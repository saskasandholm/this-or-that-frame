import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import NavigationBar from '@/components/NavigationBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AchievementsDemoClient } from '@/components/demos/AchievementsDemoClient';
import { Trophy, Clock, Zap, ThumbsUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Achievements Demo | Frame',
  description: 'Demo and information about the achievement system in Frame',
};

export default function AchievementsDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/demo" className="text-primary hover:underline mb-2 inline-block">
            ← Back to Demos
          </Link>
          <h1 className="text-4xl font-bold mb-2">Achievements Demo</h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore how the achievement system works in Frame. Users earn achievements as they
            engage with the platform, encouraging consistent participation and diverse voting
            patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Interactive Demo</h2>
              <p className="text-muted-foreground mb-6">
                Click the buttons below to simulate different actions and see how achievements are
                unlocked and displayed.
              </p>

              <AchievementsDemoClient />
            </Card>
          </div>

          <div>
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
              <p className="text-muted-foreground mb-4">
                The achievement system is designed to reward users for their engagement and
                encourage regular participation.
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <Trophy className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Engagement Rewards</h3>
                    <p className="text-sm text-muted-foreground">
                      Users earn achievements as they vote on topics, with milestones at 10, 50,
                      100, and more votes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Streak Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      Consistent participation is rewarded with streak achievements for voting
                      multiple days in a row.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Zap className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Opinion Diversity</h3>
                    <p className="text-sm text-muted-foreground">
                      Users are encouraged to vote across different topic categories to earn
                      exploration achievements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <ThumbsUp className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Social Sharing</h3>
                    <p className="text-sm text-muted-foreground">
                      Sharing results with friends unlocks social achievements and helps grow the
                      community.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Implementation Notes</h2>
              <p className="text-sm text-muted-foreground mb-4">
                In the production application, achievements are stored in the database and linked to
                the user's Farcaster identity. Progress is tracked automatically as users interact
                with the platform.
              </p>
              <p className="text-sm text-muted-foreground">
                Achievement notifications appear in real-time when users unlock new achievements,
                providing immediate positive feedback.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
