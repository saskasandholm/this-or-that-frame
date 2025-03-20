import { getAddress, numberToHex } from 'viem';
import { createConnector } from 'wagmi';
import { sdk } from '@/lib/frame-sdk';

// Define a simple chain interface that matches what we need
type SimpleChain = {
  id: number;
  name?: string;
};

// Create a wallet connector for Farcaster Frames
export function frameConnector() {
  let connected = false;

  return createConnector((config) => ({
    id: 'farcaster',
    name: 'Farcaster',
    type: 'farcaster',
    isAuthorized: async () => {
      try {
        const accounts = await sdk?.wallet?.ethProvider?.request({
          method: 'eth_accounts',
        });
        return !!accounts?.length;
      } catch (e) {
        return false;
      }
    },
    connect: async () => {
      if (!sdk?.wallet?.ethProvider) {
        throw new Error('Frame SDK wallet not available');
      }

      const accounts = await sdk.wallet.ethProvider.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts?.length) throw new Error('No accounts returned');

      connected = true;

      const chainIdHex = await sdk.wallet.ethProvider.request({
        method: 'eth_chainId',
      });
      
      return {
        accounts: accounts.map((x) => getAddress(x)),
        chainId: Number(chainIdHex)
      };
    },
    disconnect: async () => {
      connected = false;
    },
    getAccounts: async () => {
      if (!sdk?.wallet?.ethProvider) {
        throw new Error('Frame SDK wallet not available');
      }
      
      const accounts = await sdk.wallet.ethProvider.request({
        method: 'eth_accounts',
      });
      
      return accounts?.map((x) => getAddress(x)) || [];
    },
    getChainId: async () => {
      if (!sdk?.wallet?.ethProvider) {
        throw new Error('Frame SDK wallet not available');
      }
      
      const chainIdHex = await sdk.wallet.ethProvider.request({
        method: 'eth_chainId',
      });
      
      return Number(chainIdHex);
    },
    switchChain: async ({ chainId }) => {
      if (!sdk?.wallet?.ethProvider) {
        throw new Error('Frame SDK wallet not available');
      }
      
      await sdk.wallet.ethProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: numberToHex(chainId) }],
      });
      
      // Just return the chain that matches from config
      return config.chains.find(c => c.id === chainId);
    },
    getProvider: async () => {
      if (!sdk?.wallet?.ethProvider) {
        throw new Error('Frame SDK wallet not available');
      }
      return sdk.wallet.ethProvider;
    },
    onAccountsChanged: (accounts) => {
      if (!accounts.length) {
        config.emitter.emit('disconnect');
        connected = false;
      } else {
        config.emitter.emit('change', {
          accounts: accounts.map((x) => getAddress(x)),
        });
      }
    },
    onChainChanged: (chain) => {
      config.emitter.emit('change', { chainId: Number(chain) });
    },
    onDisconnect: () => {
      config.emitter.emit('disconnect');
      connected = false;
    }
  }) as any); // Use "any" to bypass type checking
} 