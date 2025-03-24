'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@farcaster/auth-kit';
import { trackEvent } from '@/lib/analytics';

export type FarcasterUser = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
};

export function useAuthContext() {
  const { isAuthenticated, profile } = useProfile();
  const [isLoading, setIsLoading] = useState(true);

  // Update loading state based on profile initialization
  useEffect(() => {
    if (profile !== undefined) {
      setIsLoading(false);
    }
  }, [profile]);

  // Track authentication events
  useEffect(() => {
    if (isAuthenticated && profile) {
      console.log('[AuthContext] User authenticated with Farcaster AuthKit:', {
        fid: profile.fid,
        username: profile.username
      });
      trackEvent('auth_success', {
        method: 'farcaster',
        source: 'farcaster_auth_kit'
      });
    }
  }, [isAuthenticated, profile]);

  // Construct user object from profile
  const user = isAuthenticated && profile ? {
    fid: profile.fid || 0,
    username: profile.username || '',
    displayName: profile.displayName || profile.username || '',
    pfpUrl: profile.pfpUrl || ''
  } : null;

  return {
    user,
    isAuthenticated,
    isLoading
  };
}
