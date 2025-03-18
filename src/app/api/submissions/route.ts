import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/utils';

/**
 * Submit a new topic suggestion
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, optionA, optionB, categoryId, fid } = body;

    if (!name || !optionA || !optionB || !categoryId || !fid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if the user exists in UserStreak, or create it
    let userStreak = await prisma.userStreak.findUnique({
      where: { fid },
    });

    if (!userStreak) {
      userStreak = await prisma.userStreak.create({
        data: { fid },
      });
    }

    // Check if the category exists
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Create the topic submission
    const submission = await prisma.topicSubmission.create({
      data: {
        name,
        optionA,
        optionB,
        categoryId: parseInt(categoryId),
        fid,
        status: 'pending',
      },
    });

    return NextResponse.json({
      message: 'Topic submission created successfully',
      submission,
    });
  } catch (error) {
    console.error('Error creating topic submission:', error);
    return NextResponse.json({ error: 'Failed to create topic submission' }, { status: 500 });
  }
}

/**
 * Get all topic submissions with optional filtering
 * Requires admin privileges
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate FID for admin check
    if (!fid) {
      return NextResponse.json({ error: 'Missing FID parameter' }, { status: 400 });
    }

    // Check if user is an admin
    const adminStatus = await isAdmin(parseInt(fid));
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Build query filters
    const filters: any = {};
    if (status) {
      filters.status = status;
    }

    // Fetch submissions with pagination
    const submissions = await prisma.topicSubmission.findMany({
      where: filters,
      include: {
        category: {
          select: {
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.topicSubmission.count({
      where: filters,
    });

    return NextResponse.json({
      submissions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching topic submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch topic submissions' }, { status: 500 });
  }
}
