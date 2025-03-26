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

// Import the types as a namespace to avoid conflicts
import type * as FrameSDKTypes from '@farcaster/frame-sdk';

// Private SDK instance - we'll store the actual window.FrameSDK reference here
let _sdk: any = null;

/**
 * Safely checks if we're in a frame environment
 */
export function isInFrameEnvironment(): boolean {
  try {
    // First check if we're in a browser environment
    if (typeof window === 'undefined') return false;
    
    // Check if the FrameSDK is available on the window object
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
 * @returns The initialized SDK or null if initialization failed
 */
export function initFrameSDK() {
  // Exit early if we're in a server environment
  if (typeof window === 'undefined') {
    console.log('Server environment detected, skipping SDK initialization');
    return null;
  }
  
  // Only initialize once (singleton pattern)
  if (!_sdk) {
    try {
      // Check if we're in a Farcaster frame environment
      if (window.FrameSDK) {
        console.log('Farcaster Frame environment detected');
        
        try {
          // Store the SDK reference
          _sdk = window.FrameSDK;
          
          // Signal that the app is ready to receive user interactions
          if (_sdk.actions && typeof _sdk.actions.ready === 'function') {
            console.log('Calling FrameSDK.actions.ready()');
            _sdk.actions.ready()
              .then(() => {
                console.log('Frame ready signal sent successfully');
              })
              .catch((error: any) => {
                console.error('Error sending ready signal:', error);
              });
          } else {
            console.warn('FrameSDK.actions.ready is not available');
          }
        } catch (innerError) {
          console.error('Error during SDK initialization:', innerError);
        }
      } else {
        console.log('Not in a Farcaster frame environment (window.FrameSDK not available)');
      }
    } catch (error) {
      console.error('Failed to initialize Farcaster Frame SDK:', error);
    }
  }
  
  return _sdk;
}

// Initialize the SDK on module import
const initializedSDK = typeof window !== 'undefined' ? initFrameSDK() : null;

// Re-export the SDK for use throughout the app
export const sdk = initializedSDK; 