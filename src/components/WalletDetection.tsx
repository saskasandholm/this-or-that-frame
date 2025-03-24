'use client';

import { useEffect } from 'react';
import { initFrameSDK, isInFrameEnvironment } from '@/lib/frame-sdk';

/**
 * This component initializes the Frame SDK when the app loads
 * It runs only on the client side and handles initialization once
 */
export default function WalletDetection() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if we're in a frame environment
    const inFrameEnvironment = isInFrameEnvironment();
    console.log(`Frame environment detected: ${inFrameEnvironment}`);

    // Initialize the Frame SDK
    const sdk = initFrameSDK();
    
    if (sdk) {
      console.log('Frame SDK initialized successfully');
      
      // For debugging in development
      if (process.env.NODE_ENV === 'development') {
        // Check if we're in an iframe
        const isIframe = window !== window.parent;
        console.log(`Running in iframe: ${isIframe}`);
      }
    } else {
      console.log('Frame SDK initialization failed or not in frame environment');
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}
