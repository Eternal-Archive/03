import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes as S } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

function parseHeaders(raw?: string) {
  if (!raw) return {};
  return Object.fromEntries(
    raw.split(',')
      .map(kv => kv.split('=').map(s => s.trim()))
      .filter(p => p.length === 2)
  );
}

export const otel = new NodeSDK({
  resource: new Resource({
    [S.SERVICE_NAME]: 'ea-api',
    [S.DEPLOYMENT_ENVIRONMENT]: process.env.APP_ENV || 'dev',
  }),
  traceExporter: process.env.OTLP_ENDPOINT
    ? new OTLPTraceExporter({
        url: process.env.OTLP_ENDPOINT,
        headers: parseHeaders(process.env.OTLP_HEADERS),
      })
    : undefined,
});
