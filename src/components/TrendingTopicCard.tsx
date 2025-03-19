import React from 'react';

interface TrendingTopicCardProps {
  topic: {
    id: string;
    title: string;
    totalVotes: number;
    category: string;
    trend: string;
  };
  rank: number;
}

const TrendingTopicCard: React.FC<TrendingTopicCardProps> = ({ topic, rank }) => {
  return (
    <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
      <h3 className="text-lg font-semibold mb-2">
        {rank}. {topic.title}
      </h3>
      <p className="text-sm text-muted-foreground">Votes: {topic.totalVotes}</p>
      <p className="text-sm text-muted-foreground">Category: {topic.category}</p>
      <p className="text-sm text-muted-foreground">Trend: {topic.trend}</p>
    </div>
  );
};

export default TrendingTopicCard;
