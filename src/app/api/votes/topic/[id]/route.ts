import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET handler - Returns vote counts for a specific topic
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const topicId = parseInt(context.params.id);

    if (isNaN(topicId)) {
      return NextResponse.json({ error: 'Invalid topic ID' }, { status: 400 });
    }

    // Get the topic to verify it exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Return the vote counts
    return NextResponse.json({
      topicId,
      votesA: topic.votesA,
      votesB: topic.votesB,
      totalVotes: topic.votesA + topic.votesB,
    });
  } catch (error) {
    console.error('Error fetching topic votes:', error);
    return NextResponse.json(
      { error: 'Error fetching topic votes' },
      { status: 500 }
    );
  }
} 