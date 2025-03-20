'use client';

import { useState } from 'react';
import { useAccount, useSignMessage, useSignTypedData } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

/**
 * MessageSigner component allows users to sign messages
 * and typed data using their connected wallet
 */
export default function MessageSigner() {
  const { isConnected } = useAccount();
  const [signedMessage, setSignedMessage] = useState<string | null>(null);
  const [signedTypedData, setSignedTypedData] = useState<string | null>(null);

  // Sign standard message
  const {
    data: messageSignature,
    isPending: isSigningMessage,
    error: signMessageError,
    isError: isSignMessageError,
    signMessage,
  } = useSignMessage();

  // Sign typed data (EIP-712)
  const {
    data: typedDataSignature,
    isPending: isSigningTypedData,
    error: signTypedDataError,
    isError: isSignTypedDataError,
    signTypedData,
  } = useSignTypedData();

  // Example message to sign
  const exampleMessage = 'Sign this message to verify you are the owner of this wallet';

  // Example typed data following EIP-712 standard
  const exampleTypedData = {
    domain: {
      name: 'This or That',
      version: '1',
      chainId: 8453, // Base Mainnet
    },
    types: {
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
    },
    primaryType: 'Person',
    message: {
      name: 'Username',
      wallet: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    },
  } as const;

  // Handle signing message
  const handleSignMessage = async () => {
    try {
      setSignedMessage(null);
      signMessage({ message: exampleMessage });
    } catch (error) {
      console.error('Failed to sign message:', error);
    }
  };

  // Handle signing typed data
  const handleSignTypedData = async () => {
    try {
      setSignedTypedData(null);
      signTypedData(exampleTypedData);
    } catch (error) {
      console.error('Failed to sign typed data:', error);
    }
  };

  // Update state when signatures are available
  useState(() => {
    if (messageSignature) {
      setSignedMessage(messageSignature);
    }
    if (typedDataSignature) {
      setSignedTypedData(typedDataSignature);
    }
  });

  // Render error message
  const renderError = (error: Error | null) => {
    if (!error) return null;
    return (
      <div className="mt-2 text-sm text-destructive flex items-center">
        <AlertTriangle className="h-4 w-4 mr-1" />
        {error.message.length > 100 ? `${error.message.substring(0, 100)}...` : error.message}
      </div>
    );
  };

  // If wallet not connected, show disabled state
  if (!isConnected) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50">
        <h3 className="text-sm font-medium mb-2">Sign Messages</h3>
        <Button disabled variant="outline" size="sm">
          Connect wallet to sign messages
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-background">
      <h3 className="text-sm font-medium mb-3">Sign Messages</h3>

      <div className="space-y-4">
        {/* Regular message signing */}
        <div>
          <Button
            onClick={handleSignMessage}
            disabled={isSigningMessage}
            size="sm"
            variant="outline"
          >
            {isSigningMessage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing...
              </>
            ) : (
              'Sign Message'
            )}
          </Button>

          {isSignMessageError && renderError(signMessageError)}

          {signedMessage && (
            <div className="mt-2 text-xs">
              <div className="font-medium">Signature:</div>
              <div className="mt-1 p-2 bg-muted rounded-md break-all">{signedMessage}</div>
            </div>
          )}
        </div>

        {/* Typed data signing */}
        <div>
          <Button
            onClick={handleSignTypedData}
            disabled={isSigningTypedData}
            size="sm"
            variant="outline"
          >
            {isSigningTypedData ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing typed data...
              </>
            ) : (
              'Sign Typed Data'
            )}
          </Button>

          {isSignTypedDataError && renderError(signTypedDataError)}

          {signedTypedData && (
            <div className="mt-2 text-xs">
              <div className="font-medium">Typed Data Signature:</div>
              <div className="mt-1 p-2 bg-muted rounded-md break-all">{signedTypedData}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
