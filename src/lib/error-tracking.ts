import * as Sentry from '@sentry/nextjs';
import { Scope } from '@sentry/nextjs';

/**
 * Captures an error and sends it to Sentry with additional context.
 * 
 * @param error - The error to capture
 * @param context - Additional context to include with the error
 * @param level - The severity level of the error (default: 'error')
 */
export function trackError(
  error: Error | string,
  context?: Record<string, any>,
  level: Sentry.SeverityLevel = 'error'
) {
  // Convert string errors to Error objects
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  
  // Use withScope to add context and level
  Sentry.withScope((scope: Scope) => {
    scope.setLevel(level);
    
    // Add additional context if provided
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    // Capture the exception
    Sentry.captureException(errorObj);
  });
}

/**
 * Captures a message and sends it to Sentry with additional context.
 * Use this for non-error events that should still be tracked.
 * 
 * @param message - The message to capture
 * @param context - Additional context to include with the message
 * @param level - The severity level of the message (default: 'info')
 */
export function trackMessage(
  message: string,
  context?: Record<string, any>,
  level: Sentry.SeverityLevel = 'info'
) {
  // Use withScope to add context and level
  Sentry.withScope((scope: Scope) => {
    scope.setLevel(level);
    
    // Add additional context if provided
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    // Capture the message
    Sentry.captureMessage(message);
  });
}

/**
 * Set user information in Sentry to associate errors with specific users.
 * 
 * @param userId - The user's ID (usually the Farcaster FID)
 * @param username - The user's username (optional)
 */
export function setUserContext(userId: string | number, username?: string) {
  Sentry.setUser({
    id: userId.toString(),
    username: username,
  });
}

/**
 * Clear user information from Sentry.
 * Call this when a user logs out.
 */
export function clearUserContext() {
  Sentry.setUser(null);
} 