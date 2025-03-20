'use client';

import { useEffect } from 'react';
import { initFrameSDK } from '@/lib/frame-sdk';

/**
 * This component initializes the Frame SDK when the app loads
 * It runs only on the client side and handles initialization once
 */
export default function WalletDetection() {
  useEffect(() => {
    // Initialize the Frame SDK
    const sdk = initFrameSDK();
    
    if (sdk) {
      console.log('Frame SDK detected and initialized');
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}
