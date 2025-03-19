'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Filter, LineChart, Search, ArrowUpDown } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';

interface Topic {
  id: number;
  title: string;
  options: [string, string];
  date: Date;
  category: string;
  totalVotes: number;
  distribution: [number, number]; // percentage distribution between options
  userChoice?: 0 | 1;
}

export function TopicHistoryDemoClient() {
  // Mock data for past topics
  const [topics, setTopics] = useState<Topic[]>([
    {
      id: 1,
      title: 'Bitcoin or Ethereum?',
      options: ['Bitcoin', 'Ethereum'],
      date: subDays(new Date(), 1),
      category: 'Crypto',
      totalVotes: 4582,
      distribution: [58, 42],
      userChoice: 0,
    },
    {
      id: 2,
      title: 'AI: Existential threat or opportunity?',
      options: ['Threat', 'Opportunity'],
      date: subDays(new Date(), 2),
      category: 'Technology',
      totalVotes: 3721,
      distribution: [32, 68],
      userChoice: 1,
    },
    {
      id: 3,
      title: 'Work from home or office?',
      options: ['Home', 'Office'],
      date: subDays(new Date(), 3),
      category: 'Lifestyle',
      totalVotes: 2947,
      distribution: [71, 29],
      userChoice: 0,
    },
    {
      id: 4,
      title: 'iOS or Android?',
      options: ['iOS', 'Android'],
      date: subDays(new Date(), 4),
      category: 'Technology',
      totalVotes: 5103,
      distribution: [49, 51],
      userChoice: 1,
    },
    {
      id: 5,
      title: 'Books or Movies?',
      options: ['Books', 'Movies'],
      date: subDays(new Date(), 5),
      category: 'Entertainment',
      totalVotes: 2341,
      distribution: [44, 56],
    },
    {
      id: 6,
      title: 'Beach or Mountains?',
      options: ['Beach', 'Mountains'],
      date: subDays(new Date(), 6),
      category: 'Travel',
      totalVotes: 1987,
      distribution: [62, 38],
      userChoice: 1,
    },
    {
      id: 7,
      title: 'Twitter or Threads?',
      options: ['Twitter', 'Threads'],
      date: subDays(new Date(), 7),
      category: 'Social Media',
      totalVotes: 3245,
      distribution: [47, 53],
      userChoice: 0,
    },
    {
      id: 8,
      title: 'Renting or Buying a home?',
      options: ['Renting', 'Buying'],
      date: subDays(new Date(), 8),
      category: 'Finance',
      totalVotes: 2876,
      distribution: [29, 71],
    },
  ]);

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'votes'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter topics based on active filters
  const filteredTopics = topics.filter(topic => {
    // Search query filter
    if (searchQuery && !topic.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (categoryFilter && topic.category !== categoryFilter) {
      return false;
    }

    // Tab filter
    if (activeTab === 'voted' && topic.userChoice === undefined) {
      return false;
    }

    return true;
  });

  // Sort topics
  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc'
        ? b.date.getTime() - a.date.getTime()
        : a.date.getTime() - b.date.getTime();
    } else {
      return sortOrder === 'desc' ? b.totalVotes - a.totalVotes : a.totalVotes - b.totalVotes;
    }
  });

  // Get unique categories for the filter
  const categories = Array.from(new Set(topics.map(topic => topic.category)));

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Topics</TabsTrigger>
          <TabsTrigger value="voted">My Votes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search topics..."
                className="pl-8 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={categoryFilter || ''}
              onChange={e => setCategoryFilter(e.target.value || null)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setSortBy('date')}
            >
              <Calendar className="h-4 w-4" />
              Date
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setSortBy('votes')}
            >
              <LineChart className="h-4 w-4" />
              Votes
            </Button>

            <Button variant="ghost" className="w-10 p-0" onClick={toggleSortOrder}>
              <ArrowUpDown
                className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
              />
            </Button>
          </div>

          <div className="space-y-4">
            {sortedTopics.length > 0 ? (
              sortedTopics.map(topic => <TopicCard key={topic.id} topic={topic} />)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No topics match your search criteria
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="voted" className="space-y-6">
          <h3 className="text-lg font-medium mb-4">Your Voting History</h3>

          <div className="space-y-4">
            {sortedTopics.length > 0 ? (
              sortedTopics.map(topic => (
                <TopicCard key={topic.id} topic={topic} highlightUserChoice />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                You haven't voted on any topics yet
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <h3 className="text-lg font-medium mb-4">Voting Analytics</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Participation by Category
              </h4>

              <div className="space-y-3 mt-4">
                {categories.map(category => {
                  const categoryTopics = topics.filter(t => t.category === category);
                  const totalVotes = categoryTopics.reduce((sum, t) => sum + t.totalVotes, 0);
                  const width = `${Math.min(100, (totalVotes / 5000) * 100)}%`;

                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{category}</span>
                        <span className="text-muted-foreground">
                          {totalVotes.toLocaleString()} votes
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <LineChart className="h-4 w-4 mr-2" />
                Most Contested Topics
              </h4>

              <div className="space-y-3 mt-4">
                {[...topics]
                  .sort((a, b) => {
                    // Sort by how close the distribution is to 50/50
                    const aDiff = Math.abs(a.distribution[0] - 50);
                    const bDiff = Math.abs(b.distribution[0] - 50);
                    return aDiff - bDiff;
                  })
                  .slice(0, 5)
                  .map(topic => (
                    <div key={topic.id}>
                      <div className="text-sm mb-1">{topic.title}</div>
                      <div className="h-6 bg-muted rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-blue-500 flex items-center justify-end pr-2 text-xs text-white"
                          style={{ width: `${topic.distribution[0]}%` }}
                        >
                          {topic.distribution[0]}%
                        </div>
                        <div
                          className="h-full bg-purple-500 flex items-center justify-start pl-2 text-xs text-white"
                          style={{ width: `${topic.distribution[1]}%` }}
                        >
                          {topic.distribution[1]}%
                        </div>
                      </div>
                      <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                        <span>{topic.options[0]}</span>
                        <span>{topic.options[1]}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TopicCard({
  topic,
  highlightUserChoice = false,
}: {
  topic: Topic;
  highlightUserChoice?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
    >
      <div className="flex justify-between mb-2">
        <div className="flex items-center">
          <span className="text-xs bg-muted rounded-full px-2 py-0.5">{topic.category}</span>
          <span className="text-xs text-muted-foreground ml-2">
            {format(topic.date, 'MMM d, yyyy')}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {topic.totalVotes.toLocaleString()} votes
        </span>
      </div>

      <h3 className="text-lg font-semibold mb-3">{topic.title}</h3>

      <div className="space-y-2">
        {[0, 1].map(index => {
          const isUserChoice = topic.userChoice === index;
          const width = `${topic.distribution[index]}%`;

          return (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span
                  className={`flex items-center ${isUserChoice && highlightUserChoice ? 'font-medium text-primary' : ''}`}
                >
                  {isUserChoice && highlightUserChoice && (
                    <span className="inline-block h-2 w-2 rounded-full bg-primary mr-2"></span>
                  )}
                  {topic.options[index]}
                </span>
                <span className="text-muted-foreground">{topic.distribution[index]}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${index === 0 ? 'bg-blue-500' : 'bg-purple-500'} ${isUserChoice && highlightUserChoice ? 'animate-pulse' : ''}`}
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
