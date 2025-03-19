import React from 'react';

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
  return (
    <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
      <h3 className="text-lg font-semibold mb-2">{topic.title}</h3>
      <p className="text-sm text-muted-foreground">Votes A: {topic.votesA}</p>
      <p className="text-sm text-muted-foreground">Votes B: {topic.votesB}</p>
      <p className="text-sm text-muted-foreground">Winner: {topic.winner}</p>
    </div>
  );
};

export default PastTopicCard;
