import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  Edit,
  Trash,
  Check,
  X,
  EyeOff,
  Eye,
  BarChart,
  Filter,
  RefreshCw,
  MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';

// Type interfaces
interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface Topic {
  id: number;
  name: string;
  categoryId: number;
  category: Category;
  optionA: string;
  optionB: string;
  imageA: string | null;
  imageB: string | null;
  votesA: number;
  votesB: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    votes: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PaginatedTopicsTableProps {
  adminFid: number;
  initialTopics: Topic[];
  initialTotalCount: number;
  categories: Category[];
  statusFilter: string;
  className?: string;
}

const PaginatedTopicsTable: React.FC<PaginatedTopicsTableProps> = ({
  adminFid,
  initialTopics,
  initialTotalCount,
  categories,
  statusFilter,
  className = '',
}) => {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalCount: initialTotalCount,
    totalPages: Math.ceil(initialTotalCount / 10),
    hasNextPage: initialTotalCount > 10,
    hasPrevPage: false,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load topics with current filters and pagination
  const loadTopics = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query string
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: sortField,
        order: sortOrder,
      });

      // Add filters
      if (statusFilter === 'active') {
        params.append('status', 'active');
      } else if (statusFilter === 'upcoming') {
        params.append('status', 'upcoming');
      } else if (statusFilter === 'past') {
        params.append('status', 'past');
      }

      if (categoryFilter) {
        params.append('category', categoryFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      // Fetch topics
      const response = await fetch(`/api/topics/list?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load topics');
      }

      setTopics(data.topics || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading topics:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load topics when filters change
  useEffect(() => {
    if (
      statusFilter !== 'all' ||
      categoryFilter ||
      searchTerm ||
      sortField !== 'startDate' ||
      sortOrder !== 'desc'
    ) {
      loadTopics();
    }
  }, [
    pagination.page,
    pagination.limit,
    statusFilter,
    categoryFilter,
    searchTerm,
    sortField,
    sortOrder,
  ]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle limit change
  const handleLimitChange = (newLimit: string) => {
    setPagination(prev => ({ ...prev, limit: parseInt(newLimit), page: 1 }));
  };

  // Handle topic activation toggle
  const handleToggleActive = async (topicId: number, currentState: boolean) => {
    try {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminFid,
          isActive: !currentState,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update topic');
      }

      // Update local state
      setTopics(prev =>
        prev.map(topic => (topic.id === topicId ? { ...topic, isActive: !currentState } : topic))
      );
    } catch (error) {
      console.error('Error updating topic:', error);
      setError(error instanceof Error ? error.message : 'Failed to update topic');
    }
  };

  // Handle topic deletion
  const handleDeleteTopic = async (topicId: number) => {
    if (!confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/topics/${topicId}?adminFid=${adminFid}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete topic');
      }

      // Update local state
      setTopics(prev => prev.filter(topic => topic.id !== topicId));
      setPagination(prev => ({
        ...prev,
        totalCount: prev.totalCount - 1,
        totalPages: Math.ceil((prev.totalCount - 1) / prev.limit),
      }));
    } catch (error) {
      console.error('Error deleting topic:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete topic');
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get status badge color
  const getStatusBadge = (topic: Topic) => {
    const now = new Date();
    const startDate = new Date(topic.startDate);
    const endDate = topic.endDate ? new Date(topic.endDate) : null;

    if (!topic.isActive) {
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
        >
          Inactive
        </Badge>
      );
    }

    if (startDate > now) {
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
        >
          Upcoming
        </Badge>
      );
    }

    if (endDate && endDate < now) {
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
        >
          Ended
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
      >
        Active
      </Badge>
    );
  };

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array.from({ length: pagination.limit }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell>
          <Skeleton className="h-4 w-8" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-32" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-16" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-16" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-16" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-8 w-28" />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Topics {statusFilter !== 'all' ? `(${statusFilter})` : ''}</span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => loadTopics()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Search and filter controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-full sm:w-1/3">
            <Input
              placeholder="Search topics..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="w-full sm:w-1/3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-1/3">
            <Select
              value={`${sortField}:${sortOrder}`}
              onValueChange={value => {
                const [field, order] = value.split(':');
                setSortField(field);
                setSortOrder(order);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="startDate:desc">Newest First</SelectItem>
                <SelectItem value="startDate:asc">Oldest First</SelectItem>
                <SelectItem value="name:asc">Name (A-Z)</SelectItem>
                <SelectItem value="name:desc">Name (Z-A)</SelectItem>
                <SelectItem value="votesA:desc">Most Votes A</SelectItem>
                <SelectItem value="votesB:desc">Most Votes B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Topics table */}
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[120px]">Category</TableHead>
                <TableHead className="w-[80px] text-right">Votes A</TableHead>
                <TableHead className="w-[80px] text-right">Votes B</TableHead>
                <TableHead className="w-[100px] text-right">Total Votes</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[180px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                renderSkeletons()
              ) : topics.length > 0 ? (
                topics.map(topic => (
                  <TableRow key={topic.id}>
                    <TableCell className="font-mono">{topic.id}</TableCell>
                    <TableCell className="font-medium">{topic.name}</TableCell>
                    <TableCell>{topic.category.name}</TableCell>
                    <TableCell className="text-right">{topic.votesA}</TableCell>
                    <TableCell className="text-right">{topic.votesB}</TableCell>
                    <TableCell className="text-right">{topic._count.votes}</TableCell>
                    <TableCell>{getStatusBadge(topic)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end space-x-2">
                        <Link href={`/admin/${adminFid}/topics/${topic.id}`}>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleActive(topic.id, topic.isActive)}
                        >
                          {topic.isActive ? (
                            <EyeOff className="h-4 w-4 text-amber-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500"
                          onClick={() => handleDeleteTopic(topic.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No topics found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Pagination controls */}
      <CardFooter>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Showing {topics.length} of {pagination.totalCount} topics
            </span>
            <Select value={pagination.limit.toString()} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder={pagination.limit.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronFirst className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={!pagination.hasNextPage}
            >
              <ChevronLast className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PaginatedTopicsTable;
