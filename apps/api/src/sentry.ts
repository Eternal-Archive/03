import * as Sentry from '@sentry/node';

export function initSentry() {
  if (!process.env.SENTRY_DSN_API) return;
  Sentry.init({
    dsn: process.env.SENTRY_DSN_API,
    tracesSampleRate: 1.0,
    environment: process.env.APP_ENV || 'dev',
  });
}

export { Sentry };
