'use client';

import { AuthKitProvider as FarcasterAuthKitProvider } from '@farcaster/auth-kit';
import '@farcaster/auth-kit/styles.css';

export function AuthKitProvider({ children }: { children: React.ReactNode }) {
  const config = {
    domain: process.env.NEXT_PUBLIC_HOST || 'localhost:3000',
    siweUri: `${process.env.NEXT_PUBLIC_HOST || 'http://localhost:3000'}/login`,
    rpcUrl: process.env.NEXT_PUBLIC_OP_RPC_URL || 'https://mainnet.optimism.io',
    relay: 'https://relay.farcaster.xyz',
    version: 'v1',
  };

  return (
    <FarcasterAuthKitProvider config={config}>
      {children}
    </FarcasterAuthKitProvider>
  );
} 