import { NextResponse } from 'next/server';

export async function GET() {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return NextResponse.json({
    accountAssociation: {
      // This is a placeholder - in production you would replace these with real values
      header: 'eyJhbGciOiJFUzI1NiIsImZjdCI6ImZjYS0xIiwiZmNhdSI6ImZyYW1lLmdqcy5kZXYifQ',
      payload: 'eyJkb21haW4iOiJmcmFtZS5nanMuZGV2In0',
      signature:
        'szgkqOWJ4ZGFWT6hRlhFR-CWGWQlB6du-rkP9_r8PSl3QlVrK0SytMV_CYS8z4pUCwYNTQ2LsM6f8DIkV91xAQ',
    },
    frame: {
      version: '1',
      name: 'This or That?',
      homeUrl: APP_URL,
      iconUrl: `${APP_URL}/api/splash`,
      imageUrl: `${APP_URL}/api/og`,
      buttonTitle: 'Open App',
      splashImageUrl: `${APP_URL}/api/splash`,
      splashBackgroundColor: '#1a202c',
      webhookUrl: `${APP_URL}/api/frame`,
    },
    triggers: [
      {
        type: 'cast',
        id: 'vote',
        url: `${APP_URL}/api/frame`,
        name: 'Vote',
      },
    ],
  });
}
