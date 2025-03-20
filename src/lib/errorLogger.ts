'use client';

import AsyncErrorHandler, { ErrorData } from './AsyncErrorHandler';
import HapticService from '../services/HapticService';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  CRITICAL = 'CRITICAL',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

/**
 * Extended error data with context and severity
 */
export interface ExtendedErrorData extends ErrorData {
  context?: string;
  severity?: ErrorSeverity;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
}

/**
 * Centralized error logging service
 * Handles error logging, categorization, and formatting
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  private enableRemoteLogging: boolean;
  private logBuffer: ExtendedErrorData[] = [];

  private constructor() {
    this.enableRemoteLogging = process.env.NODE_ENV === 'production';
  }

  /**
   * Get the singleton instance of ErrorLogger
   */
  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error with context and optional severity
   */
  public log(
    error: unknown,
    context?: string,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    provideFeedback = true
  ): ExtendedErrorData {
    // Process error into standard format
    const processedError = AsyncErrorHandler.processError(error);

    // Extend with additional data
    const extendedError: ExtendedErrorData = {
      ...processedError,
      context,
      severity,
      timestamp: new Date().toISOString(),
    };

    // Log to console with appropriate formatting
    this.logToConsole(extendedError);

    // Send to remote logging service if enabled and error is severe enough
    if (
      this.enableRemoteLogging &&
      (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.ERROR)
    ) {
      this.sendToRemoteLogger(extendedError);
    }

    // Provide haptic feedback for serious errors if requested
    if (
      provideFeedback &&
      (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.ERROR)
    ) {
      try {
        HapticService.heavy();
      } catch (_e) {
        // Ignore haptic errors
      }
    }

    return extendedError;
  }

  /**
   * Log a critical error with enhanced visibility
   */
  public critical(error: unknown, context?: string): ExtendedErrorData {
    return this.log(error, context, ErrorSeverity.CRITICAL);
  }

  /**
   * Log a warning (less severe than error)
   */
  public warning(error: unknown, context?: string): ExtendedErrorData {
    return this.log(error, context, ErrorSeverity.WARNING);
  }

  /**
   * Log informational error (lowest severity)
   */
  public info(error: unknown, context?: string): ExtendedErrorData {
    return this.log(error, context, ErrorSeverity.INFO);
  }

  /**
   * Format and log error to console
   */
  private logToConsole(error: ExtendedErrorData): void {
    const prefix = `[${error.severity}]${error.context ? ` [${error.context}]` : ''}`;

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error(`${prefix} ${error.message}`, error);
        break;
      case ErrorSeverity.ERROR:
        console.error(`${prefix} ${error.message}`, error);
        break;
      case ErrorSeverity.WARNING:
        console.warn(`${prefix} ${error.message}`, error);
        break;
      case ErrorSeverity.INFO:
        console.info(`${prefix} ${error.message}`, error);
        break;
      default:
        console.log(`${prefix} ${error.message}`, error);
    }
  }

  /**
   * Send error to remote logging service
   */
  private sendToRemoteLogger(error: ExtendedErrorData): void {
    // Add to buffer for batch sending
    this.logBuffer.push(error);

    // In a real implementation, this would send to a service like Sentry
    // This is a placeholder for future implementation
    try {
      // Implement remote logging here
      // Example: Sentry.captureException(error);
    } catch (e) {
      // Fallback to console
      console.error('Failed to send to remote logger:', e);
    }

    // If buffer gets too large, flush it
    if (this.logBuffer.length > 10) {
      this.flushLogBuffer();
    }
  }

  /**
   * Flush the log buffer to remote service
   */
  private flushLogBuffer(): void {
    if (this.logBuffer.length === 0) return;

    try {
      // Implement batch sending to remote logger
      // Example: RemoteLoggingService.sendBatch(this.logBuffer);
      this.logBuffer = [];
    } catch (e) {
      console.error('Failed to flush error log buffer:', e);
    }
  }

  /**
   * Create wrapper function for categorizing wallet errors
   */
  public categorizeWalletError(error: Error): { type: string; message: string } {
    const message = error.message.toLowerCase();

    // User rejected transaction or signature
    if (
      message.includes('user rejected') ||
      message.includes('user denied') ||
      message.includes('rejected by user')
    ) {
      return {
        type: 'user_rejected',
        message: 'You declined the request in your wallet',
      };
    }

    // Network connection issues
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection')
    ) {
      return {
        type: 'network_error',
        message: 'Network connection issue, please try again',
      };
    }

    // Insufficient funds
    if (
      message.includes('insufficient') ||
      message.includes('enough') ||
      message.includes('funds')
    ) {
      return {
        type: 'insufficient_funds',
        message: 'Insufficient funds for this transaction',
      };
    }

    // Gas price or gas limit issues
    if (message.includes('gas')) {
      return {
        type: 'gas_error',
        message: 'Gas estimation failed, transaction may fail',
      };
    }

    // Chain/network mismatch
    if (message.includes('chain') || message.includes('network id')) {
      return {
        type: 'chain_error',
        message: 'Please switch to the correct network in your wallet',
      };
    }

    // Unknown or uncategorized error
    return {
      type: 'unknown_error',
      message: error.message,
    };
  }
}

// Export singleton instance
const errorLogger = ErrorLogger.getInstance();
export default errorLogger;
