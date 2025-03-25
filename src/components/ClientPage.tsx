'use client';

import { Button } from '@/components/ui/button';
import { useState, useEffect, useReducer, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ContextAwareTopicView from './ContextAwareTopicView';
import VotingInterfaceWrapper from './VotingInterfaceWrapper';
import FirstTimeUserExperience from './FirstTimeUserExperience';
import DidYouKnow from './DidYouKnow';
import DirectChallenge from './DirectChallenge';
import FrameSavePrompt from './FrameSavePrompt';
import SplashScreen from './SplashScreen';
import { useTheme } from 'next-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, LineChart, Sparkles, Clock, TrendingUp, History, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import VotingInterface from './VotingInterface';
import TrendingTopicCard from './TrendingTopicCard';
import PastTopicCard from './PastTopicCard';
import Image from 'next/image';
import { topicApi, VoteResult } from '@/services/api';
import { SignInButton } from '@/components/SignInButton';
import { useProfile } from '@farcaster/auth-kit';

export interface PageDataProps {
  topicTitle: string;
  topicOptions: {
    optionA: string;
    optionB: string;
    imageA: string;
    imageB: string;
  };
  currentTopicId: string;
  frameImageUrl: string;
  framePostUrl: string;
  frameButtonText: string;
  welcomeMessage?: string;
  appDescription?: string;
  howItWorks?: string[];
  trendingTopics?: any[];
  didYouKnowFacts?: string[];
  showFirstTimeExperience?: boolean;
  loginRequired?: boolean;
}

// Define sample historical topics
const trendingTopics = [
  {
    id: 'trending-1',
    title: 'Apple vs Android',
    totalVotes: 12489,
    category: 'Technology',
    trend: '+42%',
  },
  {
    id: 'trending-2',
    title: 'Pizza vs Burgers',
    totalVotes: 8921,
    category: 'Food',
    trend: '+28%',
  },
  {
    id: 'trending-3',
    title: 'Beach vs Mountains',
    totalVotes: 7534,
    category: 'Travel',
    trend: '+15%',
  },
];

const pastTopics = [
  {
    id: 'past-1',
    title: 'Remote Work vs Office',
    votesA: 6234,
    votesB: 4912,
    percentage: 56,
    winner: 'Remote Work',
  },
  {
    id: 'past-2',
    title: 'Physical Books vs eBooks',
    votesA: 7123,
    votesB: 5489,
    percentage: 57,
    winner: 'Physical Books',
  },
  {
    id: 'past-3',
    title: 'Coffee vs Tea',
    votesA: 8432,
    votesB: 6531,
    percentage: 53,
    winner: 'Coffee',
  },
];

// Add this reducer type and implementation before the ClientPage component
type VotingState = {
  loading: boolean;
  loadingResults: boolean;
  userChoice: 'A' | 'B' | null;
  results: { A: number; B: number } | null;
  votedOnCurrentTopic: boolean;
  showDidYouKnow: boolean;
  showDirectChallenge: boolean;
  showFrameSavePrompt: boolean;
  isRareOpinion: boolean;
  isHighlyContested: boolean;
  error: string | null;
};

type VotingAction =
  | { type: 'VOTE_START'; choice: 'A' | 'B' }
  | { type: 'VOTE_SUCCESS'; choice: 'A' | 'B'; results: { A: number; B: number } }
  | { type: 'VOTE_ERROR'; error: string }
  | { type: 'SHOW_DID_YOU_KNOW' }
  | { type: 'SHOW_CHALLENGE' }
  | { type: 'SHOW_FRAME_PROMPT' }
  | { type: 'HIDE_FRAME_PROMPT' }
  | { type: 'HIDE_CHALLENGE' }
  | { type: 'SET_RARE_OPINION'; value: boolean }
  | { type: 'SET_CONTESTED'; value: boolean }
  | { type: 'RESET_ERROR' };

function votingReducer(state: VotingState, action: VotingAction): VotingState {
  switch (action.type) {
    case 'VOTE_START':
      return {
        ...state,
        loadingResults: true,
        userChoice: action.choice,
        error: null,
      };
    case 'VOTE_SUCCESS':
      return {
        ...state,
        loadingResults: false,
        results: action.results,
        votedOnCurrentTopic: true,
        userChoice: action.choice,
      };
    case 'VOTE_ERROR':
      return {
        ...state,
        loadingResults: false,
        error: action.error,
      };
    case 'SHOW_DID_YOU_KNOW':
      return { ...state, showDidYouKnow: true };
    case 'SHOW_CHALLENGE':
      return { ...state, showDirectChallenge: true };
    case 'HIDE_CHALLENGE':
      return { ...state, showDirectChallenge: false };
    case 'SHOW_FRAME_PROMPT':
      return { ...state, showFrameSavePrompt: true };
    case 'HIDE_FRAME_PROMPT':
      return { ...state, showFrameSavePrompt: false };
    case 'SET_RARE_OPINION':
      return { ...state, isRareOpinion: action.value };
    case 'SET_CONTESTED':
      return { ...state, isHighlyContested: action.value };
    case 'RESET_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Add a new OptimizedImage component for better image handling
const OptimizedImage = ({
  src,
  alt,
  width = 240,
  height = 180,
  priority = false,
  className = '',
  onLoad,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  onLoad?: () => void;
}) => {
  const [error, setError] = useState(false);
  const fallbackSrc = '/images/fallback-image.jpg'; // Default fallback

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        onError={() => setError(true)}
        onLoad={onLoad}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJ5jUTrAwAAAABJRU5ErkJggg=="
        style={{ objectFit: 'cover' }}
        className="transition-opacity duration-300"
      />
    </div>
  );
};

const ClientPage = ({
  topicTitle,
  topicOptions,
  currentTopicId,
  frameImageUrl,
  framePostUrl,
  frameButtonText,
  welcomeMessage,
  appDescription,
  howItWorks,
  trendingTopics: providedTrendingTopics,
  didYouKnowFacts,
  showFirstTimeExperience: forceFirstTimeExperience,
  loginRequired,
}: PageDataProps) => {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Loading topics...');
  const [activeTab, setActiveTab] = useState('daily');
  const { isAuthenticated } = useProfile();
  
  // Initialize login prompt - don't show if already authenticated
  const [showLoginPrompt, setShowLoginPrompt] = useState(!!loginRequired && !isAuthenticated);

  // Listen for authentication state changes to hide login prompt when authenticated
  useEffect(() => {
    if (isAuthenticated && showLoginPrompt) {
      console.log('[ClientPage] User authenticated, hiding login prompt');
      setShowLoginPrompt(false);
    }
  }, [isAuthenticated, showLoginPrompt]);

  // Replace multiple useState calls with useReducer
  const [votingState, dispatch] = useReducer(votingReducer, {
    loading: false,
    loadingResults: false,
    userChoice: null,
    results: null,
    votedOnCurrentTopic: false,
    showDidYouKnow: false,
    showDirectChallenge: false,
    showFrameSavePrompt: false,
    isRareOpinion: false,
    isHighlyContested: false,
    error: null,
  });

  const [showFirstTimeExperience, setShowFirstTimeExperience] = useState(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      try {
        // Check for auth cookies
        const hasAuthCookie = document.cookie.split(';').some(cookie => 
          cookie.trim().startsWith('farcaster_auth=') ||
          cookie.trim().startsWith('farcaster_auth_lax=') ||
          cookie.trim().startsWith('farcaster_auth_none=')
        );
        
        // Check for FTUE completed flag
        const hasCompletedFTUE = localStorage.getItem('ftue_completed') === 'true';
        
        // Only show FTUE if explicitly forced or if no auth cookie and not completed before
        const shouldShowFTUE = forceFirstTimeExperience || (!hasAuthCookie && !hasCompletedFTUE);
        
        console.log('[ClientPage] FTUE initialization:', {
          forceFirstTimeExperience,
          hasAuthCookie,
          hasCompletedFTUE,
          shouldShowFTUE,
          cookies: document.cookie.split(';').map(c => c.trim()).filter(Boolean).length
        });
        
        return shouldShowFTUE;
      } catch (error) {
        console.error('[ClientPage] Error initializing FTUE state:', error);
        return !!forceFirstTimeExperience;
      }
    }
    return !!forceFirstTimeExperience;
  });

  // Add effect to handle authentication changes
  useEffect(() => {
    const checkAuthState = () => {
      const hasAuthCookie = document.cookie.split(';').some(cookie => 
        cookie.trim().startsWith('farcaster_auth=') ||
        cookie.trim().startsWith('farcaster_auth_lax=') ||
        cookie.trim().startsWith('farcaster_auth_none=')
      );
      
      if (hasAuthCookie) {
        // Hide first time experience if authenticated
        if (showFirstTimeExperience) {
          console.log('[ClientPage] Auth detected, hiding FTUE');
          setShowFirstTimeExperience(false);
        }
        
        // Also hide login prompt if visible
        if (showLoginPrompt) {
          console.log('[ClientPage] Auth detected, hiding login prompt');
          setShowLoginPrompt(false);
        }
      }
    };
    
    // Check initially
    checkAuthState();
    
    // Setup interval to check auth state periodically (helpful for login redirects)
    const intervalId = setInterval(checkAuthState, 2000);
    
    // Setup visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuthState();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showFirstTimeExperience, showLoginPrompt]);

  // Use provided trending topics if available, otherwise use fetched ones
  const displayTrendingTopics = providedTrendingTopics || trendingTopics;

  // Detect if it's the user's first visit
  useEffect(() => {
    const isFirstVisit = localStorage.getItem('hasVisitedBefore') !== 'true';
    if (isFirstVisit && !loading) {
      setShowFirstTimeExperience(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, [loading]);

  // Simulating loading time
  useEffect(() => {
    // Always use dark theme, no switching
    setTheme('dark');

    // Simulate initial data loading
    const timer = setTimeout(() => {
      setLoading(false);

      // Check if it's a first-time user
      const isFirstTime = Math.random() > 0.7; // Simulating 30% chance of first-time user
      if (isFirstTime) {
        setShowFirstTimeExperience(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [setTheme]);

  // Simulating loading time
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setLoadingStatus('Preparing voting options...');

      const finalTimer = setTimeout(() => {
        setLoading(false);
      }, 1000);

      return () => clearTimeout(finalTimer);
    }, 800);

    return () => clearTimeout(loadingTimer);
  }, []);

  // Fix the handleVote function
  const handleVote = useCallback(
    async (choice: 'A' | 'B') => {
      // Prevent voting if already in progress
      if (votingState.loadingResults) return;
      
      // Prevent voting if already voted on this topic
      if (votingState.votedOnCurrentTopic) {
        console.log('[ClientPage] Already voted on this topic. Showing results.');
        return;
      }

      // Check if user is authenticated - if not, prompt to sign in
      // Only for web interface votes, not for frame-based votes
      const isFrameContext = window.location.ancestorOrigins?.length > 0 &&
        /warpcast|farcaster/i.test(window.location.ancestorOrigins[0]);
      
      if (!isFrameContext && !isAuthenticated) {
        console.log('[ClientPage] User not authenticated, showing login prompt');
        setShowLoginPrompt(true);
        return;
      }

      // Update state to indicate voting in progress
      dispatch({ type: 'VOTE_START', choice });

      try {
        console.log(`[ClientPage] Submitting vote: ${choice} for topic: ${currentTopicId}`);
        
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create simulated result to match the expected API response
        const simulatedResult = {
          success: true,
          topicId: currentTopicId,
          choice: choice,
          breakdown: {
            A: Math.floor(Math.random() * 100) + 30,
            B: Math.floor(Math.random() * 100) + 20,
            totalVotes: 0,
            percentA: 0,
            percentB: 0,
          },
          isRareOpinion: Math.random() > 0.7,
          isHighlyContested: Math.random() > 0.6,
        };

        // Calculate the total votes and percentages
        simulatedResult.breakdown.totalVotes =
          simulatedResult.breakdown.A + simulatedResult.breakdown.B;

        simulatedResult.breakdown.percentA = Math.round(
          (simulatedResult.breakdown.A / simulatedResult.breakdown.totalVotes) * 100
        );

        simulatedResult.breakdown.percentB = Math.round(
          (simulatedResult.breakdown.B / simulatedResult.breakdown.totalVotes) * 100
        );

        console.log('[ClientPage] Vote successful, updating UI with results', simulatedResult);

        // Update state with results
        dispatch({
          type: 'VOTE_SUCCESS',
          choice,
          results: {
            A: simulatedResult.breakdown.A,
            B: simulatedResult.breakdown.B,
          },
        });

        // Check if this is a rare opinion
        if (simulatedResult.isRareOpinion) {
          dispatch({ type: 'SET_RARE_OPINION', value: true });
        }

        // Check if this is a highly contested topic
        if (simulatedResult.isHighlyContested) {
          dispatch({ type: 'SET_CONTESTED', value: true });
        }

        // Show "Did You Know" after a delay
        setTimeout(() => {
          dispatch({ type: 'SHOW_DID_YOU_KNOW' });

          // Show challenge friends option after another delay
          setTimeout(() => {
            dispatch({ type: 'SHOW_CHALLENGE' });

            // Finally show frame save prompt
            setTimeout(() => {
              dispatch({ type: 'SHOW_FRAME_PROMPT' });
            }, 3000);
          }, 2000);
        }, 1500);
      } catch (error) {
        console.error('Error voting:', error);

        // Provide a user-friendly error message
        const errorMessage =
          error instanceof Error ? error.message : 'Unable to submit your vote. Please try again.';

        dispatch({ type: 'VOTE_ERROR', error: errorMessage });

        // Reset error after 5 seconds
        setTimeout(() => {
          dispatch({ type: 'RESET_ERROR' });
        }, 5000);
      }
    },
    [currentTopicId, votingState.loadingResults, votingState.votedOnCurrentTopic, isAuthenticated, setShowLoginPrompt]
  );

  const handleCompleteFirstTimeExperience = useCallback(() => {
    console.log('[ClientPage] Completing FTUE experience');
    setShowFirstTimeExperience(false);
    
    try {
      localStorage.setItem('ftue_completed', 'true');
      console.log('[ClientPage] Saved FTUE completion to localStorage');
    } catch (error) {
      console.error('[ClientPage] Error saving FTUE state:', error);
    }
  }, []);

  const handleCloseFrameSavePrompt = useCallback(() => {
    dispatch({ type: 'HIDE_FRAME_PROMPT' });
  }, []);

  const handleShowChallenge = useCallback(() => {
    dispatch({ type: 'SHOW_CHALLENGE' });
  }, []);

  const handleCloseChallenge = useCallback(() => {
    dispatch({ type: 'HIDE_CHALLENGE' });
  }, []);

  // Render skeleton loaders for different content sections
  const renderTopicSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-6 w-2/3 mx-auto" />
        </div>
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-6 w-2/3 mx-auto" />
        </div>
      </div>
    </div>
  );

  const renderTrendingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-2/3" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Check if we have valid topic data
  const hasValidTopic = topicTitle && topicOptions?.optionA && topicOptions?.optionB;

  // Define the 'handleTryAgain' function
  const handleTryAgain = () => {
    console.log('Try again action triggered');
  };

  // Show login prompt if redirected from a protected route
  if (showLoginPrompt) {
    return (
      <div className="container mx-auto px-4 py-12 sm:py-24 max-w-6xl">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center text-center gap-6"
          >
            <div className="rounded-lg bg-primary/10 p-3 text-primary inline-block">
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: 2, repeatDelay: 2 }}
              >
                <Lock className="h-12 w-12" />
              </motion.div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">Authentication Required</h1>

            <p className="text-muted-foreground max-w-md">
              You need to sign in with your Farcaster account to access this feature. Signing in
              lets you save your voting history, track your achievements, and more.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="border rounded-lg p-6 bg-card shadow-sm">
                <h3 className="font-semibold text-lg mb-3">Sign in Benefits</h3>
                <ul className="list-disc list-inside text-left space-y-2 text-muted-foreground">
                  <li>Track your voting history</li>
                  <li>Earn achievement badges</li>
                  <li>Maintain your daily streak</li>
                  <li>Challenge friends directly</li>
                  <li>Submit your own topic ideas</li>
                </ul>
              </div>

              <div className="flex flex-col justify-center items-center p-6 gap-6">
                <div className="text-center">
                  <SignInButton className="w-full" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Or{' '}
                  <Button 
                    variant="link" 
                    className="p-0" 
                    onClick={() => {
                      console.log('[ClientPage] Continuing as guest');
                      setShowLoginPrompt(false);
                    }}
                  >
                    continue as guest
                  </Button>
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SplashScreen loadingText={loadingStatus} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showFirstTimeExperience ? (
          <FirstTimeUserExperience 
            onComplete={handleCompleteFirstTimeExperience} 
            showSteps={['welcome', 'voting', 'streaks', 'achievements']}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container max-w-lg mx-auto p-4">
              {welcomeMessage && appDescription && (
                <div className="mb-8">
                  <h1 className="text-2xl font-bold">{welcomeMessage}</h1>
                  <p className="text-muted-foreground">{appDescription}</p>
                </div>
              )}

              <Tabs defaultValue="daily" className="mb-8" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="daily" className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Daily
                  </TabsTrigger>
                  <TabsTrigger value="trending" className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger value="past" className="flex items-center">
                    <History className="w-4 h-4 mr-2" />
                    Past
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="daily" className="mt-4">
                  {loading ? (
                    renderTopicSkeleton()
                  ) : hasValidTopic ? (
                    currentTopicId && topicOptions ? (
                      <VotingInterfaceWrapper
                        topicId={currentTopicId}
                        topicTitle={topicTitle || 'Unknown Topic'}
                        optionA={topicOptions.optionA}
                        optionB={topicOptions.optionB}
                        imageA={topicOptions.imageA}
                        imageB={topicOptions.imageB}
                        onVote={handleVote}
                        userVote={votingState.userChoice || undefined}
                        isLoading={votingState.loadingResults}
                        hasVoted={votingState.votedOnCurrentTopic}
                        showDidYouKnow={votingState.showDidYouKnow}
                        showDirectChallenge={votingState.showDirectChallenge}
                        isRareOpinion={votingState.isRareOpinion}
                        isHighlyContested={votingState.isHighlyContested}
                        onTryAgain={handleTryAgain}
                        results={
                          votingState.results
                            ? {
                                totalVotes: votingState.results.A + votingState.results.B,
                                percentA:
                                  Math.round(
                                    (votingState.results.A /
                                      (votingState.results.A + votingState.results.B)) *
                                      100
                                  ) || 0,
                                percentB:
                                  Math.round(
                                    (votingState.results.B /
                                      (votingState.results.A + votingState.results.B)) *
                                      100
                                  ) || 0,
                              }
                            : undefined
                        }
                      />
                    ) : (
                      <div className="text-center space-y-4">
                        <h1 className="text-2xl font-bold">No active topic found</h1>
                        <p className="text-muted-foreground">
                          There are no active voting topics at the moment. Please check back later.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="text-center space-y-4">
                      <h1 className="text-2xl font-bold">No active topic found</h1>
                      <p className="text-muted-foreground">
                        There are no active voting topics at the moment. Please check back later.
                      </p>
                    </div>
                  )}

                  {votingState.showDidYouKnow && !loading && votingState.userChoice && (
                    <div className="mt-8">
                      <DidYouKnow
                        facts={[
                          'Did you know? ' +
                            (votingState.userChoice === 'A'
                              ? topicOptions.optionA
                              : topicOptions.optionB) +
                            ' is a popular choice among users in your demographic!',
                        ]}
                        className="mb-4"
                      />
                    </div>
                  )}

                  {votingState.showDirectChallenge &&
                    !loading &&
                    votingState.userChoice &&
                    topicOptions &&
                    currentTopicId && (
                      <div className="mt-6">
                        <DirectChallenge
                          topicId={currentTopicId}
                          topicTitle={topicTitle || ''}
                          userChoice={votingState.userChoice}
                          optionA={topicOptions.optionA}
                          optionB={topicOptions.optionB}
                          onClose={handleCloseChallenge}
                        />
                      </div>
                    )}
                </TabsContent>

                <TabsContent value="trending">
                  {loading ? (
                    renderTrendingSkeleton()
                  ) : (
                    <div className="space-y-4">
                      {displayTrendingTopics.map((topic, index) => (
                        <TrendingTopicCard key={topic.id} topic={topic} rank={index + 1} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="past">
                  {loading ? (
                    renderTrendingSkeleton()
                  ) : (
                    <div className="space-y-4">
                      {pastTopics.map(topic => (
                        <PastTopicCard key={topic.id} topic={topic} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {votingState.showFrameSavePrompt && currentTopicId && (
                <FrameSavePrompt
                  topicId={currentTopicId}
                  topicTitle={topicTitle || 'Unknown Topic'}
                  onClose={handleCloseFrameSavePrompt}
                />
              )}

              {didYouKnowFacts && didYouKnowFacts.length > 0 && (
                <DidYouKnow facts={didYouKnowFacts} className="mt-8 mb-6" />
              )}

              <div className="mt-8 border-t pt-4">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">This is a Farcaster Frame</p>
                  <p className="mb-1">
                    <span role="img" aria-label="Tip">
                      💡
                    </span>
                    Tip: You can save this frame to your collection by clicking the "Add Frame"
                    button in your Farcaster client.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientPage;
