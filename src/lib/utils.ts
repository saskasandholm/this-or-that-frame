import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { prisma } from '@/lib/prisma';

/**
 * Updates a user's streak when they vote
 * @param fid The Farcaster ID of the user
 * @returns Promise<void>
 */
export async function updateUserStreak(fid: string | number): Promise<void> {
  try {
    // Get current user streak data or create if it doesn't exist
    const existingStreak = await prisma.userStreak.findUnique({
      where: { fid: Number(fid) },
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!existingStreak) {
      // First time voter - create new streak record
      await prisma.userStreak.create({
        data: {
          fid: Number(fid),
          currentStreak: 1,
          longestStreak: 1,
          lastVoteDate: today,
          totalVotes: 1,
        },
      });
      return;
    }

    // Get the date of the last vote
    const lastVoteDate = new Date(existingStreak.lastVoteDate);
    const lastVoteDay = new Date(
      lastVoteDate.getFullYear(),
      lastVoteDate.getMonth(),
      lastVoteDate.getDate()
    );

    // Calculate the difference in days
    const diffTime = today.getTime() - lastVoteDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Update streak based on time since last vote
    let currentStreak = existingStreak.currentStreak;
    let longestStreak = existingStreak.longestStreak;

    if (diffDays === 0) {
      // Already voted today, just update the vote count
      await prisma.userStreak.update({
        where: { fid: Number(fid) },
        data: {
          totalVotes: existingStreak.totalVotes + 1,
        },
      });
      return;
    } else if (diffDays === 1) {
      // Voted yesterday, increment streak
      currentStreak += 1;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else {
      // Streak broken, reset to 1
      currentStreak = 1;
    }

    // Update user streak record
    await prisma.userStreak.update({
      where: { fid: Number(fid) },
      data: {
        currentStreak,
        longestStreak,
        lastVoteDate: today,
        totalVotes: existingStreak.totalVotes + 1,
      },
    });

    // Check for streak achievements
    if (currentStreak >= 3) {
      const streakStarterAchievement = await prisma.achievement.findFirst({
        where: { name: 'Streak Starter' },
      });

      if (streakStarterAchievement) {
        await prisma.userAchievement.upsert({
          where: {
            fid_achievementId: {
              fid: Number(fid),
              achievementId: streakStarterAchievement.id,
            },
          },
          update: {},
          create: {
            fid: Number(fid),
            achievementId: streakStarterAchievement.id,
          },
        });
      }
    }

    if (currentStreak >= 7) {
      const streakMasterAchievement = await prisma.achievement.findFirst({
        where: { name: 'Streak Master' },
      });

      if (streakMasterAchievement) {
        await prisma.userAchievement.upsert({
          where: {
            fid_achievementId: {
              fid: Number(fid),
              achievementId: streakMasterAchievement.id,
            },
          },
          update: {},
          create: {
            fid: Number(fid),
            achievementId: streakMasterAchievement.id,
          },
        });
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating user streak:', errorMessage);
  }
}

/**
 * Checks if a vote represents a rare opinion (minority position with significant vote count)
 * @param fid The Farcaster ID of the user
 * @param topicId The ID of the topic
 * @param choice The user's choice (A or B)
 * @returns Promise<boolean>
 */
export async function checkForRareOpinion(
  fid: string | number,
  topicId: number | string,
  choice: 'A' | 'B'
): Promise<boolean> {
  try {
    // Need at least 20 votes to determine if an opinion is rare
    const totalVotes = await prisma.vote.count({
      where: { topicId: Number(topicId) },
    });

    if (totalVotes < 20) {
      return false;
    }

    // Get counts for each choice
    const choiceCount = await prisma.vote.count({
      where: { topicId: Number(topicId), choice },
    });

    // If the user's choice is in the minority (less than 30%)
    const percentage = (choiceCount / totalVotes) * 100;
    const isRare = percentage <= 30;

    if (isRare) {
      // Check for the Rare Opinion achievement
      const rareOpinionAchievement = await prisma.achievement.findFirst({
        where: { name: 'Rare Opinion' },
      });

      if (rareOpinionAchievement) {
        await prisma.userAchievement.upsert({
          where: {
            fid_achievementId: {
              fid: Number(fid),
              achievementId: rareOpinionAchievement.id,
            },
          },
          update: {},
          create: {
            fid: Number(fid),
            achievementId: rareOpinionAchievement.id,
          },
        });
      }
    }

    return isRare;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking for rare opinion:', errorMessage);
    return false;
  }
}

/**
 * Checks if a topic is highly contested (close vote percentages)
 * @param topicId The ID of the topic
 * @returns Promise<boolean>
 */
export async function isHighlyContested(topicId: number | string): Promise<boolean> {
  try {
    // Need at least 10 votes to determine if a topic is contested
    const totalVotes = await prisma.vote.count({
      where: { topicId: Number(topicId) },
    });

    if (totalVotes < 10) {
      return false;
    }

    // Get counts for each choice
    const countA = await prisma.vote.count({
      where: { topicId: Number(topicId), choice: 'A' },
    });

    const countB = totalVotes - countA;

    // Calculate percentages
    const percentageA = (countA / totalVotes) * 100;
    const percentageB = (countB / totalVotes) * 100;

    // Topic is highly contested if the difference is less than 10%
    const difference = Math.abs(percentageA - percentageB);
    const isContested = difference <= 10;

    return isContested;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking for highly contested topic:', errorMessage);
    return false;
  }
}

/**
 * Checks if a user is an admin and has the required permissions
 * @param fid The Farcaster ID of the user
 * @param requiredPermission The permission level required (defaults to 'moderate')
 * @returns Promise<boolean>
 */
export async function isAdmin(
  fid: number,
  requiredPermission: 'moderate' | 'full_admin' = 'moderate'
): Promise<boolean> {
  try {
    if (!fid) return false;

    const admin = await prisma.admin.findUnique({
      where: { fid },
    });

    if (!admin || !admin.isActive) return false;

    // Check permissions level
    if (requiredPermission === 'full_admin' && admin.permissions !== 'full_admin') {
      return false;
    }

    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking admin status:', errorMessage);
    return false;
  }
}

/**
 * Initialize the first admin if no admins exist
 * @param fid Farcaster ID of the first admin
 */
export async function initializeFirstAdmin(fid: number): Promise<void> {
  try {
    // Check if any admins exist
    const adminCount = await prisma.admin.count();

    // If no admins exist, create the first one with full permissions
    if (adminCount === 0 && fid) {
      await prisma.admin.create({
        data: {
          fid,
          permissions: 'full_admin',
          isActive: true,
        },
      });
      console.log(`Initialized first admin with FID ${fid}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error initializing first admin:', errorMessage);
    // Don't throw to avoid disrupting the admin check flow
  }
}

/**
 * Helper function to check if code is running on the client side
 * @returns boolean
 */
export const isClient = () => typeof window !== 'undefined';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncates an Ethereum address for display
 * @param address The full Ethereum address
 * @param startChars Number of starting characters to keep
 * @param endChars Number of ending characters to keep
 * @returns Truncated address string
 */
export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
