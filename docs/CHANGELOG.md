## Changelog

### [Unreleased]

#### Added

- Friend leaderboards feature for enhanced social engagement
- Pagination for admin data tables to handle large datasets
- User activity tracking in the admin panel
- Improved Farcaster Frame SDK integration with better error handling and debug logs
- New utility function `isInFrameEnvironment()` to check if running in a Farcaster frame
- Added fallback mechanisms for non-frame environments

#### Changed

- Improved error handling with standardized error types
- Enhanced admin dashboard with better UX and performance
- Refactored Frame SDK initialization process for more reliable detection
- Updated wallet connection process with better error messages and fallbacks
- Modified WagmiProvider to support both frame and non-frame environments with appropriate fallbacks
- Updated WalletConnectionButton to show different UI states based on environment
- Enhanced connector with graceful fallbacks for all methods when not in frame environment

#### Fixed

- TypeScript linter errors in catch blocks
- Missing UI components in the admin interface
- Fixed wallet connection issues when running outside of a Farcaster frame
- Resolved issue with ethereum provider access in the Farcaster Frame SDK
- Fixed "WagmiProviderNotFoundError: 'useConfig' must be used within 'WagmiProvider'" error
- Added comprehensive troubleshooting documentation for common Farcaster Frame issues

### [1.4.0] - 2023-12-15

#### Added
