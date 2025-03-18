'use client';

import React, { useState, useEffect } from 'react';
import AudioService from '../../services/AudioService';
import HapticService from '../../services/HapticService';

interface FeedbackToggleProps {
  className?: string;
}

/**
 * Component that allows users to toggle audio and haptic feedback
 */
const FeedbackToggle: React.FC<FeedbackToggleProps> = ({ className = '' }) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  // Load saved preferences on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get audio preference
      const savedAudio = localStorage.getItem('audioEnabled');
      if (savedAudio !== null) {
        setAudioEnabled(savedAudio === 'true');
      }

      // Get haptic preference
      const savedHaptic = localStorage.getItem('hapticEnabled');
      if (savedHaptic !== null) {
        setHapticEnabled(savedHaptic === 'true');
      }
    }
  }, []);

  const toggleAudio = () => {
    const newValue = !audioEnabled;
    setAudioEnabled(newValue);

    if (newValue) {
      AudioService.enable();
    } else {
      AudioService.disable();
    }

    // Play test sound if enabling
    if (newValue) {
      AudioService.play('pop');
    }

    // Always provide haptic feedback for toggle
    HapticService.light();
  };

  const toggleHaptic = () => {
    const newValue = !hapticEnabled;
    setHapticEnabled(newValue);
    HapticService.setEnabled(newValue);

    // Provide test feedback if enabling
    if (newValue) {
      HapticService.medium();
    }

    // Always play audio for toggle if enabled
    if (audioEnabled) {
      AudioService.play('pop');
    }
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Audio toggle */}
      <button
        onClick={toggleAudio}
        className="flex items-center space-x-2"
        aria-label={audioEnabled ? 'Disable sound' : 'Enable sound'}
      >
        <span className="text-sm text-gray-600 dark:text-gray-300">Sound</span>
        {audioEnabled ? (
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072M12 6a7.001 7.001 0 017 7m-7-7a7 7 0 00-7 7m7-7v7m-7-7h14"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15.414a8 8 0 001.737 1.736m4.506-4.506a3.001 3.001 0 00-4.242 0m4.242 0a3 3 0 00-4.242 4.242m4.242-4.242l-4.242 4.242m6.364-6.364l-9.9 9.9"
            />
          </svg>
        )}
      </button>

      {/* Haptic toggle */}
      <button
        onClick={toggleHaptic}
        className="flex items-center space-x-2"
        aria-label={hapticEnabled ? 'Disable vibration' : 'Enable vibration'}
      >
        <span className="text-sm text-gray-600 dark:text-gray-300">Haptic</span>
        {hapticEnabled ? (
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default FeedbackToggle;
