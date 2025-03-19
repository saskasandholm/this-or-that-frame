'use client';

import { useEffect, useState, useCallback } from 'react';
import sdk from '@farcaster/frame-sdk';

export interface FrameDiscoveryState {
  isSDKLoaded: boolean;
  shouldShowPrompt: boolean;
  interactionCount: number;
  promptShown: boolean;
  trackInteraction: (type: string) => void;
  markPromptAsShown: () => void;
  saveFrame: () => Promise<boolean>;
}

/**
 * Custom hook for Frame discovery features including interaction tracking,
 * frame saving functionality, and prompt management.
 *
 * This manages the user's interaction with the frame and determines
 * when to show save prompts.
 */
export function useFrameDiscovery(): FrameDiscoveryState {
  // SDK loading state
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  // Track number of interactions with the frame
  const [interactionCount, setInteractionCount] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('frameInteractionCount');
      return stored ? parseInt(stored, 10) : 0;
    }
    return 0;
  });

  // Whether we've already shown the save prompt
  const [promptShown, setPromptShown] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem('frameSavePromptShown') === 'true';
    }
    return false;
  });

  // Initialize and load SDK
  useEffect(() => {
    const loadSDK = async () => {
      try {
        // Wait for SDK context to be ready
        await sdk.context;

        // Signal ready to the parent app
        sdk.actions.ready();

        console.debug('Frame SDK loaded successfully');
        setIsSDKLoaded(true);
      } catch (error) {
        console.error('Error initializing Frame SDK:', error);
        // Still mark as loaded to allow fallback UI to render
        setIsSDKLoaded(true);
      }
    };

    if (!isSDKLoaded) {
      loadSDK();
    }
  }, [isSDKLoaded]);

  // Listen for SDK visibility changes
  useEffect(() => {
    if (!isSDKLoaded) return;

    const handleVisibilityChange = () => {
      // Handle visibility state changes
      if (document.visibilityState === 'visible') {
        // Frame is visible again - resume any paused operations
        console.debug('Frame is visible');
      } else {
        // Frame is hidden - consider pausing animations, timers, etc.
        console.debug('Frame is hidden');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSDKLoaded]);

  // Track user interactions with the frame
  const trackInteraction = useCallback((type: string) => {
    setInteractionCount(prevCount => {
      const newCount = prevCount + 1;
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('frameInteractionCount', newCount.toString());
      }

      console.debug(`Interaction tracked: ${type}, count: ${newCount}`);
      return newCount;
    });
  }, []);

  // Mark the save prompt as shown to prevent showing it again
  const markPromptAsShown = useCallback(() => {
    setPromptShown(true);

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('frameSavePromptShown', 'true');
    }
  }, []);

  // Determine if we should show the save prompt based on interaction count
  // and whether we've already shown it
  const shouldShowPrompt = interactionCount >= 3 && !promptShown;

  // Function to save the frame using the Farcaster SDK
  const saveFrame = useCallback(async (): Promise<boolean> => {
    if (!isSDKLoaded) {
      console.error('Cannot save frame: SDK not loaded');
      return false;
    }

    try {
      console.debug('Attempting to save frame...');

      // Call the addFrame SDK method
      const result = await sdk.actions.addFrame();

      // Check result type to handle different SDK versions
      if (typeof result === 'boolean') {
        return result;
      } else if (result && typeof result === 'object' && 'success' in result) {
        return Boolean(result.success);
      }

      // If unknown result format, log and return false
      console.warn('Unexpected result from sdk.actions.addFrame():', result);
      return false;
    } catch (error) {
      console.error('Error saving frame:', error);
      return false;
    }
  }, [isSDKLoaded]);

  return {
    isSDKLoaded,
    shouldShowPrompt,
    interactionCount,
    promptShown,
    trackInteraction,
    markPromptAsShown,
    saveFrame,
  };
}

/**
 * Helper functions for working with Frame-specific functionality
 */
export const FrameHelpers = {
  // Generate a share URL for direct challenges
  generateChallengeUrl(topicId?: string, choice?: 'A' | 'B'): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const url = new URL(baseUrl);

    // Add required parameters
    if (topicId) url.searchParams.append('topicId', topicId);
    url.searchParams.append('challenge', 'true');
    if (choice) url.searchParams.append('from', choice);

    return url.toString();
  },

  // Format a challenge message for sharing
  formatChallengeMessage(
    topicTitle?: string,
    choice?: 'A' | 'B',
    optionA?: string,
    optionB?: string,
    url?: string
  ): string {
    // Validate and ensure we have a title
    const safeTitle = topicTitle || 'This or That challenge';

    // Create the challenge message
    let message = '';

    if (choice && optionA && optionB) {
      // User has voted, include their choice
      const selectedOption = choice === 'A' ? optionA : optionB;
      message = `I chose "${selectedOption}" on "${safeTitle}". What would you choose? `;
    } else {
      // Generic challenge without user's choice
      message = `Check out this "${safeTitle}" question! What would you choose? `;
    }

    // Add the URL if provided
    if (url) {
      message += url;
    }

    // Add hashtag
    message += ' #ThisOrThat';

    return message;
  },

  // Check if user is in a Farcaster frame context
  isInFrameContext(): boolean {
    // Check if we're in a frame context
    // The sdk.context will indicate this when available
    try {
      return (
        typeof window !== 'undefined' &&
        window.location.ancestorOrigins &&
        window.location.ancestorOrigins.length > 0 &&
        /warpcast|farcaster/i.test(window.location.ancestorOrigins[0])
      );
    } catch (error) {
      return false;
    }
  },
};

export default useFrameDiscovery;
