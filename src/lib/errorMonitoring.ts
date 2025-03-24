/**
 * Error Monitoring System
 * 
 * A centralized error monitoring service that tracks, categorizes,
 * and provides analytics for application errors.
 */

import { ErrorSeverity } from './errorTypes';

export type ErrorMetadata = Record<string, any>;

export interface ErrorRecord {
  timestamp: Date;
  errorType: string;
  message: string;
  context: string;
  severity: ErrorSeverity;
  stack?: string;
  metadata?: ErrorMetadata;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  recentErrors: ErrorRecord[];
  topErrors: Array<{type: string, count: number}>;
}

export interface MonitoringOptions {
  remoteReporting?: boolean;
  sentryDsn?: string;
  applicationVersion?: string;
  environment?: string;
  maxRecentErrors?: number;
}

class ErrorMonitoringSystem {
  private initialized: boolean = false;
  private errors: ErrorRecord[] = [];
  private errorCounts: Record<string, number> = {};
  private categoryErrors: Record<string, number> = {};
  private severityErrors: Record<ErrorSeverity, number> = {
    [ErrorSeverity.INFO]: 0,
    [ErrorSeverity.WARNING]: 0,
    [ErrorSeverity.ERROR]: 0,
    [ErrorSeverity.CRITICAL]: 0,
  };
  private options: MonitoringOptions = {
    remoteReporting: false,
    maxRecentErrors: 100,
    environment: 'development',
  };

  /**
   * Initialize the error monitoring system
   */
  initialize(options: MonitoringOptions = {}): void {
    if (this.initialized) {
      console.warn('Error monitoring system already initialized');
      return;
    }

    this.options = { ...this.options, ...options };
    this.setupGlobalHandlers();
    
    // Setup remote reporting if enabled
    if (this.options.remoteReporting && this.options.sentryDsn) {
      this.setupRemoteReporting();
    }

    this.initialized = true;
    console.info('Error monitoring system initialized', {
      remoteReporting: this.options.remoteReporting,
      environment: this.options.environment,
    });
  }

  /**
   * Track an error occurrence
   */
  trackError(
    error: Error | unknown,
    context: string = 'unknown',
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    metadata: ErrorMetadata = {}
  ): void {
    if (!this.initialized) {
      console.warn('Error monitoring system not initialized');
      this.initialize();
    }

    const errorObj = error instanceof Error ? error : new Error(String(error));
    const errorType = errorObj.name || 'UnknownError';
    const message = errorObj.message || 'Unknown error occurred';

    // Create error record
    const record: ErrorRecord = {
      timestamp: new Date(),
      errorType,
      message,
      context,
      severity,
      stack: errorObj.stack,
      metadata,
    };

    // Store error record
    this.errors.unshift(record);
    if (this.errors.length > (this.options.maxRecentErrors || 100)) {
      this.errors.pop();
    }

    // Update error counts
    this.errorCounts[errorType] = (this.errorCounts[errorType] || 0) + 1;
    this.severityErrors[severity] = (this.severityErrors[severity] || 0) + 1;

    // Update category count if provided
    const category = metadata?.category || 'uncategorized';
    this.categoryErrors[category] = (this.categoryErrors[category] || 0) + 1;

    // Send to remote service if enabled
    if (this.options.remoteReporting) {
      this.sendToRemoteService(record);
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): ErrorStats {
    const topErrors = Object.entries(this.errorCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors: this.errors.length,
      errorsByCategory: { ...this.categoryErrors },
      errorsByType: { ...this.errorCounts },
      errorsBySeverity: { ...this.severityErrors },
      recentErrors: [...this.errors].slice(0, 20),
      topErrors,
    };
  }

  /**
   * Get all tracked errors
   */
  getAllErrors(): ErrorRecord[] {
    return [...this.errors];
  }

  /**
   * Reset error statistics
   */
  resetStats(): void {
    this.errors = [];
    this.errorCounts = {};
    this.categoryErrors = {};
    this.severityErrors = {
      [ErrorSeverity.INFO]: 0,
      [ErrorSeverity.WARNING]: 0,
      [ErrorSeverity.ERROR]: 0,
      [ErrorSeverity.CRITICAL]: 0,
    };
    console.info('Error statistics reset');
  }

  /**
   * Setup global handlers for uncaught errors
   */
  private setupGlobalHandlers(): void {
    // Only setup browser handlers if window is available
    if (typeof window !== 'undefined') {
      // Handler for uncaught exceptions
      window.addEventListener('error', (event) => {
        this.trackError(
          event.error || new Error(event.message || 'Unknown error'),
          'global:uncaughtException',
          ErrorSeverity.CRITICAL,
          {
            category: 'uncaught',
            lineno: event.lineno,
            colno: event.colno,
            filename: event.filename,
          }
        );
      });

      // Handler for unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.trackError(
          event.reason || new Error('Unhandled Promise rejection'),
          'global:unhandledRejection',
          ErrorSeverity.CRITICAL,
          {
            category: 'unhandledRejection',
          }
        );
      });

      console.info('Global error handlers registered');
    }

    // Server-side handlers would go here if running in Node.js
  }

  /**
   * Setup remote error reporting (e.g., Sentry)
   */
  private setupRemoteReporting(): void {
    // This is a placeholder for integrating with services like Sentry
    console.info('Remote error reporting configured (placeholder)');
  }

  /**
   * Send error to remote service (e.g., Sentry)
   */
  private sendToRemoteService(record: ErrorRecord): void {
    // This is a placeholder for sending to services like Sentry
    // In a real implementation, this would use the Sentry SDK
    console.debug('Error sent to remote service (placeholder)', {
      errorType: record.errorType,
      message: record.message,
      context: record.context,
    });
  }
}

// Export singleton instance
const errorMonitoring = new ErrorMonitoringSystem();
export default errorMonitoring; 