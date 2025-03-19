import { prisma } from './prisma';
import { Topic } from '@prisma/client';

/**
 * Get the current active topic from the database
 * Returns the most recent active topic or null if none found
 * Note: This uses PrismaClient and should only be used in server components
 */
export async function getCurrentTopic() {
  const now = new Date();

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

  return currentTopic;
}

/**
 * Edge runtime compatible version that returns a simplified topic object
 * This avoids using PrismaClient in edge runtime
 */
export async function getCurrentTopicForEdge() {
  // Use fetch to call an API endpoint that can safely use Prisma
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/topics/current`,
      {
        next: { revalidate: 60 }, // Revalidate cache every minute
      }
    );

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching current topic for edge:', error);
    return null;
  }
}

/**
 * Get a specific topic by ID
 */
export async function getTopicById(id: number) {
  return prisma.topic.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
}

/**
 * Get all topics, optionally filtering by active status
 */
export async function getAllTopics(activeOnly = false) {
  return prisma.topic.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    include: {
      category: true,
    },
    orderBy: {
      startDate: 'desc',
    },
  });
}

/**
 * Topic with vote count properties
 */
export interface TopicWithVotes extends Omit<Topic, 'votesA' | 'votesB'> {
  votesA: number;
  votesB: number;
}

/**
 * Calculate voting statistics for a topic
 */
export async function getTopicStats(topicId: number) {
  const topic = (await prisma.topic.findUnique({
    where: { id: topicId },
  })) as TopicWithVotes | null;

  if (!topic) return null;

  const totalVotes = (topic.votesA || 0) + (topic.votesB || 0);

  return {
    totalVotes,
    votesA: topic.votesA || 0,
    votesB: topic.votesB || 0,
    percentageA: totalVotes ? Math.round(((topic.votesA || 0) * 100) / totalVotes) : 0,
    percentageB: totalVotes ? Math.round(((topic.votesB || 0) * 100) / totalVotes) : 0,
  };
}
