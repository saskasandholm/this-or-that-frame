import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const baseUrl = new URL(req.url).origin;

  // Frame metadata
  const frameMetadata = {
    version: 'vNext',
    image: `${baseUrl}/api/og`,
    buttons: [
      {
        label: 'This',
        action: 'post',
      },
      {
        label: 'That',
        action: 'post',
      },
    ],
    postUrl: `${baseUrl}/api/frame`,
  };

  // HTML response with frame meta tags
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>This or That - A Farcaster Frame</title>
        <meta property="og:title" content="This or That" />
        <meta property="og:description" content="Make a choice between two options!" />
        <meta property="og:image" content="${frameMetadata.image}" />
        
        <!-- Frame Meta Tags -->
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${frameMetadata.image}" />
        <meta property="fc:frame:button:1" content="${frameMetadata.buttons[0].label}" />
        <meta property="fc:frame:button:2" content="${frameMetadata.buttons[1].label}" />
        <meta property="fc:frame:post_url" content="${frameMetadata.postUrl}" />
        <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
      </head>
      <body>
        <h1>This or That - A Farcaster Frame</h1>
        <p>This page is meant to be viewed as a Farcaster Frame.</p>
      </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
