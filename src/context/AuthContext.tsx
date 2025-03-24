'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuthContext } from '@/hooks/useAuthContext';
import type { FarcasterUser } from '@/hooks/useAuthContext';

// Define the shape of the auth context
type AuthContextType = {
  user: FarcasterUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
});

/**
 * Provider component for auth state
 */
export function AuthStateProvider({ children }: { children: ReactNode }) {
  // Use our simplified hook that only uses Farcaster AuthKit
  const auth = useAuthContext();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use the auth context
 */
export function useAuth() {
  return useContext(AuthContext);
}
