'use client';

import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthStateProvider } from '@/context/AuthContext';

// Dynamically import AuthProvider with client-side only rendering
const AuthProvider = dynamic(
  () => import('@/components/providers/AuthProvider').then(mod => mod.AuthProvider),
  {
    ssr: false,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <AuthStateProvider>{children}</AuthStateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
