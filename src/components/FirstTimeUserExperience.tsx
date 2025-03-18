'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFrameContext } from '../lib/ContextProvider';
import AudioService from '../services/AudioService';
import HapticService from '../services/HapticService';

interface FirstTimeUserExperienceProps {
  onComplete: () => void;
  showSteps?: ('welcome' | 'voting' | 'streaks' | 'achievements')[];
}

/**
 * First-Time User Experience component that guides new users through the app features
 */
const FirstTimeUserExperience: React.FC<FirstTimeUserExperienceProps> = ({
  onComplete,
  showSteps = ['welcome', 'voting', 'streaks', 'achievements'],
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { isReady } = useFrameContext();

  useEffect(() => {
    if (isReady) {
      // Play welcome sound when component appears
      AudioService.play('pop');
      // Add subtle haptic feedback on component mount
      HapticService.medium();
    }
  }, [isReady]);

  const handleNext = () => {
    // Play audio feedback
    AudioService.play('pop');
    // Add haptic feedback for button press
    HapticService.light();

    if (currentStep < showSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Exit the FTUE
      setIsVisible(false);
      // Add success haptic feedback on completion
      HapticService.heavy();
      setTimeout(() => {
        onComplete();
      }, 300);
    }
  };

  const renderStepContent = () => {
    const step = showSteps[currentStep];

    switch (step) {
      case 'welcome':
        return (
          <WelcomeStep onNext={handleNext} isLastStep={currentStep === showSteps.length - 1} />
        );

      case 'voting':
        return <VotingStep onNext={handleNext} isLastStep={currentStep === showSteps.length - 1} />;

      case 'streaks':
        return (
          <StreaksStep onNext={handleNext} isLastStep={currentStep === showSteps.length - 1} />
        );

      case 'achievements':
        return (
          <AchievementsStep onNext={handleNext} isLastStep={currentStep === showSteps.length - 1} />
        );

      default:
        return null;
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
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full mx-4 overflow-hidden shadow-xl"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {renderStepContent()}

          {/* Steps indicator */}
          <div className="flex justify-center gap-1.5 pb-4">
            {showSteps.map((_, index) => (
              <motion.div
                key={index}
                className={`h-1.5 rounded-full ${index === currentStep ? 'bg-purple-500 w-6' : 'bg-gray-300 dark:bg-gray-600 w-2'}`}
                initial={false}
                animate={{ width: index === currentStep ? 24 : 8 }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

interface StepProps {
  onNext: () => void;
  isLastStep: boolean;
}

const WelcomeStep: React.FC<StepProps> = ({ onNext, isLastStep }) => {
  return (
    <div className="p-6">
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white text-2xl">👋</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center mb-2">Welcome to This or That!</h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
        The daily choice game that reveals what the Farcaster community really thinks.
      </p>
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-sm">Vote on fun and thought-provoking topics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <p className="text-sm">See how your opinion compares with others</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm">Build streaks and unlock achievements</p>
        </div>
      </div>
      <button
        onClick={onNext}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
      >
        {isLastStep ? "Let's Start!" : 'Next'}
      </button>
    </div>
  );
};

const VotingStep: React.FC<StepProps> = ({ onNext, isLastStep }) => {
  return (
    <div className="p-6">
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-2xl">🗳️</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center mb-2">Quick & Easy Voting</h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
        Each day, you'll get a new "This or That" choice to vote on.
      </p>

      <div className="relative mb-8 mt-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="relative bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-700/40 p-3 rounded-lg border-2 border-blue-300 dark:border-blue-700 flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full mb-2"></div>
            <span className="font-medium">Option A</span>
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-700/40 p-3 rounded-lg border-2 border-dashed border-green-300 dark:border-green-700 flex flex-col items-center">
            <div className="w-12 h-12 bg-green-500 rounded-full mb-2"></div>
            <span className="font-medium">Option B</span>
            <div className="absolute -top-2 -right-2 bg-green-500 text-white h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Option A</span>
            <span className="text-sm font-medium">67%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[67%]"></div>
          </div>

          <div className="flex justify-between mb-2 mt-3">
            <span className="text-sm font-medium">Option B</span>
            <span className="text-sm font-medium">33%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-[33%]"></div>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[60%] text-white text-4xl transform -rotate-12">
          <span className="drop-shadow-lg">→</span>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
      >
        {isLastStep ? "Let's Start!" : 'Next'}
      </button>
    </div>
  );
};

const StreaksStep: React.FC<StepProps> = ({ onNext, isLastStep }) => {
  return (
    <div className="p-6">
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-2xl">🔥</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center mb-2">Build Your Streak</h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
        Vote daily to build your streak and compete with friends.
      </p>

      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800/50 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-orange-800 dark:text-orange-300">
            Your Streak
          </span>
          <div className="flex items-center">
            <span className="text-2xl mr-1">🔥</span>
            <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">7</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {[1, 2, 3, 4, 5, 6, 7].map(day => (
            <div key={day} className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${day <= 7 ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}
              >
                {day}
              </div>
              <span className="text-xs mt-1">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][day - 1]}</span>
            </div>
          ))}
        </div>

        <div className="text-sm text-orange-700 dark:text-orange-300">
          <p className="flex items-center">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Vote every day to keep your streak alive!
          </p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
      >
        {isLastStep ? "Let's Start!" : 'Next'}
      </button>
    </div>
  );
};

const AchievementsStep: React.FC<StepProps> = ({ onNext, isLastStep }) => {
  return (
    <div className="p-6">
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
          <span className="text-white text-2xl">🏆</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center mb-2">Earn Achievements</h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
        Unlock special badges as you participate and reach milestones.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800/50 flex flex-col items-center">
          <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-2">
            <span className="text-white text-xl">🔥</span>
          </div>
          <span className="font-medium text-sm">7-Day Streak</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Vote 7 days in a row</span>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700/50 flex flex-col items-center opacity-70">
          <div className="h-12 w-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mb-2">
            <span className="text-white text-xl">🎯</span>
          </div>
          <span className="font-medium text-sm">Trendsetter</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Vote early on trending topics
          </span>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700/50 flex flex-col items-center opacity-70">
          <div className="h-12 w-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mb-2">
            <span className="text-white text-xl">🗣️</span>
          </div>
          <span className="font-medium text-sm">Rare Opinion</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Vote against the majority
          </span>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700/50 flex flex-col items-center opacity-70">
          <div className="h-12 w-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mb-2">
            <span className="text-white text-xl">🏅</span>
          </div>
          <span className="font-medium text-sm">Vote Master</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Cast 50+ votes</span>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
      >
        {isLastStep ? "Let's Start!" : 'Next'}
      </button>
    </div>
  );
};

export default FirstTimeUserExperience;
