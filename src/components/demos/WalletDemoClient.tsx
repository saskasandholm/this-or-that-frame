'use client';

import { useAccount } from 'wagmi';
import WalletConnectionButton from '@/components/WalletConnectionButton';
import TransactionSender from '@/components/TransactionSender';
import MessageSigner from '@/components/MessageSigner';
import TokenBalance from '@/components/TokenBalance';
import { AlertTriangle, Wallet } from 'lucide-react';
import { truncateAddress } from '@/lib/utils';
import WagmiProvider from '@/components/providers/WagmiProvider';

/**
 * WalletDemoClient - Demonstrates wallet connectivity features
 * This is a demo component similar to other demo clients
 */
export default function WalletDemoClient() {
  return (
    <WagmiProvider>
      <WalletDemoContent />
    </WagmiProvider>
  );
}

// The actual content wrapped with WagmiProvider
function WalletDemoContent() {
  const { address, isConnected, chainId } = useAccount();

  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-3xl font-bold mb-2">Wallet Integration Demo</h1>
      <p className="text-muted-foreground mb-8">
        This page demonstrates the integration with Farcaster Frame wallet functionality
      </p>

      {/* Warning Banner for Demo Only */}
      <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
        <div>
          <h3 className="font-medium text-red-600 dark:text-red-400">Demo Only</h3>
          <p className="text-sm text-muted-foreground">
            This wallet integration is for demonstration purposes only and is not officially supported in production.
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="mb-8 p-4 bg-muted/50 rounded-lg">
        <h2 className="text-lg font-medium mb-2 flex items-center">
          <Wallet className="mr-2 h-5 w-5" />
          Wallet Status
        </h2>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Connection Status:</span>
            <span className={isConnected ? 'text-green-500' : 'text-yellow-500'}>
              {isConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
          {isConnected && address && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wallet Address:</span>
                <span className="font-mono">{truncateAddress(address)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chain ID:</span>
                <span className="font-mono">{chainId}</span>
              </div>
            </>
          )}
        </div>
        <div className="mt-4">
          <WalletConnectionButton />
        </div>
      </div>

      {/* Warning for Non-Farcaster Environment */}
      <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start">
        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
        <div>
          <h3 className="font-medium text-yellow-600 dark:text-yellow-400">Note</h3>
          <p className="text-sm text-muted-foreground">
            This demo is designed to work within a Farcaster Frame environment. If you're viewing
            this outside a Frame (e.g., in a normal browser), wallet functionality may be limited or
            unavailable.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Token Balance Card */}
        <TokenBalance />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transaction Sender Component */}
        <TransactionSender />

        {/* Message Signer Component */}
        <MessageSigner />
      </div>
    </div>
  );
} 