'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DidYouKnow from '@/components/DidYouKnow';

export function DidYouKnowDemoClient() {
  const [isRareOpinion, setIsRareOpinion] = useState(false);
  const [isHighlyContested, setIsHighlyContested] = useState(false);
  const [topicTitle, setTopicTitle] = useState('Bitcoin vs Ethereum');
  const [userChoice, setUserChoice] = useState<'A' | 'B'>('A');

  return (
    <Tabs defaultValue="configure">
      <TabsList className="mb-6">
        <TabsTrigger value="configure">Configure</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>

      <TabsContent value="configure" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Topic Settings</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Topic Title</label>
              <input
                type="text"
                value={topicTitle}
                onChange={e => setTopicTitle(e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">User's Choice</label>
              <select
                value={userChoice}
                onChange={e => setUserChoice(e.target.value as 'A' | 'B')}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Trigger Conditions</h3>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="rare-opinion"
                checked={isRareOpinion}
                onChange={e => setIsRareOpinion(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="rare-opinion">Rare Opinion (less than 30% of votes)</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="highly-contested"
                checked={isHighlyContested}
                onChange={e => setIsHighlyContested(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="highly-contested">Highly Contested (votes within 10%)</label>
            </div>
            <div className="mt-4 bg-muted/30 p-3 rounded-md text-sm">
              <p>At least one of these conditions should be true for the component to appear.</p>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="preview">
        <div className="bg-muted/30 p-6 rounded-lg">
          <p className="mb-4 text-sm text-muted-foreground">Component Preview:</p>
          {isRareOpinion || isHighlyContested ? (
            <DidYouKnow
              facts={[
                isRareOpinion
                  ? `Only 15% of users chose ${userChoice} for "${topicTitle}". You have a rare opinion!`
                  : `This topic was highly contested with a nearly even split between options.`,
                'Fun fact: The most divided topic ever had a 50.1% to 49.9% split!',
                'Did you know? Users who make rare choices tend to be more creative.',
              ]}
              interval={5000}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                Enable at least one condition (Rare Opinion or Highly Contested) to see the
                component.
              </p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
