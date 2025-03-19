# Launch Contexts in Farcaster Frames v2

This document explains the different contexts in which frames can be launched and how to handle context-specific data.

## Overview

In Farcaster Frames v2, a frame can be launched in various ways, each providing different context information to your application. Understanding and properly handling these launch contexts is essential for creating responsive and context-aware frame applications.

## Launch Context Types

Frames can be launched in the following contexts:

| Context Type | Description                              | When It Occurs                                                    |
| ------------ | ---------------------------------------- | ----------------------------------------------------------------- |
| Global       | Default context with minimal information | When launched from app directory or without specific context      |
| Embed        | Launched from a cast or embedded content | When a user clicks on a frame embedded in a feed or cast          |
| Notification | Launched from a notification             | When a user clicks on a frame notification                        |
| Trigger      | Launched from a trigger                  | When a user activates a registered trigger (cast, composer, etc.) |

## Context Data Structure

When your frame is launched, the SDK provides context information through the `frameContext` object:

```typescript
type FrameContext = {
  // Type of launch context
  type: 'global' | 'embed' | 'notification' | 'trigger';

  // Context-specific data - varies based on type
  data: GlobalLaunchContext | EmbedLaunchContext | NotificationLaunchContext | TriggerLaunchContext;

  // URL of the frame
  url: string;

  // Flag indicating if the frame is verified (has valid account association)
  isVerified: boolean;
};
```

## Global Launch Context

When a frame is launched globally (from the app directory or without specific context), minimal context information is provided:

```typescript
type GlobalLaunchContext = {
  // Empty object, no additional data
};
```

Example handling:

```typescript
import { useFrameContext } from '@farcaster/frame-sdk';

function MyFrameApp() {
  const frameContext = useFrameContext();

  if (frameContext.type === 'global') {
    // Handle global launch - show default view
    return <DefaultView />;
  }

  // Handle other contexts...
}
```

## Embed Launch Context

When a frame is launched from an embed in a feed or cast, you'll receive information about the cast and embed:

```typescript
type EmbedLaunchContext = {
  // Information about the cast containing the embed
  castId?: {
    fid: number; // Farcaster ID of the cast author
    hash: string; // Unique hash of the cast
  };

  // URL of the embed
  url: string;

  // Type of embed (e.g., 'frame', 'image', 'url')
  embedType: string;
};
```

Example handling:

```typescript
import { useFrameContext } from '@farcaster/frame-sdk';

function MyFrameApp() {
  const frameContext = useFrameContext();

  if (frameContext.type === 'embed') {
    const { castId, url, embedType } = frameContext.data;

    // Show cast-specific content
    return (
      <div>
        <h1>Launched from a cast</h1>
        {castId && (
          <p>Cast by FID: {castId.fid}</p>
        )}
        <p>Embed URL: {url}</p>
        <p>Embed type: {embedType}</p>
      </div>
    );
  }

  // Handle other contexts...
}
```

## Notification Launch Context

When a frame is launched from a notification, you'll receive the notification ID:

```typescript
type NotificationLaunchContext = {
  // ID of the notification that was clicked
  notificationId: string;
};
```

Example handling:

```typescript
import { useFrameContext } from '@farcaster/frame-sdk';

function MyFrameApp() {
  const frameContext = useFrameContext();

  if (frameContext.type === 'notification') {
    const { notificationId } = frameContext.data;

    // Fetch notification details using the ID
    useEffect(() => {
      fetchNotificationDetails(notificationId);
    }, [notificationId]);

    return <NotificationView notificationId={notificationId} />;
  }

  // Handle other contexts...
}
```

## Trigger Launch Context

When a frame is launched from a trigger, you'll receive information about the trigger:

```typescript
type TriggerLaunchContext = {
  // Type of the trigger ('cast', 'composer', etc.)
  triggerType: string;

  // ID of the trigger as defined in your manifest
  triggerId: string;

  // Additional context based on trigger type
  castId?: {
    // Only for 'cast' trigger type
    fid: number;
    hash: string;
  };
};
```

Example handling:

```typescript
import { useFrameContext } from '@farcaster/frame-sdk';

function MyFrameApp() {
  const frameContext = useFrameContext();

  if (frameContext.type === 'trigger') {
    const { triggerType, triggerId, castId } = frameContext.data;

    // Handle different trigger types
    switch (triggerType) {
      case 'cast':
        return <CastTriggerView triggerId={triggerId} castId={castId} />;

      case 'composer':
        return <ComposerTriggerView triggerId={triggerId} />;

      default:
        return <GenericTriggerView triggerId={triggerId} />;
    }
  }

  // Handle other contexts...
}
```

## Context Detection and Fallbacks

It's important to handle various launch contexts gracefully, with fallbacks for unknown or unexpected contexts:

```typescript
import { useFrameContext } from '@farcaster/frame-sdk';

function MyFrameApp() {
  const frameContext = useFrameContext();

  // If frame context isn't available yet (still loading)
  if (!frameContext) {
    return <LoadingView />;
  }

  // Handle different context types
  switch (frameContext.type) {
    case 'global':
      return <GlobalView />;

    case 'embed':
      return <EmbedView data={frameContext.data} />;

    case 'notification':
      return <NotificationView data={frameContext.data} />;

    case 'trigger':
      return <TriggerView data={frameContext.data} />;

    default:
      // Fallback for unknown context types
      return <DefaultView />;
  }
}
```

## Persisting Context Information

In many cases, you'll want to persist launch context information across sessions:

```typescript
import { useFrameContext } from '@farcaster/frame-sdk';
import { useEffect } from 'react';

function MyFrameApp() {
  const frameContext = useFrameContext();

  // Save context to localStorage when it changes
  useEffect(() => {
    if (frameContext) {
      localStorage.setItem('lastFrameContext', JSON.stringify(frameContext));
    }
  }, [frameContext]);

  // Rest of your component...
}
```

## Context-Specific UX Considerations

Different launch contexts call for different UX approaches:

| Context Type | UX Considerations                                               |
| ------------ | --------------------------------------------------------------- |
| Global       | Show a complete overview with all features                      |
| Embed        | Focus on content related to the specific cast                   |
| Notification | Show detailed notification content and related actions          |
| Trigger      | Provide a streamlined interface for the specific trigger action |

## Testing Different Launch Contexts

To test how your frame behaves in different launch contexts:

1. **Global**: Access your frame directly via its URL
2. **Embed**: Use the Frame Preview Tool at https://frame.farcaster.xyz/
3. **Notification**: Test via the notification simulator (for development)
4. **Trigger**: Test by setting up triggers in your manifest and activating them in a test environment

## Handling Missing Context Data

Always validate context data before using it, as not all fields may be present in all cases:

```typescript
if (frameContext.type === 'embed' && frameContext.data.castId) {
  // Safe to use castId fields here
  const { fid, hash } = frameContext.data.castId;
  // ...
} else if (frameContext.type === 'embed') {
  // Handle the case where castId is missing
  // ...
}
```

## Best Practices

1. **Always check context type** before accessing context data
2. **Provide fallback views** for missing or unexpected contexts
3. **Use context data to personalize** the user experience
4. **Cache relevant context data** for use across sessions if needed
5. **Handle loading states** while context data is being fetched

## Changelog

- **v1.0.0** (Initial Documentation): Created comprehensive Launch Contexts guide for Farcaster Frames v2
