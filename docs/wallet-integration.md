# Farcaster Wallet Integration Guide

*Last Updated: March 25, 2025*


This guide covers wallet integration with Farcaster Frames v2, allowing your application to connect to user wallets and perform blockchain transactions.

## Table of Contents

- [Overview](#overview)
- [Wallet Connector Setup](#wallet-connector-setup)
- [Using the Wallet in Components](#using-the-wallet-in-components)
- [Sending Transactions](#sending-transactions)
- [Signing Messages](#signing-messages)
- [Full Demo Component](#full-demo-component)
- [Troubleshooting](#troubleshooting)

## Overview

Farcaster Frames v2 provides access to the user's Ethereum wallet through the Frame SDK, allowing you to:

- Connect to the user's wallet
- Send transactions
- Sign messages and typed data
- Read wallet data (address, chain ID)

## Wallet Connector Setup

### 1. Create the Custom Connector

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

### 2. Create a Wagmi Provider

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

### 3. Create a Top-Level Providers Component

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

### 4. Add the Providers to Your Layout

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

## Using the Wallet in Components

Once you've set up the wallet connector, you can use Wagmi hooks in your components to interact with the wallet.

### Basic Connection Example

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

## Sending Transactions

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

## Signing Messages

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

## Full Demo Component Example

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
