'use client';

import '@farcaster/auth-kit/styles.css';
import { AuthKitProvider } from '@farcaster/auth-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { authKitConfig } from '@/lib/farcaster-config';

// Create a query client for Auth-Kit
const queryClient = new QueryClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use state to store the config that will be updated on the client side
  const [config, setConfig] = useState(authKitConfig);
  const [isClient, setIsClient] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Update the config with browser-specific values after mount
  useEffect(() => {
    setIsClient(true);

    // Safe access to window properties
    if (typeof window !== 'undefined') {
      try {
        const host = window.location.host;
        const protocol = window.location.protocol;
        const origin = `${protocol}//${host}`;

        // Make sure domain doesn't include port if it's using standard ports
        const domain = host.replace(/:80$|:443$/, '');

        const updatedConfig = {
          ...authKitConfig,
          domain, // Use the current hostname
          siweUri: origin, // Use the current origin
          rpcUrl: 'https://mainnet.optimism.io', // Ensure we use a reliable RPC
          relay: 'https://relay.farcaster.xyz', // Ensure relay is set
          version: 'v1',
        };

        setConfig(updatedConfig);
        setHasInitialized(true);

        console.log('[AuthProvider] Updated config with browser values:', {
          host,
          domain,
          origin,
          config: updatedConfig,
        });
      } catch (error) {
        console.error('[AuthProvider] Error initializing config:', error);
      }
    }
  }, []);

  // Don't render AuthKitProvider during SSR to avoid window access issues
  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <>
      <style jsx global>{`
        /* Global styles for Farcaster Auth Kit modal */
        .fc-authkit-modal-overlay {
          background-color: rgba(0, 0, 0, 0.7) !important;
          backdrop-filter: blur(4px) !important;
        }

        .fc-authkit-modal {
          background-color: #18181b !important;
          border: 1px solid #333 !important;
          border-radius: 0.75rem !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4) !important;
        }

        .fc-authkit-qrcode-dialog {
          background-color: #18181b !important;
          color: white !important;
        }

        .fc-authkit-qrcode-container {
          background-color: #18181b !important;
          padding: 1rem !important;
        }

        .fc-authkit-qr-code {
          background-color: white !important;
          padding: 1rem !important;
          border-radius: 0.5rem !important;
          margin: 0 auto !important;
        }

        .fc-authkit-modal h2 {
          color: white !important;
          font-weight: 600 !important;
          font-size: 1.25rem !important;
        }

        .fc-authkit-modal p,
        .fc-authkit-modal span,
        .fc-authkit-modal div {
          color: #a1a1aa !important;
        }

        .fc-authkit-modal-close {
          color: white !important;
          background-color: #27272a !important;
          border-radius: 9999px !important;
          width: 2rem !important;
          height: 2rem !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          top: 1rem !important;
          right: 1rem !important;
        }

        /* Dialog elements styling */
        .fc-dialog-content {
          background-color: #18181b !important;
          color: white !important;
        }

        /* Make sure links stand out */
        .fc-authkit-modal a {
          color: rgb(139, 92, 246) !important;
        }

        /* Input fields in dark mode */
        .fc-authkit-modal input {
          background-color: #27272a !important;
          color: white !important;
          border: 1px solid #333 !important;
        }
      `}</style>
      <QueryClientProvider client={queryClient}>
        {hasInitialized ? (
          <AuthKitProvider config={config}>{children}</AuthKitProvider>
        ) : (
          // Show a minimal loading state while config initializes
          <div className="min-h-screen flex items-center justify-center">{children}</div>
        )}
      </QueryClientProvider>
    </>
  );
}
