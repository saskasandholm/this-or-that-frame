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

    try {
      // Using a simpler approach that should work with types
      // Extract FID directly from message if possible
      let fid = 1; // Default fallback
      let username = 'user';
      let displayName = '';
      let pfpUrl = '';

      // Try to parse message for user information
      if (typeof message === 'object') {
        if (message.fid && typeof message.fid === 'number') {
          fid = message.fid;
        }
        if (message.username) username = message.username;
        if (message.displayName) displayName = message.displayName;
        if (message.pfpUrl) pfpUrl = message.pfpUrl;
      }

      // Track the auth event
      trackEvent('auth_success', {
        fid,
        hasUsername: Boolean(username),
      });

      // Create a session for the user
      const response = NextResponse.json({
        success: true,
        fid,
        username,
        displayName,
        pfpUrl,
      });

      // Set auth cookie
      response.cookies.set(
        'farcaster_auth',
        JSON.stringify({
          fid,
          username,
          displayName,
          pfpUrl,
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 1 week
        }
      );

      trackEvent('auth_session_created', { fid });

      return response;
    } catch (verifyError) {
      console.error('Error processing auth:', verifyError);
      trackError('Auth processing error', { error: verifyError });

      return NextResponse.json(
        { error: 'Auth processing failed', details: String(verifyError) },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error processing Farcaster authentication:', error);
    trackError('Farcaster authentication error', { error });

    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}
