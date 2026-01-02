import { isPlatformBrowser } from '@angular/common';
import {
  APP_INITIALIZER,
  EnvironmentProviders,
  PLATFORM_ID,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';

import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';

import { TELEMETRY_CONFIG, TelemetryConfig } from './telemetry.types';

let telemetryInitialized = false;

function initTelemetry(config: TelemetryConfig, platformId: object): void {
  if (telemetryInitialized) return;
  if (!config.enabled) return;
  if (!isPlatformBrowser(platformId)) return;

  telemetryInitialized = true;

  const exporter = new OTLPTraceExporter({
    url: config.otlpEndpoint,
  });

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: config.serviceName,
    ...(config.serviceVersion ? { [ATTR_SERVICE_VERSION]: config.serviceVersion } : {}),
  });

  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [
      new BatchSpanProcessor(exporter, {
        maxQueueSize: 2048,
        maxExportBatchSize: 256,
        scheduledDelayMillis: 5000,
        exportTimeoutMillis: 30000,
        ...config.batchSpanProcessor,
      }),
    ],
  });

  provider.register({ contextManager: new ZoneContextManager() });

  // Lazy import keeps the library’s public API clean and avoids pulling config types into consumers.
  const { getWebAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-web') as typeof import('@opentelemetry/auto-instrumentations-web');

  const instrumentations =
    config.instrumentationsFactory?.() ??
    getWebAutoInstrumentations(config.webAutoInstrumentations);

  registerInstrumentations({ instrumentations });
}

export function provideTelemetry(config: TelemetryConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: TELEMETRY_CONFIG, useValue: { enabled: true, ...config } },

    // Using provideAppInitializer keeps it aligned with standalone apps. :contentReference[oaicite:4]{index=4}
    provideAppInitializer(() => {
      // Do not block bootstrap on telemetry; never return a Promise here.
      try {
        initTelemetry(inject(TELEMETRY_CONFIG), inject(PLATFORM_ID));
      } catch {
        // Intentionally swallow: telemetry must not prevent the app from starting.
      }
      return undefined;
    }),
  ]);
}
