'use client';

import React from 'react';
import FrameManifestManager from '../../lib/FrameManifestManager';
import HapticService from '../../services/HapticService';

interface ChannelLinkProps {
  className?: string;
  variant?: 'compact' | 'standard' | 'prominent';
}

/**
 * Component for linking to the official This or That Farcaster channel
 */
const ChannelLink: React.FC<ChannelLinkProps> = ({ className = '', variant = 'standard' }) => {
  const { channel } = FrameManifestManager.discoveryInfo;

  const handleClick = () => {
    HapticService.light();
    // Open the channel URL
    window.open(channel.url, '_blank');
  };

  // Compact variant - just icon and name
  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center space-x-1 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 ${className}`}
        aria-label={`Join the ${channel.name} channel`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
          />
        </svg>
        <span>{channel.name}</span>
      </button>
    );
  }

  // Prominent variant - card style with icon, name, and description
  if (variant === 'prominent') {
    return (
      <div
        className={`bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800/50 ${className}`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-1">
            <svg
              className="h-5 w-5 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="font-medium text-purple-800 dark:text-purple-300">Join our community</h3>
            <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">
              {channel.description}
            </p>
            <button
              onClick={handleClick}
              className="mt-3 inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
            >
              Join {channel.name}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standard variant (default)
  return (
    <div className={`flex items-center ${className}`}>
      <button
        onClick={handleClick}
        className="inline-flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
        aria-label={`Join the ${channel.name} channel`}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
          />
        </svg>
        <span className="font-medium">Join the {channel.name} community</span>
      </button>
    </div>
  );
};

export default ChannelLink;
