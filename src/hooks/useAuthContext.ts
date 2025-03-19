'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FarcasterUser } from './useAuthState';
import { trackEvent } from '@/lib/analytics';

export function useAuthContext() {
  const authContext = useAuth();
  const [localUser, setLocalUser] = useState<FarcasterUser | null>(null);
  const [isLocalLoading, setIsLocalLoading] = useState(true);

  useEffect(() => {
    // If auth context already has a user, use that
    if (authContext.user) {
      setLocalUser(authContext.user);
      setIsLocalLoading(false);
      return;
    }

    // Otherwise, check for cookie-based authentication
    const checkCookieAuth = async () => {
      try {
        // Try to get auth data from our server
        const response = await fetch('/api/me', {
          credentials: 'include', // Important to include cookies
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.user) {
            setLocalUser(userData.user);
            trackEvent('auth_from_cookie', {
              source: 'cookie',
              fid: userData.user.fid,
            });
          } else {
            setLocalUser(null);
          }
        } else {
          setLocalUser(null);
        }
      } catch (error) {
        console.error('Error checking cookie auth:', error);
        setLocalUser(null);
      } finally {
        setIsLocalLoading(false);
      }
    };

    if (!authContext.isLoading) {
      checkCookieAuth();
    }
  }, [authContext.user, authContext.isLoading]);

  return {
    user: localUser || authContext.user,
    isAuthenticated: !!localUser || authContext.isAuthenticated,
    isLoading: isLocalLoading || authContext.isLoading,
  };
}
