'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from './animations/Confetti';
import AudioService from '../services/AudioService';
import HapticService from '../services/HapticService';

interface FirstVoteCelebrationProps {
  onComplete: () => void;
  choiceText: string;
  percentage: number;
}

/**
 * Component that celebrates a user's first vote with animations and introduces key features
 */
const FirstVoteCelebration: React.FC<FirstVoteCelebrationProps> = ({
  onComplete,
  choiceText,
  percentage,
}) => {
  const [step, setStep] = useState<'initial' | 'streaks' | 'sharing'>('initial');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Play celebratory sound when component mounts
    AudioService.play('tada');
    // Add celebration haptic feedback
    HapticService.heavy();
  }, []);

  const handleNext = () => {
    // Play audio feedback
    AudioService.play('pop');
    // Add haptic feedback for button press
    HapticService.light();

    if (step === 'initial') {
      setStep('streaks');
    } else if (step === 'streaks') {
      setStep('sharing');
    } else {
      // Exit celebration
      setIsVisible(false);
      // Add success haptic feedback on completion
      HapticService.heavy();
      setTimeout(() => {
        onComplete();
      }, 300);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Confetti active={true} />

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full mx-4 overflow-hidden shadow-xl"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <AnimatePresence mode="wait">
            {step === 'initial' && (
              <InitialStep
                key="initial"
                onNext={handleNext}
                choiceText={choiceText}
                percentage={percentage}
              />
            )}

            {step === 'streaks' && <StreaksStep key="streaks" onNext={handleNext} />}

            {step === 'sharing' && <SharingStep key="sharing" onNext={handleNext} />}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

interface StepProps {
  onNext: () => void;
}

interface InitialStepProps extends StepProps {
  choiceText: string;
  percentage: number;
}

const InitialStep: React.FC<InitialStepProps> = ({ onNext, choiceText, percentage }) => {
  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white text-2xl">🎉</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center mb-2">First Vote Cast!</h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
        You chose{' '}
        <span className="font-bold text-purple-600 dark:text-purple-300">{choiceText}</span>.
        {percentage > 50
          ? ` You're with the majority (${Math.round(percentage)}%)!`
          : ` That's a less common choice (${Math.round(percentage)}%)!`}
      </p>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800/50 mb-6 text-center">
        <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
          <span className="font-bold">You've joined the community!</span>
        </p>
        <p className="text-sm text-purple-700 dark:text-purple-300">
          Continue voting daily to build your streak and unlock achievements!
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
      >
        Next
      </button>
    </motion.div>
  );
};

const StreaksStep: React.FC<StepProps> = ({ onNext }) => {
  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-2xl">🔥</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center mb-2">Build Your Streak</h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
        Vote daily to maintain your streak and compete with friends.
      </p>

      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800/50 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-orange-800 dark:text-orange-300">
            Your Streak
          </span>
          <div className="flex items-center">
            <span className="text-2xl mr-1">🔥</span>
            <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">1</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map(day => (
            <div key={day} className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${day === 1 ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}
              >
                {day}
              </div>
              <span className="text-xs mt-1">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][day - 1]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-md mb-6">
        <div className="flex items-start">
          <div className="mr-2 mt-1">
            <svg
              className="h-5 w-5 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-orange-800 dark:text-orange-200">
            You'll receive notifications to keep your streak going. Vote every day to earn streak
            achievements!
          </p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
      >
        Next
      </button>
    </motion.div>
  );
};

const SharingStep: React.FC<StepProps> = ({ onNext }) => {
  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-2xl">🌟</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center mb-2">Challenge Your Friends</h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
        Share your opinions to see what your friends would choose.
      </p>

      <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800/50 mb-6">
        <div className="text-center mb-4">
          <p className="font-medium text-blue-800 dark:text-blue-300 mb-2">
            Share your results to:
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <svg
                className="h-5 w-5 text-green-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm">See if your friends agree with you</span>
            </div>
            <div className="flex items-center justify-center">
              <svg
                className="h-5 w-5 text-green-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm">Challenge them to vote on the same topic</span>
            </div>
            <div className="flex items-center justify-center">
              <svg
                className="h-5 w-5 text-green-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm">Spark interesting discussions</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-md w-48 text-center">
            <div className="font-medium mb-2">I chose Option A!</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">What would you pick? 🤔</div>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
      >
        Got it!
      </button>
    </motion.div>
  );
};

export default FirstVoteCelebration;
