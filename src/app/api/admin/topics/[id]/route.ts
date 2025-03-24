import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth-utils';
import { verifyAdminAccess, hasPermission } from '@/lib/admin-auth';

// GET handler for fetching a single topic
export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const admin = await verifyAdminAccess(user.fid);
    
    if (!admin || !hasPermission(admin, 'manageTopics')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    const topicId = parseInt(resolvedParams.id);
    
    if (isNaN(topicId)) {
      return NextResponse.json({ error: 'Invalid topic ID' }, { status: 400 });
    }
    
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: { category: true },
    });
    
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }
    
    return NextResponse.json({ topic });
    
  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json({ error: 'Failed to fetch topic' }, { status: 500 });
  }
}

// PATCH handler for updating a topic
export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const admin = await verifyAdminAccess(user.fid);
    
    if (!admin || !hasPermission(admin, 'manageTopics')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    const topicId = parseInt(resolvedParams.id);
    
    if (isNaN(topicId)) {
      return NextResponse.json({ error: 'Invalid topic ID' }, { status: 400 });
    }
    
    // Check if topic exists
    const existingTopic = await prisma.topic.findUnique({
      where: { id: topicId },
    });
    
    if (!existingTopic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }
    
    // Parse request body
    const body = await req.json();
    
    // Update the topic
    const topic = await prisma.topic.update({
      where: { id: topicId },
      data: {
        name: body.name,
        categoryId: Number(body.categoryId),
        optionA: body.optionA,
        optionB: body.optionB,
        imageA: body.imageA || null,
        imageB: body.imageB || null,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        isActive: body.isActive ?? existingTopic.isActive,
      },
    });
    
    // Log activity
    await prisma.userActivity.create({
      data: {
        fid: user.fid,
        action: 'UPDATE_TOPIC',
        entityType: 'Topic',
        entityId: topic.id,
        details: `Updated topic: ${topic.name}`,
      },
    });
    
    return NextResponse.json({ topic });
    
  } catch (error) {
    console.error('Error updating topic:', error);
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
  }
}

// DELETE handler for deleting a topic
export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const admin = await verifyAdminAccess(user.fid);
    
    if (!admin || !hasPermission(admin, 'manageTopics')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    const topicId = parseInt(resolvedParams.id);
    
    if (isNaN(topicId)) {
      return NextResponse.json({ error: 'Invalid topic ID' }, { status: 400 });
    }
    
    // Check if topic exists
    const existingTopic = await prisma.topic.findUnique({
      where: { id: topicId },
    });
    
    if (!existingTopic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }
    
    // Check if there are votes for this topic
    const votesCount = await prisma.vote.count({
      where: { topicId },
    });
    
    // If there are votes, prevent deletion and recommend deactivation instead
    if (votesCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete a topic with existing votes', 
          message: 'This topic has votes. Please deactivate it instead of deleting.',
          votesCount 
        }, 
        { status: 400 }
      );
    }
    
    // Delete the topic
    await prisma.topic.delete({
      where: { id: topicId },
    });
    
    // Log activity
    await prisma.userActivity.create({
      data: {
        fid: user.fid,
        action: 'DELETE_TOPIC',
        entityType: 'Topic',
        entityId: topicId,
        details: `Deleted topic: ${existingTopic.name}`,
      },
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Topic deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
  }
} 