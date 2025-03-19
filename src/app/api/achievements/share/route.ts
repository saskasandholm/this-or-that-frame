import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ValidationError } from '@/app/api/topics/validation';

/**
 * API endpoint to record achievement sharing
 *
 * This records when a user shares an achievement to social media
 * and updates their user achievement record
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await req.json();
    const { fid, achievementId, platform } = body;

    // Validate required fields
    if (!fid) {
      return NextResponse.json({ error: 'Missing fid parameter' }, { status: 400 });
    }

    if (!achievementId) {
      return NextResponse.json({ error: 'Missing achievementId parameter' }, { status: 400 });
    }

    if (!platform) {
      return NextResponse.json({ error: 'Missing platform parameter' }, { status: 400 });
    }

    // Check if the user has earned this achievement
    const userAchievement = await prisma.userAchievement.findUnique({
      where: {
        fid_achievementId: {
          fid: Number(fid),
          achievementId: Number(achievementId),
        },
      },
    });

    if (!userAchievement) {
      return NextResponse.json({ error: 'User has not earned this achievement' }, { status: 404 });
    }

    // Record the share in a custom table
    // (Fall back to storing in a user activity log since the share model might not be available)
    const shareRecord = await prisma.$executeRaw`
      INSERT INTO user_activity_log (fid, activity_type, metadata, created_at)
      VALUES (${Number(fid)}, 'achievement_share', ${{
        achievementId: Number(achievementId),
        platform,
        userAchievementId: userAchievement.id,
      }}, NOW())
    `;

    // Check for social sharing achievements
    await checkForSharingAchievements(Number(fid));

    return NextResponse.json({
      success: true,
      message: 'Achievement share recorded',
    });
  } catch (error) {
    console.error('Error recording achievement share:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: 'An error occurred while recording the achievement share' },
      { status: 500 }
    );
  }
}

/**
 * Check if the user qualifies for sharing achievements
 *
 * @param fid User's Farcaster ID
 */
async function checkForSharingAchievements(fid: number): Promise<void> {
  try {
    // Count how many activity logs of type achievement_share the user has
    const shareCount = await prisma.$executeRaw`
      SELECT COUNT(*) FROM user_activity_log 
      WHERE fid = ${fid} AND activity_type = 'achievement_share'
    `;

    // Get all sharing achievements the user doesn't already have
    const sharingAchievements = await prisma.achievement.findMany({
      where: {
        type: 'social',
        threshold: { lte: Number(shareCount) },
        users: {
          none: {
            fid,
          },
        },
      },
    });

    if (sharingAchievements.length > 0) {
      // Create user achievements for each newly unlocked achievement
      await prisma.$transaction(
        sharingAchievements.map(achievement =>
          prisma.userAchievement.create({
            data: {
              fid,
              achievementId: achievement.id,
              earnedAt: new Date(),
            },
          })
        )
      );

      console.log(`User ${fid} earned ${sharingAchievements.length} new sharing achievements`);
    }
  } catch (error) {
    console.error('Error checking for sharing achievements:', error);
    // Don't throw - we don't want to fail the share operation
  }
}
