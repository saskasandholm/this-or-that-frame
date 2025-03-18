import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateUserStreak, checkForRareOpinion, isHighlyContested } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { topicId, fid, choice } = body;

    if (!topicId || !fid || !choice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate choice is either 'A' or 'B'
    if (choice !== 'A' && choice !== 'B') {
      return NextResponse.json({ error: 'Choice must be either A or B' }, { status: 400 });
    }

    // Check if topic exists and is active
    const topic = await prisma.topic.findFirst({
      where: {
        id: topicId,
        isActive: true,
      },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found or inactive' }, { status: 404 });
    }

    // Check if user has already voted on this topic
    const existingVote = await prisma.vote.findFirst({
      where: {
        topicId,
        fid,
      },
    });

    let vote;
    let message = '';

    if (existingVote) {
      // Update existing vote if the choice is different
      if (existingVote.choice !== choice) {
        vote = await prisma.vote.update({
          where: {
            id: existingVote.id,
          },
          data: {
            choice,
            timestamp: new Date(),
          },
        });

        message = 'Vote updated successfully';
      } else {
        vote = existingVote;
        message = 'Same choice already recorded';
      }
    } else {
      // Create new vote
      vote = await prisma.vote.create({
        data: {
          topicId,
          fid,
          choice,
        },
      });

      message = 'Vote recorded successfully';

      // Update user streak for new votes
      await updateUserStreak(fid);
    }

    // Get vote counts to check for rare opinions
    const voteCountA = await prisma.vote.count({
      where: {
        topicId,
        choice: 'A',
      },
    });

    const voteCountB = await prisma.vote.count({
      where: {
        topicId,
        choice: 'B',
      },
    });

    const totalVotes = voteCountA + voteCountB;
    const percentageA = totalVotes > 0 ? Math.round((voteCountA / totalVotes) * 100) : 0;
    const percentageB = totalVotes > 0 ? Math.round((voteCountB / totalVotes) * 100) : 0;

    // Check for rare opinion achievement
    const isRareOpinion = await checkForRareOpinion(fid, topicId, choice);

    // Check if this is a highly contested topic
    const isContested = await isHighlyContested(topicId);

    // Get user's streak information
    const userStreak = await prisma.userStreak.findUnique({
      where: { fid },
    });

    // Get user's achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { fid },
      include: { achievement: true },
      take: 3, // Get the most recent achievements
      orderBy: { earnedAt: 'desc' },
    });

    // Check for early voter (trendsetter) achievement
    if (totalVotes <= 10) {
      const trendsetterAchievement = await prisma.achievement.findFirst({
        where: { name: 'Trendsetter' },
      });

      if (trendsetterAchievement) {
        await prisma.userAchievement.upsert({
          where: {
            fid_achievementId: {
              fid,
              achievementId: trendsetterAchievement.id,
            },
          },
          update: {},
          create: {
            fid,
            achievementId: trendsetterAchievement.id,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      vote,
      message,
      stats: {
        voteCountA,
        voteCountB,
        totalVotes,
        percentageA,
        percentageB,
        isContested,
      },
      user: {
        streak: userStreak ? userStreak.currentStreak : 1,
        longestStreak: userStreak ? userStreak.longestStreak : 1,
        totalVotes: userStreak ? userStreak.totalVotes : 1,
        hasRareOpinion: isRareOpinion,
        recentAchievements: userAchievements.map(ua => ({
          name: ua.achievement.name,
          description: ua.achievement.description,
          icon: ua.achievement.badgeIcon,
          earnedAt: ua.earnedAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
