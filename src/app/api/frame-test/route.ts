import { NextRequest, NextResponse } from 'next/server';

// Force dynamic response to avoid caching
export const dynamic = 'force-dynamic';

/**
 * This is a minimal test endpoint for debugging Farcaster Frame v2 integration
 * It returns the simplest possible frame HTML with proper meta tags
 */
export async function GET(req: NextRequest) {
  console.log('Frame test endpoint called');
  
  // Public ngrok URL - this should match your current tunnel
  const PUBLIC_URL = 'https://1bcfb18ffbcd.ngrok.app';
  
  // Generate a simple test frame
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Debug Frame</title>
  
  <!-- Required OpenGraph Meta Tags -->
  <meta property="og:title" content="Debug Frame">
  <meta property="og:image" content="https://placehold.co/1200x630/FF6B00/FFFFFF.png?text=Debug%20Frame">
  <meta property="og:description" content="A minimal debug frame for testing Farcaster Frame v2">
  
  <!-- Required Frame Meta Tags -->
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="https://placehold.co/1200x630/FF6B00/FFFFFF.png?text=Debug%20Frame">
  <meta property="fc:frame:post_url" content="${PUBLIC_URL}/api/frame-test">
  <meta property="fc:frame:home_url" content="${PUBLIC_URL}">
  
  <!-- Frame Buttons -->
  <meta property="fc:frame:button:1" content="Test Button">
</head>
<body style="margin:0; padding:0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #FF6B00; color: white; font-family: system-ui, sans-serif;">
  <div style="text-align: center; max-width: 80%;">
    <h1 style="font-size: 2rem; margin-bottom: 1rem;">Debug Frame</h1>
    <p style="font-size: 1.2rem; margin-bottom: 2rem;">This is a minimal test frame for debugging Farcaster Frame v2 integration.</p>
  </div>

  <script>
    (function() {
      // Function to send the ready signal to the Farcaster Frame SDK
      function sendReadySignal() {
        if (window.FrameSDK && window.FrameSDK.actions && window.FrameSDK.actions.ready) {
          console.log('FrameSDK found, calling ready()');
          try {
            window.FrameSDK.actions.ready();
            console.log('Ready signal sent successfully');
          } catch (error) {
            console.error('Error calling ready():', error);
          }
          return true;
        }
        console.log('FrameSDK not available');
        return false;
      }

      // Try to send the ready signal immediately
      sendReadySignal();
      
      // Also try when the DOM is fully loaded
      document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, trying to send ready signal');
        sendReadySignal();
      });
      
      // Add visible feedback for debugging
      if (typeof window.FrameSDK === 'undefined') {
        const debugInfo = document.createElement('div');
        debugInfo.style.position = 'fixed';
        debugInfo.style.bottom = '10px';
        debugInfo.style.left = '10px';
        debugInfo.style.padding = '5px 10px';
        debugInfo.style.background = 'rgba(0,0,0,0.7)';
        debugInfo.style.color = 'white';
        debugInfo.style.fontSize = '12px';
        debugInfo.style.borderRadius = '4px';
        debugInfo.innerText = 'Not running in Farcaster Frame environment';
        document.body.appendChild(debugInfo);
      }
    })();
  </script>
</body>
</html>`;

  // Return the HTML with appropriate headers
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

/**
 * Handle POST requests for button interactions
 */
export async function POST(req: NextRequest) {
  console.log('Frame test POST endpoint called');
  
  try {
    // Parse the incoming request body
    const body = await req.json();
    console.log('POST body:', JSON.stringify(body));
    
    // Extract the button index if available
    const buttonIndex = body.untrustedData?.buttonIndex;
    console.log('Button clicked:', buttonIndex);
    
    // Return the same HTML as the GET handler for simplicity
    return GET(req);
  } catch (error) {
    console.error('Error processing POST request:', error);
    
    // Return a simple error response
    return new NextResponse('Error processing request', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
} 