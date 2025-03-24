import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { BarChart, Users, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Admin Dashboard | This or That',
  description: 'Admin dashboard for This or That application',
};

async function getAdminStats() {
  // Fetch stats for the dashboard
  const [
    userCount,
    topicCount,
    activeTopicCount,
    submissionCount
  ] = await Promise.all([
    prisma.user.count(),
    prisma.topic.count(),
    prisma.topic.count({ where: { isActive: true } }),
    prisma.topicSubmission.count()
  ]);

  return {
    userCount,
    topicCount,
    activeTopicCount,
    submissionCount
  };
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  
  return (
    <div className="admin-dashboard space-y-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage topics, users, and monitor platform activity
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-background border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{stats.userCount}</div>
            <p className="text-xs text-muted-foreground pt-1">
              Registered accounts
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Topics</CardTitle>
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-full">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{stats.topicCount}</div>
            <p className="text-xs text-muted-foreground pt-1">
              All time
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Topics</CardTitle>
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-full">
              <Clock className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{stats.activeTopicCount}</div>
            <p className="text-xs text-muted-foreground pt-1">
              Currently active
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-full">
              <BarChart className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{stats.submissionCount}</div>
            <p className="text-xs text-muted-foreground pt-1">
              User submitted topics
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity Section */}
      <section className="space-y-4 mt-10">
        <h2 className="text-xl font-bold tracking-tight mb-4">Recent Activity</h2>
        <Card className="bg-background border-border shadow-sm">
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              This section will display recent user activity and admin actions.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
} 