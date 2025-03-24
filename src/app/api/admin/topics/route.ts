import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-utils';
import { verifyAdminAccess, hasPermission } from '@/lib/admin-auth';

// GET handler for fetching topics with pagination
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const admin = await verifyAdminAccess(user.fid);
    
    if (!admin || !hasPermission(admin, 'manageTopics')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Get query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status');
    const categoryId = url.searchParams.get('categoryId');
    
    // Build filter conditions
    const where: any = {};
    
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }
    
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch topics
    const [topics, totalCount] = await Promise.all([
      prisma.topic.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.topic.count({ where }),
    ]);
    
    return NextResponse.json({
      topics,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    });
    
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

// POST handler for creating new topics
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const admin = await verifyAdminAccess(user.fid);
    
    if (!admin || !hasPermission(admin, 'manageTopics')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    const requiredFields = ['name', 'categoryId', 'optionA', 'optionB', 'startDate'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Create the topic
    const topic = await prisma.topic.create({
      data: {
        name: body.name,
        categoryId: Number(body.categoryId),
        optionA: body.optionA,
        optionB: body.optionB,
        imageA: body.imageA || null,
        imageB: body.imageB || null,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        isActive: body.isActive ?? true,
      },
    });
    
    // Log activity
    await prisma.userActivity.create({
      data: {
        fid: user.fid,
        action: 'CREATE_TOPIC',
        entityType: 'Topic',
        entityId: topic.id,
        details: `Created topic: ${topic.name}`,
      },
    });
    
    return NextResponse.json({ topic }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
} 