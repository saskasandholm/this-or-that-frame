import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, User, Award, BarChart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Manage Users | Admin Dashboard',
  description: 'Manage users in the This or That application',
};

async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: {
      lastLogin: 'desc',
    },
    take: 50, // Limit to 50 users for performance
  });

  // Get streaks for each user
  const streaks = await prisma.userStreak.findMany({
    where: {
      fid: {
        in: users.map(user => user.fid),
      },
    },
  });

  // Map streaks to users
  const userStreaks = streaks.reduce((acc, streak) => {
    acc[streak.fid] = streak.currentStreak;
    return acc;
  }, {} as Record<number, number>);

  // Transform data for the table
  return users.map(user => {
    return {
      id: user.id,
      fid: user.fid,
      username: user.username || `User ${user.fid}`,
      displayName: user.displayName || `User ${user.fid}`,
      pfpUrl: user.pfpUrl || null,
      streak: userStreaks[user.fid] || 0,
      votes: 0, // Placeholder for votes count - implement real counting if needed
      lastActivity: user.lastLogin,
    };
  });
}

export default async function AdminUsersPage() {
  const users = await getUsers();
  
  return (
    <div className="admin-users space-y-8">
      <header className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground mt-2">
            View and manage user accounts
          </p>
        </div>
        <div>
          <Input
            placeholder="Search users by FID or username"
            className="w-80"
          />
        </div>
      </header>
      
      <Card className="bg-background border-border shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">User Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2">Sort By</label>
                <Select defaultValue="recent">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select sorting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="recent">Recent Activity</SelectItem>
                      <SelectItem value="streaks">Highest Streaks</SelectItem>
                      <SelectItem value="votes">Most Votes</SelectItem>
                      <SelectItem value="fid">FID (Ascending)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm mb-2">Activity</label>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by activity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active (Last 7 Days)</SelectItem>
                      <SelectItem value="inactive">Inactive (30+ Days)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm mb-2">Achievements</label>
                <Select defaultValue="any">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by achievements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="streaks">With Streaks</SelectItem>
                      <SelectItem value="voted">Has Voted</SelectItem>
                      <SelectItem value="none">No Achievements</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider border-b border-border">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">FID</th>
                  <th className="px-4 py-3 font-medium">Streak</th>
                  <th className="px-4 py-3 font-medium">Total Votes</th>
                  <th className="px-4 py-3 font-medium">Last Activity</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-accent/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          {user.pfpUrl ? (
                            <img 
                              src={user.pfpUrl} 
                              alt={user.username} 
                              className="h-8 w-8 rounded-full" 
                            />
                          ) : (
                            <User className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          {user.displayName !== user.username && (
                            <div className="text-xs text-muted-foreground">
                              {user.displayName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono">{user.fid}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>{user.streak} {user.streak > 0 && <span className="text-xs text-muted-foreground">(Max: {user.streak})</span>}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <BarChart className="h-4 w-4 text-primary mr-1" />
                        <span>{user.votes}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                        <span>
                          {new Date(user.lastActivity).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                          {' '}
                          <span className="text-xs text-muted-foreground">
                            {new Date(user.lastActivity).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground">
            Showing 1 to {users.length} of {users.length} users
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 