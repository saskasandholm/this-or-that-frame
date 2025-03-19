'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DirectChallenge from '@/components/DirectChallenge';
import NavigationBar from '@/components/NavigationBar';

export default function DirectChallengeDemoPage() {
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeData, setChallengeData] = useState({
    topicId: 'topic-123',
    topicTitle: 'Bitcoin vs Ethereum',
    userChoice: 'A' as 'A' | 'B',
    optionA: 'Bitcoin',
    optionB: 'Ethereum',
  });

  const handleCloseChallenge = () => {
    setShowChallenge(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 bg-clip-text text-transparent">
          Direct Challenge Feature Demo
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Direct Challenge Configuration</CardTitle>
              <CardDescription>Customize the Direct Challenge parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Topic ID</label>
                <input
                  type="text"
                  value={challengeData.topicId}
                  onChange={e => setChallengeData({ ...challengeData, topicId: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Topic Title</label>
                <input
                  type="text"
                  value={challengeData.topicTitle}
                  onChange={e => setChallengeData({ ...challengeData, topicTitle: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">User Choice</label>
                <select
                  value={challengeData.userChoice}
                  onChange={e =>
                    setChallengeData({ ...challengeData, userChoice: e.target.value as 'A' | 'B' })
                  }
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Option A</label>
                <input
                  type="text"
                  value={challengeData.optionA}
                  onChange={e => setChallengeData({ ...challengeData, optionA: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Option B</label>
                <input
                  type="text"
                  value={challengeData.optionB}
                  onChange={e => setChallengeData({ ...challengeData, optionB: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-background"
                />
              </div>

              <Button className="w-full mt-4" onClick={() => setShowChallenge(true)}>
                Launch Challenge Flow
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>About the Direct Challenge feature</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  The Direct Challenge feature allows users to send personalized challenges to their
                  friends after voting on a topic.
                </p>

                <div className="bg-muted/30 p-4 rounded-md">
                  <h3 className="font-medium text-foreground mb-2">Key Features:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Personalized challenge messages based on the topic</li>
                    <li>Copy challenge link or text to clipboard</li>
                    <li>Share button uses Web Share API (when available)</li>
                    <li>Warpcast DM integration for direct messaging</li>
                    <li>Creates a direct link to the same topic for your friend</li>
                    <li>Includes your choice to show comparison after they vote</li>
                  </ul>
                </div>

                <p>
                  In the real app, this component appears after a user votes, with a prompt asking
                  if they'd like to challenge a friend. If they agree, this interface is shown.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {showChallenge && (
          <DirectChallenge
            topicId={challengeData.topicId}
            topicTitle={challengeData.topicTitle}
            userChoice={challengeData.userChoice}
            optionA={challengeData.optionA}
            optionB={challengeData.optionB}
            onClose={handleCloseChallenge}
          />
        )}
      </div>
    </div>
  );
}
