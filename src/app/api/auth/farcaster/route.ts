import { NextRequest, NextResponse } from 'next/server';
import { createAppClient, viemConnector } from '@farcaster/auth-client';
import { prisma } from '@/lib/prisma';
import { trackError } from '@/lib/error-tracking';
import type { VerifyResponse } from '@farcaster/auth-client';

// Simplified cookie configuration
const AUTH_COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
};

// Mobile-specific cookie configuration
const MOBILE_COOKIE_CONFIG = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  maxAge: 60 * 60 * 24 * 30,
  path: '/',
};

// Non-httpOnly cookie for client-side detection
const CHECK_COOKIE_CONFIG = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30,
  path: '/',
};

// Mobile check cookie
const MOBILE_CHECK_COOKIE_CONFIG = {
  httpOnly: false,
  secure: true,
  sameSite: 'none' as const,
  maxAge: 60 * 60 * 24 * 30,
  path: '/',
};

/**
 * Get possible domain values for verification
 */
function getDomainOptions(): string[] {
  const configuredDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || '';
  const domains = [
    configuredDomain,
    configuredDomain.replace(/^https?:\/\//, ''),
    'localhost',
    'localhost:3000',
    'frame.frog.pub',
  ].filter(Boolean);
  
  return Array.from(new Set(domains));
}

/**
 * Extract FID from verification message
 */
function extractFidFromMessage(message: Record<string, unknown> | string): number | null {
  try {
    if (typeof message === 'object' && message !== null && 'fid' in message) {
      return typeof message.fid === 'number' ? message.fid : null;
    }

    if (typeof message === 'string') {
      try {
        const parsed = JSON.parse(message);
        if (parsed && typeof parsed.fid === 'number') {
          return parsed.fid;
        }
        if (parsed && parsed.payload && typeof parsed.payload.fid === 'number') {
          return parsed.payload.fid;
        }
      } catch {
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
 */
export async function POST(req: NextRequest) {
  console.log('[Auth API] Starting authentication process');

  try {
    const { signature, message, nonce, isMobile } = await req.json();
    console.log('[Auth API] Request received', { 
      hasSignature: !!signature, 
      hasMessage: !!message, 
      isMobile: !!isMobile 
    });

    if (!signature || !message) {
      console.log('[Auth API] Missing signature or message');
      return NextResponse.json({ error: 'Missing signature or message' }, { status: 400 });
    }

    // Create app client for verification
    const appClient = createAppClient({
      relay: 'https://relay.farcaster.xyz',
      ethereum: viemConnector(),
    });

    // List of domains to try for verification
    const domains = ['localhost', 'localhost:3000'];
    console.log('[Auth API] Will try verification with domains:', domains);

    // Try verification with each domain
    let verifyResult: VerifyResponse | null = null;
    for (const domain of domains) {
      try {
        console.log(`[Auth API] Trying verification with domain: ${domain}`);
        const result = await appClient.verifySignInMessage({
          message: typeof message === 'string' ? message : JSON.stringify(message),
          signature: signature as `0x${string}`,
          domain,
          nonce: nonce || undefined,
        });
        
        if (result && result.fid) {
          verifyResult = result;
          console.log(`[Auth API] Verification succeeded with domain: ${domain}`);
          break;
        }
      } catch (error) {
        console.error(`[Auth API] Verification failed with domain ${domain}:`, error);
      }
    }

    if (!verifyResult || !verifyResult.fid) {
      console.log('[Auth API] Verification failed for all domains');
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const fid = verifyResult.fid;
    console.log(`[Auth API] User authenticated with FID: ${fid}`);

    // User data to store
    const userData = {
      fid,
      username: verifyResult.userInfo?.username || '',
      displayName: verifyResult.userInfo?.displayName || verifyResult.userInfo?.username || '',
      pfpUrl: verifyResult.userInfo?.pfp?.url || '',
    };

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
      console.log('[Auth API] User data saved to database');
    } catch (dbError) {
      console.error('[Auth API] Database error:', dbError);
      // Continue even if DB operation fails
    }

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: userData,
    });

    // Set cookie with appropriate config based on device type
    const cookieConfig = isMobile ? MOBILE_COOKIE_CONFIG : AUTH_COOKIE_CONFIG;
    response.cookies.set('farcaster_auth', JSON.stringify(userData), cookieConfig);
    
    console.log('[Auth API] Authentication complete, cookie set');
    return response;
  } catch (error) {
    console.error('[Auth API] Unexpected error:', error);
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
