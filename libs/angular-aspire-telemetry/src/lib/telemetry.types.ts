import { InjectionToken } from '@angular/core';
import type { Instrumentation } from '@opentelemetry/instrumentation';
import type { BufferConfig } from '@opentelemetry/sdk-trace-base';

export type WebAutoInstrumentationConfig =
  Parameters<typeof import('@opentelemetry/auto-instrumentations-web').getWebAutoInstrumentations>[0];

export interface TelemetryConfig {
  enabled?: boolean;

  serviceName: string;
  serviceVersion?: string;

  /*
   * Prefer a same-origin relative URL (e.g. '/v1/traces') and proxy it,
   * rather than calling a collector cross-origin from the browser.
   */
  otlpEndpoint: string;

  batchSpanProcessor?: Partial<BufferConfig>;

  webAutoInstrumentations?: WebAutoInstrumentationConfig;

  /*
   * Escape hatch if you want to add/remove instrumentations.
   * If provided, this takes precedence over `webAutoInstrumentations`.
   */
  instrumentationsFactory?: () => Instrumentation[];
}

export const TELEMETRY_CONFIG = new InjectionToken<TelemetryConfig>('TELEMETRY_CONFIG');
