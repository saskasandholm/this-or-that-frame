'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { truncateAddress } from '@/lib/utils';

/**
 * TransactionSender component allows users to send transactions
 * from their connected wallet and displays transaction status
 */
export default function TransactionSender() {
  const { isConnected } = useAccount();

  const {
    data: txHash,
    isPending: isSendTxPending,
    error: sendTxError,
    isError: isSendTxError,
    sendTransaction,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Handle transaction sending
  const handleSendTransaction = async () => {
    try {
      sendTransaction({
        to: '0x0000000000000000000000000000000000000000', // Zero address as example
        value: parseEther('0.0001'), // Small amount as example (0.0001 ETH)
      });
    } catch (error) {
      console.error('Failed to send transaction:', error);
    }
  };

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
        <h3 className="text-sm font-medium mb-2">Send Transaction</h3>
        <Button disabled variant="outline" size="sm">
          Connect wallet to send transactions
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-background">
      <h3 className="text-sm font-medium mb-2">Send Transaction</h3>

      <Button onClick={handleSendTransaction} disabled={isSendTxPending || isConfirming} size="sm">
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

      {isSendTxError && renderError(sendTxError)}

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
            ) : (
              <span className="text-muted-foreground">Pending</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
