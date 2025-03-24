import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { trackError } from '@/lib/error-tracking';

// Cookie configuration for consistency across the app
const AUTH_COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,  // 'lax' works best across browsers and mobile devices
  maxAge: 60 * 60 * 24 * 30,  // 30 days
  path: '/',
};

const CHECK_COOKIE_CONFIG = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30,  // 30 days
  path: '/',
};

/**
 * Sync endpoint to maintain server-side sessions from client-side Auth-kit state
 * This allows us to maintain consistent auth state between Auth-kit and server
 */
export async function POST(req: NextRequest) {
  try {
    // Get user data from request body
    const userData = await req.json();
    console.log('[Auth/sync] Received sync request:', { 
      hasFid: !!userData?.fid,
      username: userData?.username,
    });
    
    if (!userData || !userData.fid) {
      return NextResponse.json({ error: 'Missing user data' }, { status: 400 });
    }
    
    // Upsert user in database
    try {
      const { fid, username, displayName, pfpUrl } = userData;
      
      await prisma.user.upsert({
        where: { fid },
        update: {
          username,
          displayName,
          pfpUrl,
          lastLogin: new Date(),
        },
        create: {
          fid,
          username,
          displayName,
          pfpUrl,
          lastLogin: new Date(),
        },
      });
      
      console.log('[Auth/sync] User synced in database:', { fid, username });
    } catch (dbError) {
      console.error('[Auth/sync] Database error:', dbError);
      trackError('Database error during sync', { error: dbError });
      // Continue despite DB error
    }
    
    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      user: userData,
    });
    
    // Set auth cookies for server-side session
    const cookieValue = JSON.stringify(userData);
    response.cookies.set('farcaster_auth', cookieValue, AUTH_COOKIE_CONFIG);
    response.cookies.set('farcaster_auth_check', 'true', CHECK_COOKIE_CONFIG);
    
    console.log('[Auth/sync] Auth cookies set for user:', { 
      fid: userData.fid, 
      cookieLength: cookieValue.length 
    });
    
    return response;
  } catch (error) {
    console.error('[Auth/sync] Error syncing auth state:', error);
    trackError('Error syncing auth state', { error });
    return NextResponse.json({ error: 'Failed to sync auth state' }, { status: 500 });
  }
} 