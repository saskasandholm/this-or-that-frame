'use client';

import { useEffect, useState } from 'react';

const WalletDetection = () => {
  const [_hasFarcasterExtension, setHasFarcasterExtension] = useState(false);

  useEffect(() => {
    // Check if Farcaster extension is available
    const checkFarcasterExtension = () => {
      // @ts-expect-error - Farcaster extension types not available
      const hasFarcaster = typeof window !== 'undefined' && !!window.farcaster;
      setHasFarcasterExtension(hasFarcaster);
    };

    checkFarcasterExtension();

    // We could also set up event listeners for wallet connection events here
  }, []);

  // We're just detecting, not displaying anything in the UI currently
  return null;
};

export default WalletDetection;
