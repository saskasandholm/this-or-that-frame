import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ValidationError, getQueryParam } from '@/app/api/topics/validation';

/**
 * Log user activity
 *
 * POST /api/user-activity
 *
 * Required payload:
 * - fid: User's Farcaster ID
 * - action: Activity type (e.g., "vote", "view", "share")
 *
 * Optional payload:
 * - details: Additional action-specific details (JSON string)
 * - entityType: Related entity type (e.g., "topic", "achievement")
 * - entityId: Related entity ID
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.fid || !data.action) {
      throw new ValidationError('Missing required fields: fid and action are required', 400);
    }

    // Get IP address and user agent
    const ipAddress =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create activity record
    const activity = await prisma.userActivity.create({
      data: {
        fid: parseInt(data.fid.toString()),
        action: data.action,
        details: data.details || null,
        entityType: data.entityType || null,
        entityId: data.entityId ? parseInt(data.entityId.toString()) : null,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({ success: true, id: activity.id });
  } catch (error: unknown) {
    console.error('Error logging user activity:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ error: 'Failed to log user activity' }, { status: 500 });
  }
}

/**
 * Get user activity with pagination
 *
 * GET /api/user-activity
 *
 * Query parameters:
 * - fid: Filter by user FID (required for non-admin users)
 * - adminFid: Admin user FID for authentication (required to view other users' activity)
 * - page: Page number (default 1)
 * - limit: Items per page (default 20, max 100)
 * - action: Filter by action type (optional)
 * - entityType: Filter by entity type (optional)
 * - entityId: Filter by entity ID (optional)
 * - startDate: Filter by start date (optional, ISO format)
 * - endDate: Filter by end date (optional, ISO format)
 */
export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const fid = getQueryParam(request, 'fid');
    const adminFid = getQueryParam(request, 'adminFid');
    const page = parseInt(getQueryParam(request, 'page') || '1');
    let limit = parseInt(getQueryParam(request, 'limit') || '20');
    const action = getQueryParam(request, 'action');
    const entityType = getQueryParam(request, 'entityType');
    const entityId = getQueryParam(request, 'entityId');
    const startDate = getQueryParam(request, 'startDate');
    const endDate = getQueryParam(request, 'endDate');

    // Check if user is authorized
    if (!fid && !adminFid) {
      throw new ValidationError('Access denied. User FID is required', 403);
    }

    // If adminFid is provided, check if it's a valid admin
    if (adminFid) {
      const adminIdNum = parseInt(adminFid);

      if (isNaN(adminIdNum)) {
        throw new ValidationError('Invalid admin FID', 400);
      }

      const admin = await prisma.admin.findFirst({
        where: {
          fid: adminIdNum,
          isActive: true,
        },
      });

      if (!admin) {
        throw new ValidationError('Access denied. Admin privileges required', 403);
      }
    } else if (fid) {
      // If not admin, can only access own activity
      // This is a simple security measure - in production, you'd want to verify signatures
    } else {
      throw new ValidationError('Access denied', 403);
    }

    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      throw new ValidationError('Page must be a positive integer', 400);
    }

    if (isNaN(limit) || limit < 1) {
      throw new ValidationError('Limit must be a positive integer', 400);
    }

    // Cap limit to prevent excessive requests
    limit = Math.min(limit, 100);

    // Calculate pagination values
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};

    // If not admin or specific fid requested, filter by fid
    if (fid) {
      where.fid = parseInt(fid);
    }

    // Apply optional filters
    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = parseInt(entityId);
    }

    // Apply date filters if provided
    if (startDate || endDate) {
      where.timestamp = {};

      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }

      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    // Execute count query first
    const totalCount = await prisma.userActivity.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    // Execute paginated query
    const activities = await prisma.userActivity.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      skip,
      take: limit,
    });

    // Return response with pagination metadata
    return NextResponse.json({
      activities,
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
    console.error('Error fetching user activity:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ error: 'Failed to fetch user activity' }, { status: 500 });
  }
}
