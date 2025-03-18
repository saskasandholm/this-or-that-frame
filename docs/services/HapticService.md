# HapticService

## Overview

The HapticService provides haptic feedback capabilities throughout the application using the Navigator Vibration API. It offers various vibration patterns and intensities for different user interactions, enhancing the tactile experience on supported devices while gracefully degrading on unsupported platforms.

## Table of Contents

- [API](#api)
- [Example Usage](#example-usage)
- [Dependencies](#dependencies)
- [Implementation Details](#implementation-details)
- [Browser Compatibility](#browser-compatibility)
- [Performance Considerations](#performance-considerations)
- [Related Documents](#related-documents)
- [Changelog](#changelog)

## API

| Method              | Parameters       | Return Type   | Description                                                            |
| ------------------- | ---------------- | ------------- | ---------------------------------------------------------------------- |
| getInstance()       | None             | HapticService | Returns the singleton instance of the HapticService                    |
| isSupported()       | None             | boolean       | Checks if haptic feedback is supported on the device                   |
| setEnabled(enabled) | enabled: boolean | void          | Enables or disables haptic feedback based on user preference           |
| isEnabled()         | None             | boolean       | Checks if haptic feedback is enabled based on user preference          |
| light()             | None             | void          | Triggers a light click/tap feedback (10ms vibration)                   |
| subtle()            | None             | void          | Triggers a subtle feedback (5ms vibration)                             |
| medium()            | None             | void          | Triggers medium feedback for confirming actions (20ms vibration)       |
| strong()            | None             | void          | Triggers stronger feedback for important events (30ms vibration)       |
| success()           | None             | void          | Triggers a pattern of [10, 20, 10] for success/completion events       |
| error()             | None             | void          | Triggers a pattern of [30, 10, 30] for error notifications             |
| celebration()       | None             | void          | Triggers a pattern of [10, 10, 10, 10, 10] for achievements/milestones |

## Example Usage

### Basic Usage

```tsx
import HapticService from '@/services/HapticService';

function VoteButton({ onVote }) {
  const handleVote = () => {
    // Provide subtle feedback when button is pressed
    HapticService.getInstance().subtle();
    // Or directly if using static methods
    HapticService.subtle();

    onVote();
  };

  return <button onClick={handleVote}>Vote</button>;
}
```

### Success/Error Feedback

```tsx
import HapticService from '@/services/HapticService';
import { useState } from 'react';

function SubmitForm({ onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      HapticService.success();
      showSuccessMessage();
    } catch (error) {
      HapticService.error();
      showErrorMessage(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </form>
  );
}
```

### User Preference Toggle

```tsx
import HapticService from '@/services/HapticService';
import { useState, useEffect } from 'react';

function HapticToggle() {
  const [enabled, setEnabled] = useState(HapticService.isEnabled());

  const toggleHaptic = () => {
    const newState = !enabled;
    setEnabled(newState);
    HapticService.setEnabled(newState);

    // Provide feedback if enabling (to demonstrate the effect)
    if (newState) {
      HapticService.subtle();
    }
  };

  return (
    <div className="setting-row">
      <label htmlFor="haptic-toggle">Haptic Feedback</label>
      <input id="haptic-toggle" type="checkbox" checked={enabled} onChange={toggleHaptic} />
    </div>
  );
}
```

## Dependencies

The HapticService has no external dependencies. It only uses browser native APIs:

- Navigator Vibration API
- localStorage API for preference persistence

## Implementation Details

### Singleton Pattern

The service is implemented as a singleton to ensure consistent state throughout the application:

```typescript
class HapticService {
  private static instance: HapticService;

  private constructor() {
    // Initialize service
  }

  static getInstance(): HapticService {
    if (!HapticService.instance) {
      HapticService.instance = new HapticService();
    }
    return HapticService.instance;
  }

  // Other methods...
}
```

You can access the service through:

- The singleton instance: `HapticService.getInstance().method()`
- Static methods for convenience: `HapticService.method()`

### Vibration Patterns

The service provides several predefined patterns:

- **light**: Single 10ms vibration
- **subtle**: Single 5ms vibration
- **medium**: Single 20ms vibration
- **strong**: Single 30ms vibration
- **success**: Pattern of [10, 20, 10]
- **error**: Pattern of [30, 10, 30]
- **celebration**: Pattern of [10, 10, 10, 10, 10]

### User Preference Storage

User preferences for haptic feedback are stored in localStorage:

- Key: 'hapticEnabled'
- Value: 'true' or 'false'
- Default: true (if no preference is set)

### Safety Checks

All methods that trigger vibrations first check:

1. If the device supports vibration via `isSupported()`
2. If the user has enabled haptic feedback via `isEnabled()`

This ensures the service degrades gracefully on unsupported devices or respects user preferences.

## Browser Compatibility

### Supported Platforms

- Chrome for Android 53+
- Firefox for Android 59+
- Samsung Internet
- Opera Mobile 46+

### Unsupported Platforms

- Safari (iOS and macOS)
- All desktop browsers
- Internet Explorer and Edge Legacy

## Performance Considerations

1. **Battery Impact**: Frequent haptic feedback can impact device battery life. The service uses short, minimal vibrations to reduce power consumption.

2. **Event Throttling**: Consider throttling haptic feedback in rapidly repeating events (like scrolling) to prevent excessive vibration.

3. **User Experience**: Haptic feedback should be used judiciously and map to meaningful interactions rather than being overused.

## Related Documents

- [FeedbackToggle Component](../components/ui/FeedbackToggle.md)
- [AudioService Documentation](./AudioService.md)
- [User Preferences Architecture](../architecture/user-preferences.md)

## Changelog

| Version | Date       | Changes                                                                            |
| ------- | ---------- | ---------------------------------------------------------------------------------- |
| 1.0.0   | 2024-03-17 | Initial implementation with basic vibration patterns                               |
| 1.0.1   | 2024-03-17 | Added user preference storage and celebration pattern                              |
| 1.1.0   | 2024-03-20 | Implemented singleton pattern and added additional methods (subtle, strong, light) |
