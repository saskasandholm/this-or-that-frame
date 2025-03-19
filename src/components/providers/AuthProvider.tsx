'use client';

import { AuthKitProvider } from '@farcaster/auth-kit';
import { optimism } from 'viem/chains';
import { createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = createConfig({
  chains: [optimism],
  transports: {
    [optimism.id]: http('https://mainnet.optimism.io'),
  },
});

const queryClient = new QueryClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthKitProvider config={config}>{children}</AuthKitProvider>
    </QueryClientProvider>
  );
}
