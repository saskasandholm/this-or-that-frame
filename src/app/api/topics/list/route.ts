import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ValidationError, getQueryParam } from '@/app/api/topics/validation';

/**
 * GET /api/topics/list
 *
 * Query parameters:
 * - page: Page number (default 1)
 * - limit: Items per page (default 10, max 50)
 * - status: Filter by status (optional, 'active', 'inactive', 'all')
 * - category: Filter by category ID (optional)
 * - sort: Sort field (default 'startDate')
 * - order: Sort order (default 'desc')
 */
export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const page = parseInt(getQueryParam(request, 'page') || '1');
    let limit = parseInt(getQueryParam(request, 'limit') || '10');
    const status = getQueryParam(request, 'status');
    const category = getQueryParam(request, 'category');
    const sort = getQueryParam(request, 'sort') || 'startDate';
    const order = getQueryParam(request, 'order') || 'desc';

    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      throw new ValidationError('Page must be a positive integer', 400);
    }

    if (isNaN(limit) || limit < 1) {
      throw new ValidationError('Limit must be a positive integer', 400);
    }

    // Cap limit to prevent excessive requests
    limit = Math.min(limit, 50);

    // Build filter conditions
    const where: any = {};

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    if (category) {
      const categoryId = parseInt(category);
      if (!isNaN(categoryId)) {
        where.categoryId = categoryId;
      }
    }

    // Calculate pagination values
    const skip = (page - 1) * limit;

    // Validate sort field to prevent SQL injection
    const validSortFields = [
      'id',
      'name',
      'startDate',
      'endDate',
      'createdAt',
      'updatedAt',
      'votesA',
      'votesB',
    ];
    if (!validSortFields.includes(sort)) {
      throw new ValidationError(`Invalid sort field: ${sort}`, 400);
    }

    // Validate sort order
    if (order !== 'asc' && order !== 'desc') {
      throw new ValidationError('Sort order must be "asc" or "desc"', 400);
    }

    // Build sort object
    const orderBy: any = {};
    orderBy[sort] = order;

    // Execute count query first
    const totalCount = await prisma.topic.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    // Execute paginated query
    const topics = await prisma.topic.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: { votes: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Calculate total votes for each topic
    const topicsWithStats = topics.map(topic => {
      const totalVotes = (topic.votesA || 0) + (topic.votesB || 0);
      const percentA = totalVotes ? Math.round((topic.votesA * 100) / totalVotes) : 0;
      const percentB = totalVotes ? Math.round((topic.votesB * 100) / totalVotes) : 0;

      return {
        ...topic,
        stats: {
          totalVotes,
          percentA,
          percentB,
          voteCount: topic._count.votes,
        },
      };
    });

    // Return response with pagination metadata
    return NextResponse.json({
      topics: topicsWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching topics:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}
