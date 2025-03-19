import { Metadata } from 'next';
import React from 'react';
import NavigationBar from '@/components/NavigationBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DidYouKnowDemoClient } from '@/components/demos/DidYouKnowDemoClient';

export const metadata: Metadata = {
  title: 'Did You Know Demo | This or That',
  description:
    'Experience the Did You Know feature that provides contextual information after voting.',
};

export default function DidYouKnowDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 bg-clip-text text-transparent">
          "Did You Know" Feature Demo
        </h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>"Did You Know" Educational Facts</CardTitle>
            <CardDescription>
              This component shows interesting facts after a user votes, especially when their
              choice is rare or the topic is contested.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DidYouKnowDemoClient />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The "Did You Know" component appears after voting, triggered by specific conditions.
              It shows educational facts related to the topic's category. The facts are dynamically
              selected and messaging is tailored based on the user's choice and the overall voting
              patterns. This feature aims to make the app more engaging and educational, making each
              vote a learning opportunity.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
