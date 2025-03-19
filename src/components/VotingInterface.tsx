'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VotingInterfaceProps {
  topic: {
    id: string;
    title: string;
    optionA: string;
    optionB: string;
    imageA?: string;
    imageB?: string;
    votesA: number;
    votesB: number;
  };
  onVote: (option: 'A' | 'B') => void;
  hasVoted: boolean;
  selectedOption?: 'A' | 'B';
  isLoading?: boolean;
}

const VotingInterface: React.FC<VotingInterfaceProps> = ({
  topic,
  onVote,
  hasVoted,
  selectedOption,
  isLoading = false,
}) => {
  const [isHoveringA, setIsHoveringA] = useState(false);
  const [isHoveringB, setIsHoveringB] = useState(false);
  const [showResults, setShowResults] = useState(hasVoted);

  useEffect(() => {
    setShowResults(hasVoted);
  }, [hasVoted]);

  const totalVotes = topic.votesA + topic.votesB;
  const percentA = totalVotes ? Math.round((topic.votesA / totalVotes) * 100) : 0;
  const percentB = totalVotes ? Math.round((topic.votesB / totalVotes) * 100) : 0;

  // Helper to determine if a tooltip should be shown
  const shouldShowTooltip = (optionName: string): boolean => {
    const cryptoTerms = ['Bitcoin', 'Ethereum', 'Crypto', 'Blockchain', 'NFT', 'Web3', 'DeFi'];
    return cryptoTerms.some(term => optionName.includes(term));
  };

  // Get tooltip content based on option name
  const getTooltipContent = (optionName: string): string => {
    if (optionName.includes('Bitcoin')) {
      return 'Bitcoin is a decentralized digital currency created in 2009, often called "digital gold" due to its store of value properties.';
    } else if (optionName.includes('Ethereum')) {
      return 'Ethereum is a decentralized platform that enables smart contracts and dApps, powering much of the Web3 ecosystem with its native currency Ether.';
    } else if (optionName.includes('NFT')) {
      return 'Non-Fungible Tokens (NFTs) are unique digital assets that represent ownership of a specific item or piece of content on the blockchain.';
    } else if (optionName.includes('DeFi')) {
      return 'Decentralized Finance (DeFi) refers to financial applications built on blockchain technology that aim to replace traditional financial intermediaries.';
    } else if (optionName.includes('Web3')) {
      return 'Web3 refers to a decentralized version of the internet built on blockchain, emphasizing user ownership and control of data and digital assets.';
    }
    return 'A cryptocurrency or blockchain-related technology';
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto overflow-hidden shadow-xl border-2 border-border/30">
        <div className="p-5 flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="flex flex-col gap-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto overflow-hidden shadow-xl border-2 border-border/30 backdrop-blur-md bg-background/70">
      <div className="p-5">
        <motion.h2
          className="text-center text-xl sm:text-2xl font-bold mb-6 bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {topic.title}
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              className={cn(
                'relative rounded-xl overflow-hidden border-2 transition-all duration-300 bg-black/5 backdrop-blur-sm',
                hasVoted && selectedOption === 'A'
                  ? 'border-primary/70 shadow-xl shadow-primary/20'
                  : 'border-border/20',
                isHoveringA && !hasVoted && 'scale-[1.02] shadow-lg'
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onHoverStart={() => !hasVoted && setIsHoveringA(true)}
              onHoverEnd={() => setIsHoveringA(false)}
            >
              <div className="relative aspect-square bg-muted/50 overflow-hidden rounded-lg border border-border/20 shadow-inner">
                {topic.imageA ? (
                  <motion.div
                    className="absolute inset-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={topic.imageA}
                      alt={topic.optionA}
                      priority
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-all duration-300"
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                      }}
                      quality={95}
                      unoptimized={
                        topic.imageA.startsWith('data:') || topic.imageA.includes('/api/og')
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl bg-gradient-to-br from-primary-800/20 to-primary-700/40">
                    ☕️
                  </div>
                )}
              </div>
              <div className="p-3 text-center relative z-10">
                {shouldShowTooltip(topic.optionA) ? (
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h3 className="text-lg font-semibold inline-flex items-center">
                          {topic.optionA}
                          <span className="ml-1 text-xs text-muted-foreground">ⓘ</span>
                        </h3>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-sm bg-gray-900/95 border-gray-800 text-gray-200 p-3">
                        {getTooltipContent(topic.optionA)}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <h3 className="text-lg font-semibold">{topic.optionA}</h3>
                )}
                {showResults && (
                  <motion.div
                    className="mt-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <Progress value={percentA} className="h-2 mb-1" />
                    <p className="text-sm font-medium">
                      {percentA}% ({topic.votesA} votes)
                    </p>
                  </motion.div>
                )}
              </div>
              {!hasVoted && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                  whileHover={{ opacity: 1 }}
                >
                  <Button
                    variant="default"
                    size="lg"
                    className="font-bold shadow-xl transition-all duration-300 hover:scale-110"
                    onClick={() => onVote('A')}
                  >
                    Vote
                  </Button>
                </motion.div>
              )}
              {hasVoted && selectedOption === 'A' && (
                <div className="absolute top-3 right-3 size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    ✓
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              className={cn(
                'relative rounded-xl overflow-hidden border-2 transition-all duration-300 bg-black/5 backdrop-blur-sm',
                hasVoted && selectedOption === 'B'
                  ? 'border-primary/70 shadow-xl shadow-primary/20'
                  : 'border-border/20',
                isHoveringB && !hasVoted && 'scale-[1.02] shadow-lg'
              )}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onHoverStart={() => !hasVoted && setIsHoveringB(true)}
              onHoverEnd={() => setIsHoveringB(false)}
            >
              <div className="relative aspect-square bg-muted/50 overflow-hidden rounded-lg border border-border/20 shadow-inner">
                {topic.imageB ? (
                  <motion.div
                    className="absolute inset-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={topic.imageB}
                      alt={topic.optionB}
                      priority
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-all duration-300"
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                      }}
                      quality={95}
                      unoptimized={
                        topic.imageB.startsWith('data:') || topic.imageB.includes('/api/og')
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl bg-gradient-to-br from-secondary-800/20 to-secondary-700/40">
                    🍵
                  </div>
                )}
              </div>
              <div className="p-3 text-center relative z-10">
                {shouldShowTooltip(topic.optionB) ? (
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h3 className="text-lg font-semibold inline-flex items-center">
                          {topic.optionB}
                          <span className="ml-1 text-xs text-muted-foreground">ⓘ</span>
                        </h3>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-sm bg-gray-900/95 border-gray-800 text-gray-200 p-3">
                        {getTooltipContent(topic.optionB)}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <h3 className="text-lg font-semibold">{topic.optionB}</h3>
                )}
                {showResults && (
                  <motion.div
                    className="mt-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <Progress value={percentB} className="h-2 mb-1" />
                    <p className="text-sm font-medium">
                      {percentB}% ({topic.votesB} votes)
                    </p>
                  </motion.div>
                )}
              </div>
              {!hasVoted && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                  whileHover={{ opacity: 1 }}
                >
                  <Button
                    variant="default"
                    size="lg"
                    className="font-bold shadow-xl transition-all duration-300 hover:scale-110"
                    onClick={() => onVote('B')}
                  >
                    Vote
                  </Button>
                </motion.div>
              )}
              {hasVoted && selectedOption === 'B' && (
                <div className="absolute top-3 right-3 size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    ✓
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {hasVoted && (
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-sm text-muted-foreground mb-2">Thank you for voting!</p>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResults(!showResults)}
                className="shadow-sm"
              >
                {showResults ? 'Hide Results' : 'Show Results'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
};

export default VotingInterface;
