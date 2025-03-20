import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';

interface PastTopicCardProps {
  topic: {
    id: string;
    title: string;
    votesA: number;
    votesB: number;
    percentage: number;
    winner: string;
  };
}

const PastTopicCard: React.FC<PastTopicCardProps> = ({ topic }) => {
  // Extract option names from the title (assumes format like "Option A vs Option B")
  const titleParts = topic.title.split(' vs ');
  const optionA = titleParts[0];
  const optionB = titleParts.length > 1 ? titleParts[1] : 'Option B';
  
  // Calculate percentages
  const totalVotes = topic.votesA + topic.votesB;
  const percentA = Math.round((topic.votesA / totalVotes) * 100);
  const percentB = Math.round((topic.votesB / totalVotes) * 100);
  
  // Determine which side won
  const isWinnerA = topic.winner === optionA;
  const isWinnerB = topic.winner === optionB;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      <h3 className="text-lg font-semibold p-4 border-b">{topic.title}</h3>
      
      <div className="grid grid-cols-2 divide-x">
        {/* Option A */}
        <div className={`p-4 ${isWinnerA ? 'bg-primary/5' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{optionA}</span>
            {isWinnerA && (
              <div className="flex items-center text-primary text-sm">
                <Trophy className="w-4 h-4 mr-1" />
                <span>Winner</span>
              </div>
            )}
          </div>
          <div className="text-2xl font-bold mb-1">{topic.votesA.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Votes A</div>
        </div>
        
        {/* Option B */}
        <div className={`p-4 ${isWinnerB ? 'bg-primary/5' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{optionB}</span>
            {isWinnerB && (
              <div className="flex items-center text-primary text-sm">
                <Trophy className="w-4 h-4 mr-1" />
                <span>Winner</span>
              </div>
            )}
          </div>
          <div className="text-2xl font-bold mb-1">{topic.votesB.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Votes B</div>
        </div>
      </div>
      
      {/* Progress bar showing relative vote distribution */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{percentA}%</span>
          <span>{percentB}%</span>
        </div>
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentA}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-blue-500 h-full"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentB}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-purple-500 h-full"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PastTopicCard;
