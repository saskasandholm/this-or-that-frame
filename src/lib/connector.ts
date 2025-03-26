import sdk from '@farcaster/frame-sdk';
import { SwitchChainError, fromHex, getAddress, numberToHex } from 'viem';
import { ChainNotConfiguredError, createConnector } from 'wagmi';

/**
 * Farcaster Frame Wallet Connector
 * 
 * This connector allows Next.js applications to interact with the Farcaster wallet
 * exposed through the Frame v2 SDK. It integrates with the Wagmi library to provide
 * a seamless wallet connection experience within Farcaster Frames.
 */

// Valid test address for mock environment - don't change this address
const MOCK_ADDRESS = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

// Define the type for the frameConnector
frameConnector.type = 'frameConnector' as const;

/**
 * Creates a Wagmi connector for the Farcaster Frame wallet.
 * This allows integration with Wagmi hooks for wallet interactions.
 */
export function frameConnector() {
  let connected = true;

  return createConnector<typeof sdk.wallet.ethProvider>((config) => ({
    id: 'farcaster',
    name: 'Farcaster Wallet',
    type: frameConnector.type,

    async setup() {
      this.connect({ chainId: config.chains[0].id });
    },
    async connect({ chainId } = {}) {
      const provider = await this.getProvider();
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      let currentChainId = await this.getChainId();
      if (chainId && currentChainId !== chainId) {
        const chain = await this.switchChain!({ chainId });
        currentChainId = chain.id;
      }

      connected = true;

      return {
        accounts: accounts.map((x) => getAddress(x)),
        chainId: currentChainId,
      };
    },
    async disconnect() {
      connected = false;
    },
    async getAccounts() {
      if (!connected) throw new Error('Not connected');
      const provider = await this.getProvider();
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });
      return accounts.map((x) => getAddress(x));
    },
    async getChainId() {
      const provider = await this.getProvider();
      const hexChainId = await provider.request({ method: 'eth_chainId' });
      return fromHex(hexChainId, 'number');
    },
    async isAuthorized() {
      if (!connected) {
        return false;
      }

      const accounts = await this.getAccounts();
      return !!accounts.length;
    },
    async switchChain({ chainId }) {
      const provider = await this.getProvider();
      const chain = config.chains.find((x) => x.id === chainId);
      if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: numberToHex(chainId) }],
      });
      return chain;
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0) this.onDisconnect();
      else
        config.emitter.emit('change', {
          accounts: accounts.map((x) => getAddress(x)),
        });
    },
    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit('change', { chainId });
    },
    async onDisconnect() {
      config.emitter.emit('disconnect');
      connected = false;
    },
    async getProvider() {
      return sdk.wallet.ethProvider;
    },
  }));
}

/**
 * Create a mock provider for local development
 * This allows the app to function outside of a Farcaster Frame context
 */
function createMockProvider() {
  console.log('Creating mock provider for local development');
  
  return {
    request: async ({ method, params }) => {
      console.log(`Mock provider request: ${method}`, params);
      
      switch (method) {
        case 'eth_requestAccounts':
          return [MOCK_ADDRESS]; // Use the constant valid address
        case 'eth_chainId':
          return '0x14a33'; // Base Mainnet (84531)
        case 'wallet_switchEthereumChain':
          console.log('Mock: Switching chain', params);
          return null;
        default:
          console.log(`Unhandled method in mock provider: ${method}`);
          return null;
      }
    },
    // Implement required provider interface methods
    on: (event, listener) => {
      console.log(`Mock provider: Added listener for ${event}`);
      return;
    },
    removeListener: (event, listener) => {
      console.log(`Mock provider: Removed listener for ${event}`);
      return;
    }
  };
}

/**
 * Add type definition for window.FrameSDK
 * This is required for TypeScript to recognize the global FrameSDK object
 */
declare global {
  interface Window {
    FrameSDK?: {
      wallet: {
        ethProvider: any;
      };
      actions: {
        ready: () => Promise<void>;
        openUrl: (url: string) => Promise<void>;
        close: () => Promise<void>;
      };
      context: Promise<{
        user?: {
          fid?: number;
          username?: string;
          displayName?: string;
          pfpUrl?: string;
        };
        fid?: number;
        url?: string;
        verified?: boolean;
        network?: number;
        messageHash?: string;
        timestamp?: number;
        castId?: {
          fid: number;
          hash: string;
        };
        buttonIndex?: number;
        inputText?: string;
        state?: Record<string, string>;
      }>;
    }
  }
} 