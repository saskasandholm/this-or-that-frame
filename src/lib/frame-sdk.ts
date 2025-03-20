import { FrameSDK } from '@farcaster/frame-sdk';

let _sdk: FrameSDK | null = null;

// Initialize the Frame SDK once on the client side
export function initFrameSDK() {
  if (typeof window === 'undefined') return null;
  
  if (!_sdk) {
    try {
      // @ts-ignore - The SDK is expected to be available in the Farcaster Frame environment
      _sdk = window.FrameSDK;
      
      // Signal that the app is ready
      _sdk?.actions.ready();
      
      console.log('Farcaster Frame SDK initialized');
    } catch (error) {
      console.error('Failed to initialize Farcaster Frame SDK:', error);
      return null;
    }
  }
  
  return _sdk;
}

// Access the SDK instance (initializing if needed)
export const sdk = typeof window !== 'undefined' ? initFrameSDK() : null;

// Re-export the SDK type
export type { FrameSDK }; 