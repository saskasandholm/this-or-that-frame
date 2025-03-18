# API Routes for Farcaster Frames v2

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

For better security, you should verify the signature of incoming frame messages. Here's how to implement signature verification:

```typescript
// src/lib/verifyFrameMessage.ts
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { FrameMessageData } from '@farcaster/frame-sdk';

// Create a public client for blockchain interactions
const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export async function verifyFrameMessage(
  body: any
): Promise<{ isValid: boolean; message: FrameMessageData | null }> {
  try {
    if (!body || !body.untrustedData || !body.trustedData) {
      return { isValid: false, message: null };
    }

    const { untrustedData, trustedData } = body;

    // Create message data
    const message: FrameMessageData = {
      fid: untrustedData.fid,
      url: untrustedData.url,
      messageHash: trustedData.messageHash,
      timestamp: untrustedData.timestamp,
      network: untrustedData.network,
      buttonIndex: untrustedData.buttonIndex,
      inputText: untrustedData.inputText || '',
      castId: {
        fid: untrustedData.castId?.fid,
        hash: untrustedData.castId?.hash,
      },
    };

    // In a production environment, you would verify the signature
    // This is simplified for the example
    const isValid = true;

    return { isValid, message };
  } catch (error) {
    console.error('Error verifying frame message:', error);
    return { isValid: false, message: null };
  }
}
```

Then update your API route to use this verification:

```typescript
// src/app/api/frame/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyFrameMessage } from '@/lib/verifyFrameMessage';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();

    // Verify the message signature
    const { isValid, message } = await verifyFrameMessage(body);

    if (!isValid || !message) {
      return NextResponse.json({ error: 'Invalid message signature' }, { status: 400 });
    }

    // Extract user information
    const { fid, url, buttonIndex } = message;

    console.log('Received frame interaction:');
    console.log('- FID:', fid);
    console.log('- URL:', url);
    console.log('- Button Index:', buttonIndex);

    // Process the interaction based on the button clicked
    const responseData = handleInteraction(buttonIndex, fid);

    // Return a new frame as response
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error processing frame interaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to handle the interaction
function handleInteraction(buttonIndex: number, fid: number) {
  // Same implementation as before
}
```

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
