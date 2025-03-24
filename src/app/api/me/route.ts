import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/me
 * Returns the currently authenticated user
 */
export async function GET(req: NextRequest) {
  console.log('[API] /api/me request received');

  // Get all possible auth cookies directly from the request
  const authCookie =
    req.cookies.get('farcaster_auth') ||
    req.cookies.get('farcaster_auth_lax') ||
    req.cookies.get('farcaster_auth_none');

  // Log cookie information for debugging
  console.log('[API] Auth cookie check:', {
    hasAuthCookie: !!authCookie,
    cookieName: authCookie?.name,
    allCookies: req.cookies.getAll().map(c => c.name),
  });

  // If no auth cookie is found, return unauthenticated response
  if (!authCookie) {
    console.log('[API] No auth cookie found, user is not authenticated');
    return Response.json(
      {
        isAuthenticated: false,
        user: null,
        error: 'Not authenticated',
      },
      { status: 401 }
    );
  }

  try {
    // Parse the cookie value to get user data
    const userData = JSON.parse(authCookie.value);

    console.log('[API] Auth cookie parsed:', {
      hasFid: !!userData?.fid,
      fid: userData?.fid,
      username: userData?.username || '[none]',
    });

    // Validate the user data
    if (!userData || !userData.fid) {
      console.log('[API] Invalid user data in cookie');
      return Response.json(
        {
          isAuthenticated: false,
          user: null,
          error: 'Invalid user data',
        },
        { status: 401 }
      );
    }

    // Verify the user exists in our database
    try {
      const user = await prisma.user.findUnique({
        where: { fid: userData.fid },
      });

      if (!user) {
        console.log('[API] User not found in database:', userData.fid);
        return Response.json(
          {
            isAuthenticated: false,
            user: null,
            error: 'User not found',
          },
          { status: 401 }
        );
      }

      // User is authenticated and exists in database
      console.log('[API] User authenticated successfully:', {
        fid: user.fid,
        username: user.username,
      });

      // Return the user data
      return Response.json({
        isAuthenticated: true,
        user: {
          fid: user.fid,
          username: user.username || '',
          displayName: user.displayName || user.username || '',
          pfpUrl: user.pfpUrl || '',
        },
      });
    } catch (dbError) {
      console.error('[API] Database error:', dbError);
      // Fall back to cookie data if database fails
      return Response.json({
        isAuthenticated: true,
        user: userData,
        source: 'cookie_fallback',
      });
    }
  } catch (error) {
    console.error('[API] Error parsing auth cookie:', error);
    return Response.json(
      {
        isAuthenticated: false,
        user: null,
        error: 'Invalid auth data',
      },
      { status: 401 }
    );
  }
}
