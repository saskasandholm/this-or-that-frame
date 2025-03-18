'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  minDisplayTime?: number;
  maxDisplayTime?: number;
  preloadAssets?: {
    images?: string[];
    audio?: string[];
  };
  className?: string;
  onComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  minDisplayTime = 2000,
  maxDisplayTime = 5000,
  preloadAssets,
  className,
  onComplete,
}) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [_assetsLoaded, setAssetsLoaded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Simulate assets loading
  useEffect(() => {
    const totalAssets = (preloadAssets?.images?.length || 0) + (preloadAssets?.audio?.length || 0);
    let loadedAssets = 0;

    const loadingMessages = [
      'Initializing...',
      'Loading assets...',
      'Preparing components...',
      'Almost there...',
      'Ready!',
    ];

    // Set initial message
    setLoadingMessage(loadingMessages[0]);

    // Preload images if provided
    if (preloadAssets?.images && preloadAssets.images.length > 0) {
      preloadAssets.images.forEach(src => {
        if (!src) return;

        const img = new Image();
        img.onload = () => {
          loadedAssets++;
          updateProgress(loadedAssets, totalAssets, loadingMessages);
        };
        img.onerror = () => {
          loadedAssets++;
          updateProgress(loadedAssets, totalAssets, loadingMessages);
        };
        img.src = src;
      });
    }

    // If no assets to preload, simulate loading progress
    if (totalAssets === 0) {
      simulateLoading(loadingMessages);
    }

    // Check if we should auto-dismiss after maxDisplayTime
    const maxTimeoutId = setTimeout(() => {
      handleComplete();
    }, maxDisplayTime);

    return () => {
      clearTimeout(maxTimeoutId);
    };
  }, [preloadAssets, maxDisplayTime, minDisplayTime, onComplete]);

  const updateProgress = (loaded: number, total: number, messages: string[]) => {
    const progress = total > 0 ? Math.floor((loaded / total) * 100) : 100;
    setLoadingProgress(progress);

    // Update message based on progress
    const messageIndex = Math.min(
      Math.floor((progress / 100) * (messages.length - 1) + 0.5),
      messages.length - 1
    );
    setLoadingMessage(messages[messageIndex]);

    if (loaded >= total) {
      setAssetsLoaded(true);

      // Ensure minimum display time
      setTimeout(() => {
        handleComplete();
      }, minDisplayTime);
    }
  };

  const simulateLoading = (messages: string[]) => {
    const steps = messages.length;
    const stepDuration = minDisplayTime / steps;

    for (let i = 0; i < steps; i++) {
      setTimeout(() => {
        setLoadingProgress(Math.min(100, (i + 1) * (100 / steps)));
        setLoadingMessage(messages[i]);
        if (i === steps - 1) {
          setAssetsLoaded(true);
          setTimeout(() => {
            handleComplete();
          }, stepDuration);
        }
      }, i * stepDuration);
    }
  };

  const handleComplete = () => {
    if (isDismissed) return;
    setIsDismissed(true);
    if (onComplete) onComplete();
  };

  if (isDismissed) return null;

  return (
    <div className={cn('flex flex-col items-center justify-center p-6 w-full max-w-md', className)}>
      <div className="w-full">
        <div className="relative py-8 flex flex-col items-center gap-6">
          {/* Logo animation */}
          <div className="relative size-20 mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/60 to-secondary/60 blur-xl animate-pulse-slow"></div>
            <div className="relative size-full bg-card rounded-full border border-primary/30 flex items-center justify-center shadow-lg">
              <div className="text-3xl animate-bounce-slow">🎮</div>
            </div>
          </div>

          {/* Loading text */}
          <h2 className="text-xl font-semibold text-center animate-pulse-slow bg-gradient-to-r from-primary-300 to-primary-500 text-transparent bg-clip-text">
            {loadingMessage}
          </h2>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2.5 mb-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-400 to-secondary-400 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
              role="progressbar"
              aria-valuenow={loadingProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>

          {/* Loading animation */}
          <div className="flex space-x-3 justify-center mt-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn('size-2.5 rounded-full bg-primary/80', 'animate-bounce')}
                style={{
                  animationDelay: `${i * 150}ms`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
