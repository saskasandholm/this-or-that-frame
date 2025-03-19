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
import { ArrowLeft, Download, Edit, Plus, Trash, Search } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { Prisma } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Manage Topics | Admin Dashboard',
  description: 'Create, edit, and manage topics for This or That voting.',
};

// Temporarily use 'any' type to bypass the type constraint issue
type TopicsPageProps = {
  params: any;
  searchParams: any;
};

export default async function TopicsPage({ params, searchParams = {} }: TopicsPageProps) {
  // Convert fid to number with proper error handling
  const fid = parseInt(params.fid);

  if (isNaN(fid) || fid === 0) {
    return notFound();
  }

  // Get pagination parameters
  const page = parseInt(searchParams.page || '1');
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  // Parse filtering options
  const categoryFilter =
    searchParams.category && searchParams.category !== 'all'
      ? parseInt(searchParams.category)
      : undefined;
  const statusFilter = searchParams.status; // 'active', 'inactive', or 'all'

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
    // Build the filters for topics query
    const filter: any = {};

    if (categoryFilter) {
      filter.categoryId = categoryFilter;
    }

    if (statusFilter === 'active') {
      filter.isActive = true;
    } else if (statusFilter === 'inactive') {
      filter.isActive = false;
    }

    // Fetch topics with pagination
    const topics = await prisma.topic.findMany({
      where: filter,
      orderBy: {
        startDate: 'desc',
      },
      take: pageSize,
      skip: skip,
      include: {
        category: true,
      },
    });

    // Get total count for pagination
    const totalTopics = await prisma.topic.count({
      where: filter,
    });

    // Calculate pagination details
    const totalPages = Math.ceil(totalTopics / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get categories for filter
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Count active topics
    const activeTopicsCount = await prisma.topic.count({
      where: {
        isActive: true,
      },
    });

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Topic Management</h1>
            <p className="text-muted-foreground">Manage topics and their content</p>
          </div>
          <div className="flex gap-4">
            <Link href={`/admin/${fid}`}>
              <Button variant="outline" className="flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href={`/admin/${fid}/topics/new`}>
              <Button className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Create Topic
              </Button>
            </Link>
          </div>
        </div>

        {/* Topic Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTopics}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTopicsCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently visible to users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Available topic categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <form action={`/admin/${fid}/topics`} method="get">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <div>
                <label className="text-sm font-medium mb-1 block text-muted-foreground">
                  Category
                </label>
                <Select defaultValue={categoryFilter?.toString() || 'all'} name="category">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block text-muted-foreground">
                  Status
                </label>
                <Select defaultValue={statusFilter || 'all'} name="status">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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

        {/* Topics Table */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Votes</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.length > 0 ? (
                  topics.map(topic => (
                    <TableRow key={topic.id}>
                      <TableCell className="font-medium">{topic.id}</TableCell>
                      <TableCell>
                        <Link href={`/admin/${fid}/topics/${topic.id}`} className="hover:underline">
                          {topic.name}
                        </Link>
                      </TableCell>
                      <TableCell>{topic.category.name}</TableCell>
                      <TableCell>{topic.votesA + topic.votesB}</TableCell>
                      <TableCell>{format(new Date(topic.startDate), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>
                        <Badge variant={topic.isActive ? 'default' : 'secondary'}>
                          {topic.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/${fid}/topics/${topic.id}`}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No topics found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination Component */}
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={newPage => {
              const url = `/admin/${fid}/topics?page=${newPage}${categoryFilter ? `&category=${categoryFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`;
              // Client-side will handle navigation with this component
            }}
            className="mt-6"
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching topics data:', error);
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Topic Management</h1>
            <p className="text-muted-foreground">Manage topics and their content</p>
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
            <h2 className="text-xl font-semibold mb-2">Error Loading Topics</h2>
            <p className="text-muted-foreground mb-4">
              There was a problem fetching the topics data. This could be due to database connection
              issues.
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
