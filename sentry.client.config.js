import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === 'development',
  environment: process.env.NODE_ENV,
  
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