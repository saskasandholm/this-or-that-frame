'use client';

/**
 * @file ErrorBoundary.tsx
 * @description Component that catches JavaScript errors in its child component tree
 * and displays a fallback UI instead of crashing the entire app.
 *
 * @version 1.0.1
 * @see {@link /docs/components/ErrorBoundary.md} for detailed documentation
 */

import React, { Component, ErrorInfo, ReactNode, useState } from 'react';
import HapticService from '../services/HapticService';

// Type for the custom fallback render function
type FallbackRenderFn = (props: { error: Error; resetError: () => void }) => ReactNode;

/**
 * Props for the ErrorBoundary component
 */
export interface ErrorBoundaryProps {
  /**
   * Components that should be protected by the error boundary
   */
  children: ReactNode;

  /**
   * Custom fallback UI to display when an error occurs
   * If not provided, a default fallback will be used
   */
  fallback?: ReactNode | FallbackRenderFn;

  /**
   * Called when an error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;

  /**
   * Whether to reset the error state when props change
   * This can be useful for navigation-based resets
   */
  resetOnPropsChange?: boolean;

  /**
   * Called when the error boundary resets
   */
  onReset?: () => void;
}

/**
 * State for the ErrorBoundary component
 */
interface ErrorBoundaryState {
  /**
   * Whether an error was caught
   */
  hasError: boolean;

  /**
   * The error that was caught
   */
  error?: Error;
}

/**
 * Component that catches JavaScript errors in its child component tree
 * and displays a fallback UI instead of crashing the entire app
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Update state when an error occurs - this is a static lifecycle method
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Log the error and call the onError prop
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // Provide haptic feedback to indicate error
    HapticService.heavy();

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Reset error state on prop changes if requested
   */
  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError && this.props.resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorState();
    }
  }

  /**
   * Reset the error state
   */
  resetErrorState = (): void => {
    this.setState({
      hasError: false,
      error: undefined,
    });

    // Call the onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function' && this.state.error) {
          // Call the function with error and reset function
          return (this.props.fallback as FallbackRenderFn)({
            error: this.state.error,
            resetError: this.resetErrorState,
          });
        }
        return this.props.fallback as ReactNode;
      }
      return (
        <div className="p-6 bg-red-100 border border-red-300 rounded-md">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-700">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version of the ErrorBoundary for functional components
 * @param onError - Called when an error is caught
 * @returns Object with error info and reset function
 */
export const useErrorHandler = (
  onError?: (error: Error) => void
): {
  error: Error | null;
  handleError: (error: Error) => void;
  resetError: () => void;
} => {
  const [error, setError] = useState<Error | null>(null);

  const handleError = (error: Error): void => {
    setError(error);

    if (onError) {
      onError(error);
    }

    console.error('Error caught by useErrorHandler:', error);
    HapticService.heavy();
  };

  const resetError = (): void => {
    setError(null);
  };

  return { error, handleError, resetError };
};

export default ErrorBoundary;
