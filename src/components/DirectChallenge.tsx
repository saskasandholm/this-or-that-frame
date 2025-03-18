'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Share2, User } from 'lucide-react';
import HapticService from '@/services/HapticService';

interface DirectChallengeProps {
  topicId?: string;
  topicTitle?: string;
  userChoice?: 'A' | 'B';
  optionA?: string;
  optionB?: string;
  onClose?: () => void;
}

/**
 * Component for challenging friends directly with a specific topic
 */
const DirectChallenge: React.FC<DirectChallengeProps> = ({
  topicId,
  topicTitle,
  userChoice,
  optionA,
  optionB,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'copy' | 'share' | 'dm'>('copy');

  // Generate challenge URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://this-or-that.frame.app';
  const challengeUrl = `${baseUrl}?topicId=${topicId}&challenge=true&from=${userChoice}`;

  // Generate challenge message
  const challengeMessage =
    userChoice && optionA && optionB
      ? `I chose "${userChoice === 'A' ? optionA : optionB}" on the "${topicTitle}" question. I challenge you to make your choice! ${challengeUrl} #ThisOrThat`
      : `I challenge you to answer this This or That question: "${topicTitle}" ${challengeUrl} #ThisOrThat`;

  // Handle copying to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(challengeMessage);
      setCopied(true);
      HapticService.subtle();

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Handle sharing via Web Share API
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `This or That Challenge: ${topicTitle}`,
          text: challengeMessage,
          url: challengeUrl,
        });
        HapticService.medium();
      } else {
        // Fallback if Web Share API is not available
        handleCopy();
      }
    } catch (err) {
      console.error('Failed to share: ', err);
      // Fallback to copy
      handleCopy();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gray-900 border border-gray-800 rounded-lg w-full max-w-md p-5 shadow-xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Challenge a Friend</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white rounded-full p-1 hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 mb-4">
            Challenge your friends to answer this question and see if they agree with you!
          </p>

          <div className="bg-gray-800/50 rounded-lg p-4 text-sm mb-4">
            <p className="font-medium text-white mb-2">"{topicTitle}"</p>
            {userChoice && (
              <p className="text-gray-400">
                Your choice:{' '}
                <span className="text-purple-400 font-medium">
                  {userChoice === 'A' ? optionA : optionB}
                </span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => setSelectedOption('copy')}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-colors ${
                selectedOption === 'copy'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Copy size={18} className="mb-1" />
              <span className="text-xs">Copy</span>
            </button>
            <button
              onClick={() => setSelectedOption('share')}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-colors ${
                selectedOption === 'share'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Share2 size={18} className="mb-1" />
              <span className="text-xs">Share</span>
            </button>
            <button
              onClick={() => setSelectedOption('dm')}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-colors ${
                selectedOption === 'dm'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <User size={18} className="mb-1" />
              <span className="text-xs">Warpcast DM</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {selectedOption === 'copy' && (
            <div className="relative">
              <textarea
                readOnly
                value={challengeMessage}
                className="w-full h-24 p-3 text-sm bg-gray-800 rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                onClick={handleCopy}
                className={`absolute top-2 right-2 p-2 rounded-md ${
                  copied ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}

          {selectedOption === 'share' && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-medium text-white"
            >
              Share Challenge
            </motion.button>
          )}

          {selectedOption === 'dm' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                Open Warpcast to send this challenge directly to a friend
              </p>
              <a
                href={`https://warpcast.com/~/compose?text=${encodeURIComponent(challengeMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-medium text-white text-center"
              >
                Open Warpcast
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DirectChallenge;
