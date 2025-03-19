import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import NavigationBar from '@/components/NavigationBar';
import { Card } from '@/components/ui/card';
import { TopicHistoryDemoClient } from '@/components/demos/TopicHistoryDemoClient';
import { History, Calendar, Filter, LineChart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Topic History Demo | Frame',
  description: 'Explore the topic history feature in Frame',
};

export default function TopicHistoryDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/demo" className="text-primary hover:underline mb-2 inline-block">
            ← Back to Demos
          </Link>
          <h1 className="text-4xl font-bold mb-2">Topic History Demo</h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore past topics and view voting trends over time. The topic history feature allows
            users to see previous topics, their choices, and community voting patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Interactive Demo</h2>
              <p className="text-muted-foreground mb-6">
                Browse through previous topics and explore the voting trends and statistics.
              </p>

              <TopicHistoryDemoClient />
            </Card>
          </div>

          <div>
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
              <p className="text-muted-foreground mb-4">
                The topic history feature maintains a record of all past topics and allows users to
                explore them in various ways.
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <History className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Topic Archives</h3>
                    <p className="text-sm text-muted-foreground">
                      Browse all past topics chronologically, with filtering options for different
                      categories and time periods.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Personal History</h3>
                    <p className="text-sm text-muted-foreground">
                      View your own voting history, including your past choices and when you made
                      them.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Filter className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Category Filters</h3>
                    <p className="text-sm text-muted-foreground">
                      Filter topics by category, popularity, controversy level, or time period.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <LineChart className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Voting Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Explore voting trends and analytics for past topics, including participation
                      rates and option distributions.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Implementation Notes</h2>
              <p className="text-sm text-muted-foreground mb-4">
                In the production application, topic history is fetched from the database and
                associated with the user's Farcaster identity when logged in.
              </p>
              <p className="text-sm text-muted-foreground">
                For users without an account, a limited view of past topics is available,
                encouraging sign-up for personalized history tracking.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
