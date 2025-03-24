'use client';

import { useState, useCallback } from 'react';
import HapticService from '../services/HapticService';

/**
 * Interface for structured error data
 */
export interface ErrorData {
  name: string;
  message: string;
  code?: string | number;
  stack?: string;
  originalError?: unknown;
}

/**
 * Standard error response structure
 */
export interface ErrorResponse<T = null> {
  success: false;
  error: ErrorData;
  data: T | null;
}

/**
 * Success response structure
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  error: null;
}

/**
 * Result type for async operations
 */
export type Result<T> = ErrorResponse | SuccessResponse<T>;

/**
 * AsyncErrorHandler
 * 
 * A utility class for standardizing error handling across the application
 * with specific handling for different types of errors and contexts.
 */
export default class AsyncErrorHandler {
  /**
   * Error severity levels
   */
  static Severity = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical',
  };

  /**
   * Error categories for better organization and reporting
   */
  static Category = {
    VALIDATION: 'validation',
    NETWORK: 'network',
    API: 'api',
    DATABASE: 'database',
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    WALLET: 'wallet_connection',
    FRAME: 'frame_interaction',
    UNKNOWN: 'unknown',
  };

  /**
   * Create a standardized error object
   */
  static createError(message: string, code?: string | number, details?: unknown): ErrorData;
  static createError(message: string, options?: Partial<StandardizedError>): StandardizedError;
  static createError(message: string, optionsOrCode?: string | number | Partial<StandardizedError>, details?: unknown): ErrorData | StandardizedError {
    if (optionsOrCode && typeof optionsOrCode === 'object') {
      // Creating a StandardizedError
      const error = new StandardizedError(message);
      
      if (optionsOrCode) {
        Object.assign(error, optionsOrCode);
      }
      
      return error;
    } else {
      // Creating a basic ErrorData
    return {
        name: 'Error',
      message,
        code: optionsOrCode as string | number | undefined,
        originalError: details,
      stack: new Error().stack,
    };
    }
  }

  /**
   * Process any error type into a standardized format
   */
  static processError(error: unknown): ErrorData {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
        originalError: error,
      };
    }

    if (typeof error === 'string') {
      return {
        name: 'Error',
        message: error,
        originalError: error,
      };
    }

    if (typeof error === 'object' && error !== null) {
      // Try to extract error information from object
      const errorObj = error as Record<string, any>;
      return {
        name: errorObj.name || 'UnknownError',
        message: errorObj.message || errorObj.error || JSON.stringify(error),
        code: errorObj.code || errorObj.statusCode,
        originalError: error,
      };
    }

    // Default case for unknown error types
    return {
      name: 'UnknownError',
      message: 'An unknown error occurred',
      originalError: error,
    };
  }

  /**
   * Safely stringify any error to prevent [object Object] errors
   */
  static stringifyError(error: unknown): string {
    try {
      if (error instanceof Error) {
        return error.message;
      }

      if (typeof error === 'string') {
        return error;
      }

      if (typeof error === 'object' && error !== null) {
        return JSON.stringify(error);
      }

      return String(error);
    } catch (e) {
      return 'Error cannot be stringified';
    }
  }

  /**
   * Safely serialize an error for logging or transmission
   */
  static serializeError(error: unknown): string {
    try {
      if (error instanceof Error) {
        return JSON.stringify({
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      } else if (typeof error === 'object' && error !== null) {
        return JSON.stringify(error);
      } else {
        return String(error);
      }
    } catch (e) {
      return 'Unserializable error';
    }
  }

  /**
   * Handle form submission errors with field-level details
   */
  static handleFormError(error: unknown): FormError {
    // Check if it's already a StandardizedError
    if (error instanceof StandardizedError) {
      // Default form error response
      const formError: FormError = {
        message: error.message,
        fieldErrors: {},
      };
      
      // Extract field-specific errors if available
      if (error.originalError && 
          typeof error.originalError === 'object' && 
          error.originalError !== null &&
          'fieldErrors' in error.originalError) {
        formError.fieldErrors = (error.originalError as any).fieldErrors || {};
      }
      
      return formError;
    }
    
    // Use the enhanced error handling
    const standardError = this.standardizeError(error);
    
    // Default form error response
    const formError: FormError = {
      message: standardError.message,
      fieldErrors: {},
    };
    
    // Extract field-specific errors if available
    if (standardError.originalError && 
        typeof standardError.originalError === 'object' &&
        standardError.originalError !== null &&
        'fieldErrors' in standardError.originalError) {
      formError.fieldErrors = (standardError.originalError as any).fieldErrors || {};
    } else {
      // Check if it's in the original format
      const processed = this.processError(error);
      
      // Extract field-level errors if available
      const fieldErrors = 
        error instanceof Error && 
        (error as any).details?.fieldErrors ? 
          (error as any).details.fieldErrors : 
          undefined;
      
      if (fieldErrors) {
        formError.fieldErrors = fieldErrors;
      }
    }
    
    return formError;
  }

  /**
   * Handle data fetching errors with retry capability
   */
  static handleFetchError(
    error: unknown, 
    retryFn?: () => void
  ): { message: string; canRetry: boolean } {
    const processed = this.processError(error);
    
    // Determine if error is retryable
    const canRetry = 
      (error instanceof Error && (error as any).retryable) || 
      (error instanceof Error && 
       (error.message.includes('network') || 
        error.message.includes('timeout') ||
        error.message.includes('failed to fetch') ||
        error.message.includes('connection')));
    
    return {
      message: processed.message,
      canRetry
    };
  }

  /**
   * Handle database query errors
   */
  static handleDatabaseError(error: unknown): { message: string; isConnectionError: boolean; code?: string; };
  static handleDatabaseError(error: unknown, operation?: string): StandardizedError;
  static handleDatabaseError(error: unknown, operation?: string): StandardizedError | { message: string; isConnectionError: boolean; code?: string; } {
    // If operation is provided, use enhanced version
    if (operation !== undefined) {
      const standardError = this.standardizeError(error);
      standardError.category = this.Category.DATABASE;
      
      if (operation) {
        standardError.context = `Database operation: ${operation}`;
      }
      
      // Hide technical details in production
      if (process.env.NODE_ENV === 'production') {
        standardError.message = 'A database error occurred. Please try again later.';
      }
      
      standardError.severity = this.Severity.CRITICAL;
      
      return standardError;
    }
    
    // Otherwise use original version
    const processed = this.processError(error);
    
    // Determine if it's a connection error
    const isConnectionError = 
      error instanceof Error && 
      (error.message.includes('connection') || 
       error.message.includes('timeout') ||
       error.message.includes('ECONNREFUSED'));
    
    // Extract database error code if available
    const code = processed.code ? String(processed.code) : undefined;
    
    return {
      message: processed.message,
      isConnectionError,
      code
    };
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(error: unknown): {
    message: string;
    isExpired: boolean;
    requiresLogin: boolean;
  } {
    const processed = this.processError(error);
    
    // Determine if session expired
    const isExpired = 
      error instanceof Error && 
      (error.message.includes('expired') || 
       error.message.includes('token') ||
       error.message.includes('session'));
    
    // Determine if user needs to login
    const requiresLogin = 
      error instanceof Error && 
      (error.message.includes('unauthorized') || 
       error.message.includes('unauthenticated') ||
       error.message.includes('login required') ||
       error.message.includes('401'));
    
    return {
      message: processed.message,
      isExpired,
      requiresLogin
    };
  }

  /**
   * Create a safer async function wrapper
   * Wraps an async function with proper error handling
   */
  static createSafeAsyncFunction<T, A extends any[]>(
    fn: (...args: A) => Promise<T>,
    fallback?: T,
    errorHandler?: (error: unknown) => void
  ): (...args: A) => Promise<T> {
    return async (...args: A): Promise<T> => {
      try {
        return await fn(...args);
      } catch (error) {
        if (errorHandler) {
          errorHandler(error);
        }
        
        if (fallback !== undefined) {
          return fallback;
        }
        
        throw error;
      }
    };
  }

  /**
   * Handle API errors
   */
  static handleApiError(error: unknown): { statusCode: number; message: string; details?: any; };
  static handleApiError(error: unknown, endpoint?: string): StandardizedError;
  static handleApiError(error: unknown, endpoint?: string): StandardizedError | { statusCode: number; message: string; details?: any; } {
    // If endpoint is provided, use enhanced version
    if (endpoint !== undefined) {
      const standardError = this.standardizeError(error);
      standardError.category = this.Category.API;
      
      if (endpoint) {
        standardError.context = `API call to ${endpoint}`;
      }
      
      // Add specific handling for API errors based on status codes
      if (standardError.originalError && 
          typeof standardError.originalError === 'object' && 
          standardError.originalError !== null &&
          'status' in standardError.originalError) {
        const status = (standardError.originalError as any).status;
        
        if (status === 401 || status === 403) {
          standardError.category = this.Category.AUTHENTICATION;
          standardError.message = 'Authentication error. Please try logging in again.';
        } else if (status === 404) {
          standardError.message = 'The requested resource was not found.';
        } else if (status >= 500) {
          standardError.severity = this.Severity.CRITICAL;
          standardError.message = 'Server error. Please try again later.';
        }
      }
      
      return standardError;
    }
    
    // Otherwise use original version
    const processed = this.processError(error);
    
    // Extract status code if available
    let statusCode = 500; // Default to internal server error
    
    if (processed.code && !isNaN(Number(processed.code))) {
      statusCode = Number(processed.code);
    } else if (
      error instanceof Error && 
      (error as any).statusCode && 
      !isNaN(Number((error as any).statusCode))
    ) {
      statusCode = Number((error as any).statusCode);
    }
    
    return {
      statusCode,
      message: processed.message,
      details: processed.originalError
    };
  }

  /**
   * Format error for logging
   */
  static formatErrorForLogging(error: unknown, context?: string): string {
    const processed = this.processError(error);
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    
    return `${timestamp} ${contextStr} ${processed.name}: ${processed.message}${
      processed.stack ? `\n${processed.stack}` : ''
    }`;
  }

  /**
   * Safely execute an async function with error handling
   */
  static async safeExecute<T>(
    fn: () => Promise<T>,
    options?: {
      fallbackMessage?: string;
      handleError?: (error: ErrorData) => void;
      feedback?: boolean;
      logError?: boolean;
    }
  ): Promise<Result<T>> {
    const {
      fallbackMessage = 'An error occurred',
      handleError,
      feedback = true,
      logError = true,
    } = options || {};

    try {
      const result = await fn();
      return { success: true, data: result, error: null };
    } catch (error) {
      const processedError = this.processError(error);

      if (logError) {
        console.error('Operation failed:', processedError);
      }

      if (feedback) {
        HapticService.error();
      }

      if (handleError) {
        handleError(processedError);
      }

      return {
        success: false,
        error: {
          ...processedError,
          message: processedError.message || fallbackMessage,
        },
        data: null,
      };
    }
  }

  /**
   * Handles any type of error and returns a standardized error object
   */
  static handleError(error: unknown, context?: string): StandardizedError {
    // Ensure we're working with a standard error structure
    const standardError = this.standardizeError(error);
    
    // Add context information if provided
    if (context) {
      standardError.context = context;
    }
    
    // Log the error for tracking (could integrate with monitoring services)
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[${standardError.category}] ${standardError.message}`, 
        standardError.originalError || '');
    }
    
    return standardError;
  }

  /**
   * Special handling for wallet connection errors
   */
  static handleWalletError(error: unknown, action?: string): StandardizedError {
    const standardError = this.standardizeError(error);
    standardError.category = this.Category.WALLET;
    
    if (action) {
      standardError.context = `Wallet action: ${action}`;
    }
    
    // Common wallet errors
    const errorString = String(error).toLowerCase();
    if (errorString.includes('user rejected')) {
      standardError.message = 'Connection request was rejected by the user.';
      standardError.severity = this.Severity.INFO;
    } else if (errorString.includes('already processing')) {
      standardError.message = 'A wallet request is already in progress. Please wait.';
      standardError.severity = this.Severity.WARNING;
    } else if (errorString.includes('chain id') || errorString.includes('network')) {
      standardError.message = 'Please switch to the correct network in your wallet.';
      standardError.severity = this.Severity.WARNING;
    }
    
    return standardError;
  }
  
  /**
   * Convert any error to a standard format
   */
  static standardizeError(error: unknown): StandardizedError {
    if (error instanceof StandardizedError) {
      return error;
    }
    
    const standardError = new StandardizedError();
    
    if (error instanceof Error) {
      standardError.message = error.message;
      standardError.originalError = error;
      standardError.stack = error.stack;
      
      // Check for network errors
      if (error.name === 'NetworkError' || 
          error.message.includes('network') || 
          error.message.includes('fetch')) {
        standardError.category = this.Category.NETWORK;
      }
      
      // Check for validation errors
      if (error.name === 'ValidationError' || 
          error.message.includes('valid') || 
          error.message.includes('required')) {
        standardError.category = this.Category.VALIDATION;
        standardError.severity = this.Severity.WARNING;
      }
    } else if (typeof error === 'string') {
      standardError.message = error;
    } else if (error && typeof error === 'object') {
      try {
        standardError.originalError = error;
        
        // Try to extract a message from the object
        if ('message' in error && typeof (error as any).message === 'string') {
          standardError.message = (error as any).message;
        } else if ('error' in error && typeof (error as any).error === 'string') {
          standardError.message = (error as any).error;
        } else {
          standardError.message = 'An error occurred: ' + JSON.stringify(error);
        }
        
        // Extract status information if available
        if ('status' in error) {
          standardError.httpStatus = (error as any).status;
        }
      } catch (e) {
        standardError.message = 'Unknown error occurred';
      }
    } else {
      standardError.message = 'Unknown error occurred';
    }
    
    return standardError;
  }
}

/**
 * React hook for handling async operations with loading and error states
 */
export const useAsyncHandler = <T>(
  _initialState?: T
): {
  loading: boolean;
  error: ErrorData | null;
  clearError: () => void;
  execute: <R>(
    fn: () => Promise<R>,
    options?: {
      onSuccess?: (result: R) => void;
      onError?: (error: ErrorData) => void;
      feedback?: boolean;
      logError?: boolean;
      fallbackMessage?: string;
    }
  ) => Promise<Result<R>>;
  setLoading: (loading: boolean) => void;
} => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorData | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(
    async <R>(
      fn: () => Promise<R>,
      options?: {
        onSuccess?: (result: R) => void;
        onError?: (error: ErrorData) => void;
        feedback?: boolean;
        logError?: boolean;
        fallbackMessage?: string;
      }
    ): Promise<Result<R>> => {
      setLoading(true);
      setError(null);

      const {
        onSuccess,
        onError,
        feedback = true,
        logError = true,
        fallbackMessage = 'An error occurred',
      } = options || {};

      try {
        const result = await fn();
        setLoading(false);

        if (onSuccess) {
          onSuccess(result);
        }

        return { success: true, data: result, error: null };
      } catch (err) {
        setLoading(false);
        const processedError = AsyncErrorHandler.processError(err);

        if (logError) {
          console.error('Operation failed:', processedError);
        }

        if (feedback) {
          HapticService.error();
        }

        setError(processedError);

        if (onError) {
          onError(processedError);
        }

        return {
          success: false,
          error: {
            ...processedError,
            message: processedError.message || fallbackMessage,
          },
          data: null,
        };
      }
    },
    []
  );

  return {
    loading,
    error,
    clearError,
    execute,
    setLoading,
  };
};

/**
 * Standardized error class
 */
export class StandardizedError extends Error {
  category: string = AsyncErrorHandler.Category.UNKNOWN;
  severity: string = AsyncErrorHandler.Severity.ERROR;
  context?: string;
  httpStatus?: number;
  errorCode?: string;
  originalError?: unknown;
  timestamp: number = Date.now();
  
  constructor(message: string = 'An error occurred') {
    super(message);
    this.name = 'StandardizedError';
  }
  
  /**
   * Convert to a user-friendly message
   */
  toUserMessage(): string {
    // For user-facing messages, we may want to be less technical
    if (this.severity === AsyncErrorHandler.Severity.CRITICAL) {
      return 'A system error has occurred. Our team has been notified.';
    }
    
    return this.message;
  }
  
  /**
   * Convert to an object for JSON serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      message: this.message,
      category: this.category,
      severity: this.severity,
      context: this.context,
      httpStatus: this.httpStatus,
      errorCode: this.errorCode,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Form error interface
 */
export interface FormError {
  message: string;
  fieldErrors: Record<string, string>;
}
