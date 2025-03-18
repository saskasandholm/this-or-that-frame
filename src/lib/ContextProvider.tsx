'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

// Define types for frame context
interface FrameContextType {
  isFrame: boolean;
  fid: string | null;
  frameUrl: string | null;
  isReady: boolean;
  launchSource: 'global' | 'embed' | 'notification' | 'trigger' | null;
  streakReminder: boolean;
  missedDays: number;
  achievementUnlocked: string | null;
  votedOptionId: 'A' | 'B' | null;
  friendVotes: { fid: string; choice: 'A' | 'B' }[] | null;
}

// Default context state
const defaultContextValue: FrameContextType = {
  isFrame: false,
  fid: null,
  frameUrl: null,
  isReady: false,
  launchSource: null,
  streakReminder: false,
  missedDays: 0,
  achievementUnlocked: null,
  votedOptionId: null,
  friendVotes: null,
};

// Create context
const FrameContext = createContext<FrameContextType>(defaultContextValue);

// Provider component
export const FrameContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [context, setContext] = useState<FrameContextType>(defaultContextValue);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    // Only run in client (browser) environment
    if (typeof window === 'undefined') return;

    // Initialize SDK and get context
    const loadSDK = async () => {
      try {
        // Check if we're in a frame context
        const isFrame = window !== window.parent;

        if (isFrame) {
          try {
            // Signal ready to the parent frame
            if (sdk && sdk.actions && typeof sdk.actions.ready === 'function') {
              sdk.actions.ready();
            }

            // In v0.0.31, context is accessed as a promise
            let frameContext = null;
            try {
              if (sdk && sdk.context && typeof sdk.context.then === 'function') {
                frameContext = await sdk.context;
              }
            } catch (contextError) {
              console.error('Error accessing sdk.context:', contextError);
            }

            if (frameContext) {
              // Parse any query parameters for additional context
              const urlParams = new URLSearchParams(window.location.search);
              const launchSource =
                (urlParams.get('source') as FrameContextType['launchSource']) || 'global';
              const streakReminder = urlParams.get('streak') === 'true';
              const missedDays = Number(urlParams.get('missed') || '0');
              const achievementUnlocked = urlParams.get('achievement');
              const votedOptionId = urlParams.get('voted') as 'A' | 'B' | null;

              // Parse friend votes if present
              let friendVotes = null;
              const friendVotesParam = urlParams.get('friendVotes');
              if (friendVotesParam) {
                try {
                  friendVotes = JSON.parse(decodeURIComponent(friendVotesParam));
                } catch (e) {
                  console.error('Error parsing friendVotes parameter:', e);
                }
              }

              // Extract fid from context, handling different possible structures
              let contextFid = null;
              try {
                // Handle different versions of the frame context structure
                const typedContext = frameContext as {
                  user?: { fid?: number };
                  fid?: number;
                };
                contextFid = typedContext.user?.fid || typedContext.fid || null;
              } catch (e) {
                console.error('Error extracting FID from context:', e);
              }

              setContext({
                isFrame,
                fid: contextFid ? String(contextFid) : null,
                frameUrl: window.location.href,
                isReady: true,
                launchSource,
                streakReminder,
                missedDays,
                achievementUnlocked,
                votedOptionId,
                friendVotes,
              });
            } else {
              // No context data available
              setContext({
                ...defaultContextValue,
                isFrame,
                isReady: true,
                launchSource: 'global',
              });
            }
          } catch (sdkError) {
            console.error('Error getting frame context:', sdkError);
            setContext({
              ...defaultContextValue,
              isFrame,
              isReady: true,
              launchSource: 'global',
            });
          }
        } else {
          // Not in a frame - set basic context
          setContext({
            ...defaultContextValue,
            isReady: true,
            launchSource: 'global',
          });
        }
      } catch (error) {
        console.error('Error initializing Frame SDK:', error);
        // Set fallback state
        setContext({
          ...defaultContextValue,
          isReady: true,
          launchSource: 'global',
        });
      }
    };

    if (!isSDKLoaded) {
      setIsSDKLoaded(true);
      loadSDK();
    }
  }, [isSDKLoaded]);

  return <FrameContext.Provider value={context}>{children}</FrameContext.Provider>;
};

// Hook to consume the context
export const useFrameContext = () => useContext(FrameContext);
