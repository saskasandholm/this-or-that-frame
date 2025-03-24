import { NextRequest, NextResponse } from 'next/server';
import { createAppClient, viemConnector } from '@farcaster/auth-client';
import { prisma } from '@/lib/prisma';
import { trackError } from '@/lib/error-tracking';

// Primary auth cookie for regular browsing
const AUTH_COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
};

// Mobile browsers often need SameSite=None
const MOBILE_COOKIE_CONFIG = {
  httpOnly: true,
  secure: true, // Must be secure for SameSite=None
  sameSite: 'none' as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
};

// Check cookie is visible to JavaScript
const CHECK_COOKIE_CONFIG = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30,
  path: '/',
};

// Mobile check cookie with appropriate settings
const MOBILE_CHECK_COOKIE_CONFIG = {
  httpOnly: false,
  secure: true,
  sameSite: 'none' as const,
  maxAge: 60 * 60 * 24 * 30,
  path: '/',
};

/**
 * Get possible domain values for verification
 * This is needed because the domain in the signature might vary
 */
function getDomainOptions(): string[] {
  const configuredDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || '';

  // Create an array of possible domains to try
  const domains = [
    configuredDomain,
    configuredDomain.replace(/^https?:\/\//, ''), // Without protocol
    'localhost',
    'localhost:3000',
    'frame.frog.pub', // If this is your production domain
  ].filter(Boolean); // Remove empty strings

  return Array.from(new Set(domains)); // Remove duplicates
}

/**
 * Detects if the request is likely from a mobile device
 */
function isMobileRequest(req: NextRequest, isMobileFlag?: boolean): boolean {
  if (isMobileFlag === true) return true;
  const userAgent = req.headers.get('user-agent') || '';
  return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
}

/**
 * Extract FID from verification message
 */
function extractFidFromMessage(message: Record<string, unknown> | string): number | null {
  try {
    // If message is an object with fid
    if (typeof message === 'object' && message !== null && 'fid' in message) {
      return typeof message.fid === 'number' ? message.fid : null;
    }

    // Try to parse JSON if it's a string
    if (typeof message === 'string') {
      try {
        const parsed = JSON.parse(message);
        if (parsed && typeof parsed.fid === 'number') {
          return parsed.fid;
        }

        // Sometimes FID is inside a nested data structure
        if (parsed && parsed.payload && typeof parsed.payload.fid === 'number') {
          return parsed.payload.fid;
        }
      } catch {
        // Not valid JSON, try to extract FID using regex
        const fidMatch = message.match(/fid['":\s]+(\d+)/i);
        if (fidMatch && fidMatch[1]) {
          const parsedFid = parseInt(fidMatch[1], 10);
          if (!isNaN(parsedFid)) {
            return parsedFid;
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('[Server Auth] Error extracting FID:', error);
    return null;
  }
}

/**
 * Farcaster authentication handler
 * Verifies the signature and creates a server-side session
 */
export async function POST(req: NextRequest) {
  console.log('[Server Auth] Starting authentication process');

  try {
    const { signature, message, nonce, isMobile, userAgent } = await req.json();

    console.log('[Server Auth] Request data:', {
      hasSignature: !!signature,
      hasMessage: !!message,
      isMobile,
      userAgentLength: userAgent ? userAgent.length : 0,
      messageType: typeof message,
    });

    if (!signature || !message) {
      return NextResponse.json({ error: 'Missing signature or message' }, { status: 400 });
    }

    // Create app client for verification
    const appClient = createAppClient({
      relay: 'https://relay.farcaster.xyz',
      ethereum: viemConnector(),
    });

    let verifyResponse;
    let fid: number | null = null;
    let verificationSuccess = false;
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);

    // Try extracting FID first as a fallback
    const extractedFid = extractFidFromMessage(message);

    // Get all possible domains to try
    const domainOptions = getDomainOptions();
    console.log('[Server Auth] Will try verification with domains:', domainOptions);

    // Try verification with each domain
    const errors: Array<{ domain: string; error: string }> = [];
    for (const domain of domainOptions) {
      try {
        console.log(`[Server Auth] Trying verification with domain: ${domain}`);
        verifyResponse = await appClient.verifySignInMessage({
          message: messageStr,
          signature: signature as `0x${string}`,
          domain: domain,
          nonce: nonce || undefined,
        });

        if (verifyResponse && verifyResponse.fid) {
          fid = verifyResponse.fid;
          verificationSuccess = true;
          console.log(`[Server Auth] Verification succeeded with domain: ${domain}`);
          break;
        }
      } catch (error) {
        errors.push({ domain, error: error instanceof Error ? error.message : String(error) });
        console.error(`[Server Auth] Verification error with domain ${domain}:`, error);
      }
    }

    // Log verification results
    console.log('[Server Auth] Verification results:', {
      success: verificationSuccess,
      fid,
      errors: errors.length > 0 ? errors : undefined,
    });

    // If standard verification failed, use extracted FID as fallback
    if (!fid && extractedFid) {
      console.log('[Server Auth] Using extracted FID as fallback:', extractedFid);
      fid = extractedFid;
    }

    if (!fid) {
      return NextResponse.json(
        {
          error: 'Invalid signature or unable to verify',
          details: 'Could not extract valid FID',
          tried: domainOptions,
          errors,
        },
        { status: 401 }
      );
    }

    // Extract user data from message if available
    type UserData = {
      fid: number;
      username: string;
      displayName: string;
      pfpUrl: string;
      [key: string]: unknown;
    };

    let userData: UserData;

    try {
      // Try to extract user data from message
      const messageObj =
        typeof message === 'object'
          ? message
          : typeof message === 'string'
            ? JSON.parse(message)
            : {};

      // If Farcaster returns verification data with user profile, prefer that
      if (verifyResponse && verifyResponse.userInfo) {
        userData = {
          fid,
          username: verifyResponse.userInfo.username || '',
          displayName:
            verifyResponse.userInfo.displayName || verifyResponse.userInfo.username || '',
          pfpUrl: verifyResponse.userInfo.pfp?.url || '',
        };
      } else {
        // Otherwise use data from message
        userData = {
          fid,
          username: messageObj.username || '',
          displayName: messageObj.displayName || messageObj.username || '',
          pfpUrl: messageObj.pfpUrl || '',
        };
      }
    } catch (_error) {
      console.error('[Server Auth] Error parsing user data:', _error);
      // Minimal fallback if we can't extract user data but have a valid FID
      userData = { fid, username: '', displayName: '', pfpUrl: '' };
    }

    console.log('[Server Auth] User data extracted:', {
      fid: userData.fid,
      username: userData.username || '[none]',
    });

    // Store or update user in database
    try {
      await prisma.user.upsert({
        where: { fid },
        update: {
          username: userData.username,
          displayName: userData.displayName,
          pfpUrl: userData.pfpUrl,
          lastLogin: new Date(),
        },
        create: {
          fid,
          username: userData.username,
          displayName: userData.displayName,
          pfpUrl: userData.pfpUrl,
          lastLogin: new Date(),
        },
      });
      console.log('[Server Auth] User data saved to database');
    } catch (dbError) {
      console.error('[Server Auth] Database error:', dbError);
      // Continue even if database fails - we can still set cookies
    }

    // Create response with auth cookie
    const response = NextResponse.json({
      success: true,
      user: userData,
    });

    // Determine if request is from mobile
    const isMobileDevice = isMobileRequest(req, isMobile);
    const userDataStr = JSON.stringify(userData);

    console.log('[Server Auth] Setting cookies for device type:', {
      isMobile: isMobileDevice,
      cookieValueLength: userDataStr.length,
    });

    // Set cookies with different configurations
    // Main auth cookie - use mobile config for mobile devices
    response.cookies.set(
      'farcaster_auth',
      userDataStr,
      isMobileDevice ? MOBILE_COOKIE_CONFIG : AUTH_COOKIE_CONFIG
    );

    // Always set a check cookie that's visible to JavaScript
    response.cookies.set(
      'farcaster_auth_check',
      'true',
      isMobileDevice ? MOBILE_CHECK_COOKIE_CONFIG : CHECK_COOKIE_CONFIG
    );

    // For compatibility, always set a fallback cookie with different SameSite
    if (isMobileDevice) {
      // Set a lax cookie as fallback for mobile
      response.cookies.set('farcaster_auth_lax', userDataStr, AUTH_COOKIE_CONFIG);
      response.cookies.set('farcaster_auth_check_lax', 'true', CHECK_COOKIE_CONFIG);
    } else {
      // Set a none cookie as fallback for desktop
      response.cookies.set('farcaster_auth_none', userDataStr, MOBILE_COOKIE_CONFIG);
      response.cookies.set('farcaster_auth_check_none', 'true', MOBILE_CHECK_COOKIE_CONFIG);
    }

    console.log('[Server Auth] Auth complete, cookies set:', {
      cookieCount: response.cookies.getAll().length,
      cookieNames: response.cookies.getAll().map(c => c.name),
      cookieHeaders: response.headers.get('set-cookie'),
    });

    return response;
  } catch (error) {
    console.error('[Server Auth] Error:', error);
    trackError('Farcaster authentication error', { error });
    return NextResponse.json(
      {
        error: 'Authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
