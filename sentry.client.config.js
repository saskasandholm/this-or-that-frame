const Sentry = require('@sentry/nextjs');

// Initialize Sentry for client-side error handling
Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  
  // Add context for specific errors
  beforeSend(event) {
    // Modify the event before sending to Sentry
    if (event.user) {
      // Don't send user's personal identifiable information
      delete event.user.ip_address;
    }
    return event;
  },
}); 