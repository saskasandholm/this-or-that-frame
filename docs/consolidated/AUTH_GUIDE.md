# Authentication Guide

*Last Updated: March 25, 2025*

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
- [Viem Documentation](https://viem.sh/)