import { Metadata } from 'next';
import NavigationBar from '@/components/NavigationBar';
import VotingInterface from '@/components/VotingInterface';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
  title: 'Voting Interface Demo | This or That',
  description: 'Experience the core voting interface with animated transitions and result display.',
};

export default function VotingInterfaceDemoPage() {
  return (
    <div className="min-h-screen">
      <NavigationBar />

      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center mb-8">
          <Link href="/demo">
            <Button variant="ghost" size="sm" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Demos
            </Button>
          </Link>
          <h1 className="text-2xl font-bold ml-4">Voting Interface Demo</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-xl">Interactive Demo</CardTitle>
                <CardDescription>
                  Try out the voting interface with different sample topics
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ClientVotingWrapper />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>Key components of the voting interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-primary pl-4 py-2">
                  <h3 className="font-medium">Animated Transitions</h3>
                  <p className="text-sm text-muted-foreground">
                    Smooth animations between voting states using Framer Motion
                  </p>
                </div>

                <div className="border-l-4 border-secondary pl-4 py-2">
                  <h3 className="font-medium">Tooltips</h3>
                  <p className="text-sm text-muted-foreground">
                    Helpful explanations for cryptocurrency terms and concepts
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-medium">Results Visualization</h3>
                  <p className="text-sm text-muted-foreground">
                    Clear presentation of voting results with percentage indicators
                  </p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4 py-2">
                  <h3 className="font-medium">Responsive Design</h3>
                  <p className="text-sm text-muted-foreground">
                    Works seamlessly across mobile, tablet, and desktop devices
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  <p>
                    This component is the core of the application and handles all voting
                    interactions.
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create a new client component file for the voting wrapper
// This helps separate client-side state and functionality from the server component
import { ClientVotingWrapper } from '@/components/demos/ClientVotingWrapper';
