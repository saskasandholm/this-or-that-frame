'use client';

import { useEffect } from 'react';
import { initFrameSDK } from '@/lib/frame-sdk';
import { useRouter } from 'next/navigation';

export default function FrameClient() {
  const router = useRouter();

  useEffect(() => {
    // Initialize the Frame SDK and signal ready
    const sdk = initFrameSDK();
    
    // Add debug logging to understand what's happening
    console.log('Frame SDK initialized:', !!sdk);
    
    if (sdk && sdk.actions) {
      // Make sure to call ready() to signal to Farcaster that the frame is ready
      sdk.actions.ready();
      console.log('Frame SDK ready signal sent');
    }
    
    // Redirect to the home page after a short delay
    const timeout = setTimeout(() => {
      router.push('/');
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [router]);

  // This client component doesn't render anything visible
  return null;
} 