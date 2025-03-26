import { NextRequest, NextResponse } from 'next/server';

// Force dynamic response
export const dynamic = 'force-dynamic';

/**
 * Handle GET requests - just redirect to the test HTML file
 */
export async function GET(req: NextRequest) {
  // Redirect to the static test frame
  return NextResponse.redirect(new URL('/basic-test.html', req.url));
}

/**
 * Handle POST requests from the frame (button clicks)
 */
export async function POST(req: NextRequest) {
  try {
    // Log the POST request
    console.log('Received Warpcast test frame POST request');
    
    // Return a simple response frame with no JavaScript
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Button Clicked</title>
  
  <!-- Basic Meta Tags -->
  <meta property="og:title" content="You Clicked the Button!">
  <meta property="og:image" content="https://placehold.co/1200x630/00FF00/FFFFFF.png?text=Success">
  
  <!-- Frame Meta Tags -->
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://placehold.co/1200x630/00FF00/FFFFFF.png?text=Success">
  <meta property="fc:frame:button:1" content="Go Back">
  <meta property="fc:frame:post_url" content="https://1bcfb18ffbcd.ngrok.app/api/warpcast-test">
</head>
<body>
  <div>Your click was registered!</div>
</body>
</html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Error handling POST request:', error);
    return new NextResponse('Error processing frame action', { status: 500 });
  }
} 