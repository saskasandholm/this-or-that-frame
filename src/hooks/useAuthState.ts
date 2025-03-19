'use client';

import { useProfile } from '@farcaster/auth-kit';
import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
}

export function useAuthState() {
  const { isAuthenticated, profile } = useProfile();
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && profile) {
      if (typeof profile.fid === 'number') {
        const userData: FarcasterUser = {
          fid: profile.fid,
          username: profile.username || '',
          displayName: profile.displayName || '',
          pfpUrl: profile.pfpUrl || '',
        };

        setUser(userData);

        trackEvent('auth_status_changed', {
          isAuthenticated: true,
          fid: profile.fid,
          hasUsername: Boolean(profile.username),
        });
      }
    } else {
      setUser(null);

      trackEvent('auth_status_changed', {
        isAuthenticated: false,
      });
    }

    setIsLoading(false);
  }, [isAuthenticated, profile]);

  return {
    user,
    isAuthenticated,
    isLoading,
  };
}
