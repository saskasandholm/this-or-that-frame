# Farcaster Frames v2 Notifications

This guide explains how to implement notifications in your Farcaster Frames v2 application.

## Overview

Farcaster Frames v2 allows you to send notifications to users who have enabled notifications for your frame. This feature helps with re-engagement and provides a way to update users about important events.

The notification system in Frames v2 works through a combination of:

1. **Client-side SDK events** that notify your app when a user enables or disables notifications
2. **Webhooks** that notify your server about notification-related events
3. **Server-to-server API calls** to send notifications to users

## Notification Workflow

The notification workflow consists of these steps:

1. User adds your frame to their saved frames list
2. Farcaster client sends notification token to your frame webhook
3. Your server stores the token
4. Your server sends notifications to the user via the token when needed
5. User clicks notification and launches your frame with notification context

## Implementation Steps

### 1. Set Up Your Webhook Endpoint

The first step is to set up a webhook endpoint to receive notification events. In your frame manifest, include a `webhookUrl`:

```json
{
  "frame": {
    "version": "1",
    "name": "My Frame App",
    "homeUrl": "https://myapp.example",
    "iconUrl": "https://myapp.example/icon.png",
    "imageUrl": "https://myapp.example/image.png",
    "buttonTitle": "Launch App",
    "splashImageUrl": "https://myapp.example/splash.png",
    "splashBackgroundColor": "#ffffff",
    "webhookUrl": "https://myapp.example/api/webhook"
  }
}
```

Create a Next.js API route to handle webhook events:

```typescript
// src/app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Handle different webhook events
    switch (data.event) {
      case 'frame_added':
        await handleFrameAdded(data);
        break;

      case 'frame_removed':
        await handleFrameRemoved(data);
        break;

      case 'notifications_enabled':
        await handleNotificationsEnabled(data);
        break;

      case 'notifications_disabled':
        await handleNotificationsDisabled(data);
        break;

      default:
        console.warn('Unknown webhook event:', data.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Event handlers
async function handleFrameAdded(data: any) {
  const { notificationDetails } = data;

  if (notificationDetails) {
    // Store notification details for later use
    await storeNotificationToken(data.fid, notificationDetails.url, notificationDetails.token);
  }

  console.log('Frame added by FID:', data.fid);
}

async function handleFrameRemoved(data: any) {
  // Remove notification tokens for this user
  await removeNotificationTokens(data.fid);

  console.log('Frame removed by FID:', data.fid);
}

async function handleNotificationsEnabled(data: any) {
  const { notificationDetails } = data;

  // Store notification details
  await storeNotificationToken(data.fid, notificationDetails.url, notificationDetails.token);

  console.log('Notifications enabled by FID:', data.fid);
}

async function handleNotificationsDisabled(data: any) {
  // Remove notification tokens for this user
  await removeNotificationTokens(data.fid);

  console.log('Notifications disabled by FID:', data.fid);
}

// Helper functions (implement based on your database)
async function storeNotificationToken(fid: number, url: string, token: string) {
  // Store in your database
  // Example: await db.notificationTokens.upsert({ fid, url, token });
}

async function removeNotificationTokens(fid: number) {
  // Remove from your database
  // Example: await db.notificationTokens.deleteMany({ fid });
}
```

### 2. Client-Side Notification Events

On the client side, listen for notification-related events using the Frame SDK:

```typescript
// src/components/NotificationHandler.tsx
'use client';

import { useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

export default function NotificationHandler() {
  useEffect(() => {
    // Listen for when the frame is added with notifications
    sdk.on('frameAdded', ({ notificationDetails }) => {
      console.log('Frame added');

      if (notificationDetails) {
        console.log('Notifications enabled with details:', notificationDetails);
        // You could store this client-side, but the webhook is more reliable
      }
    });

    // Listen for when the frame is removed
    sdk.on('frameRemoved', () => {
      console.log('Frame removed');
    });

    // Listen for when notifications are enabled
    sdk.on('notificationsEnabled', ({ notificationDetails }) => {
      console.log('Notifications enabled:', notificationDetails);
    });

    // Listen for when notifications are disabled
    sdk.on('notificationsDisabled', () => {
      console.log('Notifications disabled');
    });

    // Clean up on unmount
    return () => {
      sdk.removeAllListeners();
    };
  }, []);

  return null; // This component just sets up listeners, doesn't render anything
}
```

### 3. Store Notification Tokens

You need to store notification tokens securely in your database. Here's an example schema:

```typescript
// Prisma schema example
model NotificationToken {
  id          String   @id @default(cuid())
  fid         Int      // User's Farcaster ID
  url         String   // Notification URL
  token       String   // Token for this user and client
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([fid, token])
  @@index([fid])
}
```

### 4. Sending Notifications

To send a notification, make a POST request to the notification URL with the token:

```typescript
// src/lib/sendNotification.ts
interface NotificationPayload {
  notificationId: string;
  title: string;
  body: string;
  targetUrl: string;
  tokens: string[];
}

interface NotificationResponse {
  successTokens: string[];
  invalidTokens: string[];
  rateLimitedTokens: string[];
}

async function sendNotification(
  url: string,
  payload: NotificationPayload
): Promise<NotificationResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Notification failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function sendNotificationToUsers(
  userFids: number[],
  notificationId: string,
  title: string,
  body: string,
  targetUrl: string
) {
  // Get tokens for these users from your database
  const tokenRecords = await getNotificationTokens(userFids);

  // Group tokens by URL (client app)
  const tokensByUrl: Record<string, string[]> = {};
  for (const record of tokenRecords) {
    if (!tokensByUrl[record.url]) {
      tokensByUrl[record.url] = [];
    }
    tokensByUrl[record.url].push(record.token);
  }

  // Send notifications to each client app
  const results: Record<string, NotificationResponse> = {};
  for (const [url, tokens] of Object.entries(tokensByUrl)) {
    // Send in batches if needed (e.g., max 10000 tokens per request)
    const batchSize = 10000;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);

      try {
        const result = await sendNotification(url, {
          notificationId,
          title,
          body,
          targetUrl,
          tokens: batch,
        });

        // Process results
        for (const invalidToken of result.invalidTokens) {
          // Remove invalid tokens from your database
          await removeInvalidToken(invalidToken);
        }

        results[url] = result;
      } catch (error) {
        console.error(`Failed to send notifications to ${url}:`, error);
      }
    }
  }

  return results;
}

// Helper functions (implement based on your database)
async function getNotificationTokens(fids: number[]) {
  // Fetch from your database
  // Example: return db.notificationTokens.findMany({ where: { fid: { in: fids } } });
  return [];
}

async function removeInvalidToken(token: string) {
  // Remove from your database
  // Example: await db.notificationTokens.delete({ where: { token } });
}
```

### 5. API Route for Sending Notifications

Create an API route that your application can use to send notifications:

```typescript
// src/app/api/notifications/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendNotificationToUsers } from '@/lib/sendNotification';

export async function POST(req: NextRequest) {
  try {
    // Authenticate the request (implement your own authentication)
    // if (!isAuthenticated(req)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { userFids, notificationId, title, body, targetUrl } = await req.json();

    // Validate inputs
    if (!Array.isArray(userFids) || userFids.length === 0) {
      return NextResponse.json({ error: 'userFids must be a non-empty array' }, { status: 400 });
    }

    if (!notificationId || !title || !body || !targetUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Make sure the target URL is for your domain
    const appDomain = process.env.NEXT_PUBLIC_APP_URL || '';
    if (!targetUrl.startsWith(appDomain)) {
      return NextResponse.json({ error: 'targetUrl must be on your domain' }, { status: 400 });
    }

    // Send notifications
    const results = await sendNotificationToUsers(userFids, notificationId, title, body, targetUrl);

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Failed to send notification:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
```

### 6. Handling Notification Launch Context

When a user clicks a notification, your frame will be launched with the notification context:

```typescript
// src/components/NotificationHandler.tsx (extended)
'use client';

import { useEffect, useState } from 'react';
import sdk, { type FrameContext } from '@farcaster/frame-sdk';

export default function NotificationHandler() {
  const [context, setContext] = useState<FrameContext | null>(null);

  useEffect(() => {
    const init = async () => {
      const ctx = await sdk.context;
      setContext(ctx);
      sdk.actions.ready();

      // Check if launched from notification
      if (ctx.location?.type === 'notification') {
        // Handle notification launch
        handleNotificationLaunch(ctx.location.notificationId);
      }
    };

    init();

    // Other event listeners...

    return () => {
      sdk.removeAllListeners();
    };
  }, []);

  // Handle notification launch
  const handleNotificationLaunch = (notificationId: string) => {
    console.log('Launched from notification:', notificationId);

    // You can fetch notification details from your database
    // or use the notificationId to determine what to show
  };

  // Render content based on launch context
  if (!context) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {context.location?.type === 'notification' ? (
        <div>
          <h1>You clicked a notification!</h1>
          <p>Notification ID: {context.location.notificationId}</p>
        </div>
      ) : (
        <div>
          <h1>Normal launch</h1>
        </div>
      )}
    </div>
  );
}
```

## Use Cases and Examples

### 1. Activity Notifications

Notify users when someone interacts with their content:

```typescript
// When someone comments on a user's content
async function notifyCommentReceived(
  recipientFid: number,
  commenterUsername: string,
  contentTitle: string
) {
  const notificationId = `comment-${Date.now()}-${recipientFid}`;
  const title = 'New comment';
  const body = `${commenterUsername} commented on "${contentTitle}"`;
  const targetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/content/view?notification=comment`;

  await sendNotificationToUsers([recipientFid], notificationId, title, body, targetUrl);
}
```

### 2. Time-based Notifications

Send reminders or updates at specific times:

```typescript
// Scheduled job to notify users of daily summary
async function sendDailySummaries() {
  // Get active users from your database
  const activeUsers = await getActiveUsers();

  for (const user of activeUsers) {
    const notificationId = `daily-summary-${Date.now()}-${user.fid}`;
    const title = 'Daily Summary';
    const body = `You have ${user.stats.newItems} new items today`;
    const targetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/summary?date=${new Date().toISOString().split('T')[0]}`;

    await sendNotificationToUsers([user.fid], notificationId, title, body, targetUrl);
  }
}
```

### 3. Transaction Notifications

Notify users about blockchain transactions:

```typescript
// When a transaction completes
async function notifyTransactionComplete(
  userFid: number,
  txHash: string,
  amount: string,
  asset: string
) {
  const notificationId = `tx-${txHash}`;
  const title = 'Transaction Complete';
  const body = `Your ${amount} ${asset} transaction has completed`;
  const targetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/transactions/view?tx=${txHash}`;

  await sendNotificationToUsers([userFid], notificationId, title, body, targetUrl);
}
```

## Best Practices

### 1. Token Management

- **Store tokens securely** in your database
- **Remove invalid tokens** promptly when notification requests fail
- **Group tokens by URL** when sending to multiple clients

### 2. Rate Limiting

- Implement **client-side throttling** to avoid spamming users
- **Respect the rate limits** returned by the client server
- Implement a **backoff strategy** for rate-limited tokens

### 3. User Experience

- Send **meaningful and actionable notifications**
- Provide **clear UI for managing notifications**
- Use **deep links** to take users to the right place in your app
- Make notification text **concise and informative**

### 4. Security

- **Validate incoming webhook requests** if possible
- **Authenticate internal API calls** that send notifications
- **Only send notifications to users** who have opted in
- **Never expose tokens** in client-side code

## Troubleshooting

### Common Issues

1. **Webhooks not receiving events**

   - Verify your `webhookUrl` is correctly specified in your manifest
   - Make sure your webhook endpoint is publicly accessible
   - Check server logs for errors

2. **Notifications not being sent**

   - Validate that tokens are being stored correctly
   - Check for errors in your sending logic
   - Verify the notification URLs are correct

3. **Tokens becoming invalid**
   - Users may have disabled notifications
   - Users may have removed your frame
   - The client app may have invalidated tokens

### Debugging Tips

1. **Log webhook events** to understand what's happening
2. **Implement robust error handling** in your notification code
3. **Test with a small group of users** before scaling up
4. **Monitor invalid token rates** to detect issues early

## Changelog

- **v1.0.0** (Initial Documentation): Created comprehensive notifications guide for Farcaster Frames v2
