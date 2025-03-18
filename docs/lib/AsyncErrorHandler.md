# AsyncErrorHandler Utility

## Overview

The AsyncErrorHandler utility provides a standardized approach to handling asynchronous errors throughout the application. It ensures consistent error formatting, proper error logging, and offers hooks for React components to easily manage asynchronous operations with error handling. This is a core part of the application's error handling strategy, complementing the ErrorBoundary for asynchronous code.

## Table of Contents

- [API](#api)
- [Type Definitions](#type-definitions)
- [Example Usage](#example-usage)
- [Dependencies](#dependencies)
- [Implementation Details](#implementation-details)
- [Hook Usage](#hook-usage)
- [Performance Considerations](#performance-considerations)
- [Related Documents](#related-documents)
- [Changelog](#changelog)

## API

### Static Methods

| Method       | Parameters                                                  | Return Type            | Description                                           |
| ------------ | ----------------------------------------------------------- | ---------------------- | ----------------------------------------------------- |
| createError  | message: string, code?: string \| number, details?: unknown | ErrorData              | Creates a standardized error object                   |
| processError | error: unknown                                              | ErrorData              | Processes any error into a standardized format        |
| safeExecute  | fn: () => Promise\<T\>, options?: object                    | Promise\<Result\<T\>\> | Safely executes an async function with error handling |

### Hook API (useAsyncHandler)

| Property/Method | Type                                                                      | Description                                      |
| --------------- | ------------------------------------------------------------------------- | ------------------------------------------------ |
| loading         | boolean                                                                   | Indicates if an async operation is in progress   |
| error           | ErrorData \| null                                                         | Current error state (null if no error)           |
| clearError      | () => void                                                                | Clears the current error state                   |
| execute         | \<R\>(fn: () => Promise\<R\>, options?: object) => Promise\<Result\<R\>\> | Executes an async function with state management |
| setLoading      | (loading: boolean) => void                                                | Manually set the loading state                   |

## Type Definitions

```typescript
// Error data structure
interface ErrorData {
  message: string;
  code?: string | number;
  details?: unknown;
  retry?: () => Promise<any>;
  stack?: string;
}

// Error response
interface ErrorResponse<T = null> {
  success: false;
  error: ErrorData;
  data: T | null;
}

// Success response
interface SuccessResponse<T> {
  success: true;
  data: T;
  error: null;
}

// Combined result type (discriminated union)
type Result<T> = ErrorResponse | SuccessResponse<T>;
```

## Example Usage

### Static Methods

```tsx
import AsyncErrorHandler from '@/lib/AsyncErrorHandler';

async function fetchUserData(userId: string) {
  try {
    const result = await AsyncErrorHandler.safeExecute(
      async () => {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.statusText}`);
        }
        return response.json();
      },
      {
        fallbackMessage: 'Unable to load user data',
        feedback: true, // Enable haptic feedback on error
        logError: true, // Log errors to console
      }
    );

    if (result.success) {
      // Handle successful data
      return result.data;
    } else {
      // Handle error state
      showErrorToast(result.error.message);
      return null;
    }
  } catch (error) {
    // This shouldn't happen since safeExecute catches errors,
    // but for unexpected issues
    console.error('Unexpected error:', error);
    return null;
  }
}
```

### Hook Usage

```tsx
import { useAsyncHandler } from '@/lib/AsyncErrorHandler';
import { useState } from 'react';

function UserProfile({ userId }) {
  const [userData, setUserData] = useState(null);
  const { loading, error, execute, clearError } = useAsyncHandler();

  const loadUserData = async () => {
    const result = await execute(
      async () => {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.statusText}`);
        }
        return response.json();
      },
      {
        onSuccess: data => {
          setUserData(data);
        },
        onError: error => {
          console.log('Failed to load user', error);
        },
        fallbackMessage: 'Unable to load user data',
      }
    );
  };

  useEffect(() => {
    loadUserData();
  }, [userId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error.message}
        onRetry={() => {
          clearError();
          loadUserData();
        }}
      />
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="user-profile">
      <h2>{userData.name}</h2>
      {/* ... other profile details ... */}
    </div>
  );
}
```

## Dependencies

- React (for hook implementation)
- HapticService (for error feedback)

## Implementation Details

### Error Format Standardization

The utility ensures that all errors are converted to a consistent format with:

1. **Error Message**: Human-readable error message
2. **Error Code**: Optional error code for programmatic handling
3. **Error Details**: Additional context or raw error data
4. **Stack Trace**: For debugging purposes

### Error Handling Process

When using `safeExecute` or the `execute` method from the hook, the following process occurs:

1. The async function is executed within a try/catch block
2. If successful, a standardized success response is returned
3. If an error occurs:
   - The error is processed into a standard format
   - Haptic feedback is triggered (if enabled)
   - The error is logged to the console (if enabled)
   - Error handlers are called (if provided)
   - A standardized error response is returned

### Discriminated Union Result Type

The `Result<T>` type is a discriminated union with a `success` boolean property that allows for type-safe handling:

```typescript
if (result.success) {
  // TypeScript knows result.data is of type T here
  processData(result.data);
} else {
  // TypeScript knows result.error is of type ErrorData here
  handleError(result.error);
}
```

## Hook Usage

The `useAsyncHandler` hook provides several benefits for React components:

1. **Loading State Management**: Automatically tracks loading state
2. **Error State Management**: Maintains error state in component
3. **Type Safety**: Provides type-safe error and success handling
4. **Callback Integration**: Supports `onSuccess` and `onError` callbacks
5. **Feedback Integration**: Integrates with HapticService for error feedback

## Performance Considerations

1. **Error Creation**: Creating detailed error objects with stack traces can be expensive. The utility optimizes this by reusing existing stack traces when available.

2. **Hook Re-renders**: The hook uses `useState` to track loading and error states, which can trigger re-renders. Use the hook at appropriate component levels to avoid unnecessary re-renders.

3. **Error Logging**: Console logging can impact performance in production. Consider disabling detailed error logging in production builds by setting `logError: false` in performance-critical areas.

## Related Documents

- [ErrorBoundary Documentation](../components/ErrorBoundary.md)
- [HapticService Documentation](../services/HapticService.md)
- [Technical Reliability Architecture](../architecture/error-handling.md)

## Changelog

| Version | Date       | Changes                                             |
| ------- | ---------- | --------------------------------------------------- |
| 1.0.0   | 2024-03-17 | Initial implementation with static methods and hook |
| 1.0.1   | 2024-03-17 | Added haptic feedback integration                   |
