import { getAddress, numberToHex } from 'viem';
import { createConnector } from 'wagmi';
import { sdk, isInFrameEnvironment } from '@/lib/frame-sdk';
import { Chain } from 'wagmi/chains';

// Define a simple chain interface that matches what we need
type SimpleChain = {
  id: number;
  name?: string;
};

/**
 * Creates a connector for interacting with Ethereum wallets through the Farcaster Frame
 * 
 * This connector uses the Frame SDK to access the wallet provider exposed by Farcaster.
 * It handles all Ethereum wallet interactions within the Frame environment.
 * 
 * @returns A Wagmi connector for Farcaster Frames
 */
export function frameConnector() {
  let connected = false;

  // Create a mock provider for fallback when not in frame environment
  const mockProvider = {
    request: async () => Promise.resolve(null),
    on: () => {},
    removeListener: () => {},
  };

  return createConnector((config) => ({
    id: 'farcaster',
    name: 'Farcaster',
    type: 'farcaster',
    isAuthorized: async () => {
      try {
        // Check if SDK and wallet provider are available
        if (!isInFrameEnvironment() || !sdk?.wallet?.ethProvider) {
          console.log('Frame SDK or wallet provider not available for authorization');
          return false;
        }

        const accounts = await Promise.resolve(sdk.wallet.ethProvider.request({
          method: 'eth_accounts',
        })).catch(error => {
          console.error('Error in isAuthorized:', error);
          return null;
        });
        
        return !!accounts?.length;
      } catch (e) {
        console.error('Error checking authorization status:', e);
        return false;
      }
    },
    connect: async () => {
      // Check if SDK and wallet provider are available
      if (!isInFrameEnvironment() || !sdk?.wallet?.ethProvider) {
        console.error('Frame SDK wallet not available for connection');
        throw new Error('Frame SDK wallet not available. Please make sure you are in a Farcaster Frame environment.');
      }

      try {
        const accounts = await Promise.resolve(sdk.wallet.ethProvider.request({
          method: 'eth_requestAccounts',
        })).catch(error => {
          console.error('Error in connect (eth_requestAccounts):', error);
          throw new Error('Failed to request accounts from wallet');
        });

        if (!accounts?.length) {
          throw new Error('No accounts returned from wallet');
        }

        connected = true;

        const chainIdHex = await Promise.resolve(sdk.wallet.ethProvider.request({
          method: 'eth_chainId',
        })).catch(error => {
          console.error('Error in connect (eth_chainId):', error);
          // Default to Base chain if request fails
          return '0x2105'; // Base chain ID in hex
        });
        
        return {
          accounts: accounts.map((x) => getAddress(x)),
          chainId: Number(chainIdHex)
        };
      } catch (error) {
        console.error('Error connecting to wallet:', error);
        throw new Error('Failed to connect to wallet: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    },
    disconnect: async () => {
      try {
        connected = false;
        return Promise.resolve();
      } catch (error) {
        console.error('Error in disconnect:', error);
        // Always resolve - never reject on disconnect
        return Promise.resolve();
      }
    },
    getAccounts: async () => {
      if (!isInFrameEnvironment() || !sdk?.wallet?.ethProvider) {
        console.error('Frame SDK wallet not available for getting accounts');
        return [];
      }
      
      try {
        const accounts = await Promise.resolve(sdk.wallet.ethProvider.request({
          method: 'eth_accounts',
        })).catch(error => {
          console.error('Error in getAccounts:', error);
          return [];
        });
        
        return accounts?.map((x) => getAddress(x)) || [];
      } catch (error) {
        console.error('Error getting accounts:', error);
        return [];
      }
    },
    getChainId: async () => {
      if (!isInFrameEnvironment() || !sdk?.wallet?.ethProvider) {
        console.error('Frame SDK wallet not available for getting chain ID');
        // Return a fallback chain ID instead of throwing
        return config.chains[0]?.id || 8453; // Base chain ID as fallback
      }
      
      try {
        const chainIdHex = await Promise.resolve(sdk.wallet.ethProvider.request({
          method: 'eth_chainId',
        })).catch(error => {
          console.error('Error in getChainId:', error);
          return null;
        });
        
        if (!chainIdHex) {
          return config.chains[0]?.id || 8453; // Base chain ID as fallback
        }
        
        return Number(chainIdHex);
      } catch (error) {
        console.error('Error getting chain ID:', error);
        // Return a fallback chain ID instead of throwing
        return config.chains[0]?.id || 8453; // Base chain ID as fallback
      }
    },
    switchChain: async ({ chainId }) => {
      if (!isInFrameEnvironment() || !sdk?.wallet?.ethProvider) {
        console.error('Frame SDK wallet not available for switching chain');
        // Find matching chain from config or throw if none found
        const chainFromConfig = config.chains.find(c => c.id === chainId);
        if (!chainFromConfig) {
          throw new Error(`Chain with ID ${chainId} not configured`);
        }
        return chainFromConfig;
      }
      
      try {
        await Promise.resolve(sdk.wallet.ethProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdToHex(chainId) }],
        })).catch(error => {
          console.error('Error in switchChain:', error);
          throw error;
        });
        
        // Find matching chain from config or throw if none found
        const chainFromConfig = config.chains.find(c => c.id === chainId);
        if (!chainFromConfig) {
          throw new Error(`Chain with ID ${chainId} not configured`);
        }
        return chainFromConfig;
      } catch (error) {
        console.error('Error switching chain:', error);
        throw error;
      }
    },
    getProvider: async () => {
      if (!isInFrameEnvironment() || !sdk?.wallet?.ethProvider) {
        console.error('Frame SDK wallet provider not available');
        // Return a mock provider instead of throwing
        return mockProvider;
      }
      return sdk.wallet.ethProvider;
    },
    onAccountsChanged(accounts) {
      try {
        if (!accounts?.length) {
          this.onDisconnect();
        } else {
          config.emitter.emit('change', {
            accounts: accounts.map(x => getAddress(x)),
          });
        }
      } catch (error) {
        console.error('Error in onAccountsChanged:', error);
      }
    },
    onChainChanged(chain) {
      try {
        const chainId = Number(chain);
        config.emitter.emit('change', { chainId });
      } catch (error) {
        console.error('Error in onChainChanged:', error);
      }
    },
    onDisconnect() {
      try {
        config.emitter.emit('disconnect');
        connected = false;
      } catch (error) {
        console.error('Error in onDisconnect:', error);
      }
    }
  }));
}

/**
 * Convert a number chain ID to hexadecimal format
 */
function chainIdToHex(chainId: number): string {
  return `0x${chainId.toString(16)}`;
} 