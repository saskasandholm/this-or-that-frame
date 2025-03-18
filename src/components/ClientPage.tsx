'use client';

import React, { useState, useEffect } from 'react';
import { FrameContextProvider } from '../lib/ContextProvider';
import SplashScreen from './SplashScreen';
import ContextAwareTopicView from './ContextAwareTopicView';
import { ErrorBoundary } from '../lib/ErrorBoundary';
import TestComponent from './TestComponent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Define the interface for the page data passed from the server component
interface PageDataProps {
  pageData: {
    currentTopic: {
      id: number;
      name: string;
      optionA: string;
      optionB: string;
      category: string;
      imageA: string;
      imageB: string;
    } | null;
    frameImageUrl: string;
    framePostUrl: string;
  };
}

const ClientPage: React.FC<PageDataProps> = ({ pageData }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userVote, setUserVote] = useState<'A' | 'B' | null>(null);
  const [results, setResults] = useState<{
    totalVotes: number;
    percentA: number;
    percentB: number;
  } | null>(null);
  const [showTest, setShowTest] = useState(true);

  // Simulate loading time (in a real app, this would be fetching user data, etc.)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Handle vote submission
  const handleVote = async (option: 'A' | 'B') => {
    setUserVote(option);
    setIsLoading(true);

    try {
      // In a real app, you would make an API call to record the vote
      // const response = await fetch('/api/votes', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     topicId: pageData.currentTopic?.id,
      //     choice: option
      //   })
      // });
      // const data = await response.json();

      // Simulate API response
      setTimeout(() => {
        setResults({
          totalVotes: 42,
          percentA: option === 'A' ? 60 : 40,
          percentB: option === 'A' ? 40 : 60,
        });
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error recording vote:', error);
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 text-red-500">
          Something went wrong loading the frame. Please try again.
        </div>
      }
    >
      <FrameContextProvider>
        <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white overflow-x-hidden">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <header className="mb-10 text-center animate-fade-in">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text animate-gradient">
                This or That
              </h1>
              <p className="mt-3 text-gray-300 text-lg max-w-md mx-auto">
                Vote on daily binary choices and see what the community thinks
              </p>
            </header>

            {/* Test component to verify React and CSS are working */}
            {showTest && (
              <div className="mb-12 w-full animate-slide-up">
                <TestComponent />
                <div className="mt-6 text-center">
                  <Button
                    variant="secondary"
                    onClick={() => setShowTest(false)}
                    className="font-medium"
                    aria-label="Hide test component section"
                  >
                    Hide Test Component
                  </Button>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <SplashScreen
                  preloadAssets={{
                    images: [pageData.currentTopic?.imageA, pageData.currentTopic?.imageB].filter(
                      Boolean
                    ) as string[],
                  }}
                />
              </div>
            ) : (
              <div className="w-full animate-fade-in space-y-8">
                {pageData.currentTopic ? (
                  <Card className="bg-card/25 backdrop-blur-lg border-border/50 shadow-xl overflow-hidden">
                    <ContextAwareTopicView
                      topicId={String(pageData.currentTopic.id)}
                      topicTitle={pageData.currentTopic.name}
                      optionA={pageData.currentTopic.optionA}
                      optionB={pageData.currentTopic.optionB}
                      imageA={pageData.currentTopic.imageA}
                      imageB={pageData.currentTopic.imageB}
                      results={results || undefined}
                      userVote={userVote}
                      isLoading={isLoading}
                      onVote={handleVote}
                    />
                  </Card>
                ) : (
                  <Card className="p-8 text-center shadow-lg bg-card/25 backdrop-blur-lg border-border/50">
                    <CardContent className="pt-6">
                      <p className="text-xl font-medium">
                        No active topic found. Check back later!
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Frame Information Card */}
                <Card className="shadow-xl border border-gray-800/40 bg-card/25 backdrop-blur-lg overflow-hidden">
                  <CardHeader className="pb-2 border-b border-gray-800/20">
                    <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-primary-600 bg-clip-text text-transparent">
                      Frame Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="border-l-4 border-purple-500 pl-4 py-1">
                      <p className="text-sm text-muted-foreground font-medium mb-1">Image URL:</p>
                      <div className="bg-muted/50 p-3 rounded-md mt-1 overflow-x-auto">
                        <code className="text-sm font-mono text-secondary-foreground break-all">
                          {pageData.frameImageUrl}
                        </code>
                      </div>
                    </div>
                    <div className="border-l-4 border-pink-500 pl-4 py-1">
                      <p className="text-sm text-muted-foreground font-medium mb-1">Post URL:</p>
                      <div className="bg-muted/50 p-3 rounded-md mt-1 overflow-x-auto">
                        <code className="text-sm font-mono text-secondary-foreground break-all">
                          {pageData.framePostUrl}
                        </code>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="bg-primary/10 rounded-lg p-4 w-full border border-primary/20">
                      <p className="text-sm font-medium text-center">
                        This page serves as a Farcaster Frame. Cast it to enable interactive voting!
                      </p>
                    </div>
                  </CardFooter>
                </Card>

                {/* Quick Links to Showcase */}
                <div className="text-center pt-4 pb-8">
                  <p className="text-muted-foreground mb-4">Want to see all UI components?</p>
                  <a href="/ui-showcase">
                    <Button variant="gradient" size="lg" className="font-medium">
                      View UI Showcase
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>
        </main>
      </FrameContextProvider>
    </ErrorBoundary>
  );
};

export default ClientPage;
