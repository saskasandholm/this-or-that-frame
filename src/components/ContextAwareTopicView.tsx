'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useFrameContext } from '../lib/ContextProvider';
import LoadingResults from './LoadingResults';
import Confetti from './animations/Confetti';
import AudioService from '../services/AudioService';
import HapticService from '../services/HapticService';
import { useFrameDiscovery } from '../lib/FrameDiscoveryHelper';
import FrameSavePrompt from './FrameSavePrompt';
import Image from 'next/image';
import DidYouKnow from './DidYouKnow';
import DirectChallenge from './DirectChallenge';
import FriendsVotedContext from './FriendsVotedContext';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

// Add the correct type from FrameDiscoveryHelper
interface FrameDiscoveryState {
  shouldShowPrompt: boolean;
  interactionCount: number;
  trackInteraction: (type: string) => void;
  markPromptAsShown: () => void;
  saveFrame: () => Promise<boolean>;
}

interface TopicViewProps {
  topicId: string;
  topicTitle: string;
  optionA: string;
  optionB: string;
  imageA?: string;
  imageB?: string;
  results?: {
    totalVotes: number;
    percentA: number;
    percentB: number;
  };
  userVote?: 'A' | 'B' | null;
  isLoading?: boolean;
  onVote: (option: 'A' | 'B') => void;
  hasVoted: boolean;
  showDidYouKnow?: boolean;
  showDirectChallenge?: boolean;
  isRareOpinion?: boolean;
  isHighlyContested?: boolean;
  onTryAgain?: () => void;
  error?: string | null;
}

/**
 * A context-aware component that renders different views based on the frame launch context
 */
const ContextAwareTopicView: React.FC<TopicViewProps> = props => {
  const {
    launchSource,
    streakReminder,
    missedDays,
    achievementUnlocked,
    votedOptionId,
    friendVotes,
  } = useFrameContext();

  const {
    shouldShowPrompt,
    trackInteraction,
    markPromptAsShown,
    saveFrame: _saveFrame,
  } = useFrameDiscovery() as FrameDiscoveryState;

  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Track initial view
  useEffect(() => {
    trackInteraction('view_topic');
  }, [trackInteraction]);

  useEffect(() => {
    // Play different sounds based on context
    if (streakReminder) {
      AudioService.play('whoosh');
    } else if (achievementUnlocked) {
      AudioService.play('tada');
    }
  }, [streakReminder, achievementUnlocked]);

  // Show save prompt at appropriate times
  useEffect(() => {
    if (shouldShowPrompt && props.userVote && !props.isLoading) {
      setShowSavePrompt(true);
      if (markPromptAsShown) {
        markPromptAsShown();
      }
    }
  }, [shouldShowPrompt, props.userVote, props.isLoading, markPromptAsShown]);

  // Handle showing confetti when results are received
  useEffect(() => {
    if (props.results && !showConfetti && props.userVote) {
      setShowConfetti(true);
      try {
        AudioService.play('success');
        HapticService.medium();
      } catch (error) {
        console.error('Error playing effects:', error);
      }

      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [props.results, props.userVote, showConfetti]);

  // Set hasVoted if userVote is provided
  useEffect(() => {
    if (props.userVote) {
      props.hasVoted = true;
    }
  }, [props.userVote]);

  // Render loading state
  if (props.isLoading) {
    return <LoadingResults message="Processing your vote..." />;
  }

  // Display the streak reminder if launched from a streak notification
  if (streakReminder && missedDays > 0) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-lg shadow-xl text-white text-center mb-6"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [-2, 2, -2],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
            }}
            className="text-4xl mb-2"
          >
            🔥
          </motion.div>

          <h2 className="text-2xl font-bold mb-2">Don't Break Your Streak!</h2>

          <div className="mb-4 bg-white/10 p-3 rounded-lg">
            {missedDays === 1 ? (
              <div className="text-xl font-medium">Today's vote is waiting for you!</div>
            ) : (
              <div className="text-xl font-medium">
                You've missed <span className="text-yellow-300 font-bold">{missedDays} days</span>{' '}
                of voting
              </div>
            )}
          </div>

          <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-yellow-300 to-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="bg-white/20 p-2 rounded">
              <span className="block text-lg font-bold">🏆</span>
              Keep your ranking
            </div>
            <div className="bg-white/20 p-2 rounded">
              <span className="block text-lg font-bold">🎯</span>
              Unlock achievements
            </div>
          </div>

          <p className="text-sm opacity-80">Vote now to maintain your streak!</p>
        </motion.div>

        <StandardTopicView
          topicId={props.topicId}
          topicTitle={props.topicTitle}
          optionA={props.optionA}
          optionB={props.optionB}
          imageA={props.imageA}
          imageB={props.imageB}
          results={props.results}
          userVote={props.userVote}
          onVote={props.onVote}
          highlightCTA={true}
          hasVoted={props.hasVoted}
        />
      </div>
    );
  }

  // Show achievement notification if launched from an achievement notification
  if (achievementUnlocked) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <Confetti active={true} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-lg shadow-xl text-white text-center mb-6"
        >
          <h2 className="text-2xl font-bold mb-2">Achievement Unlocked! 🏆</h2>
          <p className="mb-4">You've earned a new badge!</p>
          <div className="mb-4">
            {/* The badge would be loaded based on achievementUnlocked ID */}
            <div className="w-24 h-24 rounded-full bg-white/20 mx-auto flex items-center justify-center">
              <span className="text-3xl">🏆</span>
            </div>
          </div>
          <p className="text-sm opacity-80">Keep voting to earn more achievements!</p>
        </motion.div>

        <StandardTopicView
          topicId={props.topicId}
          topicTitle={props.topicTitle}
          optionA={props.optionA}
          optionB={props.optionB}
          imageA={props.imageA}
          imageB={props.imageB}
          results={props.results}
          userVote={props.userVote}
          onVote={props.onVote}
          hasVoted={props.hasVoted}
        />
      </div>
    );
  }

  // Display a friend challenge view if launched from a share with votedOptionId
  if (launchSource === 'embed' && votedOptionId) {
    const friendChoice = votedOptionId === 'A' ? props.optionA : props.optionB;
    const friendImage = votedOptionId === 'A' ? props.imageA : props.imageB;

    return (
      <div className="p-6 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-lg shadow-xl text-white text-center mb-6"
        >
          <h2 className="text-2xl font-bold mb-2">Challenge!</h2>
          <p className="mb-4">Your friend chose:</p>
          <div className="mb-4 relative">
            <img
              src={friendImage}
              alt={friendChoice}
              className="w-32 h-32 object-cover rounded-lg mx-auto border-4 border-white/30"
            />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-bold">
              {friendChoice}
            </div>
          </div>
          <p className="text-sm opacity-80">What will you choose?</p>
        </motion.div>

        <StandardTopicView
          topicId={props.topicId}
          topicTitle={props.topicTitle}
          optionA={props.optionA}
          optionB={props.optionB}
          imageA={props.imageA}
          imageB={props.imageB}
          results={props.results}
          userVote={props.userVote}
          onVote={props.onVote}
          highlightCTA={true}
          hasVoted={props.hasVoted}
        />
      </div>
    );
  }

  // Show friend votes if available
  if (launchSource === 'embed' && friendVotes && friendVotes.length > 0) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-6 rounded-lg shadow-xl text-white text-center mb-6"
        >
          <h2 className="text-2xl font-bold mb-2">Your Friends Voted</h2>
          <div className="flex justify-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {friendVotes.filter(v => v.choice === 'A').length}
              </div>
              <div className="text-sm">chose {props.optionA}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {friendVotes.filter(v => v.choice === 'B').length}
              </div>
              <div className="text-sm">chose {props.optionB}</div>
            </div>
          </div>
          <p className="text-sm opacity-80">What's your choice?</p>
        </motion.div>

        <StandardTopicView
          topicId={props.topicId}
          topicTitle={props.topicTitle}
          optionA={props.optionA}
          optionB={props.optionB}
          imageA={props.imageA}
          imageB={props.imageB}
          results={props.results}
          userVote={props.userVote}
          onVote={props.onVote}
          hasVoted={props.hasVoted}
        />
      </div>
    );
  }

  // Show save prompt if needed
  if (showSavePrompt) {
    return <FrameSavePrompt topicId={props.topicId} topicTitle={props.topicTitle} />;
  }

  // Render error message when error occurs
  if (props.error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error occurred</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>{props.error}</p>
            </div>
            {props.onTryAgain && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={props.onTryAgain}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default standard view for all other cases
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {showConfetti && <Confetti active={true} />}

      <div className="p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{props.topicTitle}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          ID: {props.topicId} • {launchSource === 'global' ? 'Viewing in Frame' : 'Viewing on Web'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option A */}
          <div
            className={`relative rounded-lg overflow-hidden border-2 ${props.userVote === 'A' ? 'border-blue-500' : 'border-transparent'}`}
          >
            {props.imageA && (
              <div className="relative h-48 w-full">
                <OptimizedImage
                  src={props.imageA}
                  alt={props.optionA}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold">{props.optionA}</h3>
              {props.results && (
                <div className="mt-2">
                  <div className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-blue-500 h-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${props.results.percentA}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <p className="text-sm mt-1 font-medium">{props.results.percentA}%</p>
                </div>
              )}
              {!props.hasVoted && (
                <button
                  onClick={() => props.onVote('A')}
                  className="mt-4 w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                >
                  Vote {props.optionA}
                </button>
              )}
            </div>
          </div>

          {/* Option B */}
          <div
            className={`relative rounded-lg overflow-hidden border-2 ${props.userVote === 'B' ? 'border-blue-500' : 'border-transparent'}`}
          >
            {props.imageB && (
              <div className="relative h-48 w-full">
                <OptimizedImage
                  src={props.imageB}
                  alt={props.optionB}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold">{props.optionB}</h3>
              {props.results && (
                <div className="mt-2">
                  <div className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-red-500 h-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${props.results.percentB}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <p className="text-sm mt-1 font-medium">{props.results.percentB}%</p>
                </div>
              )}
              {!props.hasVoted && (
                <button
                  onClick={() => props.onVote('B')}
                  className="mt-4 w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                >
                  Vote {props.optionB}
                </button>
              )}
            </div>
          </div>
        </div>

        {props.results && (
          <div className="mt-6 text-center">
            <p className="text-lg">{props.results.totalVotes} total votes</p>
          </div>
        )}

        {/* Friends context - using sample data for demo, in a real app this would come from backend */}
        {(props.userVote === 'A' || props.userVote === 'B') && (
          <FriendsVotedContext
            friends={[
              {
                fid: '1',
                username: 'alice',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
                choice: 'A',
              },
              {
                fid: '2',
                username: 'bob',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
                choice: 'B',
              },
              {
                fid: '3',
                username: 'charlie',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
                choice: props.userVote as 'A' | 'B',
              },
            ]}
            userChoice={props.userVote as 'A' | 'B'}
            optionA={props.optionA}
            optionB={props.optionB}
            _topicTitle={props.topicTitle}
            _topicId={props.topicId || ''}
            _userVote={props.userVote as 'A' | 'B'}
            _friendsAgreeing={2}
            _friendsDisagreeing={1}
            _totalFriendsVoted={3}
          />
        )}

        <DidYouKnow
          facts={['Did you know? These topics help us understand community preferences better.']}
          className="mt-6"
        />
      </div>
    </div>
  );
};

// Standard topic view component
interface StandardTopicViewProps extends Omit<TopicViewProps, 'topicId'> {
  topicId?: string;
  highlightCTA?: boolean;
}

const StandardTopicView: React.FC<StandardTopicViewProps> = ({
  topicId,
  topicTitle,
  optionA,
  optionB,
  imageA,
  imageB,
  results,
  userVote,
  onVote,
  highlightCTA = false,
  hasVoted,
}) => {
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const {
    shouldShowPrompt,
    trackInteraction,
    markPromptAsShown,
    saveFrame: _saveFrame,
  } = useFrameDiscovery() as FrameDiscoveryState;

  // Log topicId when available for debugging purposes
  useEffect(() => {
    if (topicId) {
      console.debug(`Rendering topic view for ${topicId}`);
    }
  }, [topicId]);

  // Track interactions with the results
  useEffect(() => {
    if (results && userVote) {
      trackInteraction('view_results');
    }
  }, [results, userVote, trackInteraction]);

  // Show save prompt at appropriate times
  useEffect(() => {
    if (shouldShowPrompt && userVote && results) {
      // Show prompt after results are displayed
      const timer = setTimeout(() => {
        setShowSavePrompt(true);
        markPromptAsShown();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [shouldShowPrompt, userVote, results, markPromptAsShown]);

  // Track voting interactions
  const handleVote = (option: 'A' | 'B') => {
    HapticService.medium();
    trackInteraction('vote');
    onVote(option);
  };

  // Handle saving the frame
  const handleSaveFrame = async () => {
    try {
      HapticService.light();
      trackInteraction('save_frame_button');
      const success = await _saveFrame();
      if (success) {
        setShowSavePrompt(false);
      }
    } catch (error) {
      console.error('Error saving frame:', error);
    }
  };

  // Show the challenge modal
  const handleShowChallenge = () => {
    HapticService.light();
    trackInteraction('challenge_friend');
    setShowChallengeModal(true);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-center mb-6">{topicTitle}</h2>

      {userVote !== null && results !== undefined ? (
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <ResultOption
              option={optionA}
              image={imageA}
              percentage={results.percentA}
              isSelected={userVote === 'A'}
            />
            <ResultOption
              option={optionB}
              image={imageB}
              percentage={results.percentB}
              isSelected={userVote === 'B'}
            />
          </div>
          <div className="text-center text-gray-600 dark:text-gray-400 mb-4">
            Total votes: {results.totalVotes}
          </div>

          <div className="mt-6 flex flex-col space-y-3">
            {/* Challenge Friends button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={handleShowChallenge}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg font-medium shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>🏆</span>
              <span>Challenge a Friend</span>
            </motion.button>

            {/* Save Frame button */}
            {!showSavePrompt && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                onClick={handleSaveFrame}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2 animate-pulse"
              >
                <span>🔖</span>
                <span>Save This Frame</span>
              </motion.button>
            )}
          </div>

          {showSavePrompt && (
            <FrameSavePrompt
              variant="inline"
              onClose={() => setShowSavePrompt(false)}
              className="mt-6"
            />
          )}

          {/* DirectChallenge modal */}
          {showChallengeModal && (
            <DirectChallenge
              topicId={topicId}
              topicTitle={topicTitle}
              userChoice={userVote}
              optionA={optionA}
              optionB={optionB}
              onClose={() => setShowChallengeModal(false)}
            />
          )}
        </div>
      ) : (
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-6">
            <VoteOption
              option={optionA}
              image={imageA}
              onSelect={() => handleVote('A')}
              highlight={highlightCTA}
            />
            <VoteOption
              option={optionB}
              image={imageB}
              onSelect={() => handleVote('B')}
              highlight={highlightCTA}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Component for showing a vote option
interface VoteOptionProps {
  option: string;
  image?: string;
  onSelect: () => void;
  highlight?: boolean;
}

const VoteOption: React.FC<VoteOptionProps> = ({
  option,
  image = '/images/placeholder-a.png',
  onSelect,
  highlight = false,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      className={`flex flex-col items-center ${highlight ? 'animate-pulse' : ''}`}
    >
      <div className="relative w-full pb-[100%] mb-2">
        <Image
          src={image}
          alt={option}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          priority
          className={`object-cover rounded-lg ${
            highlight ? 'ring-4 ring-purple-500 ring-opacity-75' : ''
          }`}
          style={{ objectFit: 'cover' }}
        />
      </div>
      <span className="font-medium text-center">{option}</span>
    </motion.button>
  );
};

// Component for showing a result option
interface ResultOptionProps {
  option: string;
  image?: string;
  percentage: number;
  isSelected: boolean;
}

const ResultOption: React.FC<ResultOptionProps> = ({
  option,
  image = '/images/placeholder-a.png',
  percentage,
  isSelected,
}) => {
  return (
    <div className={`flex flex-col items-center ${isSelected ? 'scale-105' : ''}`}>
      <div className="relative w-full pb-[100%] mb-2">
        <Image
          src={image}
          alt={option}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          className={`object-cover rounded-lg ${
            isSelected ? 'ring-4 ring-green-500 ring-opacity-75' : 'opacity-70'
          }`}
          style={{ objectFit: 'cover' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-white drop-shadow-lg">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <span className={`font-medium text-center ${isSelected ? 'font-bold' : ''}`}>{option}</span>
    </div>
  );
};

export default ContextAwareTopicView;
