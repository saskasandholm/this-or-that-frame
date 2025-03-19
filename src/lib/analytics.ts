import { track } from '@vercel/analytics';

/**
 * Track an event with Vercel Analytics.
 * 
 * @param eventName - The name of the event to track
 * @param properties - Additional properties to associate with the event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
) {
  track(eventName, properties);
}

/**
 * Common event names to ensure consistency in analytics tracking.
 */
export const AnalyticsEvents = {
  // User actions
  VOTE_SUBMITTED: 'vote_submitted',
  STREAK_UPDATED: 'streak_updated',
  ACHIEVEMENT_EARNED: 'achievement_earned',
  SHARED_RESULT: 'shared_result',
  CHALLENGE_CREATED: 'challenge_created',
  CHALLENGE_ACCEPTED: 'challenge_accepted',
  
  // Frame interactions
  FRAME_LOADED: 'frame_loaded',
  FRAME_ADDED: 'frame_added',
  FRAME_ERROR: 'frame_error',
  
  // Authentication
  AUTH_STARTED: 'auth_started',
  AUTH_COMPLETED: 'auth_completed',
  AUTH_FAILED: 'auth_failed',
  
  // Navigation
  PAGE_VIEW: 'page_view',
  TOPIC_VIEW: 'topic_view',
  FEATURE_USED: 'feature_used',
  
  // Performance
  PERFORMANCE_METRIC: 'performance_metric',
  API_LATENCY: 'api_latency',
  ERROR_OCCURRED: 'error_occurred',
};

/**
 * Track a page view event.
 * 
 * @param pageName - The name of the page being viewed
 * @param additionalProps - Additional properties to include with the event
 */
export function trackPageView(
  pageName: string,
  additionalProps?: Record<string, string | number | boolean>
) {
  trackEvent(AnalyticsEvents.PAGE_VIEW, {
    page: pageName,
    timestamp: Date.now(),
    ...additionalProps,
  });
}

/**
 * Track when a user submits a vote.
 * 
 * @param topicId - The ID of the topic voted on
 * @param choice - The choice made (A or B)
 * @param isAuthenticated - Whether the user is authenticated
 */
export function trackVote(
  topicId: string, 
  choice: 'A' | 'B',
  isAuthenticated: boolean
) {
  trackEvent(AnalyticsEvents.VOTE_SUBMITTED, {
    topicId,
    choice,
    isAuthenticated,
    timestamp: Date.now(),
  });
}

/**
 * Track when a user earns an achievement.
 * 
 * @param achievementType - The type of achievement earned
 * @param achievementName - The name of the achievement
 */
export function trackAchievement(
  achievementType: string,
  achievementName: string
) {
  trackEvent(AnalyticsEvents.ACHIEVEMENT_EARNED, {
    type: achievementType,
    name: achievementName,
    timestamp: Date.now(),
  });
}

/**
 * Track API performance metrics.
 * 
 * @param endpoint - The API endpoint being measured
 * @param latencyMs - The latency in milliseconds
 * @param status - The HTTP status code
 */
export function trackApiPerformance(
  endpoint: string,
  latencyMs: number,
  status: number
) {
  trackEvent(AnalyticsEvents.API_LATENCY, {
    endpoint,
    latencyMs,
    status,
    timestamp: Date.now(),
  });
} 