import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Use Node.js runtime for Prisma
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const topicId = url.searchParams.get('topicId');
    
    let topic;
    
    if (topicId) {
      topic = await prisma.topic.findUnique({
        where: { id: parseInt(topicId) },
      });
    } else {
      topic = await prisma.topic.findFirst({
        where: {
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
        orderBy: { startDate: 'desc' },
      });
    }
    
    if (!topic) {
      return NextResponse.json({
        title: 'This or That',
        optionA: 'Option A',
        optionB: 'Option B',
      });
    }
    
    return NextResponse.json({
      title: topic.name,
      optionA: topic.optionA,
      optionB: topic.optionB,
    });
  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json({ error: 'Error fetching topic' }, { status: 500 });
  }
}
