# WalletConnectionButton Component

## Overview

The `WalletConnectionButton` component provides a user interface for connecting to Ethereum wallets within Farcaster Frames. It handles the wallet connection process, displays connection status, and provides visual feedback during transactions.

## Table of Contents

- [Props](#props)
- [Example Usage](#example-usage)
- [States](#states)
- [Implementation Details](#implementation-details)
- [Dependencies](#dependencies)
- [Styling](#styling)
- [Error Handling](#error-handling)
- [Related Components](#related-components)
- [Changelog](#changelog)

## Props

| Prop      | Type     | Required | Default | Description                                             |
| --------- | -------- | -------- | ------- | ------------------------------------------------------- |
| className | string   | No       | ''      | Additional CSS classes to apply to the button wrapper   |
| onConnect | Function | No       | -       | Callback function triggered after successful connection |
| onError   | Function | No       | -       | Callback function triggered when connection fails       |

## Example Usage

### Basic Usage

```tsx
import { WalletConnectionButton } from '@/components/WalletConnectionButton';

function WalletPage() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h1>Connect Your Wallet</h1>
      <WalletConnectionButton />
    </div>
  );
}
```

### With Custom Styling and Callbacks

```tsx
import { WalletConnectionButton } from '@/components/WalletConnectionButton';

function WalletSection() {
  const handleConnect = address => {
    console.log(`Wallet connected: ${address}`);
  };

  const handleError = error => {
    console.error('Connection error:', error);
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h2 className="text-xl font-bold mb-2">Wallet Integration</h2>
      <p className="mb-4">Connect your wallet to interact with the contract</p>
      <WalletConnectionButton
        className="w-full bg-purple-600 hover:bg-purple-700"
        onConnect={handleConnect}
        onError={handleError}
      />
    </div>
  );
}
```

## States

The WalletConnectionButton component manages several states:

1. **Disconnected**: Initial state when no wallet is connected
2. **Connecting**: While establishing a connection to the wallet
3. **Connected**: When the wallet is successfully connected
4. **Error**: When a connection error occurs
5. **Transaction Pending**: When a transaction is in progress

## Implementation Details

The WalletConnectionButton component:

1. Uses Wagmi hooks to manage wallet connection state
2. Connects to the Farcaster Frame SDK's wallet provider
3. Displays the connected account address (truncated for UI)
4. Shows connection status with visual indicators
5. Handles connection and disconnection flows
6. Provides error feedback when connection fails

```tsx
'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';

export function WalletConnectionButton({
  className = '',
  onConnect,
  onError,
}: {
  className?: string;
  onConnect?: (address: string) => void;
  onError?: (error: Error) => void;
}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors, error, isLoading } = useConnect({
    onSuccess(data) {
      if (onConnect && data.account) {
        onConnect(data.account);
      }
    },
    onError(err) {
      if (onError) {
        onError(err);
      }
    },
  });
  const { disconnect } = useDisconnect();

  // Truncate address for display
  const truncatedAddress = address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : '';

  // Handle connect click
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Connect using the first connector (Farcaster)
      if (connectors[0].ready) {
        connect({ connector: connectors[0] });
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle disconnect click
  const handleDisconnect = () => {
    disconnect();
  };

  // If connected, show the address and disconnect button
  if (isConnected) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm">
          <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
          {truncatedAddress}
        </div>
        <Button variant="outline" size="sm" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  // If connecting or loading, show loading state
  if (isConnecting || isLoading) {
    return (
      <Button className={className} disabled>
        <span className="mr-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </span>
        Connecting...
      </Button>
    );
  }

  // Show connection error if any
  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          className={`bg-red-100 text-red-800 hover:bg-red-200 ${className}`}
          onClick={handleConnect}
        >
          Connection Failed - Retry
        </Button>
        <p className="text-red-600 text-sm">{error.message}</p>
      </div>
    );
  }

  // Default: Show connect button
  return (
    <Button className={className} onClick={handleConnect}>
      Connect Wallet
    </Button>
  );
}
```

## Dependencies

- **wagmi**: Core hooks for wallet connection (`useAccount`, `useConnect`, `useDisconnect`)
- **@/components/ui/button**: Shadcn UI button component
- **@farcaster/frame-sdk**: Indirectly used through the connector

## Styling

The component uses a combination of:

1. **Tailwind CSS**: For layout and responsive design
2. **Shadcn UI**: For base button styling and variants
3. **Custom Classes**: For wallet connection status indicators

The button accepts a `className` prop that allows for complete customization of its appearance.

## Error Handling

The component handles several types of wallet connection errors:

1. **Connection Rejected**: When the user denies the connection request
2. **Provider Not Found**: When the Farcaster wallet provider is not available
3. **Chain Mismatch**: When the connected chain doesn't match the required network
4. **Already Processing**: When a connection request is already in progress

Errors are:

- Displayed to the user with a retry option
- Logged to the console
- Passed to the optional `onError` callback for custom handling

## Related Components

- **WagmiProvider**: Provides wallet connection context
- **TransactionButton**: Specialized button for sending transactions
- **WalletDetails**: Displays detailed wallet information
- **AssetList**: Shows tokens and NFTs in the connected wallet

## Changelog

| Version | Date       | Changes                                              |
| ------- | ---------- | ---------------------------------------------------- |
| 1.0.0   | 2024-04-10 | Initial implementation with basic connect/disconnect |
| 1.1.0   | 2024-04-15 | Added connection status indicators                   |
| 1.2.0   | 2024-04-20 | Improved error handling and user feedback            |
