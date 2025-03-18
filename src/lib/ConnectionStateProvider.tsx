'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import HapticService from '../services/HapticService';

// Types of connection states
export type ConnectionStatus = 'online' | 'offline' | 'reconnecting' | 'slow';

// Context interface
interface ConnectionStateContextValue {
  status: ConnectionStatus;
  isOnline: boolean;
  lastOnlineAt: Date | null;
  reconnect: () => void;
  isSlowConnection: boolean;
  latency: number | null;
}

// Create context with default values
const ConnectionStateContext = createContext<ConnectionStateContextValue>({
  status: 'online',
  isOnline: true,
  lastOnlineAt: new Date(),
  reconnect: () => {},
  isSlowConnection: false,
  latency: null,
});

// Hook to use the connection state context
export const useConnectionState = () => useContext(ConnectionStateContext);

// Props for the provider component
interface ConnectionStateProviderProps {
  children: ReactNode;
  pingEndpoint?: string;
  pingInterval?: number; // In milliseconds
  slowConnectionThreshold?: number; // In milliseconds
  onConnectionChange?: (status: ConnectionStatus) => void;
}

/**
 * Provider component that monitors network connectivity status
 * and provides connection info and reconnection capabilities
 */
export const ConnectionStateProvider: React.FC<ConnectionStateProviderProps> = ({
  children,
  pingEndpoint = '/api/ping',
  pingInterval = 30000, // Default to checking every 30 seconds
  slowConnectionThreshold = 1000, // Default to 1000ms (1 second) threshold for slow connection
  onConnectionChange,
}) => {
  const [status, setStatus] = useState<ConnectionStatus>('online');
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(new Date());
  const [latency, setLatency] = useState<number | null>(null);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  // Function to check actual connectivity by pinging an endpoint
  const checkConnectivity = async () => {
    // Skip if we're already checking
    if (status === 'reconnecting') return;

    try {
      const startTime = Date.now();

      // Make a request to the ping endpoint
      const response = await fetch(pingEndpoint, {
        method: 'HEAD',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });

      const endTime = Date.now();
      const pingLatency = endTime - startTime;

      // Set latency and check if connection is slow
      setLatency(pingLatency);
      setIsSlowConnection(pingLatency > slowConnectionThreshold);

      // If we got a response, we're online
      if (response.ok) {
        if (status !== 'online') {
          setStatus('online');
          setLastOnlineAt(new Date());

          // Notify that we're back online
          if (status === 'offline' || status === 'slow') {
            // Provide haptic feedback when coming back online
            HapticService.medium();

            if (onConnectionChange) {
              onConnectionChange('online');
            }
          }
        }
      } else {
        // If we get an error response, treat as offline
        handleOfflineState();
      }
    } catch (_error) {
      // If we can't reach the endpoint, we're offline
      handleOfflineState();
    }
  };

  // Handle moving to offline state
  const handleOfflineState = () => {
    if (status !== 'offline') {
      setStatus('offline');

      // Provide haptic feedback when going offline
      HapticService.heavy();

      if (onConnectionChange) {
        onConnectionChange('offline');
      }
    }
  };

  // Handle browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      // Set to reconnecting first to trigger a ping
      setStatus('reconnecting');

      // Then check actual connectivity
      checkConnectivity();
    };

    const handleOffline = () => {
      handleOfflineState();
    };

    // Listen for browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Do an initial check
    checkConnectivity();

    // Set up regular ping interval
    const timerId = setInterval(checkConnectivity, pingInterval);

    // Clean up event listeners and interval on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [pingInterval, onConnectionChange]);

  // Handle status change
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(status);
    }
  }, [status, onConnectionChange]);

  // Function to manually trigger reconnection
  const reconnect = () => {
    if (status !== 'online') {
      setStatus('reconnecting');
      checkConnectivity();
    }
  };

  // Provide the connection state to children
  return (
    <ConnectionStateContext.Provider
      value={{
        status,
        isOnline: status === 'online',
        lastOnlineAt,
        reconnect,
        isSlowConnection,
        latency,
      }}
    >
      {children}
    </ConnectionStateContext.Provider>
  );
};

/**
 * Component to display when connection is lost
 */
export const OfflineIndicator: React.FC<{
  style?: 'banner' | 'floating' | 'minimal';
  className?: string;
}> = ({ style = 'banner', className = '' }) => {
  const { status, reconnect } = useConnectionState();

  // Don't render anything if online
  if (status === 'online') return null;

  // Render a banner that takes up the full width of the screen
  if (style === 'banner') {
    return (
      <div
        className={`fixed top-0 left-0 right-0 bg-red-500 text-white py-2 px-4 z-50 ${className}`}
      >
        <div className="flex items-center justify-center">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="mr-2">
            {status === 'offline' ? 'You are offline' : 'Reconnecting...'}
          </span>
          {status === 'offline' && (
            <button
              onClick={reconnect}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded text-sm"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render a floating indicator in the corner
  if (style === 'floating') {
    return (
      <div
        className={`fixed bottom-4 right-4 bg-red-500 text-white py-2 px-4 rounded-lg shadow-md z-50 ${className}`}
      >
        <div className="flex items-center">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="mr-2">{status === 'offline' ? 'Offline' : 'Reconnecting...'}</span>
          {status === 'offline' && (
            <button
              onClick={reconnect}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded text-sm ml-2"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render a minimal indicator (just an icon)
  return (
    <div
      className={`fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-md z-50 ${className}`}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        onClick={reconnect}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>
  );
};

export default ConnectionStateProvider;
