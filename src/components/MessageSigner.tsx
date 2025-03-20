'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSignMessage, useSignTypedData } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import errorLogger from '@/lib/errorLogger';
import { ErrorBoundary } from '@/lib/ErrorBoundary';

/**
 * Fallback UI for MessageSigner when an error occurs
 */
const MessageSignerFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div className="p-4 border rounded-lg bg-red-50 border-red-200">
    <h3 className="text-sm font-medium mb-2 text-red-800">Message Signing Error</h3>
    <p className="text-sm text-red-700 mb-3">{error.message}</p>
    <Button variant="outline" size="sm" onClick={resetError} className="bg-white hover:bg-gray-50">
      <RefreshCw className="mr-2 h-4 w-4" />
      Retry
    </Button>
  </div>
);

/**
 * MessageSigner component allows users to sign messages
 * and typed data using their connected wallet
 */
export default function MessageSigner() {
  const { isConnected } = useAccount();
  const [signedMessage, setSignedMessage] = useState<string | null>(null);
  const [signedTypedData, setSignedTypedData] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [typedDataError, setTypedDataError] = useState<string | null>(null);

  // Sign standard message
  const {
    data: messageSignature,
    isPending: isSigningMessage,
    error: signMessageError,
    isError: isSignMessageError,
    signMessage,
    reset: resetMessageSign,
  } = useSignMessage();

  // Sign typed data (EIP-712)
  const {
    data: typedDataSignature,
    isPending: isSigningTypedData,
    error: signTypedDataError,
    isError: isSignTypedDataError,
    signTypedData,
    reset: resetTypedDataSign,
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

  // Update state and handle errors when signatures are available
  useEffect(() => {
    if (messageSignature) {
      setSignedMessage(messageSignature);
      setMessageError(null);
    }

    if (typedDataSignature) {
      setSignedTypedData(typedDataSignature);
      setTypedDataError(null);
    }
  }, [messageSignature, typedDataSignature]);

  // Handle signature errors
  useEffect(() => {
    if (signMessageError) {
      const { message } = errorLogger.categorizeWalletError(signMessageError);
      setMessageError(message);
      errorLogger.log(signMessageError, 'MessageSigner:StandardMessage');
    } else {
      setMessageError(null);
    }

    if (signTypedDataError) {
      const { message } = errorLogger.categorizeWalletError(signTypedDataError);
      setTypedDataError(message);
      errorLogger.log(signTypedDataError, 'MessageSigner:TypedData');
    } else {
      setTypedDataError(null);
    }
  }, [signMessageError, signTypedDataError]);

  // Handle signing message
  const handleSignMessage = async () => {
    try {
      setSignedMessage(null);
      resetMessageSign();
      signMessage({ message: exampleMessage });
    } catch (error) {
      errorLogger.log(error, 'MessageSigner:StandardMessage');
      if (error instanceof Error) {
        const { message } = errorLogger.categorizeWalletError(error);
        setMessageError(message);
      }
    }
  };

  // Handle signing typed data
  const handleSignTypedData = async () => {
    try {
      setSignedTypedData(null);
      resetTypedDataSign();
      signTypedData(exampleTypedData);
    } catch (error) {
      errorLogger.log(error, 'MessageSigner:TypedData');
      if (error instanceof Error) {
        const { message } = errorLogger.categorizeWalletError(error);
        setTypedDataError(message);
      }
    }
  };

  // Reset message signing
  const resetMessageSigning = () => {
    setSignedMessage(null);
    setMessageError(null);
    resetMessageSign();
  };

  // Reset typed data signing
  const resetTypedDataSigning = () => {
    setSignedTypedData(null);
    setTypedDataError(null);
    resetTypedDataSign();
  };

  // Render error message
  const renderError = (error: string | null) => {
    if (!error) return null;
    return (
      <div className="mt-2 text-sm text-destructive flex items-start">
        <AlertTriangle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
        <span>{error}</span>
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
    <ErrorBoundary
      fallback={MessageSignerFallback}
      resetOnPropsChange={true}
      onError={error => errorLogger.log(error, 'MessageSigner:Render')}
    >
      <div className="p-4 border rounded-lg bg-background">
        <h3 className="text-sm font-medium mb-3">Sign Messages</h3>

        <div className="space-y-4">
          {/* Regular message signing */}
          <div>
            <div className="flex flex-wrap gap-2">
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

              {isSignMessageError && (
                <Button size="sm" variant="outline" onClick={resetMessageSigning}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>

            {renderError(messageError)}

            {signedMessage && (
              <div className="mt-2 text-xs">
                <div className="font-medium flex items-center">
                  <span>Signature</span>
                  <CheckCircle className="ml-1 h-3.5 w-3.5 text-green-500" />
                </div>
                <div className="mt-1 p-2 bg-muted rounded-md break-all">{signedMessage}</div>
              </div>
            )}
          </div>

          {/* Typed data signing */}
          <div>
            <div className="flex flex-wrap gap-2">
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

              {isSignTypedDataError && (
                <Button size="sm" variant="outline" onClick={resetTypedDataSigning}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>

            {renderError(typedDataError)}

            {signedTypedData && (
              <div className="mt-2 text-xs">
                <div className="font-medium flex items-center">
                  <span>Typed Data Signature</span>
                  <CheckCircle className="ml-1 h-3.5 w-3.5 text-green-500" />
                </div>
                <div className="mt-1 p-2 bg-muted rounded-md break-all">{signedTypedData}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
