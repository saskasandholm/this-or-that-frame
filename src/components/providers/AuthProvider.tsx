'use client';

import { AuthKitProvider } from '@farcaster/auth-kit';
import { optimism } from 'viem/chains';
import { createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Correct configuration for AuthKitProvider
const config = {
  domain: process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost',
  siweUri: process.env.NEXT_PUBLIC_SIWE_URI || 'http://localhost:3000/login',
  rpcUrl: 'https://mainnet.optimism.io',
  relay: 'https://relay.farcaster.xyz',
};

const queryClient = new QueryClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthKitProvider config={config}>{children}</AuthKitProvider>
    </QueryClientProvider>
  );
}
