'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FrameSavePrompt from '@/components/FrameSavePrompt';
import NavigationBar from '@/components/NavigationBar';

export default function FrameSavePromptDemoPage() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [topicTitle, setTopicTitle] = useState('Bitcoin vs Ethereum');

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 bg-clip-text text-transparent">
          Frame Save Prompt Feature Demo
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Frame Save Prompt Configuration</CardTitle>
              <CardDescription>
                Configure and trigger the Frame Save Prompt component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Topic Title</label>
                <input
                  type="text"
                  value={topicTitle}
                  onChange={e => setTopicTitle(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background"
                />
              </div>

              <Button className="w-full mt-4" onClick={() => setShowPrompt(true)}>
                Show Frame Save Prompt
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>About the Frame Save Prompt feature</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  The Frame Save Prompt encourages users to save the application as a Frame in their
                  Farcaster client. This helps increase user retention and makes the app more
                  accessible.
                </p>

                <div className="bg-muted/30 p-4 rounded-md">
                  <h3 className="font-medium text-foreground mb-2">Key Features:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Appears randomly (50% chance) after voting on a topic</li>
                    <li>Provides clear instructions on how to save as a Frame</li>
                    <li>Shows visual cues to help users locate the save button</li>
                    <li>Can be dismissed and won't show again for several days</li>
                    <li>Tracks saved status in local storage to prevent repeated prompts</li>
                  </ul>
                </div>

                <p>
                  This component is specifically designed for Farcaster integration and helps
                  educate users about the Frame functionality, increasing engagement with your
                  application.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {showPrompt && (
          <div className="w-full max-w-lg mx-auto">
            <Card className="border-2 border-primary/50">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>This is how the prompt appears to users</CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <FrameSavePrompt topicTitle={topicTitle} onClose={() => setShowPrompt(false)} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
