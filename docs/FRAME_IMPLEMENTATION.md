# Farcaster Frame Implementation

This document outlines the implementation details of the Farcaster Frame integration in our application.

## Overview

Our app is set up as a Farcaster Frame to enable interactive voting and token interactions within the Farcaster ecosystem. The frame integration includes:

1. Frame SDK for user context and interaction
2. Wallet integration for Ethereum interactions
3. Manifest endpoint for Frame discovery

## Frame SDK Integration

We use the official Farcaster Frame SDK (`@farcaster/frame-sdk`) to interact with the Farcaster client. The SDK provides:

- Access to user information (FID, username, etc.)
- Wallet connection capabilities
- Frame actions (save, prompt, etc.)

### Implementation Details

Our SDK integration is defined in `src/lib/frame-sdk.ts` and follows a singleton pattern to ensure we only initialize the SDK once. Key features include:

- Environment detection to handle both frame and non-frame environments
- Proper error handling for SDK initialization failures
- Utility functions to check the current environment

### Usage Example

```typescript
import { sdk, isInFrameEnvironment } from '@/lib/frame-sdk';

// Check if we're in a frame environment
if (isInFrameEnvironment()) {
  // Use SDK functions
  await sdk.actions.saveFrame();
}
```

## Wallet Integration

We use Wagmi for wallet interactions through the Frame SDK, which allows users to:

- Connect their wallet
- Sign messages
- Execute transactions

The connector implementation is in `src/lib/connector.ts` and provides a seamless bridge between Wagmi and the Frame SDK wallet provider.

## Frame Manifest

Our frame is discoverable through the well-known endpoint at:

```
/api/well-known/farcaster/route.ts
```

This endpoint returns the frame manifest according to the Farcaster specification, including:

- Frame metadata
- Action buttons
- Image URLs
- Post URL templates

## Debugging and Troubleshooting

When running in development mode, additional logging is enabled to help debug frame integration issues:

- SDK initialization status
- Frame environment detection
- Wallet connection errors

### Common Issues

1. **"Frame SDK not available" error**: Occurs when the app is not running in a Farcaster frame environment.
2. **Wallet connection failures**: Can happen if the user has no connected wallets or declines the connection request.
3. **Frame not displaying**: Check that `sdk.actions.ready()` is being called properly.

## Testing Your Frame

To test your frame locally:

1. Run the development server: `npm run dev`
2. Use a tool like ngrok to expose your local server: `ngrok http 3000`
3. Test your frame in the Warpcast Frame Validator by entering your ngrok URL

## Production Considerations

For production deployment:

1. Ensure your frame URL is publicly accessible
2. Use proper cache headers for images to improve performance
3. Implement error handling for SDK interactions to provide a good user experience

## Resources

- [Farcaster Frame Documentation](https://docs.farcaster.xyz/developers/frames/getting-started)
- [Frame SDK Reference](https://docs.farcaster.xyz/reference/frames/sdk)
- [Warpcast Frame Validator](https://warpcast.com/~/developers/frames)