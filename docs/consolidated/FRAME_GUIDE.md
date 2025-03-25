# Farcaster Frame Guide

*Last Updated: March 25, 2025*

This document provides a comprehensive overview of implementing and testing Farcaster Frames in our application.

## Table of Contents

- [Frame Implementation](#frame-implementation)
  - [Core Concepts](#core-concepts)
  - [Frame Setup](#frame-setup)
  - [API Endpoints](#api-endpoints)
  - [Frame Response Format](#frame-response-format)
- [Frame Testing](#frame-testing)
  - [Testing Environment](#testing-environment)
  - [Test Cases](#test-cases)
  - [Debugging Tips](#debugging-tips)
- [Best Practices](#best-practices)

## Frame Implementation

### Core Concepts

Farcaster Frames allow for interactive content embedded within Farcaster posts. The key components are:

1. **Frame Metadata**: Meta tags that define the frame behavior
2. **Frame Server**: Endpoints for rendering and handling interactions
3. **Response Handlers**: Logic for processing user interactions

### Frame Setup

#### Meta Tags

Each frame requires specific meta tags in the HTML head:

```html
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="https://yourdomain.com/api/og?title=Example" />
<meta property="fc:frame:button:1" content="Option A" />
<meta property="fc:frame:button:2" content="Option B" />
<meta property="fc:frame:post_url" content="https://yourdomain.com/api/frame" />
```

#### Frame SDK Implementation

We use the official `@farcaster/frame-sdk` to validate and process frame messages:

```typescript
import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@farcaster/frame-sdk';

export async function validateFrameMessage(req: NextRequest) {
  const body = await req.json();
  const frameMessage = await getFrameMessage(body);
  
  if (!frameMessage) {
    return { isValid: false, message: null };
  }
  
  return { isValid: true, message: frameMessage };
}
```

### API Endpoints

#### Frame Post Handler

This endpoint processes frame interactions:

```typescript
// src/app/api/frame/route.ts
import { NextRequest, NextResponse } from 'next';
import { getFrameHtmlResponse } from '@farcaster/frame-sdk';
import { validateFrameMessage } from '@/lib/frame-utils';

export async function POST(req: NextRequest) {
  const { isValid, message } = await validateFrameMessage(req);
  
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid frame message' }, { status: 400 });
  }
  
  // Process the button click
  const buttonIndex = message.buttonIndex;
  const fid = message.fid;
  
  // Handle the interaction
  switch (buttonIndex) {
    case 1:
      // Option A selected
      await recordVote(fid, 'A');
      break;
    case 2:
      // Option B selected
      await recordVote(fid, 'B');
      break;
  }
  
  // Generate the response HTML
  const html = getFrameHtmlResponse({
    image: 'https://yourdomain.com/api/og?title=Results',
    buttons: [
      { label: 'See Results' },
      { label: 'New Topic' }
    ],
    postUrl: 'https://yourdomain.com/api/frame/action',
  });
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
```

#### Image Generator

This endpoint generates dynamic images for frames:

```typescript
// src/app/api/og/route.ts
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Default Title';
  
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          fontSize: 60,
          color: 'white',
          background: 'linear-gradient(to right, #1E40AF, #3B82F6)',
          width: '100%',
          height: '100%',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

### Frame Response Format

Every frame response should follow this structure:

```typescript
interface FrameResponse {
  image: string;          // URL to the image
  buttons?: Button[];     // Array of buttons (max 4)
  postUrl?: string;       // URL to post to when buttons are clicked
  textInput?: string;     // Prompt for text input
}

interface Button {
  label: string;          // Button text
  action?: 'post' | 'post_redirect' | 'link'; // Action type
  target?: string;        // URL for redirect or link
}
```

## Frame Testing

### Testing Environment

#### Warpcast Frame Validator

The easiest way to test frames is using the Warpcast Frame Validator:

1. Go to [https://warpcast.com/~/developers/frames](https://warpcast.com/~/developers/frames)
2. Enter your frame URL
3. Click "Validate" to test your frame implementation

#### Local Testing

For local development:

1. Use a tool like ngrok to expose your local server
2. Set up your frame URL to point to the ngrok URL
3. Test using the Warpcast validator

```bash
# Start your Next.js app
npm run dev

# In a separate terminal, expose your local server
ngrok http 3000
```

### Test Cases

Every frame implementation should be tested for these scenarios:

1. **Initial Render**: Ensure the frame loads with correct meta tags
2. **Button Clicks**: Test all button interactions
3. **Input Validation**: If using text input, test with valid and invalid inputs
4. **Error Handling**: Test behavior when errors occur (e.g., database unavailable)
5. **Auth Integration**: Test frames with authenticated and unauthenticated users

#### Test Checklist

- [ ] Frame image loads correctly
- [ ] All buttons render properly
- [ ] Button clicks are processed correctly
- [ ] State is maintained between interactions
- [ ] Errors are handled gracefully
- [ ] Performance is acceptable (< 500ms response time)

### Debugging Tips

1. **Check Server Logs**: Most frame issues can be identified in the API route logs
2. **Validate Message Format**: Ensure your frame message validation is working
3. **Inspect Image Generation**: If images aren't loading, check the OG image endpoint
4. **Test With Different FIDs**: Some issues only appear with specific users

## Best Practices

1. **Keep Responses Fast**: Users expect quick responses to frame interactions
2. **Use Clear CTAs**: Button labels should be concise and clear
3. **Handle Edge Cases**: Always handle potential errors and invalid inputs
4. **Progressive Enhancement**: Design frames to work even if JavaScript is disabled
5. **Secure Validation**: Always validate frame messages to prevent spoofing
6. **Cache Images**: Use CDN or caching for frame images when possible
7. **Response Size**: Keep HTML responses under 5KB for optimal performance

## References

- [Farcaster Frames Documentation](https://docs.farcaster.xyz/reference/frames/spec)
- [Frame SDK Repository](https://github.com/farcaster-project/frame-sdk)
- [Warpcast Frames Validator](https://warpcast.com/~/developers/frames) 