# Documentation Standard

This document outlines the standardized format for all documentation in the "This or That" Frame project.

## File Organization

All documentation should be placed in the `/docs` directory with the following structure:

- `/docs`
  - `architecture/`: System architecture documentation
  - `guides/`: Developer and user guides
  - `api/`: API documentation
  - `components/`: Component documentation
  - `services/`: Service documentation
  - `lib/`: Utility documentation
  - `CHANGELOG.md`: Project changelog
  - `README.md`: Project overview
  - `DOCUMENTATION_STANDARD.md`: This file

## Document Format

Each documentation file should follow this structure:

```markdown
# Document Title

## Overview

Brief introduction and purpose of the document.

## Table of Contents

- [Section 1](#section-1)
- [Section 2](#section-2)
- ...

## Section 1

Content for section 1.

### Subsection 1.1

Content for subsection 1.1.

## Section 2

Content for section 2.

## Related Documents

- [Document 1](./path/to/document1.md)
- [Document 2](./path/to/document2.md)

## Changelog

| Version | Date       | Changes         |
| ------- | ---------- | --------------- |
| 1.0.0   | YYYY-MM-DD | Initial version |
| 1.1.0   | YYYY-MM-DD | Updated xyz     |
```

## Component Documentation

Component documentation should include:

1. Component purpose
2. Props interface with types, required status, defaults, and descriptions
3. Example usage
4. Dependencies and side effects
5. Implementation details and edge cases

Example:

````markdown
# ErrorBoundary Component

## Overview

The ErrorBoundary component catches JavaScript errors in its child component tree and displays a fallback UI instead of crashing the entire application.

## Props

| Prop               | Type                  | Required | Default    | Description                 |
| ------------------ | --------------------- | -------- | ---------- | --------------------------- |
| children           | ReactNode             | Yes      | -          | Components to be protected  |
| fallback           | ReactNode \| Function | No       | Default UI | Fallback UI to display      |
| onError            | Function              | No       | -          | Called when error is caught |
| resetOnPropsChange | boolean               | No       | false      | Reset on prop changes       |
| onReset            | Function              | No       | -          | Called on reset             |

## Example Usage

```tsx
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
  <YourComponent />
</ErrorBoundary>
```
````

## Dependencies

- React
- HapticService

## Implementation Details

- Uses React's Error Boundary API to catch errors
- Provides haptic feedback on error
- Supports both class and functional component usage via hook
- Allows for custom fallback UI

## Edge Cases

- Does not catch errors in event handlers (use try/catch)
- Does not catch errors in asynchronous code (use try/catch)
- Does not catch errors in the error boundary itself

````

## Service Documentation

Service documentation should include:

1. Service purpose and responsibilities
2. Public API/methods with parameters and return types
3. Example usage
4. Dependencies
5. Notes on stateful behavior
6. Browser compatibility considerations

Example:

```markdown
# HapticService

## Overview

The HapticService provides haptic feedback capabilities using the Navigator Vibration API with appropriate fallbacks for unsupported devices.

## API

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| isSupported() | None | boolean | Checks if vibration is supported |
| setEnabled(enabled) | boolean | void | Enables/disables haptic feedback |
| isEnabled() | None | boolean | Checks if haptic feedback is enabled |
| subtle() | None | void | Triggers a subtle (10ms) vibration |
| medium() | None | void | Triggers a medium (20ms) vibration |
| strong() | None | void | Triggers a strong (30ms) vibration |
| success() | None | void | Triggers a success pattern vibration |
| error() | None | void | Triggers an error pattern vibration |

## Example Usage

```tsx
// Check support
if (HapticService.isSupported()) {
  // Enable haptics
  HapticService.setEnabled(true);

  // Use haptic feedback
  HapticService.success();
}
````

## Dependencies

None

## Stateful Behavior

- User preference for haptic feedback is stored in localStorage
- Default state is enabled if no preference is set

## Browser Compatibility

- Uses Navigator Vibration API (not supported in Safari or desktop browsers)
- Silently degrades when not supported

````

## Utility Documentation

Utility documentation should include:

1. Purpose of the utility
2. Function/method descriptions with signatures
3. Example usage
4. Performance considerations
5. Edge cases

## Code Documentation

All code should include JSDoc-style comments:

```typescript
/**
 * Component that catches JavaScript errors in its child component tree
 * and displays a fallback UI instead of crashing the entire app.
 *
 * @version 1.0.0
 * @see {@link /docs/components/ErrorBoundary.md} for detailed documentation
 */
````

## Documentation Review Process

1. All new features must include documentation
2. Documentation must be reviewed as part of the PR process
3. Changes to the codebase must be reflected in documentation updates

## Versioning

Documentation should follow semantic versioning:

- Major version (1.0.0): Complete rewrites/restructuring
- Minor version (0.1.0): Significant additions or changes
- Patch version (0.0.1): Minor updates, clarifications, or corrections
