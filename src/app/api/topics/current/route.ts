import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    // Get the current date
    const now = new Date();

    // Find the active topic for today
    const currentTopic = await prisma.topic.findFirst({
      where: {
        isActive: true,
        startDate: {
          lte: now,
        },
        OR: [
          {
            endDate: null,
          },
          {
            endDate: {
              gte: now,
            },
          },
        ],
      },
      include: {
        category: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    if (!currentTopic) {
      return NextResponse.json({ message: 'No active topic found' }, { status: 404 });
    }

    return NextResponse.json(currentTopic);
  } catch (error) {
    console.error('Error fetching current topic:', error);
    return NextResponse.json({ error: 'Failed to fetch current topic' }, { status: 500 });
  }
}
