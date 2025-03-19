# AuthProvider Component

## Overview

The `AuthProvider` component serves as the authentication context provider for the application, integrating Farcaster's Auth-kit. It enables "Sign in with Farcaster" functionality and manages authentication state throughout the application, making user data accessible to all components.

## Table of Contents

- [Props](#props)
- [Example Usage](#example-usage)
- [Implementation Details](#implementation-details)
- [Dependencies](#dependencies)
- [Configuration](#configuration)
- [Authentication Flow](#authentication-flow)
- [Related Components](#related-components)
- [Troubleshooting](#troubleshooting)
- [Changelog](#changelog)

## Props

| Prop     | Type            | Required | Default | Description                       |
| -------- | --------------- | -------- | ------- | --------------------------------- |
| children | React.ReactNode | Yes      | -       | Child components to render inside |

## Example Usage

### Basic Usage in Root Layout

```tsx
// src/app/providers.tsx
'use client';

import { AuthProvider } from '@/components/providers/AuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
```

### Usage with Other Providers

```tsx
// src/app/providers.tsx
'use client';

import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
```

## Implementation Details

The AuthProvider component:

1. Wraps the application with `AuthKitProvider` from Farcaster Auth-kit
2. Configures authentication parameters (domain, URI, relay)
3. Sets up TanStack Query for managing authentication state
4. Provides authentication context to all child components
5. Enables access to authentication hooks throughout the application

## Dependencies

- **@farcaster/auth-kit**: Provides the core authentication functionality
- **@tanstack/react-query**: Manages authentication state and data fetching
- **viem**: Used for blockchain interactions

## Configuration

The AuthProvider is configured with several parameters:

```tsx
const config = {
  domain: process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost',
  siweUri: process.env.NEXT_PUBLIC_SIWE_URI || 'http://localhost:3000/login',
  rpcUrl: 'https://mainnet.optimism.io',
  relay: 'https://relay.farcaster.xyz',
};
```

| Parameter | Description                    | Default Value                 |
| --------- | ------------------------------ | ----------------------------- |
| domain    | The domain of your application | 'localhost'                   |
| siweUri   | Sign-in with Ethereum URI      | 'http://localhost:3000/login' |
| rpcUrl    | RPC URL for blockchain access  | 'https://mainnet.optimism.io' |
| relay     | Farcaster relay URL            | 'https://relay.farcaster.xyz' |

## Authentication Flow

The complete authentication flow with AuthProvider:

1. User clicks the `SignInButton` component
2. Auth-kit displays a QR code or initiates mobile redirect
3. User approves the sign-in in their Farcaster wallet
4. Auth-kit receives the authentication response
5. The signed message is sent to the server for verification
6. Server verifies the signature and creates a session
7. The application reflects the authenticated state

## Related Components

- **SignInButton**: Displays the authentication button
- **UserProfile**: Displays authenticated user information
- **ProtectedRoute**: Restricts access to authenticated users
- **useAuth**: Hook for accessing authentication state

## Troubleshooting

### Common Issues

1. **Authentication Not Persisting**

   - Ensure cookies are properly configured on your server
   - Check that the domain in the Auth-kit config matches your application domain

2. **Invalid SIWE URI**

   - Verify that the `siweUri` points to a valid endpoint in your application
   - Ensure the URI is properly URL-encoded if necessary

3. **RPC Errors**
   - Check if the RPC endpoint is accessible
   - Consider using a different RPC provider if encountering rate limits

### Required Environment Variables

The following environment variables should be set:

```
NEXT_PUBLIC_APP_DOMAIN=your-domain.com
NEXT_PUBLIC_SIWE_URI=https://your-domain.com/login
```

## Changelog

| Version | Date       | Changes                                         |
| ------- | ---------- | ----------------------------------------------- |
| 1.0.0   | 2024-03-15 | Initial implementation                          |
| 1.1.0   | 2024-03-28 | Added TanStack Query integration                |
| 1.2.0   | 2024-04-05 | Updated configuration for production deployment |
