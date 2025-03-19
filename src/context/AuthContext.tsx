'use client';

import { createContext, useContext } from 'react';
import { useAuthState, FarcasterUser } from '@/hooks/useAuthState';

type AuthContextType = {
  user: FarcasterUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
});

export function AuthStateProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthState();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
