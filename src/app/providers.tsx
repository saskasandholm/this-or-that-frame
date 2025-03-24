'use client';

import { AuthProvider } from '@/components/providers/AuthProvider';

// Providers component wraps the application with all necessary providers
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
