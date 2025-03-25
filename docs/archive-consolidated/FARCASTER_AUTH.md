# FARCASTER_AUTH.md (ARCHIVED)

*Last Updated: March 25, 2025*

> **NOTICE**: This file has been archived. The content has been consolidated into 
> [AUTH_GUIDE.md](consolidated/AUTH_GUIDE.md).
> Please refer to that document for the most up-to-date information.

---

# Farcaster Authentication Integration

*Last Updated: March 25, 2024*


This document outlines how Farcaster authentication is implemented in the "This or That" application.

## Overview

The application uses the Farcaster Auth-kit to enable "Sign in with Farcaster" (SIWF) functionality. This allows users to authenticate using their Farcaster accounts, providing a seamless experience while preserving their Farcaster identity.

## Architecture

The authentication system consists of the following components:

1. **Client-side Auth-kit Integration**:

   - AuthProvider component for Auth-kit context
   - SignInButton component for the login UI
   - Auth context for state management

2. **Server-side Authentication**:

   - API endpoint for verifying signatures
   - Session management using secure cookies
   - User data storage in the database

3. **Protected Routes**:
   - Middleware for route protection
   - Redirect to login prompt when authentication is required

## User Flow

1. User clicks the "Sign in with Farcaster" button
2. Auth-kit handles the QR code display or direct wallet connection
3. User approves the sign-in request in their Farcaster wallet
4. Signature and message are sent to our server for verification
5. Server verifies the signature and creates a session
6. User is now authenticated and can access protected features

## Implementation Details

### Auth Provider Setup

The Auth-kit provider is set up in the application's component hierarchy:

```tsx
// src/components/providers/AuthProvider.tsx
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

### Server-side Verification

The server verifies signatures using the `@farcaster/auth-client` package:

```tsx
// src/app/api/auth/farcaster/route.ts
import { createAppClient, viemConnector } from '@farcaster/auth-client';

// Create an app client for verification
const appClient = createAppClient({
  ethereum: viemConnector(),
});

// Verify the signature
const verifyResponse = await appClient.verifySignInMessage({
  message,
  signature: signature as `0x${string}`,
  domain: process.env.NEXT_PUBLIC_APP_URL || 'localhost',
});
```

### Authentication State Management

The authentication state is managed using React context:

```tsx
// src/context/AuthContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { useAuthState, FarcasterUser } from '@/hooks/useAuthState';

type AuthContextType = {
  user: FarcasterUser | null;
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

### Protected Routes

Route protection is implemented using Next.js middleware:

```tsx
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get auth cookie
  const authCookie = request.cookies.get('farcaster_auth');

  // Check for protected routes
  if (
    request.nextUrl.pathname.startsWith('/profile') ||
    request.nextUrl.pathname.startsWith('/submit-topic') ||
    (request.nextUrl.pathname.startsWith('/admin') &&
      !request.nextUrl.pathname.startsWith('/admin/login'))
  ) {
    // If no auth cookie, redirect to home page with a login param
    if (!authCookie) {
      return NextResponse.redirect(new URL('/?login=required', request.url));
    }
  }

  return NextResponse.next();
}
```

## Database Schema

The User model in the Prisma schema:

```prisma
model User {
  id          Int       @id @default(autoincrement())
  fid         Int       @unique
  username    String?
  displayName String?
  pfpUrl      String?
  custody     String?
  lastLogin   DateTime  @default(now())
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([fid])
}
```

## Benefits

1. **Seamless Authentication**: Users can sign in with their existing Farcaster accounts
2. **User Identity**: Access to user's Farcaster profile information (FID, username, etc.)
3. **Ecosystem Integration**: Better integration with the broader Farcaster ecosystem
4. **Enhanced User Experience**: Personalized content and preferences based on user identity
5. **Reduced Onboarding Friction**: No need for users to create new accounts

## Future Enhancements

1. **Enhanced Profile Management**: Allow users to update additional profile information
2. **Social Features**: Enable friend connections and social interactions
3. **Multi-provider Auth**: Add support for additional authentication methods
4. **Permission Levels**: Implement role-based access control for different user types
5. **Refresh Tokens**: Implement refresh tokens for long-lived sessions

## Troubleshooting

- **Authentication Failures**: Check browser console for error messages and ensure Farcaster wallet is properly connected.
- **Session Issues**: Clear cookies and try signing in again if session problems occur.
- **Database Errors**: Check server logs for any database connection or query issues during user creation/update.
