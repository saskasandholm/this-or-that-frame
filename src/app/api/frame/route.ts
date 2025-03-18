import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const frameMessage = formData.get('message');

    if (!frameMessage) {
      return NextResponse.json({ error: 'Missing frame message' }, { status: 400 });
    }

    // Parse the frame message
    const message = JSON.parse(frameMessage.toString());

    // Extract data from the message
    const { buttonIndex = 1, fid, _castId, _inputText } = message;

    // Get the current topic
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
      orderBy: {
        startDate: 'desc',
      },
    });

    if (!currentTopic) {
      return NextResponse.json({
        message: 'No active topic found',
      });
    }

    // Prepare URLs
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Record the vote based on button index
    const choice = buttonIndex === 1 ? 'A' : 'B';

    // If the user has a Farcaster ID, record their vote
    if (fid) {
      // Submit the vote via the vote API
      try {
        await fetch(`${appUrl}/api/votes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topicId: currentTopic.id,
            fid,
            choice,
          }),
        });
      } catch (error) {
        console.error('Error recording vote:', error);
      }
    }

    // Return a frame response with the results URL
    const frameResponse = {
      image: `${appUrl}/api/og/results/${currentTopic.id}`,
      buttons: [
        {
          label: 'View Details',
          action: 'post_redirect',
        },
      ],
      post_url: `${appUrl}/api/frame/results`,
      state: {
        topicId: currentTopic.id.toString(),
        choice,
        fid: fid?.toString() || '',
      },
    };

    return NextResponse.json(frameResponse);
  } catch (error) {
    console.error('Error processing frame message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
