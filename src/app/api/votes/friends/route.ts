import { NextRequest, NextResponse } from 'next/server';
// Removing unused import
// import prisma from '../../../../lib/prisma';

/**
 * GET /api/votes/friends
 *
 * Retrieves voting information of a user's friends
 * Used for the context-aware UI to show social comparisons
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fid = searchParams.get('fid');
    const topicId = searchParams.get('topicId');

    if (!fid) {
      return NextResponse.json({ error: 'Missing required parameter: fid' }, { status: 400 });
    }

    // If this was a real integration with Farcaster's social graph,
    // we would query the user's followers/following here.
    // For now, we'll use a simulated approach with mock data.

    // In a real implementation, this might use a database query like:
    //
    // Get friends via Farcaster relationships
    // const friends = await getFriends(parseInt(fid));
    //
    // Get votes for these friends on the topic
    // const friendVotes = await prisma.vote.findMany({
    //   where: {
    //     user: {
    //       fid: { in: friends.map(f => f.fid) }
    //     },
    //     topicId: topicId || undefined
    //   },
    //   include: {
    //     user: {
    //       select: { fid: true }
    //     }
    //   }
    // });

    // For this example, we'll return simulated friend votes
    const mockFriendVotes = [
      { fid: 12345, choice: 'A', name: 'Alice' },
      { fid: 23456, choice: 'B', name: 'Bob' },
      { fid: 34567, choice: 'A', name: 'Charlie' },
      { fid: 45678, choice: 'A', name: 'Diana' },
      { fid: 56789, choice: 'B', name: 'Evan' },
    ];

    // Optional filtering by specific topic
    if (topicId) {
      // In a real implementation, filter by topic
      // For mock data, just return random subset
      const randomSelection = mockFriendVotes
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 4) + 1);

      return NextResponse.json({
        friendVotes: randomSelection,
        totalFriends: randomSelection.length,
        topicId,
      });
    }

    return NextResponse.json({
      friendVotes: mockFriendVotes,
      totalFriends: mockFriendVotes.length,
    });
  } catch (error) {
    console.error('Error fetching friend votes:', error);
    return NextResponse.json({ error: 'Failed to retrieve friend votes' }, { status: 500 });
  }
}
