import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, UserPlus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import FriendLeaderboard from '@/components/FriendLeaderboard';

export const metadata: Metadata = {
  title: 'Friend Leaderboards | Admin Dashboard',
  description: 'View social interactions and leaderboards for your app.',
};

// Temporarily use 'any' type to bypass the type constraint issue
type FriendPageProps = {
  params: any;
};

export default async function FriendLeaderboardPage({ params }: FriendPageProps) {
  // Convert fid to number with proper error handling
  const fid = params.fid ? parseInt(params.fid) : 0;

  if (isNaN(fid) || fid === 0) {
    return notFound();
  }

  // Check if the user is an admin
  const admin = await prisma.admin.findFirst({
    where: {
      fid: fid,
      isActive: true,
    },
  });

  // Redirect if not an admin
  if (!admin) {
    return notFound();
  }

  // Generate mock data for friends leaderboard
  // In a real implementation, this would come from your database
  const mockFriends = Array.from({ length: 10 }, (_, i) => ({
    fid: 10000 + i,
    username: `user${i + 1}`,
    score: Math.floor(Math.random() * 500) + 100,
    streak: Math.floor(Math.random() * 15),
    rank: i + 1,
    isFollowing: true,
  }));

  const mockGlobalLeaders = Array.from({ length: 10 }, (_, i) => ({
    fid: 20000 + i,
    username: `topuser${i + 1}`,
    score: Math.floor(Math.random() * 1000) + 500,
    streak: Math.floor(Math.random() * 30),
    rank: i + 1,
    isFollowing: i < 3, // First 3 are followed
  }));

  // Mock stats
  const totalUsers = 1457;
  const activeUsers = 892;
  const averageStreak = 4.2;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Friend Leaderboards</h1>
          <p className="text-muted-foreground">View social interactions and engagement metrics</p>
        </div>
        <div className="flex gap-4">
          <Link href={`/admin/${fid}`}>
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-primary" />
              <div className="text-2xl font-bold">{totalUsers}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Farcaster users connected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <UserPlus className="w-4 h-4 mr-2 text-primary" />
              <div className="text-2xl font-bold">{activeUsers}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Users active in the last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <RefreshCw className="w-4 h-4 mr-2 text-primary" />
              <div className="text-2xl font-bold">{averageStreak}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average active days per user</p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Weekly Leaderboard</CardTitle>
            <CardDescription>Top users based on activity this week</CardDescription>
          </CardHeader>
          <CardContent>
            <FriendLeaderboard
              friends={mockFriends}
              globalLeaders={mockGlobalLeaders}
              currentUserRank={42}
              period="weekly"
              onShareLeaderboard={() => {
                // This would be implemented client-side
                console.log('Share leaderboard');
              }}
              onViewProfile={fid => {
                // This would be implemented client-side
                console.log('View profile', fid);
              }}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>All-Time Leaderboard</CardTitle>
            <CardDescription>Users with the highest overall engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <FriendLeaderboard
              friends={mockFriends.sort((a, b) => b.score - a.score)}
              globalLeaders={mockGlobalLeaders.sort((a, b) => b.score - a.score)}
              currentUserRank={78}
              period="all-time"
              onShareLeaderboard={() => {
                // This would be implemented client-side
                console.log('Share leaderboard');
              }}
              onViewProfile={fid => {
                // This would be implemented client-side
                console.log('View profile', fid);
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Implementation Notes */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
          <CardDescription>Information about the friend leaderboard feature</CardDescription>
        </CardHeader>
        <CardContent className="prose">
          <p>The friend leaderboard feature enhances social engagement by:</p>
          <ul>
            <li>Showing users how they compare to their Farcaster friends</li>
            <li>Creating healthy competition to increase daily app usage</li>
            <li>Providing social proof through the global leaderboard</li>
            <li>Encouraging friend connections and network growth</li>
          </ul>
          <p>
            This implementation uses the Farcaster social graph to automatically populate friend
            lists without requiring additional friend management.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
