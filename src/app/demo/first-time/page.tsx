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
import FirstTimeUserExperience from '@/components/FirstTimeUserExperience';
import NavigationBar from '@/components/NavigationBar';

export default function FirstTimeExperienceDemoPage() {
  const [showExperience, setShowExperience] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const handleComplete = () => {
    setShowExperience(false);
    setCompletedSteps(['welcome', 'voting', 'streaks', 'achievements']);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 bg-clip-text text-transparent">
          First Time User Experience Demo
        </h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>First Time User Experience</CardTitle>
            <CardDescription>
              This component is shown to new users when they first visit the app. It introduces them
              to the key features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">The first-time user experience includes the following steps:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li className={completedSteps.includes('welcome') ? 'text-green-500' : ''}>
                Welcome message and app introduction
              </li>
              <li className={completedSteps.includes('voting') ? 'text-green-500' : ''}>
                How to vote on topics
              </li>
              <li className={completedSteps.includes('streaks') ? 'text-green-500' : ''}>
                Daily streaks and how they work
              </li>
              <li className={completedSteps.includes('achievements') ? 'text-green-500' : ''}>
                Achievements system
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setShowExperience(true)}>Launch First Time Experience</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Normally, this experience is automatically shown to first-time visitors based on
              localStorage. The component uses a step-by-step guidance approach with animated
              transitions between each step. It's designed to be informative but brief, allowing
              users to quickly understand the core features of the app.
            </p>
          </CardContent>
        </Card>
      </div>

      {showExperience && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <FirstTimeUserExperience onComplete={handleComplete} />
        </div>
      )}
    </div>
  );
}
