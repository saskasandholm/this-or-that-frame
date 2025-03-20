'use client';

import { createConfig, http, WagmiProvider as Wagmi } from 'wagmi';
import { base, optimism } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { frameConnector } from '@/lib/connector';

// Configure wagmi client with required chains and connectors
export const config = createConfig({
  chains: [base, optimism],
  transports: {
    [base.id]: http(),
    [optimism.id]: http('https://mainnet.optimism.io'),
  },
  connectors: [frameConnector()],
});

// Create a query client for tanstack/react-query
const queryClient = new QueryClient();

// WagmiProvider component wraps application with wallet connectivity
export default function WagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <Wagmi config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </Wagmi>
  );
} 