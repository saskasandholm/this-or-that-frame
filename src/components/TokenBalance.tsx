'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import errorLogger from '@/lib/errorLogger';
import { ErrorBoundary } from '@/lib/ErrorBoundary';

interface TokenBalanceProps {
  tokenAddress?: `0x${string}`;
  symbol?: string;
  decimals?: number;
  chainId?: number;
  fallbackDisplay?: boolean;
}

/**
 * Fallback UI for TokenBalance when an error occurs
 */
const TokenBalanceFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
  <Card className="w-full">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm text-red-800">Balance Error</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-red-700 text-sm mb-2">{error.message}</div>
      <Button
        variant="outline"
        size="sm"
        onClick={resetError}
        className="bg-white hover:bg-gray-50"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Retry
      </Button>
    </CardContent>
  </Card>
);

/**
 * TokenBalance component displays a user's token balance
 * For native token (ETH), leave tokenAddress undefined
 */
export default function TokenBalance({
  tokenAddress,
  symbol = 'ETH',
  decimals = 18,
  chainId,
  fallbackDisplay = true,
}: TokenBalanceProps) {
  const { address, isConnected } = useAccount();
  const [userFriendlyError, setUserFriendlyError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const {
    data: balanceData,
    isError,
    isLoading,
    error,
    refetch,
    status,
  } = useBalance({
    address,
    token: tokenAddress,
    chainId,
  });

  // Handle balance errors with user-friendly messages
  useEffect(() => {
    if (isError && error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      errorLogger.log(error, 'TokenBalance');

      // Create user-friendly error message
      let friendlyMessage = 'Failed to load balance';

      if (message.toLowerCase().includes('network') || message.toLowerCase().includes('connect')) {
        friendlyMessage = 'Network connection issue, please check your wallet';
      } else if (message.toLowerCase().includes('contract')) {
        friendlyMessage = 'Token contract error, please verify the token address';
      }

      setUserFriendlyError(friendlyMessage);
    } else {
      setUserFriendlyError(null);
    }
  }, [isError, error]);

  // Reset retrying state when balance loads
  useEffect(() => {
    if (isLoading) {
      setIsRetrying(true);
    } else {
      setIsRetrying(false);
    }
  }, [isLoading]);

  // Format the balance for display
  const formattedBalance = balanceData
    ? parseFloat(formatUnits(balanceData.value, decimals)).toFixed(4)
    : '0.0000';

  const displaySymbol = balanceData?.symbol || symbol;

  // Handle retry button click
  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    setIsRetrying(true);
    setUserFriendlyError(null);
    try {
      await refetch();
    } catch (err) {
      errorLogger.log(err, 'TokenBalance:Retry');
    }
  };

  // If wallet not connected, show placeholder state
  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Token Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">Connect your wallet to view balances</div>
        </CardContent>
      </Card>
    );
  }

  // If error but fallback display is enabled
  if (isError && fallbackDisplay) {
    return (
      <ErrorBoundary
        fallback={TokenBalanceFallback}
        resetOnPropsChange={true}
        onError={error => errorLogger.log(error, 'TokenBalance:Render')}
      >
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {tokenAddress ? `${displaySymbol} Token Balance` : 'Native Balance'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="text-2xl font-bold text-muted-foreground">--</div>
              <div className="text-muted-foreground text-sm">{displaySymbol}</div>
              <div className="text-destructive text-sm flex items-center mt-1">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {userFriendlyError || 'Failed to load balance'}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-fit mt-1"
              >
                {isRetrying ? (
                  <>
                    <Skeleton className="h-4 w-4 rounded-full mr-2" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary
      fallback={TokenBalanceFallback}
      resetOnPropsChange={true}
      onError={error => errorLogger.log(error, 'TokenBalance:Render')}
    >
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {tokenAddress ? `${displaySymbol} Token Balance` : 'Native Balance'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ) : isError ? (
            <div className="text-destructive text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {userFriendlyError || 'Failed to load balance'}
            </div>
          ) : (
            <div>
              <div className="text-2xl font-bold flex items-center">
                {formattedBalance}
                <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
              </div>
              <div className="text-muted-foreground text-sm">{displaySymbol}</div>
              {balanceData && balanceData.value.toString() === '0' && !tokenAddress && (
                <div className="text-amber-500 text-xs mt-2">
                  You'll need some {displaySymbol} for gas fees to interact with the blockchain
                </div>
              )}
            </div>
          )}

          {/* Show refresh button for manual refresh */}
          {!isLoading && !isError && (
            <Button variant="ghost" size="sm" onClick={handleRetry} className="mt-2 h-8 px-2">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}
