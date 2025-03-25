# API Routes for Farcaster Frames v2

*Last Updated: March 25, 2025*


This document explains how to implement API routes to handle Farcaster Frame interactions.

## Overview

Farcaster Frames v2 uses server-side API routes to handle button clicks and user interactions. When a user clicks a button on a frame, a POST request is sent to your API route with a signed message containing user details and interaction data.

Your API route should:

1. Receive the POST request
2. Verify the message signature (optional but recommended)
3. Process the interaction
4. Return a response with either:
   - A new frame to display
   - A redirect URL

## Next.js 15.2 Compatibility

With Next.js 15.2, there are specific type requirements for API route handlers. The second parameter of route handlers (which contains route parameters) must use a consistent format. Here are the recommended approaches:

### Standard Route Handler Format

```typescript
// src/app/api/frame/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id;
  // Your handler code...
  return NextResponse.json({ id });
}
```

### For Type Compatibility Issues

If you encounter persistent type errors, you can use the following approach:

```typescript
export async function GET(request: NextRequest, context: any) {
  const id = context.params.id;
  // Your handler code...
  return NextResponse.json({ id });
}
```

### Consistent Parameter Pattern

Avoid destructuring the context parameter in route handlers to ensure compatibility:

```typescript
// Preferred in Next.js 15.2:
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id;
  // ...
}

// Avoid this pattern:
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  // ...
}
```

## Basic API Route Implementation

Here's how to implement a basic API route in Next.js to handle frame interactions:

```typescript
// src/app/api/frame/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();

    // Extract user information
    const { fid, url, buttonIndex, isValid } = parseFrameMessage(body);

    console.log('Received frame interaction:');
    console.log('- FID:', fid);
    console.log('- URL:', url);
    console.log('- Button Index:', buttonIndex);
    console.log('- Valid Signature:', isValid);

    // Process the interaction based on the button clicked
    const responseData = handleInteraction(buttonIndex, fid);

    // Return a new frame as response
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error processing frame interaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to parse the frame message
function parseFrameMessage(body: any) {
  // In a real implementation, you would verify the signature here
  // For now, we just extract the basic information

  const fid = body.fid || 0;
  const url = body.url || '';
  const buttonIndex = body.buttonIndex || 0;

  // Placeholder for signature verification
  const isValid = true;

  return { fid, url, buttonIndex, isValid };
}

// Helper function to handle the interaction
function handleInteraction(buttonIndex: number, fid: number) {
  // Generate a response based on the button clicked

  switch (buttonIndex) {
    case 1:
      return {
        version: 'next',
        imageUrl: 'https://myapp.example/api/og/success',
        button: {
          title: 'View Details',
          action: {
            type: 'launch_frame',
            name: 'My Frame App',
            url: `https://myapp.example/details?fid=${fid}`,
            splashImageUrl: 'https://myapp.example/splash.png',
            splashBackgroundColor: '#ffffff',
          },
        },
      };

    case 2:
      // For button 2, we could return a different frame
      return {
        version: 'next',
        imageUrl: 'https://myapp.example/api/og/alternate',
        button: {
          title: 'Go Back',
          action: {
            type: 'launch_frame',
            name: 'My Frame App',
            url: 'https://myapp.example/',
            splashImageUrl: 'https://myapp.example/splash.png',
            splashBackgroundColor: '#ffffff',
          },
        },
      };

    default:
      // Default response
      return {
        version: 'next',
        imageUrl: 'https://myapp.example/api/og/default',
        button: {
          title: 'Home',
          action: {
            type: 'launch_frame',
            name: 'My Frame App',
            url: 'https://myapp.example/',
            splashImageUrl: 'https://myapp.example/splash.png',
            splashBackgroundColor: '#ffffff',
          },
        },
      };
  }
}
```

## Message Signature Verification

For better security, you should verify the signature of incoming frame messages. Here's how to implement signature verification using the official Farcaster validation service:

```typescript
import { FrameValidationServiceScoped, FrameMessage } from '@farcaster/core';

// Function to verify frame message
async function verifyFrameMessage(message: FrameMessage): Promise<{
  isValid: boolean;
  message?: {
    fid: number;
    buttonIndex: number;
    inputText?: string;
    castId?: { fid: number; hash: string };
  };
  error?: string;
}> {
  try {
    const validationService = new FrameValidationServiceScoped();
    const result = await validationService.validateFrameMessage(message);

    if (!result.isValid || !result.message) {
      return {
        isValid: false,
        error: result.error || 'Invalid message signature',
      };
    }

    // Extract validated data from the message
    return {
      isValid: true,
      message: {
        fid: result.message.data.fid,
        buttonIndex: result.message.data.frameActionBody.buttonIndex,
        inputText: result.message.data.frameActionBody.inputText,
        castId: result.message.data.castId,
      },
    };
  } catch (error) {
    console.error('Error validating frame message:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

// Usage in an API route
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { isValid, message, error } = await verifyFrameMessage(body);

    if (!isValid) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // Continue processing with validated message data
    // ...
  } catch (error) {
    // Handle errors
  }
}
```

## Authentication API Routes

To support Farcaster authentication, you need to implement an authentication endpoint that verifies signatures from the Auth-kit. Here's how to implement the `/api/auth/farcaster` route:

```typescript
// src/app/api/auth/farcaster/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySignInMessage } from '@farcaster/auth-kit/server';
import { cookies } from 'next/headers';
import { generateSessionToken, encryptSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { signature, message } = body;

    // Verify the signature
    const result = await verifySignInMessage({
      message,
      signature,
      domain: process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost',
    });

    if (!result.success) {
      console.error('Failed to verify Farcaster signature:', result.error);
      return NextResponse.json({ error: 'Invalid signature or message' }, { status: 401 });
    }

    // Extract user information
    const { fid, username, displayName, pfpUrl } = result.message;

    // Create a session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store user info in session
    const sessionData = {
      userId: fid.toString(),
      username,
      displayName,
      pfpUrl,
      expiresAt: expiresAt.toISOString(),
    };

    // Encrypt the session
    const encryptedSession = encryptSession(sessionData);

    // Set a HTTP-only cookie with the session token
    const cookieStore = cookies();
    cookieStore.set({
      name: 'auth_session',
      value: encryptedSession,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    // Return success response
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error in Farcaster auth endpoint:', error);
    return NextResponse.json({ error: 'Server error during authentication' }, { status: 500 });
  }
}
```

### Helper Functions for Authentication

Create these helper functions in `src/lib/auth.ts`:

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-fallback-encryption-key-min-32-chars';
const IV_LENGTH = 16; // For AES, this is always 16

// Generate a random session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Encrypt session data
export function encryptSession(data: any): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);

    const serialized = JSON.stringify(data);
    let encrypted = cipher.update(serialized, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Error encrypting session:', error);
    throw new Error('Failed to encrypt session data');
  }
}

// Decrypt session data
export function decryptSession(encrypted: string): any {
  try {
    const parts = encrypted.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Error decrypting session:', error);
    throw new Error('Failed to decrypt session data');
  }
}

// Verify if a session is valid
export function verifySession(sessionData: any): boolean {
  if (!sessionData || !sessionData.expiresAt) {
    return false;
  }

  const expiresAt = new Date(sessionData.expiresAt);
  return expiresAt > new Date();
}
```

### Environment Variables for Authentication

Make sure to set these environment variables:

```
NEXT_PUBLIC_APP_DOMAIN=your-app-domain.com
ENCRYPTION_KEY=your-encryption-key-min-32-chars
```

## Security Best Practices

When implementing frame API handlers, follow these security best practices:

### 1. Input Validation

Always validate incoming frame message data before processing:

```typescript
// Input validation function
function validateFrameMessage(data: any): {
  isValid: boolean;
  buttonIndex?: number;
  fid?: number;
  error?: string;
} {
  // Check if data exists and is an object
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid request data format' };
  }

  // Check for untrustedData object
  if (!data.untrustedData || typeof data.untrustedData !== 'object') {
    return { isValid: false, error: 'Missing or invalid untrustedData' };
  }

  // Validate buttonIndex
  const buttonIndex = data.untrustedData.buttonIndex;
  if (
    buttonIndex === undefined ||
    typeof buttonIndex !== 'number' ||
    !Number.isInteger(buttonIndex) ||
    buttonIndex < 1
  ) {
    return { isValid: false, error: 'Invalid or missing buttonIndex' };
  }

  // Extract FID if present (optional)
  let fid = undefined;
  if (data.untrustedData.fid !== undefined) {
    if (typeof data.untrustedData.fid === 'number' && Number.isInteger(data.untrustedData.fid)) {
      fid = data.untrustedData.fid;
    } else {
      return { isValid: false, error: 'Invalid FID format' };
    }
  }

  return { isValid: true, buttonIndex, fid };
}

// Usage in API route
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const data = await req.json();

    // Validate the frame message
    const validation = validateFrameMessage(data);
    if (!validation.isValid) {
      return new NextResponse(
        JSON.stringify({
          message: validation.error || 'Invalid frame message',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Continue with valid data...
  } catch (error) {
    // Handle errors...
  }
}
```

### 2. Safe Database Operations

Never use raw SQL with user input. Instead, use parameterized queries:

```typescript
// UNSAFE - vulnerable to SQL injection:
await prisma.$executeRawUnsafe(
  `UPDATE "Topic" SET "votesA" = "votesA" + 1 WHERE "id" = ${topicId}`
);

// SAFE - use Prisma's parameterized methods:
await prisma.topic.update({
  where: { id: parseInt(topicId) },
  data: { votesA: { increment: 1 } },
});
```

### 3. Transaction Handling

Use transactions for operations that require atomicity:

```typescript
// Perform multiple operations atomically
await prisma.$transaction(async tx => {
  // Update vote counts
  await tx.topic.update({
    where: { id: topicId },
    data: { votesA: { increment: 1 } },
  });

  // Record the vote
  await tx.vote.create({
    data: {
      fid: userId,
      topicId: topicId,
      choice: 'A',
    },
  });

  // Update user streak
  await tx.userStreak.update({
    where: { fid: userId },
    data: {
      currentStreak: { increment: 1 },
      lastVoteDate: new Date(),
    },
  });
});
```

This ensures that either all operations complete successfully or none of them do, preventing data inconsistencies when errors occur.

### 4. Proper Error Handling

Implement comprehensive error handling:

```typescript
try {
  // API logic here
} catch (error) {
  console.error('Error processing frame request:', error);

  // Return a user-friendly error response
  return new NextResponse(
    JSON.stringify({
      message: 'Error processing request',
      image: {
        url: new URL('/api/og/error', new URL(req.url)).toString(),
        aspectRatio: '1.91:1',
      },
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
```

## Button Handling

## Multi-Step Interactions

Often, you'll want to create multi-step interactions with frames. You can use state management techniques to track the user's progress:

```typescript
// src/app/api/frame/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyFrameMessage } from '@/lib/verifyFrameMessage';
import { getUserState, updateUserState } from '@/lib/userState';

export async function POST(req: NextRequest) {
  try {
    // Parse and verify the request
    const body = await req.json();
    const { isValid, message } = await verifyFrameMessage(body);

    if (!isValid || !message) {
      return NextResponse.json({ error: 'Invalid message signature' }, { status: 400 });
    }

    const { fid, buttonIndex, inputText } = message;

    // Get the user's current state
    const userState = await getUserState(fid);

    // Process based on current state and button clicked
    let responseData;
    let newState;

    switch (userState.step) {
      case 'start':
        if (buttonIndex === 1) {
          // User clicked "Continue" on the first step
          responseData = generateNameInputFrame();
          newState = { step: 'name_input' };
        } else {
          // User clicked "Cancel"
          responseData = generateCancelledFrame();
          newState = { step: 'start' };
        }
        break;

      case 'name_input':
        if (inputText) {
          // User submitted a name
          responseData = generateConfirmationFrame(inputText);
          newState = {
            step: 'confirmation',
            data: { name: inputText },
          };
        } else {
          // No input provided
          responseData = generateNameInputFrame('Please enter a name');
          newState = { step: 'name_input' };
        }
        break;

      case 'confirmation':
        if (buttonIndex === 1) {
          // User confirmed
          await saveUserData(fid, userState.data);
          responseData = generateSuccessFrame();
          newState = { step: 'complete' };
        } else {
          // User went back
          responseData = generateNameInputFrame('', userState.data?.name);
          newState = { step: 'name_input' };
        }
        break;

      default:
        // Default to start
        responseData = generateStartFrame();
        newState = { step: 'start' };
    }

    // Update the user's state
    await updateUserState(fid, newState);

    // Return the response
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error processing frame interaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions to generate frames for each step
function generateStartFrame() {
  return {
    version: 'next',
    imageUrl: 'https://myapp.example/api/og/start',
    button: {
      title: 'Continue',
      action: {
        type: 'launch_frame',
        name: 'My Frame App',
        url: 'https://myapp.example/frame',
        splashImageUrl: 'https://myapp.example/splash.png',
        splashBackgroundColor: '#ffffff',
      },
    },
  };
}

function generateNameInputFrame(errorMessage = '', defaultValue = '') {
  return {
    version: 'next',
    imageUrl: `https://myapp.example/api/og/name-input?error=${encodeURIComponent(errorMessage)}`,
    button: {
      title: 'Submit',
      action: {
        type: 'launch_frame',
        name: 'My Frame App',
        url: 'https://myapp.example/frame',
        splashImageUrl: 'https://myapp.example/splash.png',
        splashBackgroundColor: '#ffffff',
      },
    },
  };
}

// Additional frame generation functions...

// Helper function to save user data
async function saveUserData(fid: number, data: any) {
  // Save to your database
  // Example: await db.userData.upsert({ fid, data });
}
```

## Form Input Handling

Frames v2 supports form inputs. Here's how to handle text input from a frame:

```typescript
// src/app/api/frame/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyFrameMessage } from '@/lib/verifyFrameMessage';

export async function POST(req: NextRequest) {
  try {
    // Parse and verify the request
    const body = await req.json();
    const { isValid, message } = await verifyFrameMessage(body);

    if (!isValid || !message) {
      return NextResponse.json({ error: 'Invalid message signature' }, { status: 400 });
    }

    const { fid, buttonIndex, inputText } = message;

    // Process the input
    if (inputText) {
      // User submitted text
      console.log(`User ${fid} submitted: ${inputText}`);

      // Save the input to your database
      await saveUserInput(fid, inputText);

      // Return a confirmation frame
      return NextResponse.json({
        version: 'next',
        imageUrl: `https://myapp.example/api/og/confirmation?text=${encodeURIComponent(inputText)}`,
        button: {
          title: 'Continue',
          action: {
            type: 'launch_frame',
            name: 'My Frame App',
            url: 'https://myapp.example/frame/next-step',
            splashImageUrl: 'https://myapp.example/splash.png',
            splashBackgroundColor: '#ffffff',
          },
        },
      });
    } else {
      // No input provided
      return NextResponse.json({
        version: 'next',
        imageUrl: 'https://myapp.example/api/og/input-required',
        button: {
          title: 'Try Again',
          action: {
            type: 'launch_frame',
            name: 'My Frame App',
            url: 'https://myapp.example/frame',
            splashImageUrl: 'https://myapp.example/splash.png',
            splashBackgroundColor: '#ffffff',
          },
        },
      });
    }
  } catch (error) {
    console.error('Error processing frame input:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to save user input
async function saveUserInput(fid: number, input: string) {
  // Save to your database
  // Example: await db.userInputs.create({ fid, input });
}
```

## Redirects and Linking

You can redirect users to external websites or deep links within your application:

```typescript
// src/app/api/frame/redirect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyFrameMessage } from '@/lib/verifyFrameMessage';

export async function POST(req: NextRequest) {
  try {
    // Parse and verify the request
    const body = await req.json();
    const { isValid, message } = await verifyFrameMessage(body);

    if (!isValid || !message) {
      return NextResponse.json({ error: 'Invalid message signature' }, { status: 400 });
    }

    const { fid, buttonIndex } = message;

    // Determine the redirect URL based on the button clicked
    let redirectUrl;

    switch (buttonIndex) {
      case 1:
        redirectUrl = 'https://myapp.example/profile';
        break;

      case 2:
        redirectUrl = 'https://myapp.example/dashboard';
        break;

      case 3:
        redirectUrl = 'https://docs.farcaster.xyz';
        break;

      default:
        redirectUrl = 'https://myapp.example';
    }

    // Log the redirect
    console.log(`Redirecting user ${fid} to ${redirectUrl}`);

    // Return a 302 redirect
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl,
      },
    });
  } catch (error) {
    console.error('Error processing redirect:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Dynamic OG Image Generation

For dynamic frames, you'll often want to generate custom OG images based on user data or interaction:

```typescript
// src/app/api/og/[type]/route.tsx
import { ImageResponse } from 'next/server';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const type = params.type;
    const searchParams = request.nextUrl.searchParams;

    // Extract query parameters
    const error = searchParams.get('error') || '';
    const text = searchParams.get('text') || '';

    // Generate different images based on the type and parameters
    switch (type) {
      case 'start':
        return generateStartImage();

      case 'name-input':
        return generateNameInputImage(error);

      case 'confirmation':
        return generateConfirmationImage(text);

      case 'success':
        return generateSuccessImage();

      default:
        return generateDefaultImage();
    }
  } catch (error) {
    console.error('Error generating OG image:', error);
    return generateErrorImage();
  }
}

// Helper functions to generate different images
function generateStartImage() {
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
          backgroundColor: '#f4f4f8',
          padding: 40,
        }}
      >
        <h1 style={{ fontSize: 60, fontWeight: 'bold', marginBottom: 20 }}>
          Welcome to My Frame
        </h1>
        <p style={{ fontSize: 30, textAlign: 'center' }}>
          Click Continue to get started
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

function generateNameInputImage(error: string) {
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
          backgroundColor: '#f4f4f8',
          padding: 40,
        }}
      >
        <h1 style={{ fontSize: 60, fontWeight: 'bold', marginBottom: 20 }}>
          What's your name?
        </h1>
        <p style={{ fontSize: 30, textAlign: 'center', marginBottom: 20 }}>
          Please enter your name in the input field
        </p>
        {error && (
          <p style={{ fontSize: 24, color: 'red', textAlign: 'center' }}>
            {error}
          </p>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

// Additional image generation functions...
```

## Database Integration

For more complex frames, you'll want to store and retrieve data from a database:

```typescript
// src/lib/database.ts
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// User state management
export async function getUserState(fid: number) {
  try {
    const userState = await prisma.userState.findUnique({
      where: { fid },
    });

    return userState?.state || { step: 'start' };
  } catch (error) {
    console.error('Error fetching user state:', error);
    return { step: 'start' };
  }
}

export async function updateUserState(fid: number, state: any) {
  try {
    await prisma.userState.upsert({
      where: { fid },
      update: { state },
      create: { fid, state },
    });

    return true;
  } catch (error) {
    console.error('Error updating user state:', error);
    return false;
  }
}

// Save user inputs
export async function saveUserInput(fid: number, inputType: string, value: any) {
  try {
    await prisma.userInput.create({
      data: {
        fid,
        inputType,
        value,
        timestamp: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error('Error saving user input:', error);
    return false;
  }
}

// Get user data
export async function getUserData(fid: number) {
  try {
    const userData = await prisma.userData.findUnique({
      where: { fid },
    });

    return userData?.data || {};
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {};
  }
}

export async function updateUserData(fid: number, data: any) {
  try {
    await prisma.userData.upsert({
      where: { fid },
      update: { data },
      create: { fid, data },
    });

    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    return false;
  }
}
```

## Error Handling

Proper error handling is crucial for frame interactions:

```typescript
// src/app/api/frame/route.ts (extended error handling)
import { NextRequest, NextResponse } from 'next/server';
import { verifyFrameMessage } from '@/lib/verifyFrameMessage';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();

    // Check for required fields
    if (!body || !body.untrustedData) {
      logger.warn('Invalid request body', { body });
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    // Verify the message signature
    const { isValid, message } = await verifyFrameMessage(body);

    if (!isValid || !message) {
      logger.warn('Invalid message signature', { body });
      return NextResponse.json({ error: 'Invalid message signature' }, { status: 400 });
    }

    // Extract user information
    const { fid, buttonIndex } = message;

    // Log the interaction
    logger.info('Frame interaction', {
      fid,
      buttonIndex,
      url: message.url,
    });

    try {
      // Process the interaction
      const responseData = await processInteraction(buttonIndex, fid);

      // Return the response
      return NextResponse.json(responseData);
    } catch (processingError) {
      // Handle specific processing errors
      logger.error('Error processing interaction', {
        error: processingError,
        fid,
        buttonIndex,
      });

      // Return a user-friendly error frame
      return NextResponse.json({
        version: 'next',
        imageUrl: 'https://myapp.example/api/og/error',
        button: {
          title: 'Try Again',
          action: {
            type: 'launch_frame',
            name: 'My Frame App',
            url: 'https://myapp.example/frame',
            splashImageUrl: 'https://myapp.example/splash.png',
            splashBackgroundColor: '#ffffff',
          },
        },
      });
    }
  } catch (error) {
    // Handle top-level errors
    logger.error('Unhandled error in frame API', { error });

    // Return a generic error response
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Process interaction with error handling
async function processInteraction(buttonIndex: number, fid: number) {
  // Implementation with proper error handling
  // ...
}
```

## Testing API Routes

For testing your frame API routes, you can create a simple test client:

```typescript
// src/test/frameApiTest.ts
async function testFrameApi() {
  // Create a mock frame message
  const mockMessage = {
    untrustedData: {
      fid: 12345,
      url: 'https://myapp.example/frame',
      messageHash: '0x1234567890abcdef',
      timestamp: Date.now(),
      network: 1,
      buttonIndex: 1,
      inputText: 'Test input',
      castId: {
        fid: 12345,
        hash: '0xabcdef1234567890',
      },
    },
    trustedData: {
      messageBytes: '0x...',
    },
  };

  // Send a request to your API route
  const response = await fetch('http://localhost:3000/api/frame', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mockMessage),
  });

  // Log the response
  const data = await response.json();
  console.log('Response:', data);
}

// Run the test
testFrameApi().catch(console.error);
```

## Best Practices

### 1. Statelessness and Idempotency

- Design your API routes to be **stateless** whenever possible
- Make operations **idempotent** so duplicate requests don't cause issues
- Use a database or cache to store user state between requests

### 2. Performance

- **Optimize image generation** to keep response times low
- Use **edge functions** for faster response times
- Implement **caching** for frequently accessed data
- Keep frame payload sizes **small**

### 3. Security

- **Always verify message signatures** in production
- **Validate and sanitize all inputs** to prevent injection attacks
- Implement **rate limiting** to prevent abuse
- Use **secure database access patterns**

### 4. Reliability

- **Handle all error cases** gracefully
- **Log all interactions** for debugging and analytics
- **Monitor API health** and performance
- **Implement retries** for database operations

### 5. User Experience

- **Keep response times under 5 seconds** to avoid timeouts
- **Provide meaningful error messages** to users
- **Design for different screen sizes** and devices
- **Test thoroughly** on actual Farcaster clients

## Changelog

- **v1.0.0** (Initial Documentation): Created comprehensive API routes guide for Farcaster Frames v2
