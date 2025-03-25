# AUTHENTICATION.md (ARCHIVED)

*Last Updated: March 25, 2025*

> **NOTICE**: This file has been archived. The content has been consolidated into 
> [AUTH_GUIDE.md](consolidated/AUTH_GUIDE.md).
> Please refer to that document for the most up-to-date information.

---

# Authentication with Farcaster AuthKit

*Last Updated: March 25, 2024*


This documentation outlines the authentication system used in the This-or-That application, which utilizes Farcaster's AuthKit for user authentication.

## Overview

Our authentication system is built using [Farcaster's AuthKit](https://docs.farcaster.xyz/auth-kit/installation), a React library that enables seamless authentication with Farcaster accounts. It allows users to sign in using their Farcaster wallet without needing to create a separate account.

## Setup

### Dependencies

The authentication system requires the following dependencies:

```bash
npm install @farcaster/auth-kit viem
```

### Configuration

The authentication is configured in the `AuthProvider` component:

```typescript
// src/components/providers/AuthProvider.tsx
'use client';

import '@farcaster/auth-kit/styles.css';
import { AuthKitProvider } from '@farcaster/auth-kit';
import { useState, useEffect } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  // Simple client-side initialization
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render the AuthKitProvider during server-side rendering
  if (!mounted) {
    return <>{children}</>;
  }
  
  // Configure provider exactly as in the documentation
  const config = {
    rpcUrl: 'https://mainnet.optimism.io',
    domain: typeof window !== 'undefined' ? window.location.host : 'localhost',
    siweUri: typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}/login`
      : 'http://localhost:3000/login',
  };

  return (
    <AuthKitProvider config={config}>
      {children}
    </AuthKitProvider>
  );
}
```

This provider is wrapped around the application in `src/app/providers.tsx`:

```typescript
// src/app/providers.tsx
'use client';

import { AuthProvider } from '@/components/providers/AuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

## Components

### SignInButton

The `SignInButton` component displays a "Sign In with Farcaster" button when the user is not authenticated:

```typescript
// src/components/SignInButton.tsx
'use client';

import { SignInButton as FarcasterSignInButton } from '@farcaster/auth-kit';
import { useProfile } from '@farcaster/auth-kit';

export function SignInButton({ className }: { className?: string }) {
  const { isAuthenticated } = useProfile();
  
  // Don't show the button if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={className}>
      <FarcasterSignInButton />
    </div>
  );
}
```

### UserProfile

The `UserProfile` component displays user information when authenticated:

```typescript
// src/components/UserProfile.tsx
'use client';

import { useProfile } from '@farcaster/auth-kit';
import Image from 'next/image';

export const UserProfile = ({ showDetails = true }: { showDetails?: boolean }) => {
  const { isAuthenticated, profile } = useProfile();

  if (!isAuthenticated) {
    return <p>You're not signed in.</p>;
  }

  // Display user information
  return (
    <div>
      <h3>{profile?.displayName || profile?.username || 'User'}</h3>
      {profile?.username && <p>@{profile.username}</p>}
      {profile?.fid && <p>FID: {profile.fid}</p>}
    </div>
  );
};
```

### SignOutButton

The `SignOutButton` component allows users to sign out:

```typescript
// src/components/SignOutButton.tsx
'use client';

import { LogOut } from 'lucide-react';

export function SignOutButton({ className, onClick }: { className?: string, onClick?: () => void }) {
  const handleSignOut = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    
    try {
      // Clear auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fc:session:v1');
        localStorage.removeItem('fc:session:backup:v1');
        localStorage.removeItem('fc:authstate');
      }
      
      // Reload page to update auth state
      window.location.reload();
    } catch (error) {
      console.error('[SignOutButton] Error signing out:', error);
    }
  };
  
  return (
    <button className={className} onClick={handleSignOut} type="button">
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </button>
  );
}
```

## Usage

### Checking Authentication Status

You can check if a user is authenticated using the `useProfile` hook from AuthKit:

```typescript
import { useProfile } from '@farcaster/auth-kit';

function MyComponent() {
  const { isAuthenticated, profile } = useProfile();
  
  if (!isAuthenticated) {
    return <p>Please sign in to continue.</p>;
  }
  
  return <p>Welcome, {profile?.username}!</p>;
}
```

### Handling Profile Images

When displaying profile images, always add error handling to prevent UI issues:

```typescript
{profile?.pfpUrl ? (
  <Image 
    src={profile.pfpUrl} 
    alt={profile.username || 'User'} 
    width={64} 
    height={64}
    onError={(e) => {
      // Handle image loading error
      e.currentTarget.style.display = 'none';
    }}
  />
) : (
  <div>Fallback Avatar</div>
)}
```

## Remote Images Configuration

To display profile images from Farcaster, you need to configure Next.js to allow images from the Farcaster image delivery domain. Add this to your `next.config.js`:

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
      // Other domains...
    ],
  },
};
```

## Authentication Flow

1. User clicks the "Sign In with Farcaster" button.
2. Farcaster wallet (e.g., Warpcast) opens for authentication.
3. User approves the sign-in request.
4. AuthKit stores the authentication state in browser localStorage.
5. The UI updates to show the authenticated user's information.

## Troubleshooting

### Common Issues

1. **Ethereum Property Conflicts**: If you encounter errors about the `ethereum` property, ensure there are no conflicts with other wallet integrations.

2. **Image Loading Errors**: If profile images fail to load, verify that 'imagedelivery.net' is properly configured in `next.config.js`.

3. **Sign-out Issues**: If sign-out doesn't work, ensure you're clearing all relevant localStorage items (`fc:session:v1`, `fc:session:backup:v1`, `fc:authstate`).

4. **SSR Hydration Errors**: Wrap authentication-related components with client-side rendering guards to prevent hydration mismatches.

### Debug Mode

For debugging purposes, you can monitor authentication-related localStorage items and console logs. Check the browser console for logs prefixed with `[AuthProvider]`, `[SignInButton]`, and `[UserProfile]`.

## Testing

Visit `/auth-test` in the application to access a dedicated page for testing authentication functionality. This page provides detailed information about the authentication state and allows you to test sign-in and sign-out flows.

---

This authentication implementation follows Farcaster's recommended practices and provides a seamless authentication experience for users with Farcaster accounts. 
