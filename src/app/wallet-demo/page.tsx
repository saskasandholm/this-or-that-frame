'use client';

import { Suspense } from 'react';
import { AlertTriangle } from 'lucide-react';
import dynamicImport from 'next/dynamic';

// Next.js dynamic rendering config
export const dynamic = 'force-dynamic';

// Dynamically import the wallet demo client with SSR disabled
const WalletDemoClient = dynamicImport(
  () => import('@/components/demos/WalletDemoClient'),
  { ssr: false }
);

// Export Next.js page config
export const config = {
  unstable_runtimeJS: true,
};

// Loading fallback for wallet content
function WalletDemoLoading() {
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

      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-32 bg-muted rounded mb-4"></div>
          <div className="h-4 w-48 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );
}

// Export the page with Suspense boundary
export default function WalletDemoPage() {
  return (
    <Suspense fallback={<WalletDemoLoading />}>
      <WalletDemoClient />
    </Suspense>
  );
}
