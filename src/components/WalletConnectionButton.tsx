'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Loader2, Check, AlertTriangle, Wallet } from 'lucide-react';
import { truncateAddress } from '@/lib/utils';
import { isInFrameEnvironment } from '@/lib/frame-sdk';

// Safe hook wrapper for wagmi hooks
const useSafeWagmiHooks = () => {
  const [wagmiError, setWagmiError] = useState<Error | null>(null);
  
  // Try using wagmi hooks safely with error handling
  try {
    const account = useAccount();
    const connect = useConnect();
    const disconnect = useDisconnect();
    
    return {
      hasError: false,
      account,
      connect,
      disconnect
    };
  } catch (error) {
    // If we get here, it means wagmi hooks failed
    if (!wagmiError) {
      console.error('Wagmi hooks error:', error);
      setWagmiError(error instanceof Error ? error : new Error('Unknown Wagmi error'));
    }
    
    return {
      hasError: true,
      account: { address: null, isConnected: false },
      connect: { 
        connect: async () => { 
          // Safe no-op function that won't reject
          return Promise.resolve({ accounts: [], chainId: 0 }); 
        }, 
        connectors: [], 
        error: null, 
        isPending: false 
      },
      disconnect: { 
        disconnect: async () => {
          // Safe no-op function that won't reject
          return Promise.resolve();
        }, 
        isPending: false 
      }
    };
  }
};

export default function WalletConnectionButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [frameAvailable, setFrameAvailable] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  const [wagmiError, setWagmiError] = useState<Error | null>(null);
  
  // Always initialize these hooks, but only use them conditionally
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  // Use our safe wrapper for wagmi hooks
  const { 
    hasError,
    account: { address: safeAddress, isConnected: safeIsConnected },
    connect: { connect: safeConnect, connectors, error: connectError, isPending: isConnectPending },
    disconnect: { disconnect: safeDisconnect, isPending: isDisconnectPending }
  } = useSafeWagmiHooks();

  // Safe wrapper for handling wallet connections
  const handleConnection = useCallback(async () => {
    try {
      if (safeIsConnected) {
        setIsLoading(true);
        setErrorMessage(null);
        
        try {
          await safeDisconnect();
        } catch (disconnectError) {
          // Safely stringify the error
          const errorMessage = disconnectError instanceof Error 
            ? disconnectError.message 
            : 'Failed to disconnect wallet';
          
          console.error('Disconnect error:', errorMessage);
          setErrorMessage(errorMessage);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(true);
        setConnectionAttempted(true);
        setErrorMessage(null);
        
        try {
          // Get first connector - typically our frameConnector
          const connector = connectors[0];
          if (!connector) {
            throw new Error('No wallet connector available');
          }
          
          // Wrap connect in Promise.resolve to ensure it never throws
          await Promise.resolve(safeConnect({ connector }))
            .catch(error => {
              // This will handle any rejected promise from connect
              const message = error instanceof Error 
                ? error.message 
                : 'Failed to connect wallet';
              
              throw new Error(message);
            });
        } catch (connectError) {
          // Parse and handle the error appropriately
          const message = connectError instanceof Error 
            ? connectError.message 
            : 'Error connecting to wallet';
          
          console.error('Connect error:', connectError);
          setErrorMessage(message);
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      // Final catch-all error handler
      console.error('Unexpected wallet interaction error:', error);
      setIsLoading(false);
      setErrorMessage('An unexpected error occurred');
    }
  }, [safeIsConnected, safeDisconnect, safeConnect, connectors]);

  useEffect(() => {
    // Check if we're in a Farcaster frame environment
    try {
      setFrameAvailable(isInFrameEnvironment());
    } catch (error) {
      console.error('Error checking frame environment:', error);
      setFrameAvailable(false);
    }

    // Create a safer handler for unhandled rejections
    const safeHandleUnhandledRejection = (event: PromiseRejectionEvent) => {
      try {
        // Get a safely serializable representation of the error
        let reasonString = 'Unknown error';
        
        try {
          if (event.reason instanceof Error) {
            reasonString = event.reason.message;
          } else if (typeof event.reason === 'string') {
            reasonString = event.reason;
          } else if (typeof event.reason === 'object' && event.reason !== null) {
            // Try to safely stringify the object
            try {
              reasonString = JSON.stringify(event.reason);
            } catch (jsonError) {
              reasonString = '[Error object could not be stringified]';
            }
          }
        } catch (errorProcessingError) {
          reasonString = '[Error processing error object]';
        }
        
        console.error('Safely handled unhandled promise rejection:', reasonString);
        
        // Prevent the error from propagating
        event.preventDefault();
      } catch (handlerError) {
        // Last resort error handler for the error handler itself
        console.error('Error in unhandled rejection handler:', handlerError);
        event.preventDefault();
      }
    };

    // Add event listener for unhandled promise rejections
    window.addEventListener('unhandledrejection', safeHandleUnhandledRejection);

    // Clean up event listener
    return () => {
      window.removeEventListener('unhandledrejection', safeHandleUnhandledRejection);
    };
  }, []);

  // If wagmi hooks failed, show a fallback button
  if (hasError) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        title="Wallet connection unavailable"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Wallet
      </Button>
    );
  }

  // If not in a frame environment, show a disabled button with explanation
  if (frameAvailable === false) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        title="Wallet connection is only available in Farcaster frames"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Frame Only
      </Button>
    );
  }

  // Handle connection pending state 
  if (isLoading || isConnectPending || isDisconnectPending) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {safeIsConnected ? 'Disconnecting...' : 'Connecting...'}
      </Button>
    );
  }

  // Handle connected state
  if (safeIsConnected && safeAddress) {
    return (
      <Button variant="outline" size="sm" onClick={handleConnection}>
        <Check className="mr-2 h-4 w-4 text-green-500" />
        {truncateAddress(safeAddress)}
      </Button>
    );
  }

  // Handle error state with tooltip
  if (errorMessage) {
    return (
      <div className="relative group">
        <Button variant="outline" size="sm" onClick={handleConnection} className="text-red-500 border-red-300 hover:bg-red-50 hover:text-red-600">
          <AlertTriangle className="mr-2 h-4 w-4" />
          {connectionAttempted ? 'Try Again' : 'Connect Wallet'}
        </Button>
        <div className="absolute z-50 hidden group-hover:block bg-black text-white text-xs p-2 rounded whitespace-nowrap -top-8 left-1/2 transform -translate-x-1/2">
          {errorMessage}
        </div>
      </div>
    );
  }

  // Default state (not connected and no error)
  return (
    <Button variant="outline" size="sm" onClick={handleConnection}>
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
} 