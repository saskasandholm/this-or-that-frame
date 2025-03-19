import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentTopic } from '@/lib/topics';

// Define the button types for consistent handling
const BUTTON_TYPES = {
  OPTION_A: 1,
  OPTION_B: 2,
  ADMIN: 3,
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Try to parse the request body
    const data = await req.json();

    // Extract fid from untrustedData if available
    const fid = data?.untrustedData?.fid;

    // Get the current active topic
    const currentTopic = await getCurrentTopic();

    // If no active topic is found, return a message
    if (!currentTopic) {
      return new NextResponse(
        JSON.stringify({
          message: 'Welcome to This or That!',
          buttons: [
            {
              label: 'Visit website',
              action: 'post_redirect',
            },
          ],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Create the post URL with topic ID parameter
    const postUrl = new URL('/api/frame/post', req.url);
    postUrl.searchParams.append('topicId', currentTopic.id.toString());

    // Initialize buttons array with voting options
    const buttons = [
      { index: BUTTON_TYPES.OPTION_A, label: currentTopic.optionA, action: 'post' },
      { index: BUTTON_TYPES.OPTION_B, label: currentTopic.optionB, action: 'post' },
    ];

    // Prepare the frame response data without buttons yet
    const frameData: {
      message: string;
      image: {
        url: string;
        aspectRatio: string;
      };
      buttons: Array<{ label: string; action: string }>;
      postUrl: string;
    } = {
      message: `${currentTopic.name}`,
      image: {
        url: new URL('/api/frame/image', req.url).toString(),
        aspectRatio: '1.91:1',
      },
      buttons: [],
      postUrl: postUrl.toString(),
    };

    // Check if the user is an admin
    let isAdmin = false;
    if (fid) {
      const adminRecord = await prisma.admin.findFirst({
        where: {
          fid: parseInt(fid.toString()),
          isActive: true,
        },
      });

      isAdmin = !!adminRecord;
    }

    // If the user is an admin, add the admin button
    if (isAdmin) {
      buttons.push({
        index: BUTTON_TYPES.ADMIN,
        label: '⚙️ Admin',
        action: 'post_redirect',
      });
    }

    // Extract just the button data needed for the response
    // and maintain explicit index order
    frameData.buttons = buttons
      .sort((a, b) => a.index - b.index)
      .map(({ label, action }) => ({ label, action }));

    // Return the frame HTML as a NextResponse
    return new NextResponse(JSON.stringify(frameData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error processing frame request:', error);

    return new NextResponse(
      JSON.stringify({
        message: 'Error processing request',
        image: {
          url: new URL('/api/og', new URL(req.url)).toString(),
          aspectRatio: '1.91:1',
        },
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
