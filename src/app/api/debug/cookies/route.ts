import { NextRequest, NextResponse } from 'next/server';

type UserData = {
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  [key: string]: unknown;
};

/**
 * GET /api/debug/cookies
 * Returns the current cookies for debugging authentication issues
 * THIS SHOULD BE DISABLED IN PRODUCTION
 */
export async function GET(req: NextRequest) {
  const allCookies = req.cookies.getAll();
  const authCookies = allCookies.filter(cookie => cookie.name.startsWith('farcaster_'));

  // Get auth cookie if it exists
  const authCookie =
    req.cookies.get('farcaster_auth') ||
    req.cookies.get('farcaster_auth_lax') ||
    req.cookies.get('farcaster_auth_none');

  // Get check cookie if it exists
  const checkCookie =
    req.cookies.get('farcaster_auth_check') ||
    req.cookies.get('farcaster_auth_check_lax') ||
    req.cookies.get('farcaster_auth_check_none');

  // Try to parse auth cookie if it exists
  let userData: UserData | null = null;
  if (authCookie) {
    try {
      userData = JSON.parse(authCookie.value);
    } catch {
      userData = { error: 'Failed to parse cookie value', cookieValue: authCookie.value };
    }
  }

  // Get Farcaster-related request headers for debugging
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (
      key.toLowerCase().includes('cookie') ||
      key.toLowerCase().includes('auth') ||
      key.toLowerCase().includes('farcaster')
    ) {
      headers[key] = value;
    }
  });

  return NextResponse.json({
    authState: {
      hasAuthCookie: !!authCookie,
      authCookieName: authCookie?.name,
      hasCheckCookie: !!checkCookie,
      checkCookieName: checkCookie?.name,
      isAuthenticated: !!(authCookie || checkCookie),
    },
    userData,
    cookies: {
      auth: authCookies.map(c => ({
        name: c.name,
        value: c.name.includes('check') ? c.value : '[REDACTED]',
      })),
      all: allCookies.map(c => c.name),
    },
    headers,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
}
