import { NextRequest, NextResponse } from 'next/server';
import { createAppClient, viemConnector } from '@farcaster/auth-client';
import { prisma } from '@/lib/prisma';
import { trackEvent } from '@/lib/analytics';
import { trackError } from '@/lib/error-tracking';

export async function POST(req: NextRequest) {
  try {
    const { signature, message } = await req.json();

    // Create an app client for verification
    const appClient = createAppClient({
      ethereum: viemConnector(),
    });

    // Verify the signature
    const verifyResponse = await appClient.verifySignInMessage({
      message,
      signature: signature as `0x${string}`,
      domain: process.env.NEXT_PUBLIC_APP_URL || 'localhost',
    });

    if (!verifyResponse.success) {
      trackEvent('auth_verification_failed', {
        error: verifyResponse.error,
      });

      return NextResponse.json(
        { error: 'Invalid signature', details: verifyResponse.error },
        { status: 401 }
      );
    }

    const { fid, username, displayName, pfpUrl, custody } = verifyResponse;

    // Store or update user data in the database
    try {
      // Use Prisma to upsert the user
      await prisma.user.upsert({
        where: { fid },
        update: {
          username: username || '',
          displayName: displayName || '',
          pfpUrl: pfpUrl || '',
          lastLogin: new Date(),
        },
        create: {
          fid,
          username: username || '',
          displayName: displayName || '',
          pfpUrl: pfpUrl || '',
          lastLogin: new Date(),
        },
      });

      trackEvent('auth_user_upserted', {
        fid,
        hasUsername: Boolean(username),
      });
    } catch (dbError) {
      console.error('Database error during user upsert:', dbError);
      trackError('Database error during user upsert', { error: dbError, fid });

      // Continue even if user storage fails - we still want to authenticate the user
    }

    // Create a session for the user
    // Using a secure HTTP-only cookie
    const response = NextResponse.json({ success: true, fid, username });

    response.cookies.set('farcaster_auth', JSON.stringify({ fid, username }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    trackEvent('auth_session_created', { fid });

    return response;
  } catch (error) {
    console.error('Error processing Farcaster authentication:', error);
    trackError('Farcaster authentication error', { error });

    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}
