# Farcaster Frame SDK Integration

*Last Updated: March 25, 2025*


This guide covers how to integrate the Farcaster Frame SDK into your Next.js application.

## Overview

The Farcaster Frame SDK provides a set of tools to interact with the Farcaster client from your Frame application. It allows you to:

- Signal readiness to the client
- Access user context information
- Perform actions like opening URLs or closing the frame
- Interact with the user's wallet
- Listen for events
- Use the primary button API

## Installation

First, install the Frame SDK:

```bash
npm install @farcaster/frame-sdk
# or
yarn add @farcaster/frame-sdk
# or
pnpm add @farcaster/frame-sdk
```

## Basic SDK Integration

Since the SDK relies on browser APIs, we need to load it client-side only using dynamic imports in Next.js:

### 1. Create a Client Component

Create a client component that will use the SDK:

```tsx
// src/components/FrameApp.tsx
'use client';

import { useEffect, useState } from 'react';
import sdk, { type FrameContext } from '@farcaster/frame-sdk';

export default function FrameApp() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();

  // Initialize SDK and signal readiness
  useEffect(() => {
    const load = async () => {
      // Get context information
      const ctx = await sdk.context;
      setContext(ctx);

      // Signal that the frame is ready to be displayed
      sdk.actions.ready();
    };

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }

    // Cleanup event listeners on unmount
    return () => {
      sdk.removeAllListeners();
    };
  }, [isSDKLoaded]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Farcaster Frame App</h1>

      {context && (
        <div className="mb-4">
          <h2 className="text-xl font-bold">Context</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(context, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

### 2. Import the Component Dynamically

In your page file, import the client component dynamically:

```tsx
// src/app/page.tsx
import dynamic from 'next/dynamic';

// Import the FrameApp component with client-side only rendering
const FrameApp = dynamic(() => import('@/components/FrameApp'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <FrameApp />
    </main>
  );
}
```

## Using SDK Features

### Actions API

The SDK provides several actions you can perform:

```tsx
// Opening a URL
const openUrl = () => {
  sdk.actions.openUrl('https://farcaster.xyz');
};

// Closing the frame
const close = () => {
  sdk.actions.close();
};

// Setting a primary button
const setPrimaryButton = async () => {
  await sdk.actions.setPrimaryButton({
    text: 'Take Action',
    enabled: true,
  });
};

// Requesting to add your frame to the user's saved frames
const addFrame = async () => {
  try {
    const result = await sdk.actions.addFrame();
    console.log('Frame added:', result);
  } catch (error) {
    console.error('Error adding frame:', error);
  }
};
```

### Event Handling

You can listen for various events from the Farcaster client:

```tsx
useEffect(() => {
  // Primary button click handler
  sdk.on('primaryButtonClicked', () => {
    console.log('Primary button was clicked!');
    // Handle your action here
  });

  // Frame added event
  sdk.on('frameAdded', ({ notificationDetails }) => {
    console.log('Frame was added to saved frames!');
    if (notificationDetails) {
      // Store notification details for later use
      console.log('Notifications enabled:', notificationDetails);
    }
  });

  // Frame add rejected event
  sdk.on('frameAddRejected', ({ reason }) => {
    console.log('Frame add was rejected:', reason);
  });

  // Frame removed event
  sdk.on('frameRemoved', () => {
    console.log('Frame was removed from saved frames');
  });

  // Notifications enabled event
  sdk.on('notificationsEnabled', ({ notificationDetails }) => {
    console.log('Notifications were enabled:', notificationDetails);
  });

  // Notifications disabled event
  sdk.on('notificationsDisabled', () => {
    console.log('Notifications were disabled');
  });

  // Clean up event listeners on unmount
  return () => {
    sdk.removeAllListeners();
  };
}, []);
```

### Context Information

The SDK provides context information about the user and how the frame was launched:

```tsx
useEffect(() => {
  const getContextInfo = async () => {
    const context = await sdk.context;
    console.log('User FID:', context.fid);
    console.log('Username:', context.username);
    console.log('Frame source:', context.source);
    console.log('Launch context:', context.location);
  };

  getContextInfo();
}, []);
```

Example context object:

```json
{
  "version": "next",
  "fid": 3621,
  "username": "horsefacts.eth",
  "source": "warpcast",
  "verified": {
    "address": "0x8773442740c17c9d0f0b87022c722f9a136206ed"
  },
  "location": {
    "type": "cast_embed",
    "cast": {
      "fid": 3621,
      "hash": "0xa2fbef8c8e4d00d8f84ff45f9763b8bae2c5c544",
      "text": "New frame just dropped:",
      "embeds": ["https://myapp.example"]
    }
  }
}
```

## Advanced Features

### Frame Discovery Helper

To simplify frame discovery and interactions, we've implemented a custom hook that wraps the SDK functionality:

```tsx
// src/lib/FrameDiscoveryHelper.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import sdk, { type FrameContext } from '@farcaster/frame-sdk';

export function useFrameDiscovery() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext | null>(null);
  const [isInstalledFrame, setIsInstalledFrame] = useState(false);

  // Initialize SDK
  useEffect(() => {
    const load = async () => {
      try {
        const ctx = await sdk.context;
        setContext(ctx);
        sdk.actions.ready();

        // Check if this frame is already installed
        // This could be determined based on context or other information
        setIsInstalledFrame(false); // Default to false, update based on your logic
      } catch (error) {
        console.error('Error initializing Frame SDK:', error);
      }
    };

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }

    return () => {
      sdk.removeAllListeners();
    };
  }, [isSDKLoaded]);

  // Function to save the frame
  const saveFrame = useCallback(async () => {
    try {
      const result = await sdk.actions.addFrame();
      return result;
    } catch (error) {
      console.error('Error saving frame:', error);
      return { success: false, error };
    }
  }, []);

  return {
    isSDKLoaded,
    context,
    isInstalledFrame,
    saveFrame,
  };
}
```

### Save Frame Implementation

The FrameDiscoveryHelper provides a convenient way to prompt users to save your frame:

```tsx
// Implementing the save frame functionality in a component
import { useFrameDiscovery } from '@/lib/FrameDiscoveryHelper';

export function FrameSavePrompt({ type = 'modal', message, onClose, topicId, topicTitle }) {
  const { saveFrame } = useFrameDiscovery();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await saveFrame();
      if (result.success) {
        setSaved(true);
        // Close the prompt after a success delay
        setTimeout(() => {
          onClose?.();
        }, 2000);
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  // Render appropriate UI based on the type (modal, toast, inline)
  // ...
}
```

This implementation ensures proper type checking and provides a clean abstraction over the SDK's frame saving functionality.

### Primary Button API

The primary button provides a clear and consistent call to action:

```tsx
'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';

export default function PrimaryButtonExample() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Signal that the frame is ready
      sdk.actions.ready();

      // Set up the primary button
      await sdk.actions.setPrimaryButton({
        text: 'Submit',
        enabled: true,
      });

      // Listen for button clicks
      sdk.on('primaryButtonClicked', handleButtonClick);
    };

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      init();
    }

    return () => {
      sdk.removeAllListeners();
    };
  }, [isSDKLoaded]);

  const handleButtonClick = () => {
    // Process the button click
    console.log('Primary button clicked!');

    // You might want to update the button state
    sdk.actions.setPrimaryButton({
      text: 'Processing...',
      enabled: false,
    });

    // Do some work...

    // Update the button when done
    setTimeout(() => {
      sdk.actions.setPrimaryButton({
        text: 'Done!',
        enabled: true,
      });
    }, 2000);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Primary Button Example</h1>
      <p>Click the primary button at the bottom of the screen</p>
    </div>
  );
}
```

### Different Launch Contexts

Frames can be launched from different contexts. You can detect and respond to these:

```tsx
'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';

export default function ContextExample() {
  const [context, setContext] = useState(null);

  useEffect(() => {
    const init = async () => {
      const ctx = await sdk.context;
      setContext(ctx);
      sdk.actions.ready();
    };

    init();

    return () => {
      sdk.removeAllListeners();
    };
  }, []);

  if (!context) {
    return <div>Loading context...</div>;
  }

  // Handle different launch contexts
  const renderContextSpecificUI = () => {
    if (!context.location) {
      return <div>Launched directly</div>;
    }

    switch (context.location.type) {
      case 'cast_embed':
        return (
          <div>
            <h2>Launched from cast:</h2>
            <p>Cast text: {context.location.cast.text}</p>
            <p>Author FID: {context.location.cast.fid}</p>
          </div>
        );

      case 'notification':
        return (
          <div>
            <h2>Launched from notification:</h2>
            <p>Notification ID: {context.location.notificationId}</p>
          </div>
        );

      default:
        return <div>Unknown launch context</div>;
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Context Example</h1>

      <div className="mb-4">
        <h2 className="text-xl font-bold">User Info</h2>
        <p>FID: {context.fid}</p>
        <p>Username: {context.username}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold">Launch Context</h2>
        {renderContextSpecificUI()}
      </div>
    </div>
  );
}
```

## Common Patterns

### Loading and Error States

It's important to handle loading and error states in your frame application:

```tsx
'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';

export default function FrameWithStates() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Get context information
        const ctx = await sdk.context;
        setContext(ctx);

        // Signal that the frame is ready
        await sdk.actions.ready();

        // Update status
        setStatus('ready');
      } catch (err) {
        setStatus('error');
        setError(err.message || 'Unknown error');
      }
    };

    init();

    return () => {
      sdk.removeAllListeners();
    };
  }, []);

  // Render based on status
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 text-red-500">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>{error || 'An unknown error occurred'}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Ready state
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Frame is Ready</h1>
      {context && (
        <div>
          <p>Welcome, {context.username || `FID: ${context.fid}`}!</p>
        </div>
      )}
    </div>
  );
}
```

### Saving State

For frames that need to persist state between sessions:

```tsx
'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';

export default function StatefulFrame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [user, setUser] = useState(null);

  // Load stored state
  useEffect(() => {
    // Try to get saved state from localStorage
    const savedState = localStorage.getItem('frameState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        // Use the saved state
        console.log('Restored state:', state);
      } catch (e) {
        console.error('Failed to parse saved state');
      }
    }
  }, []);

  // Initialize SDK
  useEffect(() => {
    const init = async () => {
      try {
        const context = await sdk.context;

        // Store user information
        setUser({
          fid: context.fid,
          username: context.username,
          lastVisit: new Date().toISOString(),
        });

        // Save to localStorage
        localStorage.setItem(
          'frameState',
          JSON.stringify({
            user: {
              fid: context.fid,
              username: context.username,
              lastVisit: new Date().toISOString(),
            },
          })
        );

        sdk.actions.ready();
      } catch (e) {
        console.error('Failed to initialize:', e);
      }
    };

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      init();
    }

    return () => {
      sdk.removeAllListeners();
    };
  }, [isSDKLoaded]);

  if (!isSDKLoaded || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Stateful Frame</h1>
      <p>Welcome {user.username || `FID: ${user.fid}`}!</p>
      <p>Last visit: {user.lastVisit}</p>
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **SDK not loading**

   - Make sure you're using dynamic imports with `ssr: false`
   - Verify you're calling `sdk.actions.ready()` to signal readiness

2. **Context not available**

   - Ensure you're awaiting `sdk.context` before trying to use it
   - Verify you're testing in a Farcaster client that supports Frames v2

3. **Event listeners not firing**

   - Double-check the event name spelling
   - Make sure the event listeners are registered after the SDK is loaded
   - Clean up listeners with `sdk.removeAllListeners()` on component unmount

4. **Primary button not appearing**
   - Verify you're calling `sdk.actions.setPrimaryButton()` with valid parameters
   - Check that the frame is in a ready state

### Best Practices

1. **Always clean up event listeners** to prevent memory leaks
2. **Handle loading and error states** for a better user experience
3. **Use dynamic imports** to load the SDK client-side only
4. **Check for SDK readiness** before using its features
5. **Implement defensive coding** by wrapping SDK calls in try/catch blocks

## Full Example

Here's a complete example component that demonstrates SDK integration:

```tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import sdk, { type FrameContext } from '@farcaster/frame-sdk';

export default function CompleteSDKExample() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<FrameContext | null>(null);
  const [isPrimaryButtonVisible, setIsPrimaryButtonVisible] = useState(false);

  // Initialize SDK
  useEffect(() => {
    const init = async () => {
      try {
        // Get context information
        const ctx = await sdk.context;
        setContext(ctx);

        // Setup event listeners
        setupEventListeners();

        // Signal that the frame is ready
        await sdk.actions.ready();

        // Set primary button
        await sdk.actions.setPrimaryButton({
          text: 'Take Action',
          enabled: true,
        });
        setIsPrimaryButtonVisible(true);

        // Update status
        setStatus('ready');
      } catch (err) {
        setStatus('error');
        setError(err.message || 'Unknown error');
      }
    };

    init();

    return () => {
      sdk.removeAllListeners();
    };
  }, []);

  // Setup event listeners
  const setupEventListeners = useCallback(() => {
    // Primary button clicked
    sdk.on('primaryButtonClicked', () => {
      console.log('Primary button clicked');
      // Handle primary button action
    });

    // Frame added to saved frames
    sdk.on('frameAdded', ({ notificationDetails }) => {
      console.log('Frame added', notificationDetails);
      // Store notification details if present
    });

    // Frame removed from saved frames
    sdk.on('frameRemoved', () => {
      console.log('Frame removed');
    });

    // Notifications enabled
    sdk.on('notificationsEnabled', ({ notificationDetails }) => {
      console.log('Notifications enabled', notificationDetails);
    });

    // Notifications disabled
    sdk.on('notificationsDisabled', () => {
      console.log('Notifications disabled');
    });
  }, []);

  // Action handlers
  const openUrl = useCallback(() => {
    sdk.actions.openUrl('https://farcaster.xyz');
  }, []);

  const closeFrame = useCallback(() => {
    sdk.actions.close();
  }, []);

  const addFrame = useCallback(async () => {
    try {
      const result = await sdk.actions.addFrame();
      console.log('Add frame result:', result);
    } catch (err) {
      console.error('Failed to add frame:', err);
    }
  }, []);

  // Render based on status
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 text-red-500">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>{error || 'An unknown error occurred'}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Ready state
  return (
    <div className="w-[300px] mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">SDK Example</h1>

      {context && (
        <div className="mb-4">
          <h2 className="text-xl font-bold">User Info</h2>
          <p>FID: {context.fid}</p>
          {context.username && <p>Username: {context.username}</p>}
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-bold">Actions</h2>

        <div className="flex flex-col gap-2 mt-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={openUrl}>
            Open URL
          </button>

          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={closeFrame}>
            Close Frame
          </button>

          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={addFrame}>
            Add Frame
          </button>
        </div>
      </div>

      {isPrimaryButtonVisible && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Primary button is active at the bottom of the screen
        </div>
      )}
    </div>
  );
}
```

## Changelog

- **v1.0.0** (Initial Documentation): Created comprehensive SDK integration guide for Farcaster Frames v2
