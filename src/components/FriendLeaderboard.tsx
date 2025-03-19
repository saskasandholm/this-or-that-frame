import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users, Flame, Share2, TrendingUp } from 'lucide-react';

interface FriendData {
  fid: number;
  username: string;
  avatarUrl?: string;
  score: number;
  streak?: number;
  rank: number;
  isFollowing: boolean;
}

interface FriendLeaderboardProps {
  friends: FriendData[];
  globalLeaders: FriendData[];
  currentUserRank?: number;
  period?: 'weekly' | 'monthly' | 'all-time';
  onShareLeaderboard?: () => void;
  onViewProfile?: (fid: number) => void;
  className?: string;
}

const FriendLeaderboard: React.FC<FriendLeaderboardProps> = ({
  friends,
  globalLeaders,
  currentUserRank,
  period = 'weekly',
  onShareLeaderboard,
  onViewProfile,
  className = '',
}) => {
  const displayedFriends = friends.slice(0, 10); // Show top 10 friends
  const displayedGlobal = globalLeaders.slice(0, 10); // Show top 10 global

  const renderLeaderItem = (user: FriendData, index: number, showRank = true) => (
    <div
      key={user.fid}
      className={`flex items-center justify-between p-3 rounded-lg ${index % 2 === 0 ? 'bg-muted/30' : ''} ${user.rank <= 3 ? 'border-l-2 border-primary' : ''}`}
    >
      <div className="flex items-center gap-3">
        {showRank && (
          <div
            className={`text-lg font-bold w-6 ${user.rank <= 3 ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {user.rank}
          </div>
        )}

        <Avatar className="w-10 h-10 border">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.username} />
          ) : (
            <div className="bg-primary/10 text-primary w-full h-full flex items-center justify-center text-lg font-semibold rounded-full">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </Avatar>

        <div>
          <div className="font-medium">{user.username}</div>
          {user.streak && user.streak > 0 && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Flame className="h-3 w-3 mr-1 text-amber-500" />
              <span>{user.streak} day streak</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono">
          {user.score.toLocaleString()}
        </Badge>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onViewProfile && onViewProfile(user.fid)}
        >
          <Users className="h-4 w-4" />
          <span className="sr-only">View Profile</span>
        </Button>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-8">
      <Users className="w-12 h-12 mx-auto text-muted-foreground mb-2 opacity-50" />
      <h3 className="font-medium mb-1">No friends found</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Follow friends on Farcaster to see them on your leaderboard
      </p>
      <Button size="sm" variant="outline">
        Find Friends
      </Button>
    </div>
  );

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-primary" />
              Leaderboard
            </CardTitle>
            <CardDescription>See how you compare with friends and others</CardDescription>
          </div>

          {onShareLeaderboard && (
            <Button variant="ghost" size="sm" onClick={onShareLeaderboard}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="friends">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="friends">
              <Users className="h-4 w-4 mr-2" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="global">
              <TrendingUp className="h-4 w-4 mr-2" />
              Global
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="m-0 space-y-1">
            {friends.length > 0 ? (
              <>
                <div className="text-sm text-muted-foreground mb-2 flex justify-between">
                  <span>
                    {period === 'weekly'
                      ? 'This Week'
                      : period === 'monthly'
                        ? 'This Month'
                        : 'All Time'}
                  </span>
                  {currentUserRank && (
                    <span>
                      Your rank:{' '}
                      <span className="font-semibold text-primary">#{currentUserRank}</span>
                    </span>
                  )}
                </div>
                {displayedFriends.map((friend, index) => renderLeaderItem(friend, index))}
              </>
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          <TabsContent value="global" className="m-0 space-y-1">
            <div className="text-sm text-muted-foreground mb-2">
              {period === 'weekly' ? 'This Week' : period === 'monthly' ? 'This Month' : 'All Time'}
            </div>
            {displayedGlobal.map((user, index) => renderLeaderItem(user, index))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FriendLeaderboard;
