import { ImageResponse } from 'next/og';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentTopicForEdge } from '@/lib/topics';

export const runtime = 'edge';

// This route provides a quick way to test frames with Farcaster
export async function GET(req: NextRequest) {
  try {
    // Get the base URL from the request 
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    // Get the current topic
    const currentTopic = await getCurrentTopicForEdge();
    
    // Fall back topic data
    const optionA = currentTopic?.optionA || 'Option A';
    const optionB = currentTopic?.optionB || 'Option B';
    const topicName = currentTopic?.name || 'Make a choice';
    
    // Create the post URL for interaction
    const postUrl = currentTopic 
      ? `${baseUrl}/api/frame/post?topicId=${currentTopic.id}` 
      : `${baseUrl}/api/frame/post`;
    
    // Create the image URL
    const imageUrl = `${baseUrl}/api/frame/image`;
    
    // Return HTML with frame tags
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>This or That - Frame Test</title>
          <meta property="og:title" content="This or That" />
          <meta property="og:description" content="${topicName}" />
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${imageUrl}" />
          <meta property="fc:frame:post_url" content="${postUrl}" />
          <meta property="fc:frame:button:1" content="${optionA}" />
          <meta property="fc:frame:button:2" content="${optionB}" />
          <meta property="fc:frame:button:3" content="View Results" />
        </head>
        <body style="margin:0; background:#000; color:#fff; font-family:system-ui, sans-serif; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center;">
          <h1>This or That - Frame Test</h1>
          <p>Current topic: ${topicName}</p>
          <p>Options: ${optionA} or ${optionB}</p>
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
    console.error('Error in frame test route:', error);
    
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