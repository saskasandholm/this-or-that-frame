'use client';

import { useState, useEffect, useCallback } from 'react';
import { trackEvent } from '@/lib/analytics';

export type FarcasterUser = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  [key: string]: unknown;
};

/**
 * The useAuthState hook manages the authentication state and user information.
 * It handles cookie checking, user fetching, and visibility change events.
 */
export function useAuthState() {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCookies, setHasCookies] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  /**
   * Check if the auth cookies are present
   */
  const hasAuthCookies = useCallback(() => {
    if (typeof document === 'undefined') return false;

    const cookiesStr = document.cookie;
    const cookies = cookiesStr.split(';').map(c => c.trim());

    // Look for our primary auth cookie first
    const hasMainAuthCookie = cookies.some(c => c.startsWith('farcaster_auth='));
    
    // Look for our primary check cookie 
    const hasMainCheckCookie = cookies.some(c => c.startsWith('farcaster_auth_check='));

    // Only if main cookies aren't present, check fallbacks
    const hasAnyAuthCookie = hasMainAuthCookie || cookies.some(
      c => c.startsWith('farcaster_auth_lax=') || c.startsWith('farcaster_auth_none=')
    );

    const hasAnyCheckCookie = hasMainCheckCookie || cookies.some(
      c => c.startsWith('farcaster_auth_check_lax=') || c.startsWith('farcaster_auth_check_none=')
    );

    console.log('[useAuthState] Cookie check details:', {
      hasMainAuthCookie,
      hasMainCheckCookie,
      hasAnyAuthCookie,
      hasAnyCheckCookie,
      cookieCount: cookies.length,
      rawCookies: cookiesStr.substring(0, 100) + (cookiesStr.length > 100 ? '...' : ''),
      cookieNames: cookies.map(c => c.split('=')[0]),
    });

    // Consider authenticated if we have either the main cookies or any of the fallbacks
    return (hasMainAuthCookie && hasMainCheckCookie) || (hasAnyAuthCookie && hasAnyCheckCookie);
  }, []);

  /**
   * Fetch the user data from the server
   */
  const fetchUser = useCallback(async () => {
    try {
      console.log('[useAuthState] Fetching user data...');
      setIsLoading(true);

      const response = await fetch('/api/me', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      console.log('[useAuthState] User data response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          setUser(null);
          console.log('[useAuthState] User is not authenticated');

          // If we have cookies but the request failed, try to debug
          if (hasAuthCookies()) {
            try {
              const debugResponse = await fetch('/api/debug/cookies', {
                credentials: 'include',
              });
              const debugData = await debugResponse.json();
              console.log('[useAuthState] Cookie debug data:', debugData);
            } catch (e) {
              console.error('[useAuthState] Failed to fetch debug data:', e);
            }
          }
        }
        return;
      }

      const data = await response.json();
      console.log('[useAuthState] User data received:', !!data.user);

      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        // Track authentication success
        trackEvent('auth_state_restored', { source: 'cookie' });
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[useAuthState] Error fetching user:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [hasAuthCookies]);

  /**
   * Check cookies and update auth state
   */
  const checkAuth = useCallback(async () => {
    const cookiesExist = hasAuthCookies();
    setHasCookies(cookiesExist);

    if (cookiesExist) {
      await fetchUser();
    } else {
      console.log('[useAuthState] No auth cookies found');
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [hasAuthCookies, fetchUser]);

  /**
   * Handle visibility change - check auth when page becomes visible
   */
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      console.log('[useAuthState] Page visible, checking auth state');
      checkAuth();
    }
  }, [checkAuth]);

  /**
   * Check for auth params in the URL (for after-auth redirects)
   */
  const checkAuthParams = useCallback(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const authCompleted = urlParams.get('auth');

    if (authCompleted === 'completed') {
      console.log('[useAuthState] Detected auth completion in URL');

      // Clean URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      // Check auth with a small delay to allow cookies to settle
      setTimeout(() => {
        checkAuth();
      }, 500);
    }
  }, [checkAuth]);

  /**
   * Initialize auth state
   */
  useEffect(() => {
    console.log('[useAuthState] Initializing auth state');
    checkAuth();
    checkAuthParams();

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAuth, handleVisibilityChange, checkAuthParams]);

  /**
   * Retry fetching user if needed
   */
  useEffect(() => {
    // If cookies exist but we failed to get the user, retry a few times
    if (hasCookies && !user && !isLoading && retryCount < MAX_RETRIES) {
      console.log(`[useAuthState] Retrying user fetch (${retryCount + 1}/${MAX_RETRIES})`);
      const timer = setTimeout(
        () => {
          setRetryCount(prev => prev + 1);
          fetchUser();
        },
        1000 * (retryCount + 1)
      ); // Exponential backoff

      return () => clearTimeout(timer);
    }
  }, [hasCookies, user, isLoading, retryCount, fetchUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    hasCookies,
    refreshAuth: checkAuth,
  };
}
