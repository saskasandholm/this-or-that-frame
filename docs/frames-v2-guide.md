# Farcaster Frames v2 - Developer Guide

## Introduction

Farcaster Frames v2 represents a significant upgrade from the original Frames implementation. This new standard enables richer social applications with the following features:

- Full screen interactive canvas based on HTML/CSS/Javascript
- Reliable and fast mobile wallet transactions
- Ability to save, search, and discover frames
- Access to native mobile notifications
- Farcaster native actions, like follows and channel invitations
- Developer attribution

This guide will walk you through building a Farcaster Frame v2 application using Next.js.

## Project Setup

### Prerequisites

- Node.js (v18 or later)
- Yarn or npm
- Basic understanding of React and Next.js

### Initial Setup

1. Create a new Next.js application:

```bash
yarn create next-app
# Configuration options:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind CSS: Yes
# - src/ directory: Yes
# - App Router: Yes
# - Import alias: @/* (default)
```

2. Install Frame-specific dependencies:

```bash
# Frame SDK for interacting with the Farcaster client
yarn add @farcaster/frame-sdk

# Wagmi for wallet interactions
yarn add wagmi viem@2.x @tanstack/react-query
```

## Core Concepts

### Frame Structure

A Farcaster Frame v2 consists of:

1. **Initial Frame**: The HTML page that is embedded in a cast, with meta tags defining the frame properties
2. **Response Frames**: The frames returned when a user interacts with buttons
3. **Frame App**: The full-screen interactive application opened when a user engages with the frame

### Implementation Components

1. **Meta Tags**: Required in the HTML `<head>` to identify the page as a Frame
2. **Server Endpoints**: For handling frame interactions via POST requests
3. **Client-side SDK**: For enabling interactive features and wallet connections
4. **Frame Manifest**: (Optional) A file at `/.well-known/farcaster.json` with metadata about your Frame

## Building Your First Frame

### 1. Setting Up the Initial Frame

Create a component for your frame page. Since frames are designed for mobile, use a fixed width:

```tsx
// app/components/Demo.tsx
export default function Demo() {
  return (
    <div className="w-[300px] mx-auto py-4 px-2">
      <h1 className="text-2xl font-bold text-center mb-4">My First Frame v2</h1>
    </div>
  );
}
```

Import this component dynamically in your page:

```tsx
// app/page.tsx
'use client';

import dynamic from 'next/dynamic';

const Demo = dynamic(() => import('@/components/Demo'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col p-4">
      <Demo />
    </main>
  );
}
```

### 2. Integrating the Frame SDK

The Frame SDK helps your application interact with the Farcaster client:

```tsx
// app/components/Demo.tsx
'use client';

import { useEffect, useState } from 'react';
import { FrameContainer, FrameSDK } from '@farcaster/frame-sdk';

export default function Demo() {
  const [sdk, setSdk] = useState<FrameSDK | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Create a new SDK instance
    const newSdk = new FrameSDK();
    setSdk(newSdk);

    // Signal to the Farcaster client that our frame is ready
    newSdk.ready().then(() => {
      setIsReady(true);
    });

    // Clean up on unmount
    return () => {
      newSdk.removeAllListeners();
    };
  }, []);

  return (
    <div className="w-[300px] mx-auto py-4 px-2">
      <h1 className="text-2xl font-bold text-center mb-4">My First Frame v2</h1>
      {isReady ? (
        <p className="text-green-500">Frame is ready!</p>
      ) : (
        <p className="text-yellow-500">Frame is loading...</p>
      )}
    </div>
  );
}
```

### 3. Adding Meta Tags for Frame Discovery

Create a layout component to include the required meta tags:

```tsx
// app/layout.tsx
import { Metadata } from 'next';
import './globals.css';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'My Farcaster Frame',
  description: 'A Farcaster Frame v2 example',
  other: {
    'fc:frame': JSON.stringify({
      version: 'next',
      imageUrl: `${APP_URL}/api/og`,
      button: {
        title: 'Open App',
        action: {
          type: 'launch_frame',
          name: 'My Frame App',
          url: APP_URL,
          splashImageUrl: `${APP_URL}/splash.png`,
          splashBackgroundColor: '#ffffff',
        },
      },
    }),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 4. Create an API Route for the Open Graph Image

```tsx
// app/api/og/route.tsx
import { ImageResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          fontSize: 40,
          color: 'black',
          background: 'white',
          width: '100%',
          height: '100%',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        My First Frame v2
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

### 5. Adding a Primary Button

The Frame SDK allows you to add a primary action button:

```tsx
// Extending your Demo component
useEffect(() => {
  if (sdk && isReady) {
    // Set up a primary button
    sdk.actions.setPrimaryButton({
      text: 'Take Action',
      enabled: true,
    });

    // Listen for button clicks
    sdk.on('primaryButtonClicked', () => {
      console.log('Primary button was clicked!');
      // Handle your action here
    });
  }
}, [sdk, isReady]);
```

### 6. Setting Up Wallet Integration

For wallet interactions, use the wagmi library:

```tsx
'use client';

import { WagmiConfig, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';

const queryClient = new QueryClient();

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiConfig>
  );
}
```

Wrap your application in this provider in `app/layout.tsx`.

## Testing Your Frame

### Local Testing

1. Run your Next.js development server:

```bash
yarn dev
```

2. Use a tunneling service like ngrok to make your local server accessible:

```bash
ngrok http http://localhost:3000
```

3. Open the Frame Playground on Warpcast mobile by visiting https://warpcast.com/~/developers/frame-playground

4. Enter your ngrok URL and tap "Launch" to test your frame.

### Deployment

For production, deploy your application to a hosting service like Vercel, Netlify, or a traditional web server. Make sure to:

1. Set environment variables correctly
2. Update the `NEXT_PUBLIC_APP_URL` to point to your production URL
3. Create a proper splash image (200x200px) and OG image (3:2 ratio)

## Advanced Features

### Notifications

Frames v2 supports notifications, allowing you to re-engage users:

1. Set up a webhook URL in your frame manifest
2. Listen for notification token events
3. Store tokens securely for later use
4. Send notifications using the provided API

### Frame Manifest

For advanced functionality, create a manifest file at `/.well-known/farcaster.json`:

```json
{
  "accountAssociation": {
    "header": "<base64url encoded JFS header>",
    "payload": "<base64url encoded payload>",
    "signature": "<base64url encoded signature bytes>"
  },
  "frame": {
    "version": "1",
    "name": "My Frame App",
    "homeUrl": "https://myapp.example",
    "iconUrl": "https://myapp.example/icon.png",
    "imageUrl": "https://myapp.example/image.png",
    "buttonTitle": "Launch App",
    "splashImageUrl": "https://myapp.example/splash.png",
    "splashBackgroundColor": "#ffffff"
  },
  "triggers": [
    {
      "type": "cast",
      "id": "view-data",
      "url": "https://myapp.example/triggers/cast",
      "name": "View Data"
    }
  ]
}
```

## Best Practices

1. **Performance**: Optimize for mobile devices with fast load times
2. **Error Handling**: Gracefully handle errors and network issues
3. **User Experience**: Keep the UI simple and intuitive
4. **Security**: Validate all incoming requests
5. **Testing**: Test your frame on multiple devices and clients

## Resources

- [Frames v2 Demo by Farcaster](https://github.com/farcasterxyz/frames-v2-demo)
- [Farcaster Frames v2 Documentation](https://docs.farcaster.xyz/developers/frames/v2/)
- [Warpcast Frame Playground](https://warpcast.com/~/developers/frame-playground)
- [Frame SDK on GitHub](https://github.com/farcasterxyz/frame-sdk)

## Changelog

- **v1.0.0** (Initial Documentation): Created comprehensive guide for Farcaster Frames v2 implementation
