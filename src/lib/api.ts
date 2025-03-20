'use client';

import errorLogger, { ErrorSeverity } from './errorLogger';

/**
 * Configuration for API requests
 */
export interface ApiRequestConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  retryStatusCodes?: number[];
  headers?: Record<string, string>;
}

/**
 * Default API configuration
 */
const DEFAULT_CONFIG: ApiRequestConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 15000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Custom API error class
 */
export class ApiError extends Error {
  status: number;
  details?: any;
  retryable: boolean;

  constructor(message: string, status: number, details?: any, retryable = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.retryable = retryable;
  }
}

/**
 * Utility to add delay for retry backoff
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff time with jitter
 */
function calculateBackoff(attempt: number, baseDelay: number): number {
  // Exponential backoff: baseDelay * 2^attempt + random jitter
  const maxJitter = 300;
  const expBackoff = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * maxJitter;

  return expBackoff + jitter;
}

/**
 * Determine if an error should trigger a retry
 */
function shouldRetry(error: unknown, config: ApiRequestConfig): boolean {
  // Retry network errors
  if (!(error instanceof ApiError)) {
    return true;
  }

  // Retry based on status code
  return error.retryable || (config.retryStatusCodes?.includes(error.status) ?? false);
}

/**
 * Enhanced API request function with retry logic
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
  config: ApiRequestConfig = {}
): Promise<T> {
  // Merge with default config
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const { maxRetries = 3, retryDelay = 1000, timeout = 15000, headers = {} } = mergedConfig;

  // Ensure the URL has the correct base
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  // Setup request with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let attempts = 0;
  let lastError: unknown;

  // Retry loop
  while (attempts < maxRetries) {
    try {
      // Make the request
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          ...DEFAULT_CONFIG.headers,
          ...headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      // Clear timeout
      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `Error: ${response.status} ${response.statusText}` };
        }

        const message = errorData.message || `Error: ${response.status} ${response.statusText}`;

        // Determine if this error is retryable
        const retryable = mergedConfig.retryStatusCodes?.includes(response.status) ?? false;

        throw new ApiError(message, response.status, errorData, retryable);
      }

      // Parse successful response
      return await response.json();
    } catch (error) {
      attempts++;
      lastError = error;

      // Log the error
      const severity = attempts === maxRetries ? ErrorSeverity.ERROR : ErrorSeverity.WARNING;

      errorLogger.log(error, `API:${attempts === maxRetries ? 'FINAL' : attempts}`, severity);

      // Handle aborted requests (timeout)
      if (error instanceof DOMException && error.name === 'AbortError') {
        if (attempts < maxRetries) {
          // Retry after delay
          await delay(calculateBackoff(attempts, retryDelay));
          continue;
        } else {
          throw new ApiError('Request timed out', 408, { original: error }, false);
        }
      }

      // Check if we should retry
      if (attempts < maxRetries && shouldRetry(error, mergedConfig)) {
        // Retry after delay with exponential backoff
        await delay(calculateBackoff(attempts, retryDelay));
        continue;
      }

      // If error is already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error;
      }

      // Convert other errors to ApiError
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0,
        { original: error },
        false
      );
    }
  }

  // If we've exhausted retries, throw the last error
  if (lastError instanceof ApiError) {
    throw lastError;
  }

  throw new ApiError('Failed after maximum retry attempts', 0, { original: lastError }, false);
}

/**
 * Export main API utility with methods for common HTTP verbs
 */
const api = {
  /**
   * GET request
   */
  get: <T>(url: string, config?: ApiRequestConfig): Promise<T> => {
    return apiRequest<T>(url, { method: 'GET' }, config);
  },

  /**
   * POST request
   */
  post: <T>(url: string, data: any, config?: ApiRequestConfig): Promise<T> => {
    return apiRequest<T>(
      url,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      config
    );
  },

  /**
   * PUT request
   */
  put: <T>(url: string, data: any, config?: ApiRequestConfig): Promise<T> => {
    return apiRequest<T>(
      url,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      config
    );
  },

  /**
   * DELETE request
   */
  delete: <T>(url: string, config?: ApiRequestConfig): Promise<T> => {
    return apiRequest<T>(url, { method: 'DELETE' }, config);
  },
};

export default api;
