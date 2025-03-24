/**
 * Error severity levels used throughout the application
 * for consistent error handling and monitoring.
 */
export enum ErrorSeverity {
  /**
   * Information only, no error occurred
   */
  INFO = 'info',
  
  /**
   * Non-critical warning that doesn't affect functionality
   */
  WARNING = 'warning',
  
  /**
   * Error that affects functionality but doesn't crash the application
   */
  ERROR = 'error',
  
  /**
   * Critical error that may crash the application or cause severe issues
   */
  CRITICAL = 'critical'
}

/**
 * Error categories for grouping errors by domain or source
 */
export enum ErrorCategory {
  /**
   * API-related errors (fetch failures, API responses, etc.)
   */
  API = 'api',
  
  /**
   * Authentication and authorization errors
   */
  AUTH = 'auth',
  
  /**
   * Database-related errors
   */
  DATABASE = 'database',
  
  /**
   * Form validation and submission errors
   */
  FORM = 'form',
  
  /**
   * Wallet connection and interaction errors
   */
  WALLET = 'wallet',
  
  /**
   * Navigation and routing errors
   */
  NAVIGATION = 'navigation',
  
  /**
   * Rendering and component errors
   */
  RENDERING = 'rendering',
  
  /**
   * Uncategorized errors
   */
  UNKNOWN = 'unknown',
  
  /**
   * External service integration errors
   */
  EXTERNAL = 'external',
  
  /**
   * Frame-specific errors
   */
  FRAME = 'frame'
} 