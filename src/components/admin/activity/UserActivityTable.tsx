import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
  Calendar,
  Activity,
  User,
  Hash,
  Clock,
} from 'lucide-react';

interface UserActivity {
  id: number;
  fid: number;
  action: string;
  details: string | null;
  entityType: string | null;
  entityId: number | null;
  timestamp: string;
  ipAddress: string | null;
  userAgent: string | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UserActivityTableProps {
  adminFid: number;
  className?: string;
}

const UserActivityTable: React.FC<UserActivityTableProps> = ({ adminFid, className = '' }) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [userFid, setUserFid] = useState<string>('');
  const [actionType, setActionType] = useState<string>('');
  const [entityType, setEntityType] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});

  // Load activities when component mounts or filters change
  useEffect(() => {
    fetchActivities();
  }, [pagination.page, pagination.limit, adminFid]);

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams({
        adminFid: adminFid.toString(),
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      // Add optional filters if set
      if (userFid) params.append('fid', userFid);
      if (actionType) params.append('action', actionType);
      if (entityType) params.append('entityType', entityType);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      const response = await fetch(`/api/user-activity?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user activity');
      }

      setActivities(data.activities || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: string) => {
    setPagination(prev => ({ ...prev, limit: parseInt(newLimit), page: 1 }));
  };

  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchActivities();
  };

  const handleResetFilters = () => {
    setUserFid('');
    setActionType('');
    setEntityType('');
    setDateRange({});
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchActivities();
  };

  // Format timestamp to local date and time
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Parse and format JSON details
  const formatDetails = (details: string | null) => {
    if (!details) return '-';

    try {
      const parsed = JSON.parse(details);
      return Object.entries(parsed)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    } catch {
      return details;
    }
  };

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
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
          <Skeleton className="h-4 w-32" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-32" />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            User Activity
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchActivities()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Filters Section */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">User FID</label>
            <div className="relative flex items-center">
              <div className="absolute left-2 text-gray-500">
                <User className="h-4 w-4" />
              </div>
              <Input
                placeholder="User FID"
                value={userFid}
                onChange={e => setUserFid(e.target.value)}
                className="w-full pl-8"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Action Type</label>
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Actions</SelectItem>
                <SelectItem value="vote">Vote</SelectItem>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="share">Share</SelectItem>
                <SelectItem value="submit">Submit</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Entity Type</label>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Entities</SelectItem>
                <SelectItem value="topic">Topic</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="frame">Frame</SelectItem>
                <SelectItem value="submission">Submission</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2">
            <Button variant="secondary" className="flex-1" onClick={handleApplyFilters}>
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleResetFilters}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Activity Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-1" />
                    ID
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    FID
                  </div>
                </TableHead>
                <TableHead className="w-[150px]">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-1" />
                    Action
                  </div>
                </TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-[120px]">Entity Type</TableHead>
                <TableHead className="w-[80px]">Entity ID</TableHead>
                <TableHead className="w-[180px]">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Timestamp
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                renderSkeletons()
              ) : activities.length > 0 ? (
                activities.map(activity => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-mono">{activity.id}</TableCell>
                    <TableCell>{activity.fid}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getActionColor(activity.action)}`}
                      >
                        {activity.action}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {formatDetails(activity.details)}
                    </TableCell>
                    <TableCell>{activity.entityType || '-'}</TableCell>
                    <TableCell>{activity.entityId || '-'}</TableCell>
                    <TableCell>{formatTimestamp(activity.timestamp)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No activity records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Showing {activities.length} of {pagination.totalCount} entries
            </span>
            <Select value={pagination.limit.toString()} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder={pagination.limit.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get action-specific styling
function getActionColor(action: string): string {
  switch (action.toLowerCase()) {
    case 'vote':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    case 'view':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    case 'share':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
    case 'submit':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
    case 'login':
      return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300';
    case 'admin':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  }
}

export default UserActivityTable;
