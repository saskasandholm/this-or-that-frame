import { NextRequest } from 'next/server';

// Configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Simple POST handler for frame interactions
 * This doesn't rely on any database access
 */
export async function POST(req: NextRequest) {
  try {
    // Get the button index from the request
    const data = await req.json();
    const buttonIndex = data?.untrustedData?.buttonIndex || 0;
    
    // Generate a simple HTML response based on the button clicked
    let buttonText = 'Unknown';
    if (buttonIndex === 1) {
      buttonText = 'Bitcoin';
    } else if (buttonIndex === 2) {
      buttonText = 'Ethereum';
    } else if (buttonIndex === 3) {
      buttonText = 'Results';
    }
    
    // Build frame HTML response
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext">
          <meta property="fc:frame:image" content="https://1bcfb18ffbcd.ngrok.app/api/frame/image">
          <meta property="fc:frame:post_url" content="https://1bcfb18ffbcd.ngrok.app/api/frame/post">
          <meta property="fc:frame:button:1" content="Bitcoin">
          <meta property="fc:frame:button:2" content="Ethereum">
          <meta property="fc:frame:button:3" content="View Results">
          <meta property="og:image" content="https://1bcfb18ffbcd.ngrok.app/api/frame/image">
        </head>
        <body>
          <p>You clicked: ${buttonText}</p>
        </body>
      </html>
    `;
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    console.error('Error handling frame POST:', error);
    
    // Return a simple error response frame
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext">
          <meta property="fc:frame:image" content="https://1bcfb18ffbcd.ngrok.app/api/frame/image">
          <meta property="fc:frame:post_url" content="https://1bcfb18ffbcd.ngrok.app/api/frame/post">
          <meta property="fc:frame:button:1" content="Try Again">
          <meta property="og:image" content="https://1bcfb18ffbcd.ngrok.app/api/frame/image">
        </head>
        <body>
          <p>An error occurred</p>
        </body>
      </html>
    `;
    
    return new Response(errorHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}
