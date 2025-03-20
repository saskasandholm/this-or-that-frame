# WalletConnectionButton Component

A React component that provides a user interface for connecting and disconnecting a wallet using the Farcaster Frame SDK.

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

The `WalletConnectionButton` component provides a clean, responsive interface for users to connect and disconnect their wallet when using the application within a Farcaster Frame. It displays different visual states based on connection status and handles error states gracefully.

## Props

| Name        | Type     | Required | Description                                   |
| ----------- | -------- | -------- | --------------------------------------------- |
| `className` | `string` | No       | Additional CSS classes to apply to the button |

## Usage Example

```tsx
import WalletConnectionButton from '@/components/WalletConnectionButton';

export default function Header() {
  return (
    <div className="flex items-center gap-2">
      <span>Connect your wallet:</span>
      <WalletConnectionButton />
    </div>
  );
}
```

## Visual States

The component has the following visual states:

1. **Not Connected**: Shows "Connect Wallet" with a wallet icon
2. **Connecting**: Shows a loading spinner with "Connecting..."
3. **Connected**: Shows a green checkmark and a truncated wallet address
4. **Disconnecting**: Shows a loading spinner
5. **Error**: Shows an alert triangle icon for connection errors

## Implementation Details

The `WalletConnectionButton` is a client-side component that leverages the Wagmi hooks for wallet interactions. It manages state transitions during connection and disconnection processes, and provides appropriate visual feedback to users.

### Key Functions

- `handleConnection()`: Manages both connect and disconnect actions based on current connection state
- `truncateAddress()`: Utility to shorten Ethereum addresses for display

### Code Structure

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Loader2, Check, AlertTriangle, Wallet } from 'lucide-react';
import { truncateAddress } from '@/lib/utils';

export default function WalletConnectionButton() {
  // Implementation details...
}
```

## Dependencies

- **React**: Core library
- **wagmi**: Hooks for wallet interactions (`useAccount`, `useConnect`, `useDisconnect`)
- **@/components/ui/button**: UI component from the application's design system
- **lucide-react**: Icon library
- **@/lib/utils**: Utility functions, specifically `truncateAddress`

## Error Handling

The component handles connection errors by:

1. Displaying an alert triangle icon when errors occur
2. Providing a tooltip with error details on hover
3. Logging detailed errors to the console
4. Gracefully continuing operation even when errors occur

## Accessibility

- Uses appropriate ARIA attributes for loading states
- Maintains contrast ratios for text against background
- Provides visual indicators for interactive states (hover, focus)
- Uses icons with appropriate labels for different states

## Changelog

| Version | Date       | Changes                                           |
| ------- | ---------- | ------------------------------------------------- |
| 1.0.0   | 2025-04-10 | Initial implementation                            |
| 1.1.0   | 2025-04-15 | Added error handling and improved visual feedback |
