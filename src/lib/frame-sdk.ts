/**
 * Farcaster Frame SDK Integration
 * ===============================
 * 
 * This module provides a singleton interface to the Farcaster Frame SDK.
 * It handles initialization, ensures the SDK is only initialized once,
 * and provides a consistent way to access SDK functionality throughout the app.
 * 
 * The Frame SDK allows:
 * - Accessing user context (FID, username, etc.)
 * - Wallet interactions (connecting, signing, etc.)
 * - Frame actions (ready, saveFrame, etc.)
 * 
 * Reference: https://docs.farcaster.xyz/developers/frames/v2/getting-started
 */

import { FrameSDK } from '@farcaster/frame-sdk';

// Extend the Window interface to include FrameSDK
declare global {
  interface Window {
    FrameSDK?: FrameSDK;
  }
}

/**
 * Private SDK instance - implements the singleton pattern
 * This prevents multiple instances of the SDK being created
 */
let _sdk: FrameSDK | null = null;

/**
 * Safely checks if we're in a frame environment
 */
export function isInFrameEnvironment(): boolean {
  try {
    // First check if we're in a browser environment
    if (typeof window === 'undefined') return false;
    
    // Check if the FrameSDK is available
    return !!window.FrameSDK;
  } catch (error) {
    console.error('Error checking frame environment:', error);
    return false;
  }
}

/**
 * Initializes the Farcaster Frame SDK
 * 
 * This function:
 * 1. Checks if we're in a browser environment
 * 2. Initializes the SDK if it hasn't been initialized yet
 * 3. Signals that the app is ready to receive user interactions
 * 
 * The SDK is exposed by the Farcaster client through the window object
 * when running within a frame context.
 * 
 * @returns {FrameSDK | null} The initialized SDK or null if initialization failed
 */
export function initFrameSDK() {
  // Exit early if we're in a server environment
  if (typeof window === 'undefined') return null;
  
  // Only initialize once (singleton pattern)
  if (!_sdk) {
    try {
      // Safely check if we're in a Farcaster frame environment
      if (isInFrameEnvironment()) {
        try {
          // Assign the SDK instance with proper type checking
          const frameSDK = window.FrameSDK;
          if (!frameSDK) {
            console.log('FrameSDK is undefined despite environment check');
            return null;
          }
          
          _sdk = frameSDK;
          
          // Signal that the app is ready to receive user interactions
          // This is a critical step - without this, the frame will not display
          if (_sdk.actions?.ready) {
            _sdk.actions.ready();
            console.log('Farcaster Frame SDK initialized and ready');
          }
        } catch (innerError) {
          console.error('Error during SDK initialization:', innerError);
          return null;
        }
      } else {
        // We're not in a Farcaster frame environment
        console.log('Not in a Farcaster frame environment, SDK not available');
        return null;
      }
    } catch (error) {
      console.error('Failed to initialize Farcaster Frame SDK:', error);
      return null;
    }
  }
  
  return _sdk;
}

// Initialize the SDK on module import
const initializedSDK = initFrameSDK();

// Re-export the SDK for use throughout the app
export const sdk = initializedSDK;

// Re-export the SDK type for use throughout the app
export type { FrameSDK }; 