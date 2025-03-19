import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get auth cookie
    const authCookie = req.cookies.get('farcaster_auth');

    if (!authCookie?.value) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null,
      });
    }

    try {
      // Parse the cookie value
      const { fid } = JSON.parse(authCookie.value);

      if (!fid) {
        return NextResponse.json({
          isAuthenticated: false,
          user: null,
        });
      }

      // Fetch user from database
      const user = await prisma.user.findUnique({
        where: { fid },
      });

      if (!user) {
        return NextResponse.json({
          isAuthenticated: false,
          user: null,
        });
      }

      // Return user data
      return NextResponse.json({
        isAuthenticated: true,
        user: {
          fid: user.fid,
          username: user.username || '',
          displayName: user.displayName || '',
          pfpUrl: user.pfpUrl || '',
        },
      });
    } catch (e) {
      // Cookie parsing error
      return NextResponse.json({
        isAuthenticated: false,
        user: null,
        error: 'Invalid auth cookie',
      });
    }
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return NextResponse.json(
      {
        isAuthenticated: false,
        user: null,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
