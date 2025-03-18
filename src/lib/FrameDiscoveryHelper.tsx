'use client';

import { useState, useEffect, useCallback } from 'react';
import sdk from '@farcaster/frame-sdk';

/**
 * Interface defining the state and methods returned by the useFrameDiscovery hook
 * @interface FrameDiscoveryState
 */
interface FrameDiscoveryState {
  /** Whether to show the frame save prompt based on interaction conditions */
  shouldShowPrompt: boolean;
  /** Count of user interactions with the frame */
  interactionCount: number;
  /** Function to track user interactions with the frame */
  trackInteraction: (type: string) => void;
  /** Function to mark the save prompt as having been shown */
  markPromptAsShown: () => void;
  /** Function to save the frame to the user's collection */
  saveFrame: () => Promise<boolean>;
}

/**
 * Custom hook for managing frame discovery features
 *
 * This hook helps track user interactions, determine when to show save prompts,
 * and manage the frame saving process. It uses localStorage to persist state
 * across sessions.
 *
 * @returns {FrameDiscoveryState} Object containing state and methods for frame discovery
 *
 * @example
 * ```tsx
 * const { shouldShowPrompt, trackInteraction, saveFrame } = useFrameDiscovery();
 *
 * // Track when user interacts with a feature
 * const handleButtonClick = () => {
 *   trackInteraction('button_click');
 *   // other logic...
 * };
 *
 * // Show save prompt conditionally
 * useEffect(() => {
 *   if (shouldShowPrompt) {
 *     // Show your custom prompt UI
 *   }
 * }, [shouldShowPrompt]);
 * ```
 */
export function useFrameDiscovery(): FrameDiscoveryState {
  const [interactions, setInteractions] = useState<number>(0);
  const [hasShownPrompt, setHasShownPrompt] = useState<boolean>(false);
  const [promptShowed, setPromptShowed] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedHasShownPrompt = localStorage.getItem('frameDiscovery_hasShownPrompt');
      const storedIsSaved = localStorage.getItem('frameDiscovery_isSaved');

      if (storedHasShownPrompt) {
        setHasShownPrompt(storedHasShownPrompt === 'true');
      }

      if (storedIsSaved) {
        setIsSaved(storedIsSaved === 'true');
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('frameDiscovery_hasShownPrompt', String(hasShownPrompt));
      localStorage.setItem('frameDiscovery_isSaved', String(isSaved));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [hasShownPrompt, isSaved]);

  /**
   * Tracks a user interaction with the frame
   *
   * @param {string} type - The type of interaction being tracked
   */
  const trackInteraction = useCallback((type: string = 'general') => {
    console.log(`Tracking interaction: ${type}`);
    setInteractions(prev => prev + 1);
  }, []);

  /**
   * Marks the save prompt as having been shown to the user
   * This prevents showing the prompt again in the same session
   */
  const markPromptAsShown = useCallback(() => {
    setHasShownPrompt(true);
    setPromptShowed(true);
  }, []);

  // Determine if we should show the prompt
  const shouldShowPrompt = !hasShownPrompt && !isSaved && interactions >= 2 && !promptShowed;

  /**
   * Attempts to save the frame to the user's collection using the Farcaster SDK
   *
   * @returns {Promise<boolean>} A promise that resolves to true if the frame was saved successfully, false otherwise
   */
  const saveFrame = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    try {
      // Check if addFrame is supported
      if (sdk.actions && typeof sdk.actions.addFrame === 'function') {
        const result = await sdk.actions.addFrame();
        if (result && 'added' in result && result.added === true) {
          setIsSaved(true);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error saving frame:', error);
      return false;
    }
  }, []);

  return {
    shouldShowPrompt,
    interactionCount: interactions,
    trackInteraction,
    markPromptAsShown,
    saveFrame,
  };
}
