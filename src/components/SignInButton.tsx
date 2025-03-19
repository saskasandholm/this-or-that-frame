'use client';

import { SignInButton as FarcasterSignInButton } from '@farcaster/auth-kit';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { trackError } from '@/lib/error-tracking';

export function SignInButton({ className }: { className?: string }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // If still loading, show a loading state
  if (isLoading) {
    return (
      <Button className={className} disabled>
        <span className="mr-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </span>
        Loading...
      </Button>
    );
  }

  // If authenticated, show user info
  if (isAuthenticated && user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img
          src={user.pfpUrl || 'https://warpcast.com/~/assets/favicon.png'}
          alt={user.displayName || user.username}
          className="h-8 w-8 rounded-full"
        />
        <span className="font-medium">{user.displayName || user.username}</span>
      </div>
    );
  }

  // Otherwise, show our custom sign in button that wraps Farcaster's button
  return (
    <div className={`farcaster-button-wrapper ${className}`}>
      <style jsx global>{`
        /* Override Farcaster button styles to match our UI */
        .farcaster-button-wrapper button.fc-authkit-button {
          background-color: rgb(139, 92, 246) !important; /* Match our purple button */
          border-radius: 0.5rem !important;
          border: none !important;
          padding: 0.5rem 1rem !important;
          transition: background-color 0.2s ease !important;
          font-family: var(--font-sans) !important;
          font-weight: 500 !important;
          box-shadow: none !important;
          height: 40px !important;
          min-width: auto !important;
        }

        .farcaster-button-wrapper button.fc-authkit-button:hover {
          background-color: rgb(124, 58, 237) !important; /* Darker purple on hover */
        }

        .farcaster-button-wrapper button.fc-authkit-button > div {
          height: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0.5rem !important;
        }

        .farcaster-button-wrapper button.fc-authkit-button > div > div {
          display: flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
        }
      `}</style>
      <FarcasterSignInButton
        onSuccess={async response => {
          console.log('Authentication successful!', response);
          setIsSigningIn(true);

          try {
            // Extract the signature and message
            const { signature, message } = response;

            // Send to our server endpoint for verification
            const serverResponse = await fetch('/api/auth/farcaster', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ signature, message }),
            });

            if (!serverResponse.ok) {
              const errorData = await serverResponse.json();
              throw new Error(errorData.error || 'Failed to authenticate on server');
            }

            // Successfully authenticated with the server
            trackEvent('auth_success', {
              method: 'farcaster',
            });

            // Reload the page to update the UI with the authenticated state
            window.location.reload();
          } catch (error) {
            console.error('Server authentication error:', error);
            trackError('Server authentication error', { error });
            trackEvent('auth_server_error', {
              method: 'farcaster',
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          } finally {
            setIsSigningIn(false);
          }
        }}
        onError={error => {
          console.error('Authentication error:', error);
          setIsSigningIn(false);
          trackError('Authentication error', { error: error ? error.message : 'Unknown error' });
          trackEvent('auth_error', {
            method: 'farcaster',
            error: error ? error.message : 'Unknown error',
          });
        }}
      />
    </div>
  );
}
