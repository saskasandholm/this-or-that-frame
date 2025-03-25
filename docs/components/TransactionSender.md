# TransactionSender Component

*Last Updated: March 25, 2025*


A React component that enables users to send Ethereum transactions through their connected Farcaster wallet.

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

The `TransactionSender` component provides a user interface for sending Ethereum transactions from a connected wallet when using the application within a Farcaster Frame. It handles the entire transaction flow, including sending, tracking status, and displaying confirmation or error states.

## Props

This component doesn't accept any props as it's designed to be self-contained.

## Usage Example

```tsx
import TransactionSender from '@/components/TransactionSender';

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Send a Transaction</h2>
      <TransactionSender />
    </div>
  );
}
```

## Visual States

The component has the following visual states:

1. **Not Connected**: Displays a disabled button with a message to connect wallet
2. **Ready**: Shows a button to send a transaction
3. **Sending**: Displays a loading spinner with "Sending..." text
4. **Confirming**: Shows a loading spinner with "Confirming..." text
5. **Confirmed**: Displays the transaction hash and status as confirmed
6. **Error**: Shows an error message with details about what went wrong

## Implementation Details

The `TransactionSender` component uses Wagmi hooks to interact with the connected wallet and the blockchain. It manages the transaction flow through different states and provides appropriate visual feedback.

### Key Functions

- `handleSendTransaction()`: Prepares and sends a transaction through the connected wallet
- `renderError()`: Formats and displays error messages in a user-friendly way

### Code Structure

```tsx
'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { truncateAddress } from '@/lib/utils';

export default function TransactionSender() {
  // Implementation details...
}
```

## Dependencies

- **React**: Core library
- **wagmi**: Hooks for transaction interactions (`useAccount`, `useSendTransaction`, `useWaitForTransactionReceipt`)
- **viem**: Ethereum utility functions, specifically `parseEther`
- **@/components/ui/button**: UI component from the application's design system
- **lucide-react**: Icon library
- **@/lib/utils**: Utility functions, specifically `truncateAddress`

## Error Handling

The component handles transaction errors by:

1. Displaying an alert icon with the error message in a readable format
2. Truncating very long error messages for better UI presentation
3. Logging detailed errors to the console
4. Allowing users to retry after errors occur

## Accessibility

- Uses appropriate ARIA attributes for loading states
- Provides clear visual indicators of transaction status
- Implements proper contrast ratios for text and UI elements
- Uses semantic HTML for better screen reader compatibility

## Changelog

| Version | Date       | Changes                |
| ------- | ---------- | ---------------------- |
| 1.0.0   | 2025-04-15 | Initial implementation |
