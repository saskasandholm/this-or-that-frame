import { NextRequest, NextResponse } from 'next/server';

// Force dynamic response
export const dynamic = 'force-dynamic';

/**
 * Handle GET requests - just redirect to the test HTML file
 */
export async function GET(req: NextRequest) {
  // Redirect to the static test frame
  return NextResponse.redirect(new URL('/minimal-test.html', req.url));
}

/**
 * Handle POST requests from the frame (button clicks)
 */
export async function POST(req: NextRequest) {
  try {
    // Log the full request
    console.log('Received frame POST request');
    
    // Parse the frame data if available
    const data = await req.json().catch(() => ({}));
    console.log('Frame POST data:', JSON.stringify(data));
    
    // Return a simple response frame
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Response Frame</title>
  
  <!-- Basic OpenGraph Tags -->
  <meta property="og:title" content="Response Frame">
  <meta property="og:image" content="https://placehold.co/1200x630/33A1FF/FFFFFF.png?text=Button+Clicked">
  <meta property="og:description" content="Button click response">
  
  <!-- Required Frame Meta Tags -->
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://placehold.co/1200x630/33A1FF/FFFFFF.png?text=Button+Clicked">
  <meta property="fc:frame:post_url" content="https://1bcfb18ffbcd.ngrok.app/api/minimal-frame-post">
  <meta property="fc:frame:home_url" content="https://1bcfb18ffbcd.ngrok.app">
  
  <!-- Frame Buttons -->
  <meta property="fc:frame:button:1" content="Go Back">
</head>
<body>
  <div style="text-align:center; padding: 2rem;">
    <h1>Button Clicked!</h1>
    <p>This is a response frame</p>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error handling frame request:', error);
    return new NextResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
} 