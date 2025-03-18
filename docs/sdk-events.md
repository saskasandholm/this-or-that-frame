# SDK Events in Farcaster Frames v2

This document provides a comprehensive guide to events available in the Farcaster Frames v2 SDK, including how to listen for and handle these events in your applications.

## Overview

The Farcaster Frame SDK exposes several events that allow your frame application to respond to user actions and client state changes. These events are essential for creating interactive experiences and maintaining user engagement.

## Available Events

The Frame SDK provides the following events:

| Event Name              | Description                                                  | Data Payload                                                  |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| `frameAdded`            | Fired when a user adds your frame to their saved frames      | `{ fid: number }`                                             |
| `frameAddRejected`      | Fired when a user rejects adding your frame                  | `{ fid: number, reason?: string }`                            |
| `frameRemoved`          | Fired when a user removes your frame from their saved frames | `{ fid: number }`                                             |
| `notificationsEnabled`  | Fired when a user enables notifications for your frame       | `{ fid: number, token: string }`                              |
| `notificationsDisabled` | Fired when a user disables notifications for your frame      | `{ fid: number }`                                             |
| `primaryButtonClicked`  | Fired when a user clicks the primary button                  | `{ fid: number }`                                             |
| `navigate`              | Fired when the frame SDK performs a navigation action        | `{ url: string }`                                             |
| `contextChanged`        | Fired when the frame context changes (e.g., launch context)  | `{ previousContext: FrameContext, newContext: FrameContext }` |
| `error`                 | Fired when an error occurs in the frame SDK                  | `{ code: string, message: string }`                           |

## Basic Event Handling

To listen for events, use the `addEventListener` method from the Frame SDK:

```typescript
import { addEventListener, EventType } from '@farcaster/frame-sdk';

// Add an event listener
const removeListener = addEventListener(EventType.frameAdded, event => {
  console.log(`User ${event.fid} added this frame`);

  // Perform actions when frame is added
  updateUserPreferences(event.fid, { hasAddedFrame: true });
});

// Later, when you want to stop listening:
removeListener();
```

## Event-Specific Examples

### Frame Added Event

The `frameAdded` event fires when a user adds your frame to their saved frames:

```typescript
import { addEventListener, EventType } from '@farcaster/frame-sdk';

addEventListener(EventType.frameAdded, event => {
  const { fid } = event;

  // Show a welcome message
  showToast(`Thanks for adding our frame, user ${fid}!`);

  // Save the user to your database
  saveUserToDatabase(fid, { addedAt: new Date() });

  // Trigger analytics
  trackEvent('frame_added', { fid });
});
```

### Frame Add Rejected Event

The `frameAddRejected` event fires when a user declines to add your frame:

```typescript
import { addEventListener, EventType } from '@farcaster/frame-sdk';

addEventListener(EventType.frameAddRejected, event => {
  const { fid, reason } = event;

  // Log the rejection reason if available
  if (reason) {
    console.log(`User ${fid} rejected adding frame: ${reason}`);
  }

  // You might want to show different content to users who haven't added the frame
  setUserState({ hasAddedFrame: false });

  // Track rejection for analytics
  trackEvent('frame_add_rejected', { fid, reason });
});
```

### Frame Removed Event

The `frameRemoved` event fires when a user removes your frame from their saved frames:

```typescript
import { addEventListener, EventType } from '@farcaster/frame-sdk';

addEventListener(EventType.frameRemoved, event => {
  const { fid } = event;

  // Update user state
  setUserState({ hasAddedFrame: false });

  // Update your database
  updateUserInDatabase(fid, { removedAt: new Date() });

  // Track removal for analytics
  trackEvent('frame_removed', { fid });

  // Optionally show a "We're sorry to see you go" message
  showFeedback("We're sorry to see you go. Feedback welcome!");
});
```

### Notifications Enabled Event

The `notificationsEnabled` event fires when a user enables notifications for your frame:

```typescript
import { addEventListener, EventType } from '@farcaster/frame-sdk';

addEventListener(EventType.notificationsEnabled, event => {
  const { fid, token } = event;

  // Store the notification token securely in your database
  saveNotificationToken(fid, token);

  // Update user preferences
  updateUserPreferences(fid, { notifications: true });

  // Show confirmation to the user
  showToast("Notifications enabled! We'll keep you updated.");

  // Track event
  trackEvent('notifications_enabled', { fid });
});
```

### Notifications Disabled Event

The `notificationsDisabled` event fires when a user disables notifications for your frame:

```typescript
import { addEventListener, EventType } from '@farcaster/frame-sdk';

addEventListener(EventType.notificationsDisabled, event => {
  const { fid } = event;

  // Remove or invalidate the notification token in your database
  removeNotificationToken(fid);

  // Update user preferences
  updateUserPreferences(fid, { notifications: false });

  // Track event
  trackEvent('notifications_disabled', { fid });
});
```

### Primary Button Clicked Event

The `primaryButtonClicked` event fires when a user clicks the primary button that you've set:

```typescript
import { addEventListener, EventType, setPrimaryButton } from '@farcaster/frame-sdk';

// First, set up a primary button
setPrimaryButton({
  label: 'Join Game',
  action: 'primary_action',
});

// Then listen for clicks on that button
addEventListener(EventType.primaryButtonClicked, event => {
  const { fid } = event;

  // Handle the primary action
  startGame(fid);

  // Update UI
  setGameState('playing');

  // Track event
  trackEvent('game_started', { fid });
});
```

### Navigate Event

The `navigate` event fires when the frame SDK performs a navigation action:

```typescript
import { addEventListener, EventType } from '@farcaster/frame-sdk';

addEventListener(EventType.navigate, event => {
  const { url } = event;

  console.log(`Navigating to: ${url}`);

  // You might want to update UI based on navigation
  setCurrentPage(getPageNameFromUrl(url));

  // Track navigation for analytics
  trackEvent('navigation', { url });
});
```

### Context Changed Event

The `contextChanged` event fires when the frame context changes:

```typescript
import { addEventListener, EventType } from '@farcaster/frame-sdk';

addEventListener(EventType.contextChanged, event => {
  const { previousContext, newContext } = event;

  console.log(`Context changed from ${previousContext.type} to ${newContext.type}`);

  // Adjust UI based on the new context
  if (newContext.type === 'notification') {
    // Show notification-specific content
    showNotificationView(newContext.data.notificationId);
  } else if (newContext.type === 'trigger') {
    // Show trigger-specific content
    showTriggerView(newContext.data.triggerType, newContext.data.triggerId);
  }

  // Track context change
  trackEvent('context_changed', {
    from: previousContext.type,
    to: newContext.type,
  });
});
```

### Error Event

The `error` event fires when an error occurs in the frame SDK:

```typescript
import { addEventListener, EventType } from '@farcaster/frame-sdk';

addEventListener(EventType.error, event => {
  const { code, message } = event;

  console.error(`Frame SDK error: ${code} - ${message}`);

  // Show error to user if appropriate
  if (code === 'auth_error') {
    showErrorMessage('Authentication failed. Please try again.');
  } else if (code === 'network_error') {
    showErrorMessage('Network error. Please check your connection.');
  }

  // Log error to your error tracking service
  logError('frame_sdk_error', { code, message });
});
```

## Multiple Event Listeners

You can add multiple listeners for the same event:

```typescript
import { addEventListener, EventType } from '@farcaster/frame-sdk';

// Analytics listener
addEventListener(EventType.frameAdded, event => {
  trackEvent('frame_added', { fid: event.fid });
});

// User experience listener
addEventListener(EventType.frameAdded, event => {
  showWelcomeMessage(event.fid);
});

// Server sync listener
addEventListener(EventType.frameAdded, event => {
  syncUserToServer(event.fid);
});
```

## Conditional Event Handling

You can conditionally handle events based on application state:

```typescript
import { addEventListener, EventType } from '@farcaster/frame-sdk';
import { useAppState } from './state';

function setupEventListeners() {
  const { isOnboarded, currentView } = useAppState();

  addEventListener(EventType.primaryButtonClicked, event => {
    const { fid } = event;

    // Handle differently based on app state
    if (!isOnboarded) {
      startOnboarding(fid);
    } else if (currentView === 'game') {
      makeGameMove(fid);
    } else if (currentView === 'profile') {
      saveProfile(fid);
    }
  });
}
```

## Cleaning Up Event Listeners

Always clean up event listeners when components unmount to prevent memory leaks:

```typescript
import { addEventListener, EventType } from '@farcaster/frame-sdk';
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    // Add event listeners
    const removeFrameAddedListener = addEventListener(EventType.frameAdded, handleFrameAdded);
    const removeNotificationsListener = addEventListener(
      EventType.notificationsEnabled,
      handleNotifications
    );

    // Clean up function
    return () => {
      removeFrameAddedListener();
      removeNotificationsListener();
    };
  }, []);

  // Rest of the component...
}
```

## React Hook for Events

You can create a custom React hook to easily use Farcaster Frame events:

```typescript
import { useState, useEffect } from 'react';
import { addEventListener, EventType } from '@farcaster/frame-sdk';

function useFrameEvent(eventType, handler) {
  useEffect(() => {
    const removeListener = addEventListener(eventType, handler);
    return () => removeListener();
  }, [eventType, handler]);
}

// Usage
function MyComponent() {
  const [isAdded, setIsAdded] = useState(false);

  useFrameEvent(EventType.frameAdded, (event) => {
    setIsAdded(true);
    console.log(`Frame added by user ${event.fid}`);
  });

  return (
    <div>
      {isAdded ? 'Thanks for adding our frame!' : 'Please add our frame!'}
    </div>
  );
}
```

## Event Debugging

For debugging events during development, you can create a general event logger:

```typescript
import { addEventListener, EventType } from '@farcaster/frame-sdk';

function setupEventDebugger() {
  // Create an array of all event types
  const allEvents = Object.values(EventType);

  // Add a listener for each event type
  allEvents.forEach(eventType => {
    addEventListener(eventType, event => {
      console.log(`[Frame Event] ${eventType}:`, event);
    });
  });
}

// Only use in development
if (process.env.NODE_ENV === 'development') {
  setupEventDebugger();
}
```

## Event Handling Best Practices

1. **Keep event handlers lightweight** - Avoid heavy processing in event handlers to maintain performance
2. **Handle errors gracefully** - Always wrap event handler code in try/catch blocks
3. **Clean up listeners** - Always remove listeners when they're no longer needed
4. **Don't rely solely on events** - Use events in conjunction with other data sources for reliability
5. **Consider user experience** - Use events to enhance UX, not just for tracking
6. **Respect privacy** - Only collect and store data that's necessary

## Troubleshooting Events

If you're not receiving events as expected:

1. Verify the event is supported in the current SDK version
2. Check if the client supports the event (some events may not be available in all clients)
3. Ensure your event handler is registered before the event occurs
4. Look for errors in your event handler that might prevent it from executing properly
5. Make sure you haven't accidentally removed the event listener

## Changelog

- **v1.0.0** (Initial Documentation): Created comprehensive SDK Events guide for Farcaster Frames v2
