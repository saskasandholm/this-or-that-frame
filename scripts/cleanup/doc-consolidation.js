#!/usr/bin/env node

/**
 * Documentation Consolidation Script
 * 
 * This script helps move files to the archive directory and can be used to 
 * implement the consolidation plan. It moves files to docs/archive-consolidated
 * and adds a notice that the content has been consolidated into another file.
 */

const fs = require('fs');
const path = require('path');

// Files that have been consolidated
const consolidatedFiles = [
  {
    files: [
      'docs/ERROR_HANDLING_STRATEGY.md',
      'docs/ERROR_HANDLING_IMPLEMENTATION.md',
      'docs/ERROR_MONITORING_IMPLEMENTATION.md'
    ],
    destination: 'docs/consolidated/ERROR_HANDLING.md'
  },
  {
    files: [
      'docs/DATABASE_SCHEMA.md',
      'docs/DATABASE_SETUP.md',
      'docs/DATABASE_OPTIMIZATION_PLAN.md'
    ],
    destination: 'docs/consolidated/DATABASE.md'
  },
  {
    files: [
      'docs/FRAME_IMPLEMENTATION.md',
      'docs/FRAME_TESTING.md'
    ],
    destination: 'docs/consolidated/FRAME_GUIDE.md'
  },
  {
    files: [
      'docs/AUTHENTICATION.md',
      'docs/FARCASTER_AUTH.md',
      'docs/wallet-integration.md'
    ],
    destination: 'docs/consolidated/AUTH_GUIDE.md',
    createIfNotExists: true,
    content: `# Authentication Guide

*Last Updated: March 25, 2024*

This document provides a comprehensive overview of authentication in the Frame application, covering Farcaster authentication, wallet connections, and user management.

## Table of Contents

- [Farcaster Authentication](#farcaster-authentication)
- [Wallet Integration](#wallet-integration)
- [Session Management](#session-management)
- [Best Practices](#best-practices)

## Farcaster Authentication

### Overview

We use Farcaster Auth Kit to authenticate users through their Farcaster identities. This provides a seamless authentication experience for Farcaster users while maintaining security.

### Implementation

The authentication flow consists of these main steps:

1. User initiates sign-in with Farcaster
2. Auth Kit handles QR code display or direct wallet connection
3. User approves the sign-in request
4. Our application receives the signed message and verifies it
5. User session is created and managed

### Code Implementation

The main authentication components are:

1. **SignInButton**: Initiates the authentication flow
2. **AuthProvider**: Manages authentication state
3. **AuthGuard**: Protects routes requiring authentication

## Wallet Integration

### Supported Wallets

We support various wallet types through WalletConnect:

- MetaMask
- Rainbow
- Coinbase Wallet
- Trust Wallet
- And other Ethereum-compatible wallets

### Wallet Connection

The wallet connection process uses wagmi and viem for a consistent experience:

1. User initiates wallet connection
2. WalletConnect modal displayed
3. User selects their wallet
4. Connection established for transactions

### Transaction Handling

Once connected, transactions can be sent:

1. Transaction request created
2. Wallet prompts user for approval
3. Transaction submitted to blockchain
4. Application receives transaction result

## Session Management

### Token Storage

Authentication tokens are stored securely:

- Short-lived JWT tokens for API access
- Refresh tokens for obtaining new access tokens
- HTTP-only cookies for secure storage

### Security Considerations

Security measures in place:

- CSRF protection
- Rate limiting on authentication endpoints
- Token rotation
- Secure cookie settings

## Best Practices

1. **Always Verify Authentication**: Check auth state server-side for protected routes
2. **Handle Authentication Errors**: Provide clear error messages for auth issues
3. **Secure Storage**: Never store sensitive tokens in localStorage
4. **Logout Functionality**: Properly clear all tokens and state on logout
5. **Testing**: Thoroughly test authentication flows with mocked providers

## References

- [Farcaster Auth Kit Documentation](https://docs.farcaster.xyz/reference/auth-kit/overview)
- [WalletConnect Documentation](https://docs.walletconnect.com/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)`
  }
];

// Archive directory
const archiveDir = 'docs/archive-consolidated';

// Ensure archive directory exists
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
}

// Ensure consolidated directory exists
if (!fs.existsSync('docs/consolidated')) {
  fs.mkdirSync('docs/consolidated', { recursive: true });
}

// Process each consolidated file set
consolidatedFiles.forEach(({ files, destination, createIfNotExists, content }) => {
  const destinationName = path.basename(destination);
  
  // Create the consolidated file if it doesn't exist and content is provided
  if (createIfNotExists && content && !fs.existsSync(destination)) {
    console.log(`Creating consolidated file: ${destination}`);
    fs.writeFileSync(destination, content);
  }
  
  files.forEach(file => {
    if (!fs.existsSync(file)) {
      console.log(`File ${file} does not exist. Skipping.`);
      return;
    }
    
    // Read the content of the original file
    const originalContent = fs.readFileSync(file, 'utf8');
    
    // Create the archive notice
    const archiveNotice = `# ${path.basename(file)} (ARCHIVED)

*Last Updated: March 25, 2024*

> **NOTICE**: This file has been archived. The content has been consolidated into 
> [${destinationName}](${path.relative(path.dirname(file), destination)}).
> Please refer to that document for the most up-to-date information.

---

${originalContent}`;
    
    // Generate archive filename
    const archiveFilename = path.join(archiveDir, path.basename(file));
    
    // Write to archive
    fs.writeFileSync(archiveFilename, archiveNotice);
    
    console.log(`Archived ${file} to ${archiveFilename}`);
  });
});

console.log('Document consolidation complete!'); 