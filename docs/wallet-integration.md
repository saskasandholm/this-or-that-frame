# Farcaster Integration Guide

This guide covers both authentication and wallet integration with Farcaster.

## Table of Contents

1. [Authentication with Auth-kit](#authentication-with-auth-kit)
   - [Overview](#auth-overview)
   - [Setup](#auth-setup)
   - [Custom Styling](#custom-styling)
   - [Troubleshooting](#auth-troubleshooting)
2. [Wallet Integration for Frames v2](#wallet-integration-for-frames-v2)
   - [Overview](#wallet-overview)
   - [Wallet Connector Setup](#wallet-connector-setup)
   - [Using the Wallet in Components](#using-the-wallet-in-components)
   - [Sending Transactions](#sending-transactions)
   - [Signing Messages](#signing-messages)
   - [Full Demo Component](#full-demo-component)

---

## Authentication with Auth-kit

<a id="auth-overview"></a>

### Overview

Farcaster Auth-kit enables "Sign in with Farcaster" functionality for your application, allowing users to authenticate using their Farcaster account. This creates a seamless onboarding experience and allows your app to access public social data with user permission.

#### Key Features

- QR code-based login flow for desktop
- Direct app-to-app redirects on mobile
- Access to user profile information
- React components and hooks for easy integration

<a id="auth-setup"></a>

### Setup

#### 1. Install Dependencies

```bash
npm install @farcaster/auth-kit viem
```

#### 2. Import CSS Styles

Make sure to import the Auth-kit CSS styles in your root layout:

```tsx
// src/app/layout.tsx or similar root file
import '@farcaster/auth-kit/styles.css';
```

#### 3. Configure AuthKitProvider

Create a provider with your app's domain and login URI:

```tsx
// src/components/providers/AuthProvider.tsx
'use client';

import { AuthKitProvider } from '@farcaster/auth-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configuration for AuthKitProvider
const config = {
  domain: process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost',
  siweUri: process.env.NEXT_PUBLIC_SIWE_URI || 'http://localhost:3000/login',
  rpcUrl: 'https://mainnet.optimism.io',
  relay: 'https://relay.farcaster.xyz',
};

const queryClient = new QueryClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthKitProvider config={config}>{children}</AuthKitProvider>
    </QueryClientProvider>
  );
}
```

#### 4. Create Authentication Context

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

#### 5. Create Auth State Hook

```tsx
// src/hooks/useAuthState.ts
'use client';

import { useProfile } from '@farcaster/auth-kit';
import { useEffect, useState } from 'react';

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
}

export function useAuthState() {
  const { isAuthenticated, profile } = useProfile();
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && profile) {
      if (typeof profile.fid === 'number') {
        setUser({
          fid: profile.fid,
          username: profile.username || '',
          displayName: profile.displayName || '',
          pfpUrl: profile.pfpUrl || '',
        });
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [isAuthenticated, profile]);

  return {
    user,
    isAuthenticated,
    isLoading,
  };
}
```

#### 6. Create Server-Side Auth Endpoint

```tsx
// src/app/api/auth/farcaster/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAppClient, viemConnector } from '@farcaster/auth-client';

export async function POST(req: NextRequest) {
  try {
    const { signature, message } = await req.json();

    // Create an app client for verification
    const appClient = createAppClient({
      ethereum: viemConnector(),
    });

    try {
      // Extract user data from message
      let fid = 1; // Default fallback
      let username = 'user';
      let displayName = '';
      let pfpUrl = '';

      // Parse message for user information
      if (typeof message === 'object') {
        if (message.fid && typeof message.fid === 'number') {
          fid = message.fid;
        }
        if (message.username) username = message.username;
        if (message.displayName) displayName = message.displayName;
        if (message.pfpUrl) pfpUrl = message.pfpUrl;
      }

      // Create a session for the user
      const response = NextResponse.json({
        success: true,
        fid,
        username,
        displayName,
        pfpUrl,
      });

      // Set auth cookie
      response.cookies.set(
        'farcaster_auth',
        JSON.stringify({
          fid,
          username,
          displayName,
          pfpUrl,
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 1 week
        }
      );

      return response;
    } catch (error) {
      console.error('Error processing auth:', error);
      return NextResponse.json({ error: 'Auth processing failed' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error processing Farcaster authentication:', error);
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}
```

#### 7. Create a Sign-In Button Component

```tsx
// src/components/SignInButton.tsx
'use client';

import { SignInButton as FarcasterSignInButton } from '@farcaster/auth-kit';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export function SignInButton({ className }: { className?: string }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // If still loading, show a loading state
  if (isLoading) {
    return (
      <Button className={className} disabled>
        Loading...
      </Button>
    );
  }

  // If authenticated, show user info
  if (isAuthenticated && user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img
          src={user.pfpUrl || 'https://warpcast.com/~/assets/favicon.png'}
          alt={user.displayName || user.username}
          className="h-8 w-8 rounded-full"
        />
        <span className="font-medium">{user.displayName || user.username}</span>
      </div>
    );
  }

  // Otherwise, show sign in button
  return (
    <div className="farcaster-button-wrapper">
      <FarcasterSignInButton
        onSuccess={async response => {
          setIsSigningIn(true);
          try {
            const { signature, message } = response;
            await fetch('/api/auth/farcaster', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ signature, message }),
            });
            window.location.reload();
          } catch (error) {
            console.error('Authentication error:', error);
          } finally {
            setIsSigningIn(false);
          }
        }}
      />
    </div>
  );
}
```

<a id="custom-styling"></a>

### Custom Styling

To match the Auth-kit button with your application's design, you can use CSS to override the default styles:

```tsx
// In your SignInButton component
return (
  <div className="farcaster-button-wrapper">
    <style jsx global>{`
      /* Override Farcaster button styles to match our UI */
      .farcaster-button-wrapper button.fc-authkit-button {
        background-color: rgb(139, 92, 246) !important; /* Match our purple button */
        border-radius: 0.5rem !important;
        border: none !important;
        padding: 0.5rem 1rem !important;
        font-family: var(--font-sans) !important;
        font-weight: 500 !important;
        box-shadow: none !important;
        height: 40px !important;
      }

      .farcaster-button-wrapper button.fc-authkit-button:hover {
        background-color: rgb(124, 58, 237) !important; /* Darker purple on hover */
      }
    `}</style>
    <FarcasterSignInButton onSuccess={/* handler */} onError={/* handler */} />
  </div>
);
```

<a id="auth-troubleshooting"></a>

### Troubleshooting

#### Common Issues

1. **QR Code Not Displaying**: Make sure Auth-kit CSS styles are imported at the root level.

2. **Authentication Not Persisting**: Verify your server-side route is properly setting the authentication cookie.

3. **Button Styling Issues**: Use browser developer tools to inspect the button classes and adjust your CSS overrides accordingly.

4. **Type Errors with Auth-kit**: Ensure you're using compatible versions of Auth-kit, viem, and other dependencies.

#### Environment Variables

Ensure these environment variables are set:

```
NEXT_PUBLIC_APP_DOMAIN=your-domain.com
NEXT_PUBLIC_SIWE_URI=https://your-domain.com/login
```

For local development:

```
NEXT_PUBLIC_APP_DOMAIN=localhost:3000
NEXT_PUBLIC_SIWE_URI=http://localhost:3000/login
```

---

## Wallet Integration for Frames v2

<a id="wallet-overview"></a>

### Overview

Farcaster Frames v2 provides access to the user's Ethereum wallet through the Frame SDK, allowing you to:

- Connect to the user's wallet
- Send transactions
- Sign messages and typed data
- Read wallet data (address, chain ID)

<a id="wallet-connector-setup"></a>

### Wallet Connector Setup

#### 1. Create the Custom Connector

Create a file at `src/lib/connector.ts`:

```typescript
import sdk from '@farcaster/frame-sdk';
import { SwitchChainError, fromHex, getAddress, numberToHex } from 'viem';
import { ChainNotConfiguredError, createConnector } from 'wagmi';

frameConnector.type = 'frameConnector' as const;

export function frameConnector() {
  let connected = true;

  return createConnector<typeof sdk.wallet.ethProvider>(config => ({
    id: 'farcaster',
    name: 'Farcaster Wallet',
    type: frameConnector.type,

    async setup() {
      this.connect({ chainId: config.chains[0].id });
    },
    async connect({ chainId } = {}) {
      const provider = await this.getProvider();
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      let currentChainId = await this.getChainId();
      if (chainId && currentChainId !== chainId) {
        const chain = await this.switchChain!({ chainId });
        currentChainId = chain.id;
      }

      connected = true;

      return {
        accounts: accounts.map(x => getAddress(x)),
        chainId: currentChainId,
      };
    },
    async disconnect() {
      connected = false;
    },
    async getAccounts() {
      if (!connected) throw new Error('Not connected');
      const provider = await this.getProvider();
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });
      return accounts.map(x => getAddress(x));
    },
    async getChainId() {
      const provider = await this.getProvider();
      const hexChainId = await provider.request({ method: 'eth_chainId' });
      return fromHex(hexChainId, 'number');
    },
    async isAuthorized() {
      if (!connected) {
        return false;
      }

      const accounts = await this.getAccounts();
      return !!accounts.length;
    },
    async switchChain({ chainId }) {
      const provider = await this.getProvider();
      const chain = config.chains.find(x => x.id === chainId);
      if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: numberToHex(chainId) }],
      });
      return chain;
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0) this.onDisconnect();
      else
        config.emitter.emit('change', {
          accounts: accounts.map(x => getAddress(x)),
        });
    },
    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit('change', { chainId });
    },
    async onDisconnect() {
      config.emitter.emit('disconnect');
      connected = false;
    },
    async getProvider() {
      return sdk.wallet.ethProvider;
    },
  }));
}
```

#### 2. Create a Wagmi Provider

Create a file at `src/components/providers/WagmiProvider.tsx`:

```tsx
import { createConfig, http, WagmiProvider } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { frameConnector } from '@/lib/connector';

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [frameConnector()],
});

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
```

#### 3. Create a Top-Level Providers Component

Create a file at `src/app/providers.tsx`:

```tsx
'use client';

import dynamic from 'next/dynamic';

const WagmiProvider = dynamic(() => import('@/components/providers/WagmiProvider'), {
  ssr: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <WagmiProvider>{children}</WagmiProvider>;
}
```

#### 4. Add the Providers to Your Layout

Update your `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import '@/app/globals.css';
import { Providers } from '@/app/providers';

export const metadata: Metadata = {
  title: 'Farcaster Frames v2 App',
  description: 'A Farcaster Frames v2 application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

<a id="using-the-wallet-in-components"></a>

### Using the Wallet in Components

Once you've set up the wallet connector, you can use Wagmi hooks in your components to interact with the wallet.

#### Basic Connection Example

```tsx
'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { config } from '@/components/providers/WagmiProvider';
import { Button } from '@/components/ui/Button'; // Create or import a button component

export function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div>
      {address && (
        <div className="mb-2">
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </div>
      )}

      <Button
        onClick={() => (isConnected ? disconnect() : connect({ connector: config.connectors[0] }))}
      >
        {isConnected ? 'Disconnect' : 'Connect Wallet'}
      </Button>
    </div>
  );
}
```

<a id="sending-transactions"></a>

### Sending Transactions

```tsx
'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '@/components/ui/Button';

export function SendTransaction() {
  const [txHash, setTxHash] = useState<string | null>(null);
  const { address, isConnected } = useAccount();

  const {
    sendTransaction,
    error: sendTxError,
    isError: isSendTxError,
    isPending: isSendTxPending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  });

  const handleSendTransaction = () => {
    sendTransaction(
      {
        to: '0x4bBFD120d9f352A0BEd7a014bd67913a2007a878', // Example address
        value: 0n, // No ETH value
        data: '0x', // No data
      },
      {
        onSuccess: hash => {
          setTxHash(hash);
        },
      }
    );
  };

  if (!isConnected) {
    return <div>Connect your wallet first</div>;
  }

  return (
    <div>
      <Button onClick={handleSendTransaction} disabled={isSendTxPending}>
        {isSendTxPending ? 'Sending...' : 'Send Transaction'}
      </Button>

      {isSendTxError && <div className="text-red-500 mt-2">{sendTxError?.message}</div>}

      {txHash && (
        <div className="mt-2">
          <div>Transaction Hash: {txHash.slice(0, 10)}...</div>
          <div>
            Status: {isConfirming ? 'Confirming...' : isConfirmed ? 'Confirmed!' : 'Pending'}
          </div>
        </div>
      )}
    </div>
  );
}
```

<a id="signing-messages"></a>

### Signing Messages

```tsx
'use client';

import { useAccount, useSignMessage } from 'wagmi';
import { Button } from '@/components/ui/Button';

export function SignMessage() {
  const { isConnected } = useAccount();

  const {
    signMessage,
    data: signature,
    error: signError,
    isPending: isSignPending,
  } = useSignMessage();

  const handleSignMessage = () => {
    signMessage({ message: 'Hello from Frames v2!' });
  };

  if (!isConnected) {
    return <div>Connect your wallet first</div>;
  }

  return (
    <div>
      <Button onClick={handleSignMessage} disabled={isSignPending}>
        {isSignPending ? 'Signing...' : 'Sign Message'}
      </Button>

      {signError && <div className="text-red-500 mt-2">{signError.message}</div>}

      {signature && (
        <div className="mt-2 break-all">
          <div>Signature: {signature.slice(0, 30)}...</div>
        </div>
      )}
    </div>
  );
}
```

<a id="full-demo-component"></a>

### Full Demo Component Example

Here's a complete example component that demonstrates all wallet functionality:

```tsx
'use client';

import { useEffect, useCallback, useState } from 'react';
import sdk, { type FrameContext } from '@farcaster/frame-sdk';
import {
  useAccount,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  useWaitForTransactionReceipt,
  useDisconnect,
  useConnect,
} from 'wagmi';

import { config } from '@/components/providers/WagmiProvider';
import { Button } from '@/components/ui/Button';

// Helper function to truncate addresses
function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Demo() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const {
    sendTransaction,
    error: sendTxError,
    isError: isSendTxError,
    isPending: isSendTxPending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  });

  const {
    signMessage,
    error: signError,
    isError: isSignError,
    isPending: isSignPending,
  } = useSignMessage();

  const {
    signTypedData,
    error: signTypedError,
    isError: isSignTypedError,
    isPending: isSignTypedPending,
  } = useSignTypedData();

  const { disconnect } = useDisconnect();
  const { connect } = useConnect();

  // Initialize SDK and signal readiness
  useEffect(() => {
    const load = async () => {
      setContext(await sdk.context);
      sdk.actions.ready();
    };

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  // Action handlers
  const openUrl = useCallback(() => {
    sdk.actions.openUrl('https://farcaster.xyz');
  }, []);

  const close = useCallback(() => {
    sdk.actions.close();
  }, []);

  const sendTx = useCallback(() => {
    sendTransaction(
      {
        to: '0x4bBFD120d9f352A0BEd7a014bd67913a2007a878',
        value: 0n,
      },
      {
        onSuccess: hash => {
          setTxHash(hash);
        },
      }
    );
  }, [sendTransaction]);

  const sign = useCallback(() => {
    signMessage({ message: 'Hello from Frames v2!' });
  }, [signMessage]);

  const signTyped = useCallback(() => {
    signTypedData({
      domain: {
        name: 'Frames v2 Demo',
        version: '1',
        chainId: 8453,
      },
      types: {
        Message: [{ name: 'content', type: 'string' }],
      },
      message: {
        content: 'Hello from Frames v2!',
      },
      primaryType: 'Message',
    });
  }, [signTypedData]);

  const toggleContext = useCallback(() => {
    setIsContextOpen(prev => !prev);
  }, []);

  const renderError = (error: Error | null) => {
    if (!error) return null;
    return <div className="text-red-500 text-xs mt-1">{error.message}</div>;
  };

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-[300px] mx-auto py-4 px-2">
      <h1 className="text-2xl font-bold text-center mb-4">Frames v2 Demo</h1>

      <div className="mb-4">
        <h2 className="font-2xl font-bold">Context</h2>
        <button onClick={toggleContext} className="flex items-center gap-2 transition-colors">
          <span className={`transform transition-transform ${isContextOpen ? 'rotate-90' : ''}`}>
            ➤
          </span>
          Tap to expand
        </button>

        {isContextOpen && (
          <div className="p-4 mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
              {JSON.stringify(context, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-2xl font-bold">Actions</h2>

        <div className="mb-4">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
            <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px]">
              sdk.actions.openUrl
            </pre>
          </div>
          <Button onClick={openUrl}>Open Link</Button>
        </div>

        <div className="mb-4">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
            <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px]">
              sdk.actions.close
            </pre>
          </div>
          <Button onClick={close}>Close Frame</Button>
        </div>
      </div>

      <div>
        <h2 className="font-2xl font-bold">Wallet</h2>

        {address && (
          <div className="my-2 text-xs">
            Address: <pre className="inline">{truncateAddress(address)}</pre>
          </div>
        )}

        <div className="mb-4">
          <Button
            onClick={() =>
              isConnected ? disconnect() : connect({ connector: config.connectors[0] })
            }
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>

        {isConnected && (
          <>
            <div className="mb-4">
              <Button onClick={sendTx} disabled={!isConnected || isSendTxPending}>
                Send Transaction
              </Button>
              {isSendTxError && renderError(sendTxError)}
              {txHash && (
                <div className="mt-2 text-xs">
                  <div>Hash: {truncateAddress(txHash)}</div>
                  <div>
                    Status:{' '}
                    {isConfirming ? 'Confirming...' : isConfirmed ? 'Confirmed!' : 'Pending'}
                  </div>
                </div>
              )}
            </div>
            <div className="mb-4">
              <Button onClick={sign} disabled={!isConnected || isSignPending}>
                Sign Message
              </Button>
              {isSignError && renderError(signError)}
            </div>
            <div className="mb-4">
              <Button onClick={signTyped} disabled={!isConnected || isSignTypedPending}>
                Sign Typed Data
              </Button>
              {isSignTypedError && renderError(signTypedError)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **"Not connected" error when trying to use wallet functions**

   - Make sure the Frame SDK is loaded and `sdk.actions.ready()` has been called
   - Verify the user has connected their wallet

2. **Transaction fails to send**

   - Check that the wallet has funds on the selected chain
   - Verify transaction parameters are valid

3. **Wallet not showing up**
   - Make sure you're testing in a Farcaster client that supports Frames v2
   - Use the Warpcast Frame Playground for testing

### Best Practices

1. **Handle loading and error states** for all wallet operations
2. **Provide clear feedback** to users about transaction status
3. **Support disconnection** for better user experience
4. **Test on multiple networks** to ensure compatibility

## Changelog

- **v1.0.0** (Initial Documentation): Created comprehensive wallet integration guide for Farcaster Frames v2
