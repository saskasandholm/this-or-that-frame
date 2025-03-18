'use client';

import { useState, useEffect } from 'react';

// Track if the user has seen the save prompt
let hasSavePromptBeenShown = false;

/**
 * Helper class for frame discovery and user interaction tracking
 */
const FrameDiscoveryHelper = {
  /**
   * Check if we should show the save prompt based on user behavior
   * @param interactionCount - Number of user interactions with the frame
   * @returns Boolean indicating if the save prompt should be shown
   */
  shouldShowSavePrompt: (interactionCount: number = 0): boolean => {
    // Don't show again if it's been shown before
    if (hasSavePromptBeenShown) {
      return false;
    }

    // If localStorage is available, check if we've saved this state
    if (typeof localStorage !== 'undefined') {
      const hasBeenShown = localStorage.getItem('savePromptShown') === 'true';
      if (hasBeenShown) {
        hasSavePromptBeenShown = true;
        return false;
      }
    }

    // Show the prompt after the user has interacted enough to understand the value
    // - First vote cast
    // - After viewing results
    // - After multiple interactions
    return interactionCount >= 2;
  },

  /**
   * Record that the save prompt has been shown to avoid showing it again
   */
  markSavePromptAsShown: (): void => {
    hasSavePromptBeenShown = true;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('savePromptShown', 'true');
    }
  },

  /**
   * Reset the save prompt shown state (for testing)
   */
  resetSavePromptState: (): void => {
    hasSavePromptBeenShown = false;

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('savePromptShown');
    }
  },

  /**
   * Check if the frame is already saved
   * @returns Promise that resolves to boolean indicating if frame is saved
   */
  isFrameSaved: async (sdk: any): Promise<boolean> => {
    if (!sdk) {
      return false;
    }

    try {
      // This is a placeholder - in a real implementation, we would use
      // the SDK to check if the frame is already saved
      return await sdk.isFrameSaved();
    } catch (error) {
      console.error('Error checking if frame is saved:', error);
      return false;
    }
  },

  /**
   * Track user interaction with the app
   * @param interactionType - Type of interaction
   */
  trackInteraction: (interactionType: string): void => {
    // Track different types of interactions (vote, view results, share, etc.)
    // This could connect to analytics or be used for showing the save prompt
    console.log(`Interaction tracked: ${interactionType}`);

    // Here we could increment a counter in localStorage to track
    // interaction count for determining when to show the save prompt
    if (typeof localStorage !== 'undefined') {
      const count = parseInt(localStorage.getItem('interactionCount') || '0', 10);
      localStorage.setItem('interactionCount', (count + 1).toString());
    }
  },

  /**
   * Get the current interaction count
   * @returns Number of tracked interactions
   */
  getInteractionCount: (): number => {
    if (typeof localStorage !== 'undefined') {
      return parseInt(localStorage.getItem('interactionCount') || '0', 10);
    }
    return 0;
  },
};

/**
 * React hook for frame discovery features
 */
export const useFrameDiscovery = () => {
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);

  // Initialize on mount
  useEffect(() => {
    // Get current interaction count
    const count = FrameDiscoveryHelper.getInteractionCount();
    setInteractionCount(count);

    // Check if we should show the save prompt
    const shouldShow = FrameDiscoveryHelper.shouldShowSavePrompt(count);
    setShouldShowPrompt(shouldShow);
  }, []);

  // Function to track a new interaction
  const trackInteraction = (type: string) => {
    FrameDiscoveryHelper.trackInteraction(type);

    // Update local state
    const newCount = FrameDiscoveryHelper.getInteractionCount();
    setInteractionCount(newCount);

    // Check if we should now show the save prompt
    if (!shouldShowPrompt) {
      const shouldShow = FrameDiscoveryHelper.shouldShowSavePrompt(newCount);
      setShouldShowPrompt(shouldShow);
    }
  };

  // Function to mark the save prompt as shown
  const markPromptAsShown = () => {
    FrameDiscoveryHelper.markSavePromptAsShown();
    setShouldShowPrompt(false);
  };

  return {
    shouldShowPrompt,
    interactionCount,
    trackInteraction,
    markPromptAsShown,
  };
};

export default FrameDiscoveryHelper;
