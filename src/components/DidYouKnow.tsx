'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { LightbulbIcon } from 'lucide-react';

interface DidYouKnowProps {
  facts: string[];
  interval?: number; // Time in milliseconds between fact changes
  className?: string;
}

const DidYouKnow: React.FC<DidYouKnowProps> = ({
  facts,
  interval = 10000, // Default 10 seconds
  className = '',
}) => {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Rotate through facts at regular intervals
  useEffect(() => {
    if (facts.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentFactIndex(prevIndex => (prevIndex + 1) % facts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [facts, interval, isPaused]);

  // Pause rotation on hover
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  if (!facts || facts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card
        className="overflow-hidden border-primary/10 hover:border-primary/30 transition-all"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 bg-primary/10 p-2 rounded-full">
              <LightbulbIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-h-[3.5rem] flex flex-col">
              <h4 className="text-sm font-semibold text-primary mb-1">Did You Know?</h4>
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentFactIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-muted-foreground"
                >
                  {facts[currentFactIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DidYouKnow;
