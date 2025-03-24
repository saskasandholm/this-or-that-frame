'use client';

import { createConfig, http, WagmiProvider as Wagmi, CreateConnectorFn } from 'wagmi';
import { base, optimism } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { frameConnector } from '@/lib/connector';
import { useEffect, useState } from 'react';
import { isInFrameEnvironment } from '@/lib/frame-sdk';

// Create a mock connector for non-frame environments
const mockConnector: CreateConnectorFn = (config) => ({
  id: 'mock',
  name: 'Mock Connector',
  type: 'mock',
  connect: async () => ({ accounts: [], chainId: base.id }),
  disconnect: async () => {},
  getAccounts: async () => [],
  getChainId: async () => base.id,
  getProvider: async () => ({
    // Minimal provider interface for wagmi
    request: async () => null,
    on: () => {},
    removeListener: () => {},
  }),
  isAuthorized: async () => false,
  onAccountsChanged: () => {},
  onChainChanged: () => {},
  onDisconnect: () => {},
});

// Configure wagmi client with required chains and connectors
export const config = createConfig({
  chains: [base, optimism],
  transports: {
    [base.id]: http(),
    [optimism.id]: http('https://mainnet.optimism.io'),
  },
  connectors: [frameConnector()],
});

// Create a fallback config for non-frame environments
export const fallbackConfig = createConfig({
  chains: [base, optimism],
  transports: {
    [base.id]: http(),
    [optimism.id]: http('https://mainnet.optimism.io'),
  },
  connectors: [mockConnector],
});

// Create a query client for tanstack/react-query
const queryClient = new QueryClient();

// WagmiProvider component wraps application with wallet connectivity
export default function WagmiProvider({ children }: { children: React.ReactNode }) {
  const [wagmiReady, setWagmiReady] = useState<boolean>(false);
  const [frameAvailable, setFrameAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    // Check if we're in a Farcaster frame environment
    const inFrame = isInFrameEnvironment();
    setFrameAvailable(inFrame);
    
    // Always mark as ready even if not in frame environment
    // This allows the app to function even without wallet features
    setWagmiReady(true);

    // Log environment details in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`WagmiProvider initialized. Frame environment: ${inFrame ? 'Available' : 'Not available'}`);
    }
  }, []);

  // Initial loading state while checking environment
  if (!wagmiReady) {
    return <>{children}</>;
  }

  // Select the appropriate configuration based on frame availability
  const activeConfig = frameAvailable ? config : fallbackConfig;

  // Always render with a Wagmi provider, but use different configs
  return (
    <Wagmi config={activeConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </Wagmi>
  );
} 