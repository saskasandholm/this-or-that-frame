'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingResultsProps {
  message?: string;
}

const LoadingResults: React.FC<LoadingResultsProps> = ({ message = 'Counting votes...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
      <motion.div
        className="w-16 h-16 border-4 border-t-purple-600 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />

      <div className="text-center">
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{message}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          This will just take a moment
        </p>
      </div>
    </div>
  );
};

export default LoadingResults;
