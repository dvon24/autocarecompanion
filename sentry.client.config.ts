import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
  replaysSessionSampleRate: 0, // Don't record session replays by default
  replaysOnErrorSampleRate: 1.0, // Record replays on errors
  enabled: process.env.NODE_ENV === 'production',
});
