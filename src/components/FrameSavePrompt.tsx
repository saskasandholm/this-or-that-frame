'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFrameDiscovery } from '../lib/FrameDiscoveryHelper';

interface FrameSavePromptProps {
  type?: 'modal' | 'toast' | 'inline';
  variant?: 'modal' | 'toast' | 'inline';
  message?: string;
  onClose?: () => void;
  topicId?: string;
  topicTitle?: string;
  className?: string;
}

const FrameSavePrompt: React.FC<FrameSavePromptProps> = ({
  type = 'modal',
  variant,
  message = 'Want to save this frame for easy access?',
  onClose,
  topicId,
  topicTitle,
  className = '',
}) => {
  const displayType = variant || type;

  const { saveFrame } = useFrameDiscovery() as {
    shouldShowPrompt: boolean;
    interactionCount: number;
    trackInteraction: (type: string) => void;
    markPromptAsShown: () => void;
    saveFrame: () => Promise<boolean>;
  };
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  // Log the topic ID for analytics when the component mounts
  useEffect(() => {
    if (topicId) {
      console.debug(`Save prompt shown for topic: ${topicId}`);
    }
  }, [topicId]);

  const handleSave = async () => {
    setSaving(true);
    setError(false);

    try {
      // If we have a topicId, we can include it in analytics or tracking
      if (topicId) {
        console.debug(`Attempting to save frame for topic: ${topicId}`);
      }

      const success = await saveFrame();
      if (success) {
        setSaved(true);
        setSaving(false);

        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setError(true);
        setSaving(false);
      }
    } catch (e) {
      console.error('Error saving frame:', e);
      setError(true);
      setSaving(false);
    }
  };

  if (displayType === 'toast') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border-l-4 border-purple-500"
        >
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium">{message}</p>
              {topicTitle && <p className="text-xs text-gray-500">{topicTitle}</p>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  saved
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white animate-pulse'
                }`}
              >
                {saving ? '...' : saved ? '✅ Saved!' : '🔖 Save'}
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (displayType === 'inline') {
    return (
      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-300 dark:border-purple-700 p-4 rounded-lg mb-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-purple-800 dark:text-purple-300">{message}</p>
            {topicTitle && <p className="text-xs text-gray-500">{topicTitle}</p>}
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-purple-700 dark:text-purple-400">
              <div className="flex items-center">
                <span className="mr-1">✓</span> Maintain streak
              </div>
              <div className="flex items-center">
                <span className="mr-1">✓</span> Easy access
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`px-4 py-2 rounded-md text-sm font-medium shadow-md transform transition-all duration-200 hover:scale-105 ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white animate-pulse'
              }`}
            >
              {saving ? '...' : saved ? '✅ Saved!' : '🔖 Save'}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm"
            >
              No Thanks
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal type is the default fallback
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${className}`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-5 shadow-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {topicTitle ? `Save "${topicTitle}"` : 'Save Frame'}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>

        <div className="mb-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-2">
            <li className="flex items-center">
              <span className="mr-2">✓</span> Easy access to daily voting
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span> Maintain your voting streak
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span> Compare with friends
            </li>
          </ul>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`flex-1 py-3 rounded-md font-bold text-base shadow-lg transform transition-all duration-200 hover:scale-105 ${
              saved
                ? 'bg-green-500 text-white'
                : error
                  ? 'bg-red-500 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white animate-pulse'
            }`}
          >
            {saving ? 'Saving...' : saved ? '✅ Saved!' : error ? 'Try Again' : '🔖 Save Frame'}
          </button>
          <button onClick={onClose} className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 rounded-md">
            {saved ? 'Close' : 'No Thanks'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FrameSavePrompt;
