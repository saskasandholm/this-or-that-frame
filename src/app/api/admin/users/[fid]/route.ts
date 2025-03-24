import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-utils';
import { verifyAdminAccess, hasPermission } from '@/lib/admin-auth';

// GET handler for fetching a specific user's details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const resolvedParams = await params;
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const admin = await verifyAdminAccess(user.fid);
    
    if (!admin || !hasPermission(admin, 'manageUsers')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    const targetFid = parseInt(resolvedParams.fid);
    
    if (isNaN(targetFid)) {
      return NextResponse.json({ error: 'Invalid FID' }, { status: 400 });
    }
    
    // Get user
    const targetUser = await prisma.user.findUnique({
      where: { fid: targetFid },
    });
    
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get user streak
    const streak = await prisma.userStreak.findUnique({
      where: { fid: targetFid },
      include: {
        achievements: {
          include: {
            achievement: true
          }
        }
      }
    });
    
    // Get recent votes
    const recentVotes = await prisma.vote.findMany({
      where: { fid: targetFid },
      orderBy: { timestamp: 'desc' },
      take: 10,
      include: {
        topic: {
          include: {
            category: true
          }
        }
      }
    });
    
    // Get activity
    const activity = await prisma.userActivity.findMany({
      where: { fid: targetFid },
      orderBy: { timestamp: 'desc' },
      take: 20
    });
    
    // Get submission statistics
    const submissionStats = await prisma.topicSubmission.groupBy({
      by: ['status'],
      where: { fid: targetFid },
      _count: {
        id: true
      }
    });
    
    const submissions = {
      total: submissionStats.reduce((total, stat) => total + stat._count.id, 0),
      approved: submissionStats.find(stat => stat.status === 'approved')?._count.id || 0,
      pending: submissionStats.find(stat => stat.status === 'pending')?._count.id || 0,
      rejected: submissionStats.find(stat => stat.status === 'rejected')?._count.id || 0
    };
    
    return NextResponse.json({
      user: targetUser,
      streak,
      recentVotes,
      activity,
      submissions
    });
    
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
  }
} 