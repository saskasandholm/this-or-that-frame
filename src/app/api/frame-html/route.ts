export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Simple, standalone HTML frame endpoint
 * This endpoint is specifically designed to serve a valid Farcaster frame
 * with minimal dependencies and maximum compatibility.
 */
export async function GET() {
  // Hard-coded data for reliable testing
  const imageUrl = 'https://1bcfb18ffbcd.ngrok.app/api/frame/image';
  const postUrl = 'https://1bcfb18ffbcd.ngrok.app/api/frame/post';
  
  // Create the most basic HTML frame possible
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>This or That Frame</title>
    <meta property="og:title" content="This or That Frame">
    <meta property="og:image" content="${imageUrl}">
    <meta property="fc:frame" content="vNext">
    <meta property="fc:frame:image" content="${imageUrl}">
    <meta property="fc:frame:post_url" content="${postUrl}">
    <meta property="fc:frame:button:1" content="Bitcoin">
    <meta property="fc:frame:button:2" content="Ethereum">
    <meta property="fc:frame:button:3" content="View Results">
  </head>
  <body style="margin:0; padding:0; background:#000; color:#fff; font-family:system-ui; display:flex; align-items:center; justify-content:center; height:100vh;">
    <div style="text-align:center; max-width:500px; padding:20px;">
      <h1>This or That Frame</h1>
      <p>Choose between Bitcoin and Ethereum</p>
      <div style="display:flex; justify-content:center; gap:20px; margin:20px 0;">
        <div style="background:#1e3a8a; padding:15px; border-radius:8px; width:150px;">
          <h2>Bitcoin</h2>
        </div>
        <div style="background:#7e22ce; padding:15px; border-radius:8px; width:150px;">
          <h2>Ethereum</h2>
        </div>
      </div>
      <script>
        // Send the ready signal when the page loads
        document.addEventListener('DOMContentLoaded', function() {
          if (window.FrameSDK) {
            console.log('Frame SDK found, sending ready signal');
            window.FrameSDK.actions.ready();
          } else {
            console.log('Frame SDK not found - normal when viewing directly');
            
            // For debugging: Create a visual indicator when viewing directly
            const debugDiv = document.createElement('div');
            debugDiv.style.padding = '10px';
            debugDiv.style.marginTop = '20px';
            debugDiv.style.background = '#333';
            debugDiv.style.borderRadius = '4px';
            debugDiv.innerHTML = 'Frame URL: <code>https://1bcfb18ffbcd.ngrok.app/api/frame-html</code>';
            document.body.appendChild(debugDiv);
          }
        });
      </script>
    </div>
  </body>
</html>
  `.trim();

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
} 