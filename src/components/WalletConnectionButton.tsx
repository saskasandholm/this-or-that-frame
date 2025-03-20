'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Loader2, Check, AlertTriangle, Wallet } from 'lucide-react';
import { truncateAddress } from '@/lib/utils';

export default function WalletConnectionButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors, error: connectError, isPending: isConnectPending } = useConnect();
  const { disconnect, isPending: isDisconnectPending } = useDisconnect();

  const handleConnection = async () => {
    setIsLoading(true);
    try {
      if (isConnected) {
        await disconnect();
      } else {
        const farcasterConnector = connectors.find(c => c.id === 'farcaster');
        if (farcasterConnector) {
          await connect({ connector: farcasterConnector });
        }
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Display different button states based on connection status
  if (isConnected && address) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleConnection}
        disabled={isDisconnectPending}
      >
        {isDisconnectPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Check className="mr-2 h-4 w-4 text-green-500" />
        )}
        {truncateAddress(address)}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm" 
      onClick={handleConnection}
      disabled={isLoading || isConnectPending}
    >
      {isLoading || isConnectPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wallet className="mr-2 h-4 w-4" />
      )}
      Connect Wallet
      {connectError && (
        <span className="ml-2 flex items-center" title={connectError.message}>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </span>
      )}
    </Button>
  );
} 