# TokenBalance Component

*Last Updated: March 25, 2025*


A React component that displays a user's token balance for both native tokens (ETH) and ERC20 tokens.

## Table of Contents

- [Overview](#overview)
- [Props](#props)
- [Usage Example](#usage-example)
- [Visual States](#visual-states)
- [Implementation Details](#implementation-details)
- [Dependencies](#dependencies)
- [Error Handling](#error-handling)
- [Accessibility](#accessibility)
- [Changelog](#changelog)

## Overview

The `TokenBalance` component provides a visual display of a user's token balance when connected to a Farcaster wallet. It can be configured to show either native token balances (ETH) or custom ERC20 token balances by providing the token contract address.

## Props

| Name           | Type          | Required | Description                                                 |
| -------------- | ------------- | -------- | ----------------------------------------------------------- |
| `tokenAddress` | `0x${string}` | No       | The contract address of the ERC20 token to show balance for |
| `symbol`       | `string`      | No       | The symbol of the token (defaults to "ETH")                 |
| `decimals`     | `number`      | No       | The number of decimals for the token (defaults to 18)       |
| `chainId`      | `number`      | No       | The chain ID to use for the balance query                   |

## Usage Example

### Native Token Balance

```tsx
import TokenBalance from '@/components/TokenBalance';

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Your Balances</h2>
      <TokenBalance />
    </div>
  );
}
```

### ERC20 Token Balance

```tsx
import TokenBalance from '@/components/TokenBalance';

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Your Balances</h2>
      {/* Display USDC balance on Base network */}
      <TokenBalance
        tokenAddress="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
        symbol="USDC"
        decimals={6}
        chainId={8453}
      />
    </div>
  );
}
```

## Visual States

The component has the following visual states:

1. **Not Connected**: Displays a message prompting the user to connect their wallet
2. **Loading**: Shows a skeleton UI while fetching the balance
3. **Loaded**: Displays the formatted token balance with symbol
4. **Error**: Shows an error message if balance retrieval fails

## Implementation Details

The `TokenBalance` component uses Wagmi's `useBalance` hook to fetch token balances from the blockchain. It formats the balances with the correct decimal precision and handles different states of the data fetching process.

### Key Functions

- Formats token values using `formatUnits` from viem
- Handles different visual states based on connection and loading status
- Provides clear error messages when balance retrieval fails

### Code Structure

```tsx
'use client';

import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

export default function TokenBalance({
  tokenAddress,
  symbol = 'ETH',
  decimals = 18,
  chainId,
}: TokenBalanceProps) {
  // Implementation details...
}
```

## Dependencies

- **React**: Core library
- **wagmi**: Hooks for blockchain interactions (`useAccount`, `useBalance`)
- **viem**: Ethereum utility functions, specifically `formatUnits`
- **@/components/ui/card**: Card components from the application's design system
- **@/components/ui/skeleton**: Skeleton loading component
- **lucide-react**: Icon library

## Error Handling

The component handles balance retrieval errors by:

1. Displaying an alert icon with a user-friendly error message
2. Showing the specific error message if available, or a fallback message
3. Maintaining a clean UI even when errors occur

## Accessibility

- Uses semantic HTML structure with proper headings
- Implements appropriate loading states with skeleton UI
- Ensures readable text with proper contrast
- Uses descriptive labels for different visual states

## Changelog

| Version | Date       | Changes                |
| ------- | ---------- | ---------------------- |
| 1.0.0   | 2025-04-15 | Initial implementation |
