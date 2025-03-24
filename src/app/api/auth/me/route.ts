import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile if logged in
 */
export async function GET(req: NextRequest) {
  // Log the request for debugging
  console.log('[Auth API] /api/auth/me request received');
  
  // Get all possible auth cookies
  const authCookie = req.cookies.get('farcaster_auth') || 
                    req.cookies.get('farcaster_auth_lax') ||
                    req.cookies.get('farcaster_auth_none');
                    
  const checkCookie = req.cookies.get('farcaster_auth_check') ||
                      req.cookies.get('farcaster_auth_check_lax') ||
                      req.cookies.get('farcaster_auth_check_none');
  
  // Log the cookie situation
  console.log('[Auth API] Auth cookies:', {
    hasAuthCookie: !!authCookie,
    authCookieName: authCookie?.name,
    hasCheckCookie: !!checkCookie,
    checkCookieName: checkCookie?.name,
    allCookies: req.cookies.getAll().map(c => c.name),
  });
  
  if (!authCookie) {
    // Return unauthenticated if no cookie is present
    console.log('[Auth API] No auth cookie found, user is not authenticated');
    return NextResponse.json({ isAuthenticated: false, user: null });
  }

  try {
    // Parse the auth cookie
    const userData = JSON.parse(authCookie.value);
    
    if (!userData || !userData.fid) {
      console.log('[Auth API] Invalid user data in cookie:', authCookie.value);
      return NextResponse.json({ isAuthenticated: false, user: null });
    }
    
    // Get the user from the database for the most up-to-date info
    const dbUser = await prisma.user.findUnique({
      where: {
        fid: userData.fid,
      },
    });
    
    if (!dbUser) {
      console.log('[Auth API] User not found in database:', userData.fid);
      return NextResponse.json({ isAuthenticated: false, user: null });
    }
    
    // Create the response with the latest user data
    const user = {
      fid: dbUser.fid,
      username: dbUser.username || '',
      displayName: dbUser.displayName || dbUser.username || '',
      pfpUrl: dbUser.pfpUrl || '',
    };

    console.log('[Auth API] User is authenticated:', {
      fid: user.fid,
      username: user.username || '[none]'
    });
    
    return NextResponse.json({ isAuthenticated: true, user });
  } catch (error) {
    console.error('[Auth API] Error processing auth request:', error);
    return NextResponse.json({ 
      isAuthenticated: false, 
      user: null,
      error: 'Failed to parse user data'
    });
  }
} 