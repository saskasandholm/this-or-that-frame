import { NextRequest } from 'next/server';
import { FarcasterUser } from '@/hooks/useAuthState';

/**
 * Get user information from the request checking all cookie variants
 * 
 * @param req NextRequest object
 * @returns User data or null if not authenticated
 */
export async function getUserFromRequest(req: NextRequest): Promise<FarcasterUser | null> {
  try {
    // Check all possible auth cookie variants
    const authCookie = req.cookies.get('farcaster_auth') || 
                       req.cookies.get('farcaster_auth_lax');
    
    if (!authCookie || !authCookie.value) {
      return null;
    }
    
    // Parse the user data from the cookie
    const userData = JSON.parse(authCookie.value);
    
    // Validate the required fields
    if (!userData || !userData.fid) {
      console.warn('[Auth] Invalid user data in auth cookie');
      return null;
    }
    
    // Return the validated user
    return {
      fid: userData.fid,
      username: userData.username || '',
      displayName: userData.displayName || userData.username || '',
      pfpUrl: userData.pfpUrl || '',
    };
  } catch (error) {
    console.error('[Auth] Error getting user from request:', error);
    return null;
  }
}

/**
 * Check if a user is authenticated from the request
 * 
 * @param req NextRequest object
 * @returns true if user is authenticated, false otherwise
 */
export async function isUserAuthenticated(req: NextRequest): Promise<boolean> {
  const user = await getUserFromRequest(req);
  return !!user;
}

/**
 * Check if a request is coming from a mobile device
 * 
 * @param req NextRequest object
 * @returns true if the request is from a mobile device
 */
export function isMobileDevice(req: NextRequest): boolean {
  const userAgent = req.headers.get('user-agent') || '';
  return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
} 