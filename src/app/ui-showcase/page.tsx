'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import TestComponent from '@/components/TestComponent';
import SplashScreen from '@/components/SplashScreen';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import Link from 'next/link';
import VotingInterface from '@/components/VotingInterface';

export default function UIShowcasePage() {
  const [showSplash, setShowSplash] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = (option: 'A' | 'B') => {
    setIsLoading(true);

    // Simulate API response
    setTimeout(() => {
      setSelectedOption(option);
      setHasVoted(true);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <motion.h1
          className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 bg-clip-text text-transparent bg-size-200 animate-gradient"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          UI Showcase
        </motion.h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          This page demonstrates all the UI components and design elements used in the This or That
          application.
        </p>
        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-16 mb-12">
        <section>
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">Voting Interface</h2>
          <div className="grid grid-cols-1 gap-8">
            <div>
              <h3 className="text-xl font-medium mb-4">Interactive Voting Card</h3>
              <VotingInterface
                topic={{
                  id: 'sample-1',
                  title: 'Coffee vs Tea',
                  optionA: 'Coffee',
                  optionB: 'Tea',
                  imageA: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?q=80&w=400',
                  imageB: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=400',
                  votesA: 127,
                  votesB: 89,
                }}
                onVote={handleVote}
                hasVoted={hasVoted}
                selectedOption={selectedOption || undefined}
                isLoading={isLoading}
              />
            </div>

            <div>
              <h3 className="text-xl font-medium mb-4">Loading State</h3>
              <VotingInterface
                topic={{
                  id: 'sample-2',
                  title: 'Dogs vs Cats',
                  optionA: 'Dogs',
                  optionB: 'Cats',
                  votesA: 0,
                  votesB: 0,
                }}
                onVote={() => {}}
                hasVoted={false}
                isLoading={true}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">Core Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-medium mb-4">Buttons</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Button Variants</CardTitle>
                  <CardDescription>Different styles for different contexts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="default">Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button size="lg">Large</Button>
                    <Button size="default">Default</Button>
                    <Button size="sm">Small</Button>
                    <Button size="icon" className="size-10">
                      <span>🔍</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-4">Card Components</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card description goes here</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Card content with body text explaining the purpose of this card.</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button>Submit</Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-4">Progress & Loading</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Progress Indicators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Default Progress</p>
                    <Progress value={60} className="w-full" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Small Progress</p>
                    <Progress value={30} className="w-full h-1" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Skeletons</p>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-4">Gradients & Effects</h3>
              <Card>
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                    Gradient Text
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm">
                    Subtle gradient background
                  </div>
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-primary/80 to-secondary/80 text-white">
                    Strong gradient background
                  </div>
                  <div className="h-12 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 rounded-md bg-size-200 animate-gradient" />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>

      <div className="text-center mt-12">
        <p className="text-muted-foreground mb-4">
          Return to the main app to see these components in action
        </p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
