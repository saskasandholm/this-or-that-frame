'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { truncateAddress } from '@/lib/utils';
import errorLogger from '@/lib/errorLogger';
import { ErrorBoundary } from '@/lib/ErrorBoundary';

/**
 * Fallback UI for transaction sender when an error occurs
 */
const TransactionSenderFallback = ({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) => (
  <div className="p-4 border rounded-lg bg-red-50 border-red-200">
    <h3 className="text-sm font-medium mb-2 text-red-800">Transaction Service Error</h3>
    <p className="text-sm text-red-700 mb-3">{error.message}</p>
    <Button variant="outline" size="sm" onClick={resetError} className="bg-white hover:bg-gray-50">
      <RefreshCw className="mr-2 h-4 w-4" />
      Retry
    </Button>
  </div>
);

/**
 * TransactionSender component allows users to send transactions
 * from their connected wallet and displays transaction status
 */
export default function TransactionSender() {
  const { isConnected } = useAccount();
  const [retries, setRetries] = useState(0);
  const [userFriendlyError, setUserFriendlyError] = useState<string | null>(null);

  const {
    data: txHash,
    isPending: isSendTxPending,
    error: sendTxError,
    isError: isSendTxError,
    sendTransaction,
    reset: resetTransaction,
  } = useSendTransaction();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
    isError: isConfirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Reset error state when transaction changes
  useEffect(() => {
    if (txHash) {
      setUserFriendlyError(null);
    }
  }, [txHash]);

  // Log errors to central logger
  useEffect(() => {
    if (sendTxError) {
      const { type, message } = errorLogger.categorizeWalletError(sendTxError);
      setUserFriendlyError(message);
      errorLogger.log(sendTxError, 'TransactionSender:Send');
    }

    if (confirmError) {
      errorLogger.log(confirmError, 'TransactionSender:Confirm');
    }
  }, [sendTxError, confirmError]);

  // Handle transaction sending with retry capability
  const handleSendTransaction = async () => {
    try {
      setUserFriendlyError(null);
      sendTransaction({
        to: '0x0000000000000000000000000000000000000000', // Zero address as example
        value: parseEther('0.0001'), // Small amount as example (0.0001 ETH)
      });
    } catch (error) {
      // This catch block handles synchronous errors only
      // Async errors are handled by the wagmi hook
      errorLogger.log(error, 'TransactionSender:Send');
      if (error instanceof Error) {
        const { message } = errorLogger.categorizeWalletError(error);
        setUserFriendlyError(message);
      }
    }
  };

  // Reset transaction state
  const handleReset = () => {
    setUserFriendlyError(null);
    resetTransaction();
    setRetries(prev => prev + 1);
  };

  // Render error message with user-friendly text
  const renderError = () => {
    if (!userFriendlyError && !sendTxError) return null;

    return (
      <div className="mt-2 text-sm text-destructive flex items-center">
        <AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0" />
        <span>{userFriendlyError || sendTxError?.message || 'An error occurred'}</span>
      </div>
    );
  };

  // Check for confirmation errors
  const hasConfirmationError = isConfirmError && confirmError;

  // If wallet not connected, show disabled state
  if (!isConnected) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50">
        <h3 className="text-sm font-medium mb-2">Send Transaction</h3>
        <Button disabled variant="outline" size="sm">
          Connect wallet to send transactions
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={TransactionSenderFallback}
      resetOnPropsChange={true}
      onError={error => errorLogger.log(error, 'TransactionSender:Render')}
    >
      <div className="p-4 border rounded-lg bg-background">
        <h3 className="text-sm font-medium mb-2">Send Transaction</h3>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleSendTransaction}
            disabled={isSendTxPending || isConfirming}
            size="sm"
          >
            {isSendTxPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              'Send 0.0001 ETH'
            )}
          </Button>

          {(isSendTxError || hasConfirmationError) && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
        </div>

        {/* Error display */}
        {renderError()}

        {/* Transaction details */}
        {txHash && (
          <div className="mt-3 text-xs space-y-1">
            <div className="flex items-center">
              <span className="font-medium mr-1">Hash:</span>
              <a
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {truncateAddress(txHash)}
              </a>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-1">Status:</span>
              {isConfirming ? (
                <span className="flex items-center text-amber-500">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Confirming
                </span>
              ) : isConfirmed ? (
                <span className="flex items-center text-green-500">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Confirmed
                </span>
              ) : hasConfirmationError ? (
                <span className="flex items-center text-red-500">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Failed
                </span>
              ) : (
                <span className="text-muted-foreground">Pending</span>
              )}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
