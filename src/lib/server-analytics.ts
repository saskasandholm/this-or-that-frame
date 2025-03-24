import { track } from '@vercel/analytics/server';

/**
 * Server-side only analytics tracking.
 * This is safe to use in API routes and server components.
 * 
 * @param eventName - The name of the event to track
 * @param properties - Additional properties to associate with the event
 */
export function trackServerEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
) {
  try {
    track(eventName, properties);
  } catch (error) {
    console.error('Server analytics error:', error);
    // Don't fail the API if analytics fails
  }
}

/**
 * Common event names to ensure consistency in analytics tracking.
 * These match the client-side event names.
 */
export const ServerAnalyticsEvents = {
  // Authentication
  AUTH_SUCCESS: 'auth_success',
  AUTH_FAILED: 'auth_failed',
  AUTH_SESSION_CREATED: 'auth_session_created',
  
  // API Performance
  API_LATENCY: 'api_latency',
  DATABASE_QUERY: 'database_query',
  ERROR_OCCURRED: 'error_occurred',
};

/**
 * Track API performance metrics on the server.
 * 
 * @param endpoint - The API endpoint being measured
 * @param latencyMs - The latency in milliseconds
 * @param status - The HTTP status code
 */
export function trackServerApiPerformance(
  endpoint: string,
  latencyMs: number,
  status: number
) {
  trackServerEvent(ServerAnalyticsEvents.API_LATENCY, {
    endpoint,
    latencyMs,
    status,
    timestamp: Date.now(),
  });
}

/**
 * Track database query performance.
 * 
 * @param queryName - The name of the query
 * @param durationMs - The duration in milliseconds
 */
export function trackDatabaseQuery(
  queryName: string,
  durationMs: number
) {
  trackServerEvent(ServerAnalyticsEvents.DATABASE_QUERY, {
    query: queryName,
    durationMs,
    timestamp: Date.now(),
  });
} 