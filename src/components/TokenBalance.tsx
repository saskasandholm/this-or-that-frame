'use client';

import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

interface TokenBalanceProps {
  tokenAddress?: `0x${string}`;
  symbol?: string;
  decimals?: number;
  chainId?: number;
}

/**
 * TokenBalance component displays a user's token balance
 * For native token (ETH), leave tokenAddress undefined
 */
export default function TokenBalance({
  tokenAddress,
  symbol = 'ETH',
  decimals = 18,
  chainId,
}: TokenBalanceProps) {
  const { address, isConnected } = useAccount();

  const {
    data: balanceData,
    isError,
    isLoading,
    error,
  } = useBalance({
    address,
    token: tokenAddress,
    chainId,
  });

  // Format the balance for display
  const formattedBalance = balanceData
    ? parseFloat(formatUnits(balanceData.value, decimals)).toFixed(4)
    : '0.0000';

  const displaySymbol = balanceData?.symbol || symbol;

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

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          {tokenAddress ? `${displaySymbol} Token Balance` : 'Native Balance'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ) : isError ? (
          <div className="text-destructive text-sm flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {error?.message || 'Failed to load balance'}
          </div>
        ) : (
          <div>
            <div className="text-2xl font-bold">{formattedBalance}</div>
            <div className="text-muted-foreground text-sm">{displaySymbol}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
