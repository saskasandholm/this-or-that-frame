import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const frameMessage = formData.get('message');

    if (!frameMessage) {
      return NextResponse.json({ error: 'Missing frame message' }, { status: 400 });
    }

    // Parse the frame message
    const message = JSON.parse(frameMessage.toString());

    // Extract state data from the message
    const { state } = message;

    if (!state) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const { topicId, choice, fid } = state;

    if (!topicId) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Build the redirect URL with query parameters
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    let redirectUrl = `${appUrl}/topic/${topicId}`;

    // Add query parameters if available
    const params = new URLSearchParams();
    if (choice) params.append('choice', choice);
    if (fid) params.append('fid', fid);

    if (params.toString()) {
      redirectUrl += `?${params.toString()}`;
    }

    // Redirect to the topic page with the appropriate parameters
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error processing results redirect:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
