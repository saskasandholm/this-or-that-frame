import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Import validation utilities
import {
  validateTopicId,
  validateFrameMessage,
  BUTTON_TYPES,
  ValidationError,
} from '../../topics/validation';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Get and validate topicId parameter
    const url = new URL(req.url);
    const topicIdStr = url.searchParams.get('topicId');
    const topicId = validateTopicId(topicIdStr);

    // Validate incoming frame message - extract trusted data from the Frame signature
    // This verifies the message is from a valid Farcaster user
    const { buttonIndex, fid, inputText } = await validateFrameMessage(req);

    console.log(
      `Processing frame post with buttonIndex: ${buttonIndex}, fid: ${fid}, topicId: ${topicId}, inputText: ${inputText || 'none'}`
    );

    // Get the topic
    const topic = await prisma.topic.findUnique({
      where: { id: parseInt(topicId) },
      select: {
        name: true,
        optionA: true,
        optionB: true,
        imageA: true,
        imageB: true,
        votesA: true,
        votesB: true,
      },
    });

    if (!topic) {
      return NextResponse.json(
        {
          message: 'Topic not found',
          image: {
            url: new URL('/api/og/error', new URL(req.url)).toString(),
            aspectRatio: '1.91:1',
          },
        },
        { status: 404 }
      );
    }

    // Define the base URL for image generation
    const baseUrl = new URL('/api/frame/image', new URL(req.url)).toString();

    // Handle different button actions based on button index
    if (buttonIndex === BUTTON_TYPES.ADMIN) {
      // Admin button - this would redirect to admin section
      return NextResponse.json({
        action: 'redirect',
        target: `${new URL('/admin', new URL(req.url)).toString()}?topicId=${topicId}`,
      });
    }

    if (buttonIndex === BUTTON_TYPES.VIEW_DETAILS || buttonIndex === BUTTON_TYPES.VOTE_AGAIN) {
      // View details button - show results page
      return NextResponse.json({
        message: 'Results for ' + topic.name,
        image: {
          url: `${baseUrl}?type=results&topicId=${topicId}`,
          aspectRatio: '1.91:1',
        },
        buttons: [
          {
            label: 'Vote Again',
            action: 'post',
          },
          {
            label: 'More Topics',
            action: 'post',
          },
        ],
      });
    }

    // Handle vote buttons (A or B)
    // Check if this is a valid vote (buttons 1 or 2)
    if (buttonIndex !== BUTTON_TYPES.OPTION_A && buttonIndex !== BUTTON_TYPES.OPTION_B) {
      return NextResponse.json(
        {
          message: 'Invalid button index',
          image: {
            url: new URL('/api/og/error', new URL(req.url)).toString(),
            aspectRatio: '1.91:1',
          },
        },
        { status: 400 }
      );
    }

    // Process a vote
    const isOptionA = buttonIndex === BUTTON_TYPES.OPTION_A;
    const votedOption = isOptionA ? 'A' : 'B';
    let vote;

    // Use a transaction for data consistency
    const topicIdInt = parseInt(topicId);
    await prisma.$transaction(async tx => {
      // Always update vote count on topic whether the user is authenticated or not
      // This allows voting directly from the frame without login
      if (isOptionA) {
        await tx.topic.update({
          where: { id: topicIdInt },
          data: { votesA: { increment: 1 } },
        });
      } else {
        await tx.topic.update({
          where: { id: topicIdInt },
          data: { votesB: { increment: 1 } },
        });
      }

      // Record the vote if we have user FID
      if (fid) {
        // Check if the user already voted on this topic
        const existingVote = await tx.vote.findUnique({
          where: {
            topicId_fid: {
              fid: fid,
              topicId: topicIdInt,
            },
          },
        });

        if (existingVote) {
          // User already voted, update the choice if different
          if (existingVote.choice !== votedOption) {
            vote = await tx.vote.update({
              where: {
                topicId_fid: {
                  fid: fid,
                  topicId: topicIdInt,
                },
              },
              data: {
                choice: votedOption,
              },
            });
          } else {
            vote = existingVote;
          }
        } else {
          // New vote
          vote = await tx.vote.create({
            data: {
              fid: fid,
              topicId: topicIdInt,
              choice: votedOption,
            },
          });

          // Check for achievements
          await checkForAchievements(tx, fid);
        }
      }
    });

    // Get updated vote counts for more accurate results
    const updatedTopic = await prisma.topic.findUnique({
      where: { id: topicIdInt },
      select: {
        votesA: true,
        votesB: true,
      },
    });

    const totalVotes = (updatedTopic?.votesA || 0) + (updatedTopic?.votesB || 0);
    const percentA = totalVotes ? Math.round((updatedTopic?.votesA || 0) / totalVotes * 100) : 0;
    const percentB = totalVotes ? Math.round((updatedTopic?.votesB || 0) / totalVotes * 100) : 0;

    // Return the vote response
    return NextResponse.json({
      message: `You voted for ${isOptionA ? topic.optionA : topic.optionB}! Here are the results:`,
      image: {
        url: `${baseUrl}?type=results&topicId=${topicId}&voted=${votedOption}`,
        aspectRatio: '1.91:1',
      },
      buttons: [
        {
          label: `View Details`,
          action: 'post',
        },
        {
          label: `Vote Again`,
          action: 'post',
        },
        {
          label: 'Share Results',
          action: 'post_redirect',
        },
      ],
    });
  } catch (error) {
    console.error('Error processing frame request:', error);

    // Format error response based on error type
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          message: error.message,
          image: {
            url: new URL('/api/og/error', new URL(req.url)).toString(),
            aspectRatio: '1.91:1',
          },
        },
        { status: error.statusCode }
      );
    }

    // Default error response
    return NextResponse.json(
      {
        message: 'An error occurred processing your request',
        image: {
          url: new URL('/api/og/error', new URL(req.url)).toString(),
          aspectRatio: '1.91:1',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Check for user achievements and grant them if conditions are met
 * @param tx Prisma transaction client
 * @param fid User's Farcaster ID
 */
async function checkForAchievements(tx: Prisma.TransactionClient, fid: number) {
  try {
    // Get user's vote count and streak info in a single query for efficiency
    const userStreak = await tx.userStreak.findUnique({
      where: { fid },
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    if (!userStreak) {
      console.log(`No user streak found for FID ${fid}`);
      return;
    }

    // List of possible achievements
    const achievements = await tx.achievement.findMany();

    // Check for vote count based achievements
    const voteCount = userStreak._count.votes;

    // Process each achievement
    for (const achievement of achievements) {
      // Skip achievements the user already has
      const hasAchievement = await tx.userAchievement.findUnique({
        where: {
          fid_achievementId: {
            fid,
            achievementId: achievement.id,
          },
        },
      });

      if (hasAchievement) continue;

      // Check vote count achievements
      if (achievement.type === 'votes' && voteCount >= achievement.threshold) {
        await tx.userAchievement.create({
          data: {
            fid,
            achievementId: achievement.id,
            earnedAt: new Date(),
          },
        });
        console.log(`Awarded achievement ${achievement.name} to user ${fid}`);
      }

      // Check streak achievements
      if (achievement.type === 'streak' && userStreak.currentStreak >= achievement.threshold) {
        await tx.userAchievement.create({
          data: {
            fid,
            achievementId: achievement.id,
            earnedAt: new Date(),
          },
        });
        console.log(`Awarded streak achievement ${achievement.name} to user ${fid}`);
      }
    }
  } catch (error) {
    console.error('Error checking for achievements:', error);
    // Don't throw - we don't want achievement errors to affect the main flow
  }
}
