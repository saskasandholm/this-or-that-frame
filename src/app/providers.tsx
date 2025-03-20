'use client';

import dynamic from 'next/dynamic';
import { AuthProvider } from '@/components/providers/AuthProvider';

// Dynamically import WagmiProvider with SSR disabled
// This is necessary because it accesses browser APIs like window
const WagmiProvider = dynamic(
  () => import('@/components/providers/WagmiProvider'),
  {
    ssr: false,
  }
);

// Providers component wraps the application with all necessary providers
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WagmiProvider>{children}</WagmiProvider>
    </AuthProvider>
  );
}
