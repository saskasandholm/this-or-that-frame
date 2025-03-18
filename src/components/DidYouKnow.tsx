'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DidYouKnowProps {
  isRareOpinion: boolean;
  isHighlyContested: boolean;
  _topicTitle: string;
  _userChoice: 'A' | 'B';
  _onClose: () => void;
}

// Sample facts database - in a real app, these would be stored in the database
// and possibly related to the specific topic categories
const FACTS = [
  'Studies show that binary choice questions receive 3x more engagement than open-ended questions.',
  'Most people make binary decisions in less than 2 seconds, but may spend up to 30 seconds justifying their choice afterward.',
  "The 'false consensus effect' is a cognitive bias where people overestimate how many others share their opinions.",
  "People are more likely to share their opinion when they believe they're in the minority - it's called the 'uniqueness bias'.",
  "The format of 'This or That' questions has existed since ancient Greek philosophical debates.",
  'Choice paralysis: When given too many options, people often end up choosing nothing at all.',
  'In group settings, people are 30% more likely to change their binary choice to match the majority view.',
  'The average person makes about 35,000 decisions each day, from simple binary choices to complex problems.',
  'Your brain processes binary choices using different neural pathways than multiple-choice questions.',
  'The illusion of choice: When presented with a binary choice, people often forget there might be other options entirely.',
];

// Topic-specific facts based on categories
const TOPIC_FACTS: Record<string, string[]> = {
  crypto: [
    'The first Bitcoin transaction was a purchase of two pizzas for 10,000 BTC, now worth millions.',
    'Over 20% of all Bitcoin is estimated to be lost forever due to forgotten passwords or lost wallets.',
    'The Ethereum blockchain uses approximately as much electricity as the entire country of Morocco.',
  ],
  tech: [
    'The first computer bug was an actual insect - a moth trapped in a Harvard Mark II computer in 1947.',
    'The average smartphone user checks their device 96 times a day, or once every 10 minutes.',
    "The world's first website, created by Tim Berners-Lee, went live on August 6, 1991.",
  ],
  culture: [
    'Studies show that people who make quick binary choices often rely more on intuition than analysis.',
    'Cultural background significantly influences how people approach binary choices.',
    'The paradox of choice: More options often lead to less satisfaction with the final decision.',
  ],
};

/**
 * Component that displays interesting "Did You Know" facts after voting
 */
const DidYouKnow: React.FC<DidYouKnowProps> = ({
  isRareOpinion,
  isHighlyContested,
  _topicTitle,
  _userChoice,
  _onClose,
}) => {
  const [fact, setFact] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Select a fact based on topic category or pick a random general fact
    // In a real app, we would use the topicId to fetch category information
    const category = 'crypto'; // This would come from the database

    const relevantFacts = TOPIC_FACTS[category] || FACTS;
    const randomIndex = Math.floor(Math.random() * relevantFacts.length);
    setFact(relevantFacts[randomIndex]);

    // Show the component after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [_topicTitle]);

  if (!isVisible) return null;

  // Customize fact blurb based on user's choice popularity
  let factBlurb = 'Interesting fact about this topic:';
  if (isRareOpinion) {
    factBlurb = "You're in the minority! Did you know:";
  } else if (isHighlyContested) {
    factBlurb = 'The community is divided on this! Did you know:';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg"
    >
      <div className="flex items-start space-x-3">
        <div className="mt-1 text-2xl">💡</div>
        <div>
          <h3 className="text-sm font-medium text-yellow-300 mb-1">{factBlurb}</h3>
          <p className="text-sm text-gray-300">{fact}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default DidYouKnow;
