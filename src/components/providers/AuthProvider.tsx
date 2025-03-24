'use client';

import '@farcaster/auth-kit/styles.css';
import { AuthKitProvider } from '@farcaster/auth-kit';
import { useState, useEffect } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  // Simple client-side initialization
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render the AuthKitProvider during server-side rendering
  if (!mounted) {
    return <>{children}</>;
  }
  
  // Configure provider exactly as in the documentation
  const config = {
    rpcUrl: 'https://mainnet.optimism.io',
    domain: typeof window !== 'undefined' ? window.location.host : 'localhost',
    siweUri: typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}/login`
      : 'http://localhost:3000/login',
  };
  
  console.log('[AuthProvider] Initializing with config:', config);

  return (
    <AuthKitProvider config={config}>
      {children}
    </AuthKitProvider>
  );
}
