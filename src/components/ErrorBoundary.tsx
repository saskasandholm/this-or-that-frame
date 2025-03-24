'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import AsyncErrorHandler, { StandardizedError } from '@/lib/AsyncErrorHandler';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: StandardizedError, reset: () => void) => ReactNode);
  onError?: (error: StandardizedError, errorInfo: ErrorInfo) => void;
  boundary?: string; // Identifier for the boundary
}

interface ErrorBoundaryState {
  error: StandardizedError | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Enhanced error boundary component that captures and handles errors in the component tree
 * Uses StandardizedError for consistent error formatting
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Standardize the error
    const standardizedError = AsyncErrorHandler.standardizeError(error);
    
    // Update state to trigger fallback UI
    return {
      error: standardizedError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Standardize the error
    const standardizedError = AsyncErrorHandler.standardizeError(error);
    
    // Set error info in state
    this.setState({
      errorInfo
    });
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(standardizedError, errorInfo);
    }
    
    // Log with additional context if boundary identifier is provided
    if (this.props.boundary) {
      console.error(`[Boundary: ${this.props.boundary}]`, standardizedError.message);
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    const { error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    // If there's an error, show fallback UI
    if (error) {
      // If fallback is a function, call it with the error and reset function
      if (typeof fallback === 'function') {
        return fallback(error, this.resetErrorBoundary);
      }
      
      // If a fallback component is provided, show it
      if (fallback) {
        return fallback;
      }
      
      // Default fallback UI
      return (
        <div className="p-4 border border-red-300 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center mb-2">
            <svg 
              className="w-5 h-5 text-red-500 mr-2" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                clipRule="evenodd" 
              />
            </svg>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300">
              Something went wrong
            </h3>
          </div>
          
          <div className="mb-4 text-sm text-red-700 dark:text-red-400">
            {error.message || 'An unexpected error occurred'}
          </div>
          
          {process.env.NODE_ENV !== 'production' && errorInfo && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer text-red-600 dark:text-red-400 font-medium">
                View details
              </summary>
              <pre className="mt-2 p-2 border border-red-200 rounded bg-red-50 overflow-auto text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300">
                {error.stack}
                {'\n\nComponent Stack:\n'}
                {errorInfo.componentStack}
              </pre>
            </details>
          )}
          
          <button
            onClick={this.resetErrorBoundary}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
          >
            Try again
          </button>
        </div>
      );
    }

    // If there's no error, render children normally
    return children;
  }
}

/**
 * Default fallback component that can be used with ErrorBoundary
 */
export const DefaultErrorFallback = ({ 
  error, 
  resetErrorBoundary 
}: { 
  error: StandardizedError; 
  resetErrorBoundary: () => void 
}): JSX.Element => {
  const userMessage = error.toUserMessage();
  
  return (
    <div className="p-4 border border-red-300 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-800">
      <div className="flex items-center mb-2">
        <svg 
          className="w-5 h-5 text-red-500 mr-2" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
            clipRule="evenodd" 
          />
        </svg>
        <h3 className="text-lg font-medium text-red-800 dark:text-red-300">
          {error.severity === AsyncErrorHandler.Severity.CRITICAL 
            ? 'Critical Error' 
            : error.severity === AsyncErrorHandler.Severity.ERROR 
              ? 'Error' 
              : 'Warning'}
        </h3>
      </div>
      
      <div className="mb-4 text-sm text-red-700 dark:text-red-400">
        {userMessage}
      </div>
      
      {process.env.NODE_ENV !== 'production' && (
        <details className="mt-2 text-xs">
          <summary className="cursor-pointer text-red-600 dark:text-red-400 font-medium">
            Technical Details
          </summary>
          <div className="mt-2 p-2 border border-red-200 rounded bg-red-50 overflow-auto text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300">
            <p><strong>Category:</strong> {error.category}</p>
            <p><strong>Severity:</strong> {error.severity}</p>
            {error.context && <p><strong>Context:</strong> {error.context}</p>}
            {error.stack && (
              <pre className="mt-2 whitespace-pre-wrap">
                {error.stack}
              </pre>
            )}
          </div>
        </details>
      )}
      
      <button
        onClick={resetErrorBoundary}
        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
      >
        Try again
      </button>
    </div>
  );
}; 