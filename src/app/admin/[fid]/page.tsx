import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getAllTopics } from '@/lib/topics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  ChevronDown,
  Edit,
  Trash,
  Check,
  X,
  PieChart,
  ListFilter,
  Users,
  User,
  BarChart2,
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Manage and monitor your application.',
};

// Temporarily use 'any' type to bypass the type constraint issue
type AdminPageProps = {
  params: any;
};

export default async function AdminPage({ params }: AdminPageProps) {
  // Convert fid to number with proper error handling
  const fid = parseInt(params.fid);

  if (isNaN(fid) || fid === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Invalid Admin ID</h1>
        <p className="mb-6 text-center text-muted-foreground">
          The provided admin ID is invalid or missing.
        </p>
        <Link href="/">
          <Button className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
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
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6 text-center text-muted-foreground">
          You do not have permission to access the admin dashboard.
        </p>
        <Link href="/">
          <Button className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  // Fetch topics
  const topics = await prisma.topic.findMany({
    take: 5, // Just get latest 5 for dashboard
    orderBy: {
      startDate: 'desc',
    },
  });

  // Get all category IDs from topics
  const categoryIds = Array.from(new Set(topics.map(topic => topic.categoryId)));

  // Fetch categories
  const categories = await prisma.category.findMany({
    where: {
      id: {
        in: categoryIds,
      },
    },
  });

  // Create a category lookup map
  const categoryMap = categories.reduce(
    (acc, category) => {
      acc[category.id] = category.name;
      return acc;
    },
    {} as Record<number, string>
  );

  // Get active topic
  const activeTopic = topics.find(topic => topic.isActive);

  // Fetch counts for the cards
  const topicCount = await prisma.topic.count();
  const usersCount = await prisma.userStreak.count();
  const votesCount = await prisma.vote.count();

  // Mock activity count for now (this would normally come from a userActivity table)
  const recentUserActivitiesCount = 42; // Sample value until actual model is available

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage topics and user submissions</p>
        </div>
        <div className="flex gap-4">
          <Link href="/">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </Button>
          </Link>
          <Link href={`/admin/${fid}/topics/new`}>
            <Button className="flex items-center">
              <Edit className="w-4 h-4 mr-2" />
              Create Topic
            </Button>
          </Link>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <PieChart className="w-4 h-4 mr-2 text-primary" />
              <div className="text-2xl font-bold">{topicCount}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeTopic ? '1 currently active' : 'No topics active'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-primary" />
              <div className="text-2xl font-bold">{usersCount}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">With voting history</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart2 className="w-4 h-4 mr-2 text-primary" />
              <div className="text-2xl font-bold">{votesCount}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all topics</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-primary" />
              <div className="text-2xl font-bold">{recentUserActivitiesCount}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">User activities in last 24h</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href={`/admin/${fid}/topics`} className="no-underline">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ListFilter className="w-5 h-5 mr-2" />
                Topic Management
              </CardTitle>
              <CardDescription>View, edit, and create topics with pagination</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="secondary" className="w-full">
                Manage Topics ({topicCount})
              </Button>
            </CardFooter>
          </Card>
        </Link>

        <Link href={`/admin/${fid}/submissions`} className="no-underline">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit className="w-5 h-5 mr-2" />
                Topic Submissions
              </CardTitle>
              <CardDescription>Review and moderate user-submitted topics</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="secondary" className="w-full">
                Review Submissions
              </Button>
            </CardFooter>
          </Card>
        </Link>

        <Link href={`/admin/${fid}/activity`} className="no-underline">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                User Activity
              </CardTitle>
              <CardDescription>Monitor user interactions and activity</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="secondary" className="w-full">
                View Activity
              </Button>
            </CardFooter>
          </Card>
        </Link>

        <Link href={`/admin/${fid}/friends`} className="no-underline">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Friend Leaderboards
              </CardTitle>
              <CardDescription>Social engagement and user rankings</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="secondary" className="w-full">
                View Leaderboards
              </Button>
            </CardFooter>
          </Card>
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <span className="mr-2">Recent Topics</span>
              <span className="bg-primary/10 text-primary text-xs py-1 px-2 rounded-full">
                {topics.length}
              </span>
            </h2>
            <Link href={`/admin/${fid}/topics`}>
              <Button variant="outline" size="sm">
                View All Topics
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map(topic => (
              <TopicCard
                key={topic.id}
                topic={topic}
                isActive={topic.id === activeTopic?.id}
                categoryName={categoryMap[topic.categoryId] || 'Unknown'}
                adminFid={fid}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopicCard({
  topic,
  isActive,
  categoryName,
  adminFid,
}: {
  topic: any;
  isActive: boolean;
  categoryName: string;
  adminFid: number;
}) {
  const startDate = topic.startDate ? new Date(topic.startDate).toLocaleDateString() : 'Not set';
  const endDate = topic.endDate ? new Date(topic.endDate).toLocaleDateString() : 'Not set';

  return (
    <div
      className={`border rounded-lg overflow-hidden ${isActive ? 'border-primary' : 'border-border'}`}
    >
      <div
        className={`px-4 py-3 flex justify-between items-center ${isActive ? 'bg-primary/10' : 'bg-card'}`}
      >
        <h3 className="font-medium truncate">{topic.name}</h3>
        {isActive && (
          <span className="bg-primary/20 border border-primary/20 text-primary text-xs py-0.5 px-2 rounded-full">
            Active
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {categoryName}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-muted/50 p-2 rounded text-center">
            <div className="text-sm text-muted-foreground">Option A</div>
            <div className="font-medium truncate">{topic.optionA}</div>
            <div className="text-sm mt-1 text-primary">{topic.votesA} votes</div>
          </div>
          <div className="bg-muted/50 p-2 rounded text-center">
            <div className="text-sm text-muted-foreground">Option B</div>
            <div className="font-medium truncate">{topic.optionB}</div>
            <div className="text-sm mt-1 text-primary">{topic.votesB} votes</div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Votes</span>
            <span className="font-medium">{topic.votesA + topic.votesB}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Start Date</span>
            <span>{startDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">End Date</span>
            <span>{endDate}</span>
          </div>
        </div>
      </div>

      <div className="border-t p-3 flex justify-between">
        <Link href={`/admin/${adminFid}/topics/${topic.id}`}>
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </Link>

        <div className="flex gap-2">
          {!isActive ? (
            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-600">
              <Check className="w-4 h-4 mr-1" />
              Activate
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-600">
              <X className="w-4 h-4 mr-1" />
              Deactivate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
