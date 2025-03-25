'use client';

import React from 'react';
import VotingInterface from './VotingInterface';
import { motion } from 'framer-motion';
import DidYouKnow from './DidYouKnow';
import DirectChallenge from './DirectChallenge';
import FriendsVotedContext from './FriendsVotedContext';
import { Card } from './ui/card';

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
 * A wrapper for VotingInterface that accepts the same props as ContextAwareTopicView
 */
const VotingInterfaceWrapper: React.FC<TopicViewProps> = ({
  topicId,
  topicTitle,
  optionA,
  optionB,
  imageA,
  imageB,
  results,
  userVote,
  isLoading,
  onVote,
  hasVoted,
  showDidYouKnow = false,
  showDirectChallenge = false,
  isRareOpinion = false,
  isHighlyContested = false,
  onTryAgain,
  error,
}) => {
  // Log props for debugging
  console.log('[VotingInterfaceWrapper] Props:', {
    topicId,
    hasVoted,
    userVote,
    isLoading,
    resultsAvailable: !!results,
    showDidYouKnow,
    showDirectChallenge
  });

  // Wrap onVote to add debugging
  const handleVote = (option: 'A' | 'B') => {
    console.log(`[VotingInterfaceWrapper] Voting for option ${option}`);
    onVote(option);
  };

  // Handle error state
  if (error) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
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
              <p>{error}</p>
            </div>
            {onTryAgain && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={onTryAgain}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Convert the data format for VotingInterface
  const topic = {
    id: topicId,
    title: topicTitle,
    optionA,
    optionB,
    imageA,
    imageB,
    votesA: results?.percentA ? Math.round((results.totalVotes * results.percentA) / 100) : 0,
    votesB: results?.percentB ? Math.round((results.totalVotes * results.percentB) / 100) : 0,
  };

  return (
    <div className="space-y-6">
      <VotingInterface
        topic={topic}
        onVote={handleVote}
        hasVoted={hasVoted}
        selectedOption={userVote as 'A' | 'B' | undefined}
        isLoading={isLoading}
      />

      {/* Friends Context when user has voted */}
      {(userVote === 'A' || userVote === 'B') && (
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
              choice: userVote as 'A' | 'B',
            },
          ]}
          userChoice={userVote as 'A' | 'B'}
          optionA={optionA}
          optionB={optionB}
          _topicTitle={topicTitle}
          _topicId={topicId}
          _userVote={userVote as 'A' | 'B'}
          _friendsAgreeing={2}
          _friendsDisagreeing={1}
          _totalFriendsVoted={3}
        />
      )}

      {/* Show "Did You Know" section if enabled */}
      {showDidYouKnow && (
        <DidYouKnow
          facts={['Did you know? These topics help us understand community preferences better.']}
        />
      )}

      {/* Show Challenge UI if enabled */}
      {showDirectChallenge && hasVoted && userVote && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 mt-6 text-center"
        >
          <h3 className="font-medium mb-2">Challenge your friends!</h3>
          <p className="text-sm mb-3">
            See if your friends agree with your choice of {userVote === 'A' ? optionA : optionB}
          </p>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            Challenge a Friend
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default VotingInterfaceWrapper;
