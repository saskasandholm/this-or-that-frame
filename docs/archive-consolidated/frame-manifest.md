# Frame Manifest for Farcaster Frames v2

*Last Updated: March 25, 2025*


This document explains how to create and implement a Frame Manifest file for your Farcaster Frames v2 application.

## Overview

The Frame Manifest is a JSON file that provides metadata about your frame application. It's served at a well-known location on your domain and provides Farcaster clients with information about your frame, including:

1. Domain ownership verification through account association
2. Frame configuration details (name, URLs, images)
3. Trigger points that define how your frame can be launched

## Manifest Location

Your manifest must be served at the following URL:

```
https://yourdomain.com/.well-known/farcaster.json
```

## Manifest Structure

The manifest follows this structure:

```typescript
type FarcasterManifest = {
  // Metadata associating the domain with a Farcaster account
  accountAssociation: {
    // base64url encoded JFS header
    header: string;
    // base64url encoded payload containing a single property `domain`
    payload: string;
    // base64url encoded signature bytes
    signature: string;
  };

  // Frame configuration
  frame: FrameConfig;

  // Trigger configuration (optional)
  triggers?: TriggerConfig[];
};
```

## Domain Account Association

The account association links your domain to a Farcaster account, which helps establish authenticity and ownership. The signature must be a signed JSON Farcaster Signature from the account's custody address with the following payload:

```typescript
{
  domain: string; // Must match the domain serving the manifest
}
```

### How to Generate the Account Association

1. Create a JSON object with the domain property:

   ```json
   { "domain": "yourdomain.com" }
   ```

2. Sign this payload with your Farcaster account's custody address using JFS (JSON Farcaster Signatures)

3. Include the resulting header, payload, and signature in the manifest

## Frame Config

The frame configuration provides essential information about your frame application:

```typescript
type FrameConfig = {
  // Manifest version (required)
  version: '1';

  // App name (required) - max 32 characters
  name: string;

  // Default launch URL (required) - max 512 characters
  homeUrl: string;

  // Frame application icon URL (optional) - max 512 characters
  // Image must be 200x200px and less than 1MB
  iconUrl: string;

  // Default image to show when frame is rendered in a feed (optional)
  // Image must have a 3:2 ratio
  imageUrl: string;

  // Default button title to use when frame is rendered in a feed (optional)
  // Max 32 characters
  buttonTitle: string;

  // Splash image URL (optional) - max 512 characters
  // Image must be 200x200px and less than 1MB
  splashImageUrl?: string;

  // Hex color code for splash background (optional)
  splashBackgroundColor?: string;

  // URL to which clients will POST events (optional but required for notifications)
  // Max 512 characters
  webhookUrl?: string;
};
```

### Example Frame Config

```json
"frame": {
  "version": "1",
  "name": "My Frame App",
  "homeUrl": "https://myframeapp.com",
  "iconUrl": "https://myframeapp.com/icon.png",
  "imageUrl": "https://myframeapp.com/default-image.png",
  "buttonTitle": "Launch App",
  "splashImageUrl": "https://myframeapp.com/splash.png",
  "splashBackgroundColor": "#ffffff",
  "webhookUrl": "https://myframeapp.com/webhook"
}
```

## Triggers Configuration

Triggers allow users to launch your frame from different contexts within Farcaster clients. These are replacing the older "cast actions" and "composer actions" with a unified system.

```typescript
type TriggerConfig =
  | {
      // Type of trigger (required): 'cast' or 'composer'
      type: 'cast';

      // Unique ID (required) - reported to the frame
      id: string;

      // Handler URL (required)
      url: string;

      // Name override (optional) - defaults to FrameConfig.name
      name?: string;
    }
  | {
      type: 'composer';
      id: string;
      url: string;
      name?: string;
    };
```

### Trigger Types

| Trigger Type | Description                                                             |
| ------------ | ----------------------------------------------------------------------- |
| `cast`       | Called when the app is invoked from a cast (formerly "cast action")     |
| `composer`   | Called when invoked from the cast composer (formerly "composer action") |

Future trigger types may include:

- `channel` (for channel profiles)
- `user` (for user profiles)

### Example Triggers Config

```json
"triggers": [
  {
    "type": "cast",
    "id": "view-stats",
    "url": "https://myframeapp.com/triggers/cast",
    "name": "View Stats"
  },
  {
    "type": "composer",
    "id": "add-poll",
    "url": "https://myframeapp.com/triggers/composer",
    "name": "Add Poll"
  }
]
```

## Frame Invocation Contexts

When your frame is invoked, it may receive different context information depending on how it was launched:

| Type         | Description                                     | Context Provided                 |
| ------------ | ----------------------------------------------- | -------------------------------- |
| global       | Called from app launcher or unspecified context | None                             |
| embed        | Called from an embed in a feed or direct cast   | Cast hash, embed URL, embed type |
| notification | Called when a user taps a frame notification    | Notification ID                  |
| trigger      | Called when a user activates a trigger          | Trigger type and ID              |

## Complete Manifest Example

```json
{
  "accountAssociation": {
    "header": "eyJhbGciOiJFUzI1NiIsImZjdCI6Im...",
    "payload": "eyJkb21haW4iOiJteWZyYW1lYXBw...",
    "signature": "szgkqOWJ4ZGFWT6hRlhFR-C..."
  },
  "frame": {
    "version": "1",
    "name": "My Frame App",
    "homeUrl": "https://myframeapp.com",
    "iconUrl": "https://myframeapp.com/icon.png",
    "imageUrl": "https://myframeapp.com/default-image.png",
    "buttonTitle": "Launch App",
    "splashImageUrl": "https://myframeapp.com/splash.png",
    "splashBackgroundColor": "#ffffff",
    "webhookUrl": "https://myframeapp.com/webhook"
  },
  "triggers": [
    {
      "type": "cast",
      "id": "view-stats",
      "url": "https://myframeapp.com/triggers/cast",
      "name": "View Stats"
    },
    {
      "type": "composer",
      "id": "add-poll",
      "url": "https://myframeapp.com/triggers/composer",
      "name": "Add Poll"
    }
  ]
}
```

## Serving the Manifest

To correctly serve your manifest file:

1. Create a `.well-known` directory at the root of your domain
2. Place the `farcaster.json` file in this directory
3. Ensure your server is configured to serve the `.well-known` directory
4. Verify that `https://yourdomain.com/.well-known/farcaster.json` returns your manifest

### Next.js Implementation

For Next.js applications, you'll need to configure the server to properly serve files from the `.well-known` directory:

```typescript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: '/api/well-known/farcaster',
      },
    ];
  },
};
```

Then create an API route to serve the manifest:

```typescript
// pages/api/well-known/farcaster.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    accountAssociation: {
      header: 'eyJhbGciOiJFUzI1NiIsImZjdCI6Im...',
      payload: 'eyJkb21haW4iOiJteWZyYW1lYXBw...',
      signature: 'szgkqOWJ4ZGFWT6hRlhFR-C...',
    },
    frame: {
      version: '1',
      name: 'My Frame App',
      homeUrl: 'https://myframeapp.com',
      // Other config...
    },
    triggers: [
      // Your triggers...
    ],
  });
}
```

## Manifest Caching

Farcaster clients may cache your frame manifest when scraping embeds. Implementations should consider cache invalidation and provide means to force refreshing the manifest when needed.

## Testing Your Manifest

You can validate your manifest implementation by:

1. Checking it with a JSON validator
2. Using tools like [frame.farcaster.xyz](https://frame.farcaster.xyz/) to preview your frame
3. Testing the account association signature against your custody address

## Changelog

- **v1.0.0** (Initial Documentation): Created comprehensive Frame Manifest guide for Farcaster Frames v2
