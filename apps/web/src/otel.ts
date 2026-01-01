import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { EnvironmentProviders, provideAppInitializer } from '@angular/core';

export function provideTelemetry(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const exporter = new OTLPTraceExporter({
      url: '/v1/traces'
    });

    const provider = new WebTracerProvider({

      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'Angular App',
        [ATTR_SERVICE_VERSION]: '1.0.0',
      }),

      spanProcessors: [
        new BatchSpanProcessor(exporter, {
          maxQueueSize: 2048,
          maxExportBatchSize: 256,
          scheduledDelayMillis: 5000,
          exportTimeoutMillis: 30000,
        }),
      ],
    });

    provider.register({
      contextManager: new ZoneContextManager(),
    });

    registerInstrumentations({
      instrumentations: [
        getWebAutoInstrumentations(),
      ],
    });
  });
}
