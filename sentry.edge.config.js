const Sentry = require('@sentry/nextjs');

// Initialize Sentry for edge runtime error handling
Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
}); 