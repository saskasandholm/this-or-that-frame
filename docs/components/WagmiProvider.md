# WagmiProvider Component

*Last Updated: March 25, 2025*


## Overview

The `WagmiProvider` component serves as the wallet integration provider for the application, enabling connectivity to Ethereum wallets through Farcaster Frames. It establishes the foundation for blockchain interactions such as connecting to wallets, sending transactions, and signing messages directly from the application.

## Table of Contents

- [Props](#props)
- [Example Usage](#example-usage)
- [Implementation Details](#implementation-details)
- [Configuration](#configuration)
- [Dependencies](#dependencies)
- [Integration with Farcaster](#integration-with-farcaster)
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

import dynamic from 'next/dynamic';

const WagmiProvider = dynamic(() => import('@/components/providers/WagmiProvider'), {
  ssr: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <WagmiProvider>{children}</WagmiProvider>;
}
```

### Combined with Other Providers

```tsx
// src/app/providers.tsx
'use client';

import dynamic from 'next/dynamic';
import { AuthProvider } from '@/components/providers/AuthProvider';

const WagmiProvider = dynamic(() => import('@/components/providers/WagmiProvider'), {
  ssr: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WagmiProvider>{children}</WagmiProvider>
    </AuthProvider>
  );
}
```

## Implementation Details

The WagmiProvider component:

1. Configures Wagmi with supported chains (primarily Base)
2. Sets up HTTP transports for RPC communication
3. Integrates the custom Frame connector for Farcaster wallet connectivity
4. Provides TanStack Query client for managing wallet state
5. Makes wallet connection and blockchain interaction hooks available throughout the application

## Configuration

The WagmiProvider is configured with these key parameters:

```tsx
export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [frameConnector()],
});
```

| Parameter  | Description                           | Value                     |
| ---------- | ------------------------------------- | ------------------------- |
| chains     | Supported blockchain networks         | [base]                    |
| transports | RPC connection methods for each chain | HTTP transport for Base   |
| connectors | Wallet connection methods             | Farcaster Frame connector |

## Dependencies

- **wagmi**: Core library for wallet integration
- **@tanstack/react-query**: State management for wallet connections
- **viem**: Low-level Ethereum interactions
- **next/dynamic**: For client-side only rendering of the provider

## Integration with Farcaster

The WagmiProvider integrates with Farcaster Frames through:

1. A custom connector that interfaces with the Farcaster SDK
2. Events that synchronize wallet state with the application
3. Methods that utilize the Farcaster-provided Ethereum provider

The Frame connector implementation:

```tsx
export function frameConnector() {
  return createConnector(config => ({
    id: 'farcaster',
    name: 'Farcaster',
    type: 'farcaster',
    async connect() {
      const provider = await getProvider();
      return {
        accounts: await provider.request({ method: 'eth_accounts' }),
        chainId: await provider.request({ method: 'eth_chainId' }),
      };
    },
    async disconnect() {
      // Nothing to do, as Farcaster manages the connection
    },
    // ...additional methods
  }));
}
```

## Related Components

- **WalletConnectionButton**: UI for initiating wallet connections
- **TransactionForm**: Component for creating transactions
- **useWalletStatus**: Hook for accessing current wallet state
- **useTransaction**: Hook for sending blockchain transactions

## Troubleshooting

### Common Issues

1. **Provider Not Found Error**

   - Ensure the Farcaster SDK is properly initialized
   - Verify that you're testing in a Farcaster client environment

2. **Chain ID Mismatch**

   - Check that the user's wallet is connected to the Base network
   - Add support for additional chains if needed

3. **SSR-Related Errors**
   - Make sure WagmiProvider is always imported using `dynamic` with `ssr: false`
   - Don't use wallet-related hooks in server components

### Required Environment Variables

No specific environment variables are required for basic wallet integration, but for production:

```
NEXT_PUBLIC_DEFAULT_RPC_URL=https://mainnet.base.org
```

## Changelog

| Version | Date       | Changes                                              |
| ------- | ---------- | ---------------------------------------------------- |
| 1.0.0   | 2024-04-10 | Initial implementation with Base network support     |
| 1.1.0   | 2024-04-15 | Added improved error handling for wallet connections |
| 1.2.0   | 2024-04-20 | Enhanced event handling for wallet state changes     |
