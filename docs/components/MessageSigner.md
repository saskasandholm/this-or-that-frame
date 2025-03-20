# MessageSigner Component

A React component that enables users to sign messages and typed data using their connected Farcaster wallet.

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

The `MessageSigner` component provides a user interface for signing both standard messages and EIP-712 typed data with a connected wallet when using the application within a Farcaster Frame. It displays the resulting signatures and handles error states gracefully.

## Props

This component doesn't accept any props as it's designed to be self-contained.

## Usage Example

```tsx
import MessageSigner from '@/components/MessageSigner';

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Sign Messages</h2>
      <MessageSigner />
    </div>
  );
}
```

## Visual States

The component has the following visual states:

1. **Not Connected**: Displays a disabled button with a message to connect wallet
2. **Ready**: Shows buttons to sign a message or typed data
3. **Signing**: Displays a loading spinner with "Signing..." text
4. **Signed**: Shows the resulting signature in a formatted display
5. **Error**: Displays error messages when signing fails

## Implementation Details

The `MessageSigner` component uses Wagmi hooks to interact with the connected wallet for message signing. It provides two distinct signing options: standard message signing and EIP-712 typed data signing.

### Key Functions

- `handleSignMessage()`: Prepares and signs a standard message
- `handleSignTypedData()`: Prepares and signs EIP-712 compliant typed data
- `renderError()`: Formats and displays error messages

### Code Structure

```tsx
'use client';

import { useState } from 'react';
import { useAccount, useSignMessage, useSignTypedData } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function MessageSigner() {
  // Implementation details...
}
```

## Dependencies

- **React**: Core library
- **wagmi**: Hooks for signing functionality (`useAccount`, `useSignMessage`, `useSignTypedData`)
- **@/components/ui/button**: UI component from the application's design system
- **lucide-react**: Icon library

## Error Handling

The component handles signing errors by:

1. Displaying an alert icon with the error message
2. Truncating long error messages for better UI presentation
3. Logging detailed errors to the console
4. Allowing users to retry signing operations

## Accessibility

- Uses appropriate ARIA attributes for loading states
- Ensures proper contrast ratios for text and UI elements
- Implements clear visual indicators for different signing states
- Uses semantic HTML elements for better screen reader compatibility

## Changelog

| Version | Date       | Changes                |
| ------- | ---------- | ---------------------- |
| 1.0.0   | 2025-04-15 | Initial implementation |
