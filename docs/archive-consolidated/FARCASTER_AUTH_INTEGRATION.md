# Farcaster Auth-kit Integration Guide

*Last Updated: March 25, 2025*


## Overview

Farcaster Auth-kit is a library that enables "Sign in with Farcaster" (SIWF) functionality, allowing users to authenticate using their Farcaster accounts. This document outlines how to integrate Auth-kit into our application, providing users with a seamless authentication experience while preserving their Farcaster identity.

## Benefits of Auth-kit Integration

1. **Frictionless Authentication**: Users can sign in with their existing Farcaster accounts
2. **User Identity**: Access to user's Farcaster profile information (FID, username, etc.)
3. **Ecosystem Integration**: Better integration with the broader Farcaster ecosystem
4. **Enhanced User Experience**: Personalized content and preferences based on user identity
5. **Reduced Onboarding Friction**: No need for users to create new accounts

## Technical Components

### Authentication Flow

1. **Client-side Initiation**: User clicks "Sign in with Farcaster" button
2. **Authentication Request**: App requests signature from the user's Farcaster account
3. **Signature Verification**: Server verifies the signature to confirm identity
4. **Session Creation**: A session is created for the authenticated user
5. **Profile Access**: Application accesses user profile information via Auth-kit hooks

### Required Dependencies

```bash
# Install Auth-kit and related dependencies
npm install @farcaster/auth-kit wagmi viem permissionless
```

## Implementation Plan

### 1. Client Configuration

First, set up the Auth-kit provider in your application:

```tsx
// src/components/AuthProvider.tsx
'use client';

import { AuthKitProvider } from '@farcaster/auth-kit';
import { optimism } from 'viem/chains';
import { createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = createConfig({
  chains: [optimism],
  transports: {
    [optimism.id]: http('https://mainnet.optimism.io'),
  },
});

const queryClient = new QueryClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthKitProvider config={config}>{children}</AuthKitProvider>
    </QueryClientProvider>
  );
}
```

### 2. Sign-in Button Component

Create a sign-in button component:

```tsx
// src/components/SignInButton.tsx
'use client';

import { SignInButton as FarcasterSignInButton } from '@farcaster/auth-kit';
import { useAuthState } from '@/hooks/useAuthState';

export function SignInButton() {
  const { isAuthenticated, isLoading } = useAuthState();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return null; // Don't show sign-in button if already authenticated
  }

  return (
    <FarcasterSignInButton
      onSuccess={async response => {
        // Send the response to your server for verification
        // and session creation
        const { signature, message } = response;
        await fetch('/api/auth/farcaster', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ signature, message }),
        });

        // Redirect or update UI state as needed
        window.location.href = '/dashboard';
      }}
      onError={error => {
        console.error('Error signing in with Farcaster:', error);
      }}
    />
  );
}
```

### 3. Server-side Implementation

Set up server-side authentication endpoint:

```typescript
// src/app/api/auth/farcaster/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySignInMessage } from '@farcaster/auth-kit/server';

export async function POST(req: NextRequest) {
  try {
    const { signature, message } = await req.json();

    // Verify the signature
    const result = await verifySignInMessage({
      signature,
      message,
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { fid, username, displayName, pfpUrl } = result.message;

    // Store user data in your database
    // This is where you'd integrate with Prisma/your DB
    await db.user.upsert({
      where: { fid },
      update: { username, displayName, pfpUrl, lastLogin: new Date() },
      create: { fid, username, displayName, pfpUrl, lastLogin: new Date() },
    });

    // Create a session for the user
    // This depends on your session management approach (NextAuth, cookies, etc.)
    // Example using a simple cookie:
    const response = NextResponse.json({ success: true });
    response.cookies.set('farcaster_auth', JSON.stringify({ fid, username }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error) {
    console.error('Error processing Farcaster authentication:', error);
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}
```

### 4. User Profile Integration

Create hooks to access user profile information:

```typescript
// src/hooks/useAuthState.ts
'use client';

import { useProfile } from '@farcaster/auth-kit';
import { useEffect, useState } from 'react';

export function useAuthState() {
  const { isAuthenticated, profile, loading } = useProfile();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (isAuthenticated && profile) {
      setUser({
        fid: profile.fid,
        username: profile.username || '',
        displayName: profile.displayName || '',
        pfpUrl: profile.pfpUrl || '',
      });
    } else {
      setUser(null);
    }

    setIsLoading(false);
  }, [isAuthenticated, profile, loading]);

  return {
    user,
    isAuthenticated,
    isLoading,
  };
}
```

### 5. Auth State Provider

Create a context provider for auth state:

```tsx
// src/context/AuthContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { useAuthState } from '@/hooks/useAuthState';

type AuthContextType = {
  user: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
});

export function AuthStateProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthState();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
```

### 6. Protected Routes

Create middleware to protect routes:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get auth cookie
  const authCookie = request.cookies.get('farcaster_auth');

  // Check for protected routes
  if (
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/profile')
  ) {
    // If no auth cookie, redirect to login
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
};
```

## Integration with Existing Features

### Connecting Frame Experience with Auth

For a seamless experience between our Frame and the full application:

```typescript
// In frame handling code
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fid, buttonIndex } = parseFrameMessage(body);

    // When user wants to access full app features
    if (buttonIndex === 1) {
      // Generate a deep link to the auth flow
      return NextResponse.json({
        version: 'next',
        imageUrl: 'https://yourapp.com/api/og/auth-prompt',
        button: {
          title: 'Sign in with Farcaster',
          action: {
            type: 'launch_frame',
            name: 'Your App Name',
            url: 'https://yourapp.com/auth/farcaster',
            splashImageUrl: 'https://yourapp.com/splash.png',
            splashBackgroundColor: '#ffffff',
          },
        },
      });
    }

    // Regular frame interaction handling
    // ...
  } catch (error) {
    // Error handling
  }
}
```

### Personalized Content

Provide personalized content based on authentication:

```tsx
// src/components/PersonalizedContent.tsx
'use client';

import { useAuth } from '@/context/AuthContext';

export function PersonalizedContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div>
        <h2>Sign in to see personalized content</h2>
        <SignInButton />
      </div>
    );
  }

  return (
    <div>
      <h2>Welcome back, {user.displayName || user.username}!</h2>
      <div>
        <h3>Your Voting History</h3>
        {/* Display user-specific content */}
      </div>
      <div>
        <h3>Your Achievements</h3>
        {/* Display user-specific achievements */}
      </div>
    </div>
  );
}
```

## Next Steps and Considerations

### Security Considerations

1. **Server-side Verification**: Always verify signatures on the server
2. **Session Management**: Use secure, HttpOnly cookies
3. **CSRF Protection**: Implement CSRF tokens for important operations
4. **Rate Limiting**: Add rate limiting to prevent abuse

### Performance Optimization

1. **Caching User Data**: Cache frequently accessed user data
2. **Optimistic UI Updates**: Implement optimistic UI updates for better UX
3. **Connection Pooling**: Use connection pooling for database operations

### Advanced Features

1. **Refresh Tokens**: Implement refresh tokens for long-lived sessions
2. **Multi-provider Auth**: Consider adding additional auth providers
3. **Permission Levels**: Implement granular permission levels
4. **Custom Claims**: Add custom claims for role-based access control

## Resources

- [Farcaster Auth-kit Documentation](https://docs.farcaster.xyz/auth-kit/introduction)
- [Sign in with Farcaster Specification](https://docs.farcaster.xyz/reference/auth/siwf)
- [Optimism RPC Configuration](https://docs.optimism.io/builders/tools/build/json-rpc)
- [NextAuth.js Integration](https://next-auth.js.org/configuration/providers/credentials)

## Implementation Timeline

1. **Week 1**: Set up Auth-kit provider and sign-in button
2. **Week 2**: Implement server-side verification and session management
3. **Week 3**: Create user profile integration and personalized content
4. **Week 4**: Test and debug authentication flow

## Conclusion

Integrating Farcaster Auth-kit provides substantial benefits for user experience and ecosystem integration. By following this guide, we can implement a robust, secure authentication system that leverages users' existing Farcaster identities.

This integration will serve as the foundation for more advanced features like personalized content, user-specific preferences, and deeper integration with the Farcaster ecosystem.
