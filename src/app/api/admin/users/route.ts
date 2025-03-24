import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-utils';
import { verifyAdminAccess, hasPermission } from '@/lib/admin-auth';
import { sub } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const admin = await verifyAdminAccess(user.fid);
    
    if (!admin || !hasPermission(admin, 'manageUsers')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Get query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search');
    const sort = url.searchParams.get('sort') || 'recent';
    const activity = url.searchParams.get('activity');
    
    // Build where conditions
    const where: any = {};
    
    // Handle search
    if (search) {
      const searchInt = parseInt(search);
      if (!isNaN(searchInt)) {
        // Search by FID if the search term is a number
        where.fid = searchInt;
      } else {
        // Search by username or display name
        where.OR = [
          { username: { contains: search } },
          { displayName: { contains: search } }
        ];
      }
    }
    
    // Handle activity filter
    if (activity === 'active') {
      // Active users - last login within 7 days
      where.lastLogin = {
        gte: sub(new Date(), { days: 7 })
      };
    } else if (activity === 'inactive') {
      // Inactive users - no login for 30+ days
      where.lastLogin = {
        lte: sub(new Date(), { days: 30 })
      };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Determine sort order
    let orderBy: any = { lastLogin: 'desc' };
    
    if (sort === 'streak') {
      // This requires a join with UserStreak, which we'll handle with includeUserStreaks below
    } else if (sort === 'votes') {
      // This also requires a join with UserStreak
    } else if (sort === 'joined') {
      orderBy = { createdAt: 'desc' };
    }
    
    // Fetch users
    const users = await prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });
    
    // Get total count
    const totalCount = await prisma.user.count({ where });
    
    // Get user streaks for the fetched users
    const userFids = users.map(user => user.fid);
    const userStreaks = await prisma.userStreak.findMany({
      where: {
        fid: {
          in: userFids
        }
      }
    });
    
    // Combine user data with streaks
    const usersWithStreaks = users.map(user => {
      const streak = userStreaks.find(s => s.fid === user.fid);
      return {
        ...user,
        streak: streak || null
      };
    });
    
    // Apply streak/votes sorting if needed (client-side sorting)
    const sortedUsers = [...usersWithStreaks];
    
    if (sort === 'streak') {
      sortedUsers.sort((a, b) => {
        const streakA = a.streak?.currentStreak || 0;
        const streakB = b.streak?.currentStreak || 0;
        return streakB - streakA;
      });
    } else if (sort === 'votes') {
      sortedUsers.sort((a, b) => {
        const votesA = a.streak?.totalVotes || 0;
        const votesB = b.streak?.totalVotes || 0;
        return votesB - votesA;
      });
    }
    
    return NextResponse.json({
      users: sortedUsers,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
} 