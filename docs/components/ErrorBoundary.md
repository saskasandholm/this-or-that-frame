# ErrorBoundary Component

## Overview

The ErrorBoundary component catches JavaScript errors in its child component tree and displays a fallback UI instead of crashing the entire application. It is a crucial part of the application's error handling strategy, ensuring that isolated component failures don't compromise the entire user experience.

## Table of Contents

- [Props](#props)
- [Example Usage](#example-usage)
- [Dependencies](#dependencies)
- [Implementation Details](#implementation-details)
- [Hook Version](#hook-version)
- [Edge Cases](#edge-cases)
- [Related Documents](#related-documents)
- [Changelog](#changelog)

## Props

| Prop               | Type                                                               | Required | Default    | Description                                               |
| ------------------ | ------------------------------------------------------------------ | -------- | ---------- | --------------------------------------------------------- |
| children           | ReactNode                                                          | Yes      | -          | Components that should be protected by the error boundary |
| fallback           | ReactNode \| ((error: Error, resetError: () => void) => ReactNode) | No       | Default UI | Custom fallback UI to display when an error occurs        |
| onError            | (error: Error, errorInfo: ErrorInfo) => void                       | No       | -          | Called when an error is caught                            |
| resetOnPropsChange | boolean                                                            | No       | false      | Whether to reset the error state when props change        |
| onReset            | () => void                                                         | No       | -          | Called when the error boundary resets                     |

## Example Usage

### Basic Usage

```tsx
import { ErrorBoundary } from '@/lib/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### With Custom Fallback UI

```tsx
import { ErrorBoundary } from '@/lib/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="error-container">
          <h3>Something went wrong</h3>
          <p>{error.message}</p>
          <button onClick={resetError}>Try Again</button>
        </div>
      )}
      onError={(error, errorInfo) => logErrorToService(error, errorInfo)}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### With Reset On Navigation

```tsx
import { ErrorBoundary } from '@/lib/ErrorBoundary';
import { useRouter } from 'next/router';

function App() {
  const router = useRouter();

  return (
    <ErrorBoundary
      resetOnPropsChange={true}
      onReset={() => console.log('Error boundary reset due to navigation')}
    >
      <MyComponent routePath={router.asPath} />
    </ErrorBoundary>
  );
}
```

## Dependencies

- React (Class Component API)
- HapticService (for error feedback)

## Implementation Details

The ErrorBoundary is implemented as a class component using React's Error Boundary API. Key implementation details include:

1. **Error State Management**:

   - Uses React's `getDerivedStateFromError` static method to update state when an error occurs
   - Maintains `hasError` and `error` in component state

2. **Error Handling**:

   - Logs errors to console
   - Provides haptic feedback using `HapticService.error()`
   - Calls the `onError` callback if provided

3. **Error Recovery**:

   - Provides a `resetErrorState` method to clear errors and restore normal rendering
   - Can automatically reset when props change (if `resetOnPropsChange` is true)
   - Calls the `onReset` callback when error state is cleared

4. **Fallback Rendering**:
   - Renders children normally when no error has occurred
   - Renders custom fallback UI when an error occurs
   - Provides a default fallback UI if no custom fallback is provided

## Hook Version

The component also exports a hook version for use in functional components:

```tsx
const { error, handleError, resetError } = useErrorHandler(onError);

// Use in try/catch blocks
try {
  riskyOperation();
} catch (err) {
  handleError(err);
}

// To display an error UI conditionally
if (error) {
  return <ErrorMessage error={error} onReset={resetError} />;
}
```

The hook version provides:

- Error state management
- Manual error capturing
- Reset functionality
- Error event callbacks

## Edge Cases

The ErrorBoundary has the following limitations:

1. **Event Handler Errors**: Errors thrown in event handlers are not automatically caught by error boundaries. Use try/catch blocks in event handlers.

2. **Asynchronous Errors**: Errors thrown in asynchronous code (promises, setTimeout, etc.) are not caught by error boundaries. Use try/catch blocks and the `useErrorHandler` hook for these cases.

3. **Server-Side Rendering**: Error boundaries don't work during server-side rendering. Add appropriate error handling in getServerSideProps or similar.

4. **Errors in the Error Boundary**: If the ErrorBoundary component itself or its fallback UI throws an error, it won't be caught by this boundary.

5. **Nested Error Boundaries**: If nested error boundaries exist, the closest ancestor error boundary will catch the error.

## Related Documents

- [AsyncErrorHandler Documentation](../lib/AsyncErrorHandler.md)
- [HapticService Documentation](../services/HapticService.md)
- [Technical Reliability Architecture](../architecture/error-handling.md)

## Changelog

| Version | Date       | Changes                                                      |
| ------- | ---------- | ------------------------------------------------------------ |
| 1.0.0   | 2024-03-17 | Initial implementation with class component and hook version |
| 1.0.1   | 2024-03-17 | Added haptic feedback integration                            |
