import Link from 'next/link';
import { Metadata } from 'next';
import {
  ArrowRight,
  Layers,
  Sparkles,
  Users,
  Lightbulb,
  Share,
  MessagesSquare,
  Award,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import NavigationBar from '@/components/NavigationBar';
import React from 'react';

export const metadata: Metadata = {
  title: 'Demo Components | This or That',
  description: 'Explore all the components and features available in the This or That application.',
};

export default function DemoPage() {
  const demoComponents = [
    {
      title: 'First Time Experience',
      description: 'Onboarding walkthrough that guides new users through the application features',
      icon: <Users className="w-5 h-5 text-blue-500" />,
      link: '/demo/first-time',
    },
    {
      title: 'Did You Know',
      description:
        'Contextual information cards that appear after voting to provide interesting facts',
      icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
      link: '/demo/did-you-know',
    },
    {
      title: 'Direct Challenge',
      description: 'Interface for challenging friends to vote on specific topics',
      icon: <MessagesSquare className="w-5 h-5 text-purple-500" />,
      link: '/demo/direct-challenge',
    },
    {
      title: 'Frame Save Prompt',
      description: 'Prompts encouraging users to save the frame to their collection',
      icon: <Share className="w-5 h-5 text-green-500" />,
      link: '/demo/frame-save',
    },
    {
      title: 'Voting Interface',
      description: 'The core voting experience with animated transitions and result display',
      icon: <Layers className="w-5 h-5 text-red-500" />,
      link: '/demo/voting',
    },
    {
      title: 'User Achievements',
      description: 'Gamification system showcasing user badges and milestones',
      icon: <Award className="w-5 h-5 text-yellow-500" />,
      link: '/demo/achievements',
    },
    {
      title: 'Topic History',
      description: 'Browse through past topics and their voting results',
      icon: <Clock className="w-5 h-5 text-cyan-500" />,
      link: '/demo/topic-history',
    },
  ];

  return (
    <div className="min-h-screen">
      <NavigationBar />

      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-3">Component Demos</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore all the features and components available in the This or That application. Each
            demo showcases a specific component in isolation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoComponents.map((demo, index) => (
            <Card
              key={index}
              className="overflow-hidden border border-border hover:border-primary/50 hover:shadow-md transition-all"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="bg-background p-2 rounded-full border border-border">
                    {demo.icon}
                  </div>
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl mt-3">{demo.title}</CardTitle>
                <CardDescription className="text-sm mt-1">{demo.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Link href={demo.link} className="w-full">
                  <Button className="w-full flex items-center justify-between">
                    <span>View Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
