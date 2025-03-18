'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Friend {
  fid: string;
  username: string;
  avatar?: string;
  choice: 'A' | 'B';
}

interface FriendsVotedContextProps {
  _topicId: string;
  _topicTitle: string;
  _userVote: 'A' | 'B';
  _friendsAgreeing: number;
  _friendsDisagreeing: number;
  _totalFriendsVoted: number;
  friends?: Friend[];
  userChoice?: 'A' | 'B';
  optionA: string;
  optionB: string;
}

/**
 * Component that displays how the user's friends voted on the same topic
 */
const FriendsVotedContext: React.FC<FriendsVotedContextProps> = ({
  friends = [],
  userChoice,
  optionA,
  optionB,
  _topicId,
  _topicTitle,
  _userVote,
  _friendsAgreeing,
  _friendsDisagreeing,
  _totalFriendsVoted,
}) => {
  if (!friends || friends.length === 0) return null;

  // Categorize friends based on their choices
  const friendsWhoAgree = friends.filter(friend => friend.choice === userChoice);
  const friendsWhoDisagree = friends.filter(friend => friend.choice !== userChoice);

  // Get the percentages
  const percentAgree = Math.round((friendsWhoAgree.length / friends.length) * 100) || 0;
  const percentDisagree = 100 - percentAgree;

  // Generate the message based on friend votes
  let message = '';
  if (friends.length === 1) {
    const onlyFriend = friends[0];
    message =
      onlyFriend.choice === userChoice
        ? `${onlyFriend.username} agrees with you!`
        : `${onlyFriend.username} chose differently than you.`;
  } else if (friendsWhoAgree.length === 0) {
    message = 'None of your friends agree with your choice!';
  } else if (friendsWhoDisagree.length === 0) {
    message = 'All of your friends agree with your choice!';
  } else if (percentAgree >= 70) {
    message = 'Most of your friends agree with you!';
  } else if (percentAgree <= 30) {
    message = 'Most of your friends disagree with you!';
  } else {
    message = 'Your friends are divided on this topic!';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6 p-4 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-sm rounded-lg border border-blue-800/50 shadow-lg"
    >
      <h3 className="text-sm font-semibold text-blue-300 mb-3">Friends Who Voted</h3>

      <div className="mb-3">
        <p className="text-gray-300 text-sm mb-2">{message}</p>

        {userChoice && friends.length > 1 && (
          <div className="bg-gray-900/50 rounded-lg p-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Agree with you ({percentAgree}%)</span>
              <span>Disagree ({percentDisagree}%)</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                style={{ width: `${percentAgree}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {friends.map(friend => (
          <div
            key={friend.fid}
            className={`flex items-center p-1 pr-3 rounded-full ${
              friend.choice === userChoice
                ? 'bg-green-900/30 border border-green-800/50'
                : 'bg-orange-900/30 border border-orange-800/50'
            }`}
          >
            <div className="relative w-6 h-6 rounded-full overflow-hidden mr-2">
              <Image
                src={friend.avatar || '/images/default-avatar.png'}
                alt={friend.username}
                fill
                sizes="24px"
                className="object-cover"
              />
            </div>
            <span className="text-xs font-medium text-gray-200">{friend.username}</span>
            <span className="ml-1 text-xs opacity-70">
              ({friend.choice === 'A' ? optionA : optionB})
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default FriendsVotedContext;
