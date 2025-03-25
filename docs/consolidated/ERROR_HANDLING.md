# Error Handling & Monitoring

*Last Updated: March 25, 2025*

This document provides a comprehensive overview of error handling and monitoring in the Frame application, consolidating information from multiple resources.

## Table of Contents

- [Error Handling Strategy](#error-handling-strategy)
- [Error Handling Implementation](#error-handling-implementation)
- [Error Monitoring Implementation](#error-monitoring-implementation)
- [Best Practices](#best-practices)

## Error Handling Strategy

### Overview

Our error handling strategy is built on these core principles:

1. **User-First Error Handling**: All errors should be presented to users in a clear, actionable manner without technical jargon.
2. **Comprehensive Error Capture**: All errors should be logged, categorized, and monitored.
3. **Graceful Degradation**: The application should continue functioning as much as possible when errors occur.
4. **Contextual Error Reporting**: Error logs should include context (user session, action being performed, etc.).

### Key Components

- **Frontend Error Boundaries**: React error boundaries to prevent UI crashes
- **API Error Handling**: Standardized error responses for all API endpoints
- **Cross-Cutting Error Logic**: Shared error handling utilities and components
- **Retry Mechanisms**: Smart retries for transient errors (network issues, etc.)
- **Error Categorization**: System for classifying errors by severity and type

## Error Handling Implementation

### Frontend Error Handling

#### Error Boundaries

Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI.

```tsx
// src/components/ErrorBoundary.tsx
import { Component, PropsWithChildren } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>Please try again or contact support if the problem persists.</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### API Request Error Handling

```tsx
// src/lib/api.ts
export async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.message || 'An error occurred', errorData);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(499, 'Request canceled', { originalError: error });
    }
    
    throw new ApiError(500, 'Network or server error', { originalError: error });
  }
}

export class ApiError extends Error {
  status: number;
  details?: Record<string, any>;

  constructor(status: number, message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}
```

### Backend Error Handling

#### API Route Error Handler

```tsx
// src/lib/error-handlers.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as Sentry from '@sentry/nextjs';

export function withErrorHandler(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error(error);
      
      // Log to Sentry
      Sentry.captureException(error);
      
      // Determine status code
      const statusCode = error.status || error.statusCode || 500;
      
      // Build error response
      const errorResponse = {
        error: {
          message: error.message || 'An unexpected error occurred',
          code: error.code || 'INTERNAL_SERVER_ERROR',
        },
      };
      
      return res.status(statusCode).json(errorResponse);
    }
  };
}
```

## Error Monitoring Implementation

### Sentry Integration

We use Sentry for error monitoring across the application. It's configured to:

1. Capture unhandled exceptions
2. Track performance metrics
3. Provide context for debugging
4. Alert the team on critical issues

#### Configuration

```js
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.5,
  environment: process.env.NODE_ENV,
  integrations: [new Sentry.BrowserTracing()],
});
```

#### Custom Error Context

For better error debugging, we add contextual information:

```tsx
// src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

export function setUserContext(user) {
  if (!user) {
    Sentry.configureScope((scope) => scope.setUser(null));
    return;
  }
  
  Sentry.configureScope((scope) => {
    scope.setUser({
      id: user.id,
      username: user.username,
      fid: user.fid,
    });
  });
}

export function setTransactionName(name: string) {
  Sentry.configureScope((scope) => {
    scope.setTransactionName(name);
  });
}
```

### Error Logging Levels

We use the following error severity levels:

1. **Fatal**: Application crash or critical functionality failure
2. **Error**: Functional errors that prevent a specific operation
3. **Warning**: Non-critical issues that should be fixed but don't break functionality
4. **Info**: Informational messages for context
5. **Debug**: Detailed debugging information

## Best Practices

1. **Never Swallow Errors**: Always either handle or propagate errors
2. **Provide Helpful Error Messages**: Error messages should be actionable for users
3. **Log Consistently**: Use standardized logging approaches across the application
4. **Monitor Errors**: Regularly review error reports in Sentry
5. **Implement Retries Carefully**: Avoid overwhelming services with retry storms

## References

- [Sentry Documentation](https://docs.sentry.io/)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [NextJS Error Handling](https://nextjs.org/docs/advanced-features/error-handling) 