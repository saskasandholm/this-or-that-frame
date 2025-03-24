/**
 * Database utility functions for server components
 * This file provides a safe interface for interacting with the database from server components
 * 
 * Important: Only import this file in server components or API routes!
 */
import { Topic, Category, Vote, Achievement, UserStreak } from '@prisma/client';
import { cache } from 'react';
import { PrismaClient } from '@prisma/client';
import { prisma, safeDbOperation } from './prisma';
import type { CategoryWithTopicsCount } from '@/types/models';

/**
 * Get the current active topic
 * @returns {Promise<Topic | null>} The current active topic or null if none found
 */
export const getCurrentTopic = cache(async (): Promise<Topic | null> => {
  try {
    const topic = await prisma.topic.findFirst({
      where: {
        isActive: true,
        startDate: {
          lte: new Date(),
        },
        OR: [
          {
            endDate: {
              gte: new Date(),
            },
          },
          {
            endDate: null,
          },
        ],
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return topic;
  } catch (error) {
    console.error('Failed to fetch current topic:', error);
    return null;
  }
});

/**
 * Get all categories
 * @returns {Promise<Category[]>} List of all categories
 */
export async function getCategories(): Promise<Category[]> {
  return safeDbOperation(
    async () => {
      return prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });
    },
    [],
    'getCategories'
  );
}

/**
 * Submit a vote for a topic
 * @param {number} topicId - The ID of the topic
 * @param {number} fid - The Farcaster ID of the user
 * @param {string} choice - The choice ('A' or 'B')
 * @returns {Promise<{ success: boolean, message?: string }>} Result of the vote operation
 */
export async function submitVote(
  topicId: number,
  fid: number,
  choice: string
): Promise<{ success: boolean; message?: string }> {
  return safeDbOperation(
    async () => {
      // First check if vote already exists
      const existingVote = await prisma.vote.findUnique({
        where: {
          topicId_fid: {
            topicId,
            fid,
          },
        },
      });

      if (existingVote) {
        return { 
          success: false, 
          message: 'You have already voted on this topic' 
        };
      }

      // Use a transaction to ensure both the vote and topic update succeed or fail together
      return prisma.$transaction(async (tx) => {
        // Get current user streak data
        const currentUserStreak = await tx.userStreak.findUnique({
          where: { fid }
        });
        
        const newStreakCount = (currentUserStreak?.currentStreak || 0) + 1;
        const newLongestStreak = Math.max(newStreakCount, currentUserStreak?.longestStreak || 0);
        
        // Create or update user streak
        const userStreak = await tx.userStreak.upsert({
          where: { fid },
          update: {
            currentStreak: newStreakCount,
            longestStreak: newLongestStreak,
            totalVotes: { increment: 1 },
            lastVoteDate: new Date(),
          },
          create: {
            fid,
            currentStreak: 1,
            longestStreak: 1,
            totalVotes: 1,
            lastVoteDate: new Date(),
          },
        });

        // Create the vote
        await tx.vote.create({
          data: {
            topicId,
            fid,
            choice,
          },
        });

        // Update topic vote count
        await tx.topic.update({
          where: { id: topicId },
          data: {
            ...(choice === 'A' 
              ? { votesA: { increment: 1 } } 
              : { votesB: { increment: 1 } }),
          },
        });

        return { success: true };
      });
    },
    { success: false, message: 'Failed to submit vote due to a server error' },
    'submitVote'
  );
}

export default {
  getCurrentTopic,
  getCategories,
  submitVote
}; 