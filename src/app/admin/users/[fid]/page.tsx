import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { formatDistanceToNow, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trophy, Calendar, Activity, Vote, History } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Award,
  Clock,
  Mail,
  ExternalLink,
} from 'lucide-react';

type UserDetailPageProps = {
  params: Promise<{ fid: string }>;
};

export async function generateMetadata({ params }: UserDetailPageProps): Promise<Metadata> {
  // Await the params Promise to get the actual parameters
  const resolvedParams = await params;
  const fidNum = parseInt(resolvedParams.fid, 10);
  
  if (isNaN(fidNum)) {
    return {
      title: 'User Not Found',
    };
  }

  const user = await prisma.user.findUnique({
    where: { fid: fidNum },
  });

  if (!user) {
    return {
      title: 'User Not Found',
    };
  }

  return {
    title: `${user.displayName || user.username || `User ${user.fid}`} | Admin`,
    description: `User details for FID ${user.fid}`,
  };
}

async function getUserData(fid: number) {
  if (isNaN(fid)) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { fid },
  });

  if (!user) {
    return null;
  }

  // Get user streak data
  const streak = await prisma.userStreak.findUnique({
    where: { fid },
  });

  // Get recent votes - Adjust field names to match your schema
  const votes = await prisma.vote.findMany({
    where: { fid },
    orderBy: { timestamp: 'desc' },
    take: 10,
  });

  // Get user activity - Adjust field names to match your schema
  const activity = await prisma.userActivity.findMany({
    where: { fid },
    orderBy: { timestamp: 'desc' },
    take: 10,
  });

  return {
    user,
    streak,
    votes,
    activity,
  };
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  // Await the params Promise to get the actual parameters
  const resolvedParams = await params;
  const fid = parseInt(resolvedParams.fid);
  
  if (isNaN(fid)) {
    notFound();
  }

  const userData = await getUserData(fid);

  if (!userData) {
    notFound();
  }

  const { user, streak, votes, activity } = userData;

  return (
    <div className="user-detail space-y-8">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
          <p className="text-muted-foreground mt-2">
            View and manage user information
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Message User
          </Button>
          <Button variant="secondary" size="sm">
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Warpcast
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-background border-border">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <div className="h-20 w-20 rounded-full mr-4 flex items-center justify-center bg-primary/10">
                {user.pfpUrl ? (
                  <img
                    src={user.pfpUrl}
                    alt={user.displayName || `User ${user.fid}`}
                    className="h-20 w-20 rounded-full"
                  />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {user.displayName || `User ${user.fid}`}
                </h2>
                {user.username && (
                  <p className="text-muted-foreground">@{user.username}</p>
                )}
                <div className="mt-2">
                  <Badge variant="secondary" className="mr-1">
                    FID: {user.fid}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joined</span>
                <span className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4 text-primary" />
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Active</span>
                <span className="flex items-center">
                  <Clock className="mr-1 h-4 w-4 text-primary" />
                  {new Date(user.lastLogin).toLocaleDateString()}
                </span>
              </div>
              {streak && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Streak</span>
                  <span className="flex items-center">
                    <Award className="mr-1 h-4 w-4 text-yellow-500" />
                    {streak.currentStreak} day{streak.currentStreak !== 1 && 's'}
                  </span>
                </div>
              )}
              {streak && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Longest Streak</span>
                  <span className="flex items-center">
                    <Award className="mr-1 h-4 w-4 text-yellow-500" />
                    {streak.longestStreak} day{streak.longestStreak !== 1 && 's'}
                  </span>
                </div>
              )}
              {streak && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Votes</span>
                  <span className="flex items-center">
                    <Activity className="mr-1 h-4 w-4 text-primary" />
                    {streak.totalVotes}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-background border-border">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="votes">Votes History</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activity && activity.length > 0 ? (
                        <div className="space-y-2">
                          {activity.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center text-sm">
                              <Activity className="mr-2 h-4 w-4 text-primary" />
                              <span>{item.action}</span>
                              <span className="ml-auto text-xs text-muted-foreground">
                                {new Date(item.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Recent Votes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {votes && votes.length > 0 ? (
                        <div className="space-y-2">
                          {votes.slice(0, 3).map((vote) => (
                            <div key={vote.id} className="flex items-center text-sm">
                              <Activity className="mr-2 h-4 w-4 text-primary" />
                              <span>Voted {vote.choice}</span>
                              <span className="ml-auto text-xs text-muted-foreground">
                                {new Date(vote.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No votes yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">User Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{streak?.totalVotes || 0}</div>
                        <div className="text-xs text-muted-foreground">Total Votes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{streak?.longestStreak || 0}</div>
                        <div className="text-xs text-muted-foreground">Longest Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                        </div>
                        <div className="text-xs text-muted-foreground">Days Registered</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="votes">
                <div className="space-y-4">
                  {votes && votes.length > 0 ? (
                    <div className="space-y-4">
                      {votes.map((vote) => (
                        <div key={vote.id} className="flex items-center p-3 border-b border-border">
                          <Activity className="mr-3 h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">Voted {vote.choice}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(vote.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No votes recorded for this user.</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="activity">
                <div className="space-y-4">
                  {activity && activity.length > 0 ? (
                    <div className="space-y-4">
                      {activity.map((item) => (
                        <div key={item.id} className="flex items-center p-3 border-b border-border">
                          <Activity className="mr-3 h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">{item.action}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(item.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No activity recorded for this user.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 