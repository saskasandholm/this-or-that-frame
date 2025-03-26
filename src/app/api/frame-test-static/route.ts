import { NextRequest, NextResponse } from 'next/server';

// This route provides a simple static frame test without edge runtime or DB access
export async function GET(req: NextRequest) {
  try {
    // Get URL from request
    const url = new URL(req.url);
    const ngrokUrl = 'https://1bcfb18ffbcd.ngrok.app';
    
    // Return HTML with frame tags
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>This or That - Static Frame Test</title>
          <meta property="og:title" content="This or That" />
          <meta property="og:description" content="Bitcoin or Ethereum?" />
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${ngrokUrl}/api/frame/image" />
          <meta property="fc:frame:post_url" content="${ngrokUrl}/api/frame/post" />
          <meta property="fc:frame:button:1" content="Bitcoin" />
          <meta property="fc:frame:button:2" content="Ethereum" />
          <meta property="fc:frame:button:3" content="View Results" />
        </head>
        <body style="margin:0; background:#000; color:#fff; font-family:system-ui, sans-serif; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center;">
          <h1>This or That - Static Frame Test</h1>
          <p>Current topic: Bitcoin or Ethereum?</p>
          <div style="display:flex; gap:20px; margin:20px 0;">
            <div style="background:#1e40af; padding:20px; border-radius:10px; text-align:center;">
              <h2>Option A</h2>
              <p>Bitcoin</p>
            </div>
            <div style="background:#6b21a8; padding:20px; border-radius:10px; text-align:center;">
              <h2>Option B</h2>
              <p>Ethereum</p>
            </div>
          </div>
          <p style="margin-top:20px; font-size:14px; color:#999;">
            Use this URL in Warpcast Frame Playground:<br>
            <code style="background:#333; padding:4px; border-radius:4px; font-size:12px;">
              ${ngrokUrl}/api/frame-test-static
            </code>
          </p>
          <script>
            // Signal to Farcaster that the frame is ready
            if (window.FrameSDK) {
              console.log("Frame SDK found, sending ready signal");
              window.FrameSDK.actions.ready();
            } else {
              console.log("Frame SDK not found - this is normal when viewing directly");
            }
          </script>
        </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error in static frame test route:', error);
    
    // Return a basic error page
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>This or That - Frame Test Error</title>
        </head>
        <body style="margin:0; background:#000; color:#fff; font-family:system-ui, sans-serif; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center;">
          <h1>Frame Test Error</h1>
          <p>Something went wrong generating the frame test.</p>
          <p>Check server logs for details.</p>
        </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
        status: 500,
      }
    );
  }
} 