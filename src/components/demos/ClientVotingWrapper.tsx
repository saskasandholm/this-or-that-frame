'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import VotingInterface from '@/components/VotingInterface';

export function ClientVotingWrapper() {
  const [demoTopicIndex, setDemoTopicIndex] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | undefined>(undefined);

  const demoTopics = [
    {
      id: 'demo-1',
      title: 'Bitcoin vs Ethereum',
      optionA: 'Bitcoin',
      optionB: 'Ethereum',
      imageA: 'https://images.unsplash.com/photo-1523759533935-e4b770303b1d?q=80&w=400',
      imageB: 'https://images.unsplash.com/photo-1622790610716-2e03517de961?q=80&w=400',
      votesA: 120,
      votesB: 85,
    },
    {
      id: 'demo-2',
      title: 'Mountains vs Beach',
      optionA: 'Mountains',
      optionB: 'Beach',
      imageA: 'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?q=80&w=400',
      imageB: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400',
      votesA: 95,
      votesB: 140,
    },
    {
      id: 'demo-3',
      title: 'Remote Work vs Office',
      optionA: 'Remote Work',
      optionB: 'Office',
      imageA: 'https://images.unsplash.com/photo-1591382696684-38c427c7547a?q=80&w=400',
      imageB: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?q=80&w=400',
      votesA: 175,
      votesB: 84,
    },
  ];

  const currentTopic = demoTopics[demoTopicIndex];

  const refreshTopic = () => {
    setDemoTopicIndex(prev => (prev + 1) % demoTopics.length);
    setHasVoted(false);
    setSelectedOption(undefined);
  };

  const handleVote = (option: 'A' | 'B') => {
    setSelectedOption(option);
    setHasVoted(true);
    console.log(
      `Voted for ${option}: ${option === 'A' ? currentTopic.optionA : currentTopic.optionB}`
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{currentTopic.title}</h2>
        <Button variant="outline" size="sm" className="flex items-center" onClick={refreshTopic}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Another Topic
        </Button>
      </div>

      <VotingInterface
        topic={currentTopic}
        onVote={handleVote}
        hasVoted={hasVoted}
        selectedOption={selectedOption}
      />
    </div>
  );
}
