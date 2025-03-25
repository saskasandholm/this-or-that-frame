# Frame Meta Tags for Farcaster Frames v2

*Last Updated: March 25, 2025*


This document explains how to implement the meta tags required for Farcaster Frames v2.

## Overview

Farcaster Frames v2 uses meta tags to define how a frame is displayed and behaves within Farcaster clients. These meta tags need to be included in the `<head>` section of your HTML document.

## Required Meta Tags

The primary meta tag for Frames v2 is:

```html
<meta name="fc:frame" content="<stringified FrameEmbed JSON>" />
```

The `content` attribute contains a stringified JSON object with the following structure:

```typescript
type FrameEmbed = {
  // Frame spec version. Required.
  // Example: "next"
  version: 'next';

  // Frame image. Required.
  // Max 512 characters.
  // Image must be 3:2 aspect ratio and less than 10 MB.
  // Example: "https://myapp.example/og-image.png"
  imageUrl: string;

  // Button attributes. Required.
  button: {
    // Button text. Required.
    // Max length of 32 characters.
    // Example: "Open App"
    title: string;

    // Action attributes. Required.
    action: {
      // Action type. Must be "launch_frame". Required.
      type: 'launch_frame';

      // App name. Required.
      // Max length of 32 characters.
      // Example: "My Frame App"
      name: string;

      // Frame launch URL. Required.
      // Max 512 characters.
      // Example: "https://myapp.example/"
      url: string;

      // Splash image URL. Required.
      // Max 512 characters.
      // Image must be 200x200px and less than 1MB.
      // Example: "https://myapp.example/splash.png"
      splashImageUrl: string;

      // Hex color code. Required.
      // Example: "#ffffff"
      splashBackgroundColor: string;
    };
  };
};
```

## Implementation in Next.js

In a Next.js application, you can add these meta tags in various ways:

### 1. Using Metadata Object in Layout

For Next.js apps using the App Router, you can define metadata in your layout file:

```tsx
// app/layout.tsx
import { Metadata } from 'next';

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

### 2. Dynamic Meta Tags in Pages

For pages that need dynamic meta tags based on props or data:

```tsx
// app/[id]/page.tsx
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Fetch item data if needed
  const item = await fetchItem(id);

  return {
    title: `${item.name} | My Frame`,
    description: item.description,
    other: {
      'fc:frame': JSON.stringify({
        version: 'next',
        imageUrl: `${APP_URL}/api/og/${id}`,
        button: {
          title: 'View Details',
          action: {
            type: 'launch_frame',
            name: 'My Frame App',
            url: `${APP_URL}/items/${id}`,
            splashImageUrl: `${APP_URL}/splash.png`,
            splashBackgroundColor: '#ffffff',
          },
        },
      }),
    },
  };
}

export default function ItemPage({ params }: Props) {
  // Page content
}
```

## Creating Dynamic OG Images

Next.js provides built-in support for dynamic Open Graph images via the `ImageResponse` API:

```tsx
// app/api/og/[id]/route.tsx
import { ImageResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;

  // Fetch data for this item if needed
  const item = await fetchItem(id);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#fff',
          padding: 50,
        }}
      >
        <h1 style={{ fontSize: 60, fontWeight: 'bold' }}>{item.name}</h1>
        <p style={{ fontSize: 30 }}>{item.description}</p>
      </div>
    ),
    {
      width: 1200,
      height: 630, // 1.91:1 ratio
    }
  );
}
```

## Creating a Splash Image

The splash image is shown during the transition to your frame application. It should be a square image (200x200px) and less than 1MB in size:

1. Create a static splash image in your `public` directory
2. Reference it in your frame meta tag using the full URL

```html
<meta
  name="fc:frame"
  content='{
  "version": "next",
  "imageUrl": "https://myapp.example/og-image.png",
  "button": {
    "title": "Open App",
    "action": {
      "type": "launch_frame",
      "name": "My Frame App",
      "url": "https://myapp.example/",
      "splashImageUrl": "https://myapp.example/splash.png",
      "splashBackgroundColor": "#ffffff"
    }
  }
}'
/>
```

## Frame Manifest (Optional)

For advanced functionality, you can provide a manifest file at the well-known URI `/.well-known/farcaster.json`:

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

To serve this manifest in Next.js, create a public directory structure matching the path:

```
public/
  .well-known/
    farcaster.json
```

## Testing Frame Meta Tags

To test your frame meta tags:

1. Deploy your application or use a tunneling service like ngrok to expose your local server
2. Visit the [Warpcast Frame Playground](https://warpcast.com/~/developers/frame-playground)
3. Enter your URL to verify that the frame loads correctly

## Common Issues

1. **Frame not detected**: Make sure all required meta tags are present and correctly formatted
2. **Images not displaying**: Verify URLs are publicly accessible and images have the correct dimensions
3. **Invalid JSON**: Check that your JSON string is properly escaped and formatted

## Best Practices

1. **Use environment variables** for URLs to make deployment to different environments easier
2. **Generate OG images dynamically** to create custom experiences for different content
3. **Keep button text concise** and descriptive (max 32 characters)
4. **Create a distinctive splash image** that represents your app's brand
5. **Test on multiple devices** to ensure compatibility

## Changelog

- **v1.0.0** (Initial Documentation): Created comprehensive guide for Farcaster Frames v2 meta tags
