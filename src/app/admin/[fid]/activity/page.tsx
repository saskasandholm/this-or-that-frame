import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Download, Filter, RefreshCcw, Search, UserRound } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Pagination } from '@/components/ui/pagination';
import { Prisma } from '@prisma/client';

export const metadata: Metadata = {
  title: 'User Activity | Admin Dashboard',
  description: 'Monitor user activity and interactions with the application.',
};

// Define UserActivity type to match the Prisma model
interface UserActivity {
  id: number;
  fid: number;
  action: string;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  entityType?: string | null;
  entityId?: number | null;
  timestamp: Date;
}

// Define action count type
interface ActionCount {
  action: string;
  count: number;
}

// Temporarily use 'any' type to bypass the type constraint issue
type ActivityPageProps = {
  params: any;
  searchParams?: any;
};

export default async function ActivityPage({ params, searchParams = {} }: ActivityPageProps) {
  // Convert fid to number with proper error handling
  const fid = parseInt(params.fid);

  if (isNaN(fid) || fid === 0) {
    return notFound();
  }

  // Get pagination parameters
  const page = parseInt(searchParams.page || '1');
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  // Parse filtering options
  const actionFilter =
    searchParams.action && searchParams.action !== 'all' ? searchParams.action : undefined;
  const daysFilter = parseInt(searchParams.days || '7');
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - daysFilter);

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

  try {
    // Since UserActivity might not be in Prisma schema directly, we'll use raw queries
    // Use raw SQL queries for all operations
    const activitiesQuery = `
      SELECT * FROM UserActivity 
      WHERE timestamp >= ? 
      ${actionFilter ? 'AND action = ?' : ''} 
      ORDER BY timestamp DESC 
      LIMIT ? OFFSET ?
    `;

    const activitiesParams = [
      dateFrom.toISOString(),
      ...(actionFilter ? [actionFilter] : []),
      pageSize.toString(),
      skip.toString(),
    ];

    // Execute the query
    const activities = (await prisma.$queryRaw(
      Prisma.sql([activitiesQuery, ...activitiesParams])
    )) as UserActivity[];

    // Count query for total records
    const countQuery = `
      SELECT COUNT(*) as count FROM UserActivity 
      WHERE timestamp >= ? 
      ${actionFilter ? 'AND action = ?' : ''}
    `;

    const countParams = [dateFrom.toISOString(), ...(actionFilter ? [actionFilter] : [])];

    // Execute the count query
    const totalCountResult = (await prisma.$queryRaw(
      Prisma.sql([countQuery, ...countParams])
    )) as Array<{ count: number }>;

    const totalActivities = totalCountResult[0]?.count || 0;

    // Calculate pagination details
    const totalPages = Math.ceil(totalActivities / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get unique action types for the filter
    const actionTypesQuery = `
      SELECT DISTINCT action FROM UserActivity ORDER BY action ASC
    `;

    const actionTypes = (await prisma.$queryRaw(Prisma.sql([actionTypesQuery]))) as Array<{
      action: string;
    }>;

    // Get counts by action type
    const actionCountsQuery = `
      SELECT action, COUNT(*) as count
      FROM UserActivity
      WHERE timestamp >= ?
      GROUP BY action
      ORDER BY count DESC
    `;

    const actionCounts = (await prisma.$queryRaw(
      Prisma.sql([actionCountsQuery, dateFrom.toISOString()])
    )) as ActionCount[];

    // Get unique users in the time period
    const uniqueUsersQuery = `
      SELECT COUNT(DISTINCT fid) as count
      FROM UserActivity
      WHERE timestamp >= ?
    `;

    const uniqueUsersResult = (await prisma.$queryRaw(
      Prisma.sql([uniqueUsersQuery, dateFrom.toISOString()])
    )) as Array<{ count: number }>;

    const uniqueUsersCount = uniqueUsersResult[0]?.count || 0;

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">User Activity</h1>
            <p className="text-muted-foreground">Monitor user interactions and behavior</p>
          </div>
          <div className="flex gap-4">
            <Link href={`/admin/${fid}`}>
              <Button variant="outline" className="flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Button className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <RefreshCcw className="w-4 h-4 mr-2 text-primary" />
                <div className="text-2xl font-bold">{totalActivities}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">In the past {daysFilter} days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unique Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <UserRound className="w-4 h-4 mr-2 text-primary" />
                <div className="text-2xl font-bold">{uniqueUsersCount}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active in the past {daysFilter} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Most Common Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2 text-primary" />
                <div className="text-2xl font-bold capitalize">
                  {actionCounts.length > 0 ? actionCounts[0].action : 'None'}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {actionCounts.length > 0 ? actionCounts[0].count : 0} occurrences
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Action Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Search className="w-4 h-4 mr-2 text-primary" />
                <div className="text-2xl font-bold">{actionTypes.length}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Different user interactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <form action={`/admin/${fid}/activity`} method="get">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <div>
                <label className="text-sm font-medium mb-1 block text-muted-foreground">
                  Time Period
                </label>
                <Select defaultValue={daysFilter.toString()} name="days">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 24 hours</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block text-muted-foreground">
                  Action Type
                </label>
                <Select defaultValue={actionFilter || 'all'} name="action">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {actionTypes.map((type: { action: string }) => (
                      <SelectItem key={type.action} value={type.action}>
                        {type.action.charAt(0).toUpperCase() + type.action.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button className="w-full md:w-auto" type="submit">
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Activity Table */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User FID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.length > 0 ? (
                  activities.map((activity: UserActivity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.fid}</TableCell>
                      <TableCell className="capitalize">{activity.action}</TableCell>
                      <TableCell>{activity.entityType || '-'}</TableCell>
                      <TableCell>{activity.entityId || '-'}</TableCell>
                      <TableCell>
                        {format(new Date(activity.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{activity.details || '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No activities found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={newPage => {
              const url = `/admin/${fid}/activity?page=${newPage}${actionFilter ? `&action=${actionFilter}` : ''}${daysFilter ? `&days=${daysFilter}` : ''}`;
              // Client-side will handle navigation with this component
            }}
            className="mt-6"
          />
        )}

        {/* Fallback pagination for server-side rendering */}
        {!totalPages || totalPages <= 1 ? null : (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {skip + 1}-{Math.min(skip + pageSize, totalActivities)} of {totalActivities}{' '}
              activities
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/${fid}/activity?page=${page - 1}${actionFilter ? `&action=${actionFilter}` : ''}${daysFilter ? `&days=${daysFilter}` : ''}`}
                aria-disabled={!hasPrevPage}
              >
                <Button variant="outline" disabled={!hasPrevPage}>
                  Previous
                </Button>
              </Link>
              <Link
                href={`/admin/${fid}/activity?page=${page + 1}${actionFilter ? `&action=${actionFilter}` : ''}${daysFilter ? `&days=${daysFilter}` : ''}`}
                aria-disabled={!hasNextPage}
              >
                <Button variant="outline" disabled={!hasNextPage}>
                  Next
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching activity data:', error);
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">User Activity</h1>
            <p className="text-muted-foreground">Monitor user interactions and behavior</p>
          </div>
          <Link href={`/admin/${fid}`}>
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Activity Data</h2>
            <p className="text-muted-foreground mb-4">
              There was a problem fetching the activity data. This could be due to database
              connection issues.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                // Client-side will handle refresh
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}
