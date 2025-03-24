'use client';

import { SignInButton as FarcasterSignInButton } from '@farcaster/auth-kit';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { trackError } from '@/lib/error-tracking';
import type { AuthClientError, StatusAPIResponse } from '@farcaster/auth-kit';

/**
 * Helper to detect mobile devices
 */
function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function SignInButton({ className }: { className?: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signInProgress, setSignInProgress] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Check if running on mobile
  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);

  // Don't show the button if already authenticated or loading
  if (isAuthenticated || isLoading) {
    console.log('[SignInButton] Not rendering because:', { isAuthenticated, isLoading });
    return null;
  }

  const handleAuthError = (error: Error | string, source: string) => {
    const errorMessage = error instanceof Error ? error.message : error;
    console.error(`[SignInButton] ${source} error:`, error);
    setAuthError(errorMessage);
    setShowAuthDialog(true);
    trackError(source, { error });
    setSignInProgress(false);
  };

  const handleSuccess = async (response: StatusAPIResponse) => {
    try {
      console.log('[SignInButton] Auth success response:', {
        keys: Object.keys(response),
        hasSignature: !!response.signature,
        hasMessage: !!response.message,
        messageType: typeof response.message,
        isMobile: isMobileDevice,
      });

      if (signInProgress) {
        console.log('[SignInButton] Already processing sign-in, ignoring duplicate callback');
        return;
      }

      setSignInProgress(true);

      if (!response.message || !response.signature) {
        throw new Error('Invalid authentication response');
      }

      // Extract useful data from message if it's an object
      let messageData: Record<string, unknown> = {};
      if (typeof response.message === 'object' && response.message !== null) {
        messageData = response.message as Record<string, unknown>;
        console.log('[SignInButton] Message data:', messageData);
      }

      // Notify the server about successful authentication with the full response
      console.log('[SignInButton] Sending auth data to server');
      const serverResponse = await fetch('/api/auth/farcaster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
        body: JSON.stringify({
          signature: response.signature,
          message: response.message,
          nonce: response.nonce,
          isMobile: isMobileDevice,
          userAgent: navigator.userAgent,
        }),
        credentials: 'include',
      });

      // Read headers before consuming the response body
      const setCookieHeader = serverResponse.headers.get('set-cookie');
      const contentTypeHeader = serverResponse.headers.get('content-type');

      const responseData = await serverResponse.json();
      console.log('[SignInButton] Server auth response:', {
        status: serverResponse.status,
        ok: serverResponse.ok,
        statusText: serverResponse.statusText,
        data: responseData,
        headers: {
          contentType: contentTypeHeader,
          setCookie: setCookieHeader ? 'present' : 'absent',
        },
      });

      if (!serverResponse.ok) {
        // If we get an authentication error, try again one more time
        if (serverResponse.status === 401 && retryCount < 2) {
          setRetryCount(count => count + 1);
          setSignInProgress(false);
          console.log(`[SignInButton] Auth failed, will retry (attempt ${retryCount + 1}/2)`);

          // Wait a moment before retrying
          setTimeout(() => {
            // Trigger the auth flow again
            window.location.reload();
          }, 1000);
          return;
        }

        throw new Error(responseData.error || 'Failed to create server session');
      }

      // Track successful authentication
      trackEvent('auth_success', { method: 'farcaster' });

      // Wait a moment to ensure cookies are set
      const waitTime = isMobileDevice ? 2500 : 1500;
      console.log(`[SignInButton] Waiting ${waitTime}ms before reload...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));

      // Check if cookies were actually set
      const cookies = document.cookie.split(';').map(c => c.trim());
      const hasCookiesSet = cookies.some(
        c =>
          c.startsWith('farcaster_auth_check=') ||
          c.startsWith('farcaster_auth_check_lax=') ||
          c.startsWith('farcaster_auth_check_none=')
      );

      console.log('[SignInButton] Cookies before reload:', {
        hasCookiesSet,
        cookies: cookies.map(c => c.split('=')[0]),
        rawCookie: document.cookie.substring(0, 100) + (document.cookie.length > 100 ? '...' : ''),
      });

      if (!hasCookiesSet) {
        console.warn('[SignInButton] No auth cookies detected after successful authentication');
        // Attempt to recover by explicitly hitting the debug endpoint
        try {
          const debugResponse = await fetch('/api/debug/cookies', {
            credentials: 'include',
            headers: { 'Cache-Control': 'no-cache' },
          });
          const debugData = await debugResponse.json();
          console.log('[SignInButton] Cookie debug data:', debugData);
        } catch (e) {
          console.error('[SignInButton] Failed to fetch cookie debug data:', e);
        }
      }

      if (isMobileDevice) {
        // Use a custom URL parameter to identify this is a post-auth reload
        const reloadUrl =
          window.location.pathname +
          '?auth=completed&t=' +
          Date.now() +
          '&mobile=true' +
          '&cookies=' +
          (hasCookiesSet ? 'true' : 'false');

        console.log('[SignInButton] Redirecting mobile to:', reloadUrl);
        window.location.href = reloadUrl;
      } else {
        // Reload the page to update auth state
        console.log('[SignInButton] Reloading page to update auth state');
        window.location.reload();
      }
    } catch (error) {
      handleAuthError(error as Error, 'Server authentication');
    }
  };

  console.log('[SignInButton] Rendering button');
  return (
    <>
      <div className={className}>
        <FarcasterSignInButton
          onSuccess={handleSuccess}
          onError={(error: AuthClientError | undefined) => {
            handleAuthError(
              error?.message || 'Failed to authenticate with Farcaster',
              'Farcaster auth'
            );
          }}
          timeout={300000} // 5 minutes timeout
        />
      </div>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Error</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">{authError}</p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button onClick={() => window.location.reload()} variant="secondary">
                Reload Page
              </Button>
              <Button onClick={() => setShowAuthDialog(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
