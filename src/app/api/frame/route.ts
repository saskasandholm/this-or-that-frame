import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime to avoid Prisma Edge compatibility issues
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET handler - Returns the initial frame HTML
 */
export async function GET(_req: NextRequest) {
  try {
    console.log('Frame API GET request received');
    
    // Get current active topic
    const currentTopic = await prisma.topic.findFirst({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    // Build the base URL from environment variable or request
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://frame-lovat.vercel.app';
    console.log('Using base URL:', baseUrl);

    if (!currentTopic) {
      console.log('No active topic found, returning default frame');
      return new Response(createFrameHtml({
        title: 'No active topic',
        imageUrl: `${baseUrl}/api/frame/default-image`,
        postUrl: `${baseUrl}/api/frame`,
        optionA: 'No Option A',
        optionB: 'No Option B'
      }), {
        headers: { 
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store, max-age=0'
        },
      });
    }

    console.log(`Topic found: ${currentTopic.name}, ID: ${currentTopic.id}`);
    
    // Generate frame HTML with current topic data
    const html = createFrameHtml({
      title: currentTopic.name,
      imageUrl: `${baseUrl}/api/frame/image?topicId=${currentTopic.id}`,
      postUrl: `${baseUrl}/api/frame?topicId=${currentTopic.id}`,
      optionA: currentTopic.optionA,
      optionB: currentTopic.optionB,
    });

    return new Response(html, {
      headers: { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, max-age=0'
      },
    });
  } catch (error) {
    console.error('Error generating frame:', error);
    return new Response(createErrorFrameHtml('Server error generating frame'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

/**
 * POST handler - Processes votes and returns the updated frame
 */
export async function POST(req: NextRequest) {
  try {
    console.log('Frame API POST request received');
    
    // Get the topic ID from the URL query params
    const url = new URL(req.url);
    const topicId = url.searchParams.get('topicId');
    
    if (!topicId) {
      console.log('POST request missing topicId parameter');
      return new Response(createErrorFrameHtml('Topic ID is missing'), { 
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    console.log(`Processing vote for topic ID: ${topicId}`);
    
    // Parse the request body to get the button index
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body));
    
    const { untrustedData } = body;
    const buttonIndex = untrustedData?.buttonIndex;
    const fid = untrustedData?.fid; // Farcaster user ID
    
    console.log(`Button clicked: ${buttonIndex}, User FID: ${fid || 'anonymous'}`);
    
    if (buttonIndex !== 1 && buttonIndex !== 2) {
      // Button 3 (View Results) or any other buttons
      console.log('Non-voting button clicked, showing results view');
      return handleResultsView(req, parseInt(topicId));
    }
    
    // Process the vote (button 1 = option A, button 2 = option B)
    const isOptionA = buttonIndex === 1;
    const topicIdInt = parseInt(topicId);
    
    console.log(`Recording vote for option ${isOptionA ? 'A' : 'B'}`);
    
    // Update vote count
    await prisma.$transaction(async (tx) => {
      // Update topic vote count
      if (isOptionA) {
        await tx.topic.update({
          where: { id: topicIdInt },
          data: { votesA: { increment: 1 } },
        });
      } else {
        await tx.topic.update({
          where: { id: topicIdInt },
          data: { votesB: { increment: 1 } },
        });
      }
      
      // If user is authenticated (has FID), record their vote
      if (fid) {
        const existingVote = await tx.vote.findUnique({
          where: {
            topicId_fid: {
              fid,
              topicId: topicIdInt,
            },
          },
        });
        
        if (existingVote) {
          // Update existing vote if different
          if (existingVote.choice !== (isOptionA ? 'A' : 'B')) {
            await tx.vote.update({
              where: {
                topicId_fid: {
                  fid,
                  topicId: topicIdInt,
                },
              },
              data: {
                choice: isOptionA ? 'A' : 'B',
              },
            });
          }
        } else {
          // Create new vote
          await tx.vote.create({
            data: {
              fid,
              topicId: topicIdInt,
              choice: isOptionA ? 'A' : 'B',
            },
          });
        }
      }
    });
    
    console.log('Vote recorded successfully, showing results');
    
    // Return results view after voting
    return handleResultsView(req, topicIdInt, isOptionA ? 'A' : 'B');
  } catch (error) {
    console.error('Error processing vote:', error);
    return new Response(createErrorFrameHtml('Error processing your vote'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

/**
 * Handle showing results after voting or when viewing results
 */
async function handleResultsView(req: NextRequest, topicId: number, votedOption?: string) {
  try {
    console.log(`Generating results view for topic ID: ${topicId}`);
    
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });
    
    if (!topic) {
      console.log('Topic not found for results view');
      return new Response(createErrorFrameHtml('Topic not found'), {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    const totalVotes = topic.votesA + topic.votesB;
    const percentA = totalVotes ? Math.round((topic.votesA / totalVotes) * 100) : 0;
    const percentB = totalVotes ? Math.round((topic.votesB / totalVotes) * 100) : 0;
    
    console.log(`Results - Total votes: ${totalVotes}, A: ${percentA}%, B: ${percentB}%`);
    
    // Build the base URL from environment variable or request
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://frame-lovat.vercel.app';
    
    // Generate results frame HTML
    const html = createResultsFrameHtml({
      title: topic.name,
      imageUrl: `${baseUrl}/api/frame/results?topicId=${topicId}${votedOption ? `&voted=${votedOption}` : ''}`,
      postUrl: `${baseUrl}/api/frame?topicId=${topicId}`,
      optionA: topic.optionA,
      optionB: topic.optionB,
      votesA: topic.votesA,
      votesB: topic.votesB,
      percentA,
      percentB,
    });
    
    return new Response(html, {
      headers: { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, max-age=0'
      },
    });
  } catch (error) {
    console.error('Error generating results view:', error);
    return new Response(createErrorFrameHtml('Error showing results'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

/**
 * Creates the HTML for the initial frame
 */
function createFrameHtml({
  title,
  imageUrl,
  postUrl = '',
  optionA,
  optionB,
}: {
  title: string;
  imageUrl: string;
  postUrl?: string;
  optionA: string;
  optionB: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  
  <!-- Standard Open Graph meta tags -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="Choose between: ${optionA} or ${optionB}">
  <meta property="og:image" content="${imageUrl}">
  
  <!-- Farcaster Frame meta tags (v2) -->
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  
  <meta property="fc:frame:button:1" content="${optionA}">
  <meta property="fc:frame:button:2" content="${optionB}">
  <meta property="fc:frame:button:3" content="View Results">
  <meta property="fc:frame:post_url" content="${postUrl}">
</head>
<body>
  <h1>${title}</h1>
  <p>Choose between: ${optionA} or ${optionB}</p>
  <p>This is a Farcaster Frame. View it in a Farcaster client like Warpcast.</p>
</body>
</html>
  `;
}

/**
 * Creates the HTML for the results frame
 */
function createResultsFrameHtml({
  title,
  imageUrl,
  postUrl,
  optionA,
  optionB,
  votesA,
  votesB,
  percentA,
  percentB,
}: {
  title: string;
  imageUrl: string;
  postUrl: string;
  optionA: string;
  optionB: string;
  votesA: number;
  votesB: number;
  percentA: number;
  percentB: number;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - Results</title>
  
  <!-- Standard Open Graph meta tags -->
  <meta property="og:title" content="${title} - Results">
  <meta property="og:description" content="${optionA}: ${percentA}% vs ${optionB}: ${percentB}%">
  <meta property="og:image" content="${imageUrl}">
  
  <!-- Farcaster Frame meta tags (v2) -->
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${imageUrl}">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  
  <meta property="fc:frame:button:1" content="Vote Again">
  <meta property="fc:frame:post_url" content="${postUrl}">
</head>
<body>
  <h1>${title} - Results</h1>
  <p>${optionA}: ${percentA}% (${votesA} votes) vs ${optionB}: ${percentB}% (${votesB} votes)</p>
  <p>This is a Farcaster Frame. View it in a Farcaster client like Warpcast.</p>
</body>
</html>
  `;
}

/**
 * Creates an error frame HTML
 */
function createErrorFrameHtml(message = 'An error occurred') {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Error</title>
  
  <!-- Standard Open Graph meta tags -->
  <meta property="og:title" content="Error">
  <meta property="og:description" content="${message}">
  
  <!-- Farcaster Frame meta tags (v2) -->
  <meta property="fc:frame" content="vNext">
  <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_APP_URL || 'https://frame-lovat.vercel.app'}/api/frame/default-image">
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
  
  <meta property="fc:frame:button:1" content="Try Again">
  <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_APP_URL || 'https://frame-lovat.vercel.app'}/api/frame">
</head>
<body>
  <h1>Error</h1>
  <p>${message}</p>
  <p>This is a Farcaster Frame. View it in a Farcaster client like Warpcast.</p>
</body>
</html>
  `;
}
