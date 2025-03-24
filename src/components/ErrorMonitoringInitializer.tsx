'use client';

import { useEffect } from 'react';
import errorMonitoring from '@/lib/errorMonitoring';

/**
 * Component that initializes the error monitoring system.
 * Should be included once in the application layout.
 * 
 * This is a client-side only component as it interacts with browser events.
 */
export default function ErrorMonitoringInitializer() {
  useEffect(() => {
    // Initialize the error monitoring system
    errorMonitoring.initialize({
      remoteReporting: process.env.NODE_ENV === 'production',
      sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      applicationVersion: process.env.NEXT_PUBLIC_APP_VERSION,
      environment: process.env.NODE_ENV,
      maxRecentErrors: 100,
    });

    // Cleanup on unmount (though this component should remain mounted)
    return () => {
      // Nothing to clean up as the monitoring system is a singleton
      console.info('Error monitoring system unmounting');
    };
  }, []);

  // This component doesn't render anything
  return null;
} 