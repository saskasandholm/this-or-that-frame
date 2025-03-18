'use client';

import { useState, useCallback } from 'react';
import HapticService from '../services/HapticService';

/**
 * Interface for structured error data
 */
export interface ErrorData {
  message: string;
  code?: string | number;
  details?: unknown;
  retry?: () => Promise<any>;
  stack?: string;
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
 * Utility for handling asynchronous errors
 * Provides standardized error handling and recovery
 */
export class AsyncErrorHandler {
  /**
   * Create a standardized error object
   */
  static createError(message: string, code?: string | number, details?: unknown): ErrorData {
    return {
      message,
      code,
      details,
      stack: new Error().stack,
    };
  }

  /**
   * Process an error into a standardized format
   */
  static processError(error: unknown): ErrorData {
    // Handle custom error objects with specific structure
    if (error && typeof error === 'object' && 'message' in error) {
      return {
        message: String(error.message),
        code: 'code' in error ? (error.code as string | number) : 'UNKNOWN_ERROR',
        details: 'details' in error ? error.details : undefined,
        stack: 'stack' in error ? String(error.stack) : new Error().stack,
      };
    }

    // Handle standard JS errors
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'UNKNOWN_ERROR',
        stack: error.stack,
      };
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        message: error,
        code: 'UNKNOWN_ERROR',
        stack: new Error().stack,
      };
    }

    // Handle unknown errors
    return {
      message: 'An unknown error occurred',
      code: 'UNKNOWN_ERROR',
      details: error,
      stack: new Error().stack,
    };
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

      // Apply fallback message if needed
      if (!processedError.message || processedError.message === '') {
        processedError.message = fallbackMessage;
      }

      // Log error
      if (logError) {
        console.error('AsyncErrorHandler caught error:', processedError);
      }

      // Provide haptic feedback
      if (feedback) {
        try {
          HapticService.heavy();
        } catch (_e) {
          // Ignore haptic errors
        }
      }

      // Call custom error handler if provided
      if (handleError) {
        handleError(processedError);
      }

      return { success: false, error: processedError, data: null };
    }
  }
}

/**
 * React hook for managing async operations with error handling
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
      clearError();

      try {
        const result = await fn();

        setLoading(false);

        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        return { success: true, data: result, error: null };
      } catch (err) {
        const processedError = AsyncErrorHandler.processError(err);

        // Apply fallback message if needed
        if (!processedError.message || processedError.message === '') {
          processedError.message = options?.fallbackMessage || 'An error occurred';
        }

        setError(processedError);
        setLoading(false);

        // Log error
        if (options?.logError !== false) {
          console.error('useAsyncHandler caught error:', processedError);
        }

        // Provide haptic feedback
        if (options?.feedback !== false) {
          try {
            HapticService.heavy();
          } catch (_e) {
            // Ignore haptic errors
          }
        }

        // Call custom error handler if provided
        if (options?.onError) {
          options.onError(processedError);
        }

        return { success: false, error: processedError, data: null };
      }
    },
    [clearError]
  );

  return {
    loading,
    error,
    clearError,
    execute,
    setLoading,
  };
};

export default AsyncErrorHandler;
