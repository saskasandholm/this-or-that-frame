'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap, Calendar, Target, Award, Star, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  total: number;
  category: 'streak' | 'voting' | 'exploration' | 'social';
}

export function AchievementsDemoClient() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'streak-3',
      name: 'Consistent Voter',
      description: 'Voted 3 days in a row',
      icon: <Calendar className="h-6 w-6 text-purple-500" />,
      unlocked: true,
      progress: 3,
      total: 3,
      category: 'streak',
    },
    {
      id: 'streak-7',
      name: 'Week Warrior',
      description: 'Voted 7 days in a row',
      icon: <Target className="h-6 w-6 text-purple-600" />,
      unlocked: false,
      progress: 3,
      total: 7,
      category: 'streak',
    },
    {
      id: 'streak-30',
      name: 'Monthly Maestro',
      description: 'Voted 30 days in a row',
      icon: <Trophy className="h-6 w-6 text-purple-700" />,
      unlocked: false,
      progress: 3,
      total: 30,
      category: 'streak',
    },
    {
      id: 'votes-10',
      name: 'Getting Started',
      description: 'Voted 10 times',
      icon: <Zap className="h-6 w-6 text-blue-500" />,
      unlocked: true,
      progress: 10,
      total: 10,
      category: 'voting',
    },
    {
      id: 'votes-50',
      name: 'Regular Contributor',
      description: 'Voted 50 times',
      icon: <Zap className="h-6 w-6 text-blue-600" />,
      unlocked: false,
      progress: 23,
      total: 50,
      category: 'voting',
    },
    {
      id: 'votes-100',
      name: 'Voting Veteran',
      description: 'Voted 100 times',
      icon: <Award className="h-6 w-6 text-blue-700" />,
      unlocked: false,
      progress: 23,
      total: 100,
      category: 'voting',
    },
    {
      id: 'categories-3',
      name: 'Diverse Opinions',
      description: 'Voted in 3 different categories',
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      unlocked: true,
      progress: 3,
      total: 3,
      category: 'exploration',
    },
    {
      id: 'categories-5',
      name: 'Topic Explorer',
      description: 'Voted in 5 different categories',
      icon: <Star className="h-6 w-6 text-yellow-600" />,
      unlocked: false,
      progress: 3,
      total: 5,
      category: 'exploration',
    },
    {
      id: 'shared-1',
      name: 'Social Sharer',
      description: 'Shared your first result',
      icon: <ThumbsUp className="h-6 w-6 text-green-500" />,
      unlocked: false,
      progress: 0,
      total: 1,
      category: 'social',
    },
  ]);

  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);

  // Simulate voting to progress achievements
  const handleVote = () => {
    const updatedAchievements = achievements.map(achievement => {
      // Update progress for all non-unlocked achievements
      if (!achievement.unlocked) {
        let newProgress = achievement.progress;

        // Increment progress based on category
        if (achievement.category === 'voting') {
          newProgress += 1;
        } else if (achievement.category === 'streak' && achievement.id === 'streak-7') {
          newProgress = Math.min(achievement.total, newProgress + 1);
        }

        // Check if achievement should be unlocked
        const shouldUnlock = newProgress >= achievement.total;

        if (shouldUnlock && !achievement.unlocked) {
          // Set this achievement for the unlock animation
          setUnlockedAchievement({ ...achievement, progress: newProgress, unlocked: true });
          setShowUnlockAnimation(true);

          // Hide the animation after a delay
          setTimeout(() => {
            setShowUnlockAnimation(false);
          }, 3000);
        }

        return {
          ...achievement,
          progress: newProgress,
          unlocked: shouldUnlock,
        };
      }
      return achievement;
    });

    setAchievements(updatedAchievements);
  };

  // Simulate sharing to unlock social achievement
  const handleShare = () => {
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.id === 'shared-1') {
        // Set this achievement for the unlock animation
        setUnlockedAchievement({ ...achievement, progress: 1, unlocked: true });
        setShowUnlockAnimation(true);

        // Hide the animation after a delay
        setTimeout(() => {
          setShowUnlockAnimation(false);
        }, 3000);

        return {
          ...achievement,
          progress: 1,
          unlocked: true,
        };
      }
      return achievement;
    });

    setAchievements(updatedAchievements);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-center gap-4 mb-8">
        <Button onClick={handleVote} className="px-6">
          Simulate Voting
        </Button>
        <Button onClick={handleShare} variant="outline">
          Simulate Sharing
        </Button>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-purple-500" />
            Streak Achievements
          </h3>

          {achievements
            .filter(a => a.category === 'streak')
            .map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Zap className="mr-2 h-5 w-5 text-blue-500" />
            Voting Achievements
          </h3>

          {achievements
            .filter(a => a.category === 'voting')
            .map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Star className="mr-2 h-5 w-5 text-yellow-500" />
            Exploration Achievements
          </h3>

          {achievements
            .filter(a => a.category === 'exploration')
            .map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <ThumbsUp className="mr-2 h-5 w-5 text-green-500" />
            Social Achievements
          </h3>

          {achievements
            .filter(a => a.category === 'social')
            .map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
        </div>
      </div>

      {/* Achievement unlock animation */}
      {showUnlockAnimation && unlockedAchievement && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/60"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.05, 1] }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-lg shadow-xl max-w-md text-center border border-primary/20"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mb-4 size-16 bg-slate-700/50 rounded-full flex items-center justify-center"
            >
              {unlockedAchievement.icon}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Badge className="bg-primary mb-2 py-1 px-3">Achievement Unlocked!</Badge>
              <h3 className="text-xl font-bold text-white mb-2">{unlockedAchievement.name}</h3>
              <p className="text-slate-300">{unlockedAchievement.description}</p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        achievement.unlocked
          ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-primary/30'
          : 'bg-slate-900/30 border-slate-700/30'
      } transition-all duration-200 hover:border-primary/50`}
    >
      <div className="flex items-center mb-2">
        <div
          className={`size-12 rounded-full ${achievement.unlocked ? 'bg-primary/20' : 'bg-slate-800'} flex items-center justify-center mr-3`}
        >
          {achievement.icon}
        </div>
        <div className="flex-1">
          <h3
            className={`font-medium ${achievement.unlocked ? 'text-primary-foreground' : 'text-muted-foreground'}`}
          >
            {achievement.name}
          </h3>
          <p className="text-sm text-muted-foreground">{achievement.description}</p>
        </div>
        {achievement.unlocked && <Badge className="bg-primary ml-2">Unlocked</Badge>}
      </div>
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">
            Progress: {achievement.progress}/{achievement.total}
          </span>
          <span className="text-muted-foreground">
            {Math.round((achievement.progress / achievement.total) * 100)}%
          </span>
        </div>
        <Progress
          value={(achievement.progress / achievement.total) * 100}
          className={`h-1.5 ${achievement.unlocked ? 'bg-primary/30' : 'bg-slate-800'}`}
        />
      </div>
    </div>
  );
}
