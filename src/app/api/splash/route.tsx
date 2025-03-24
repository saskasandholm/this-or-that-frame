import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/**
 * Cache configuration for splash image
 * Setting to 0 for better control via Cache-Control headers
 */
export const revalidate = 0;

/**
 * Generates the splash image for the Farcaster Frame
 * This image is displayed when the frame is loading or as an icon
 * The splash image should be 200x200px as recommended by Farcaster specs
 * 
 * @returns {Promise<ImageResponse>} - The generated image response
 */
export async function GET() {
  try {
    // Start timing the image generation
    const startTime = Date.now();
    
    // Define the splash image dimensions (200x200px as recommended by Farcaster)
    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom right, #1a202c, #4a5568)',
            borderRadius: '24px',
            padding: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '16px',
            }}
          >
            This or That?
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '20px',
              color: '#e2e8f0',
              textAlign: 'center',
            }}
          >
            Vote on daily binary choices
          </div>
        </div>
      ),
      {
        width: 200,
        height: 200,
        // Set appropriate headers for caching and performance
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': process.env.NODE_ENV === 'production' 
            ? 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800' 
            : 'no-cache, no-store',
        },
      }
    );
    
    // Log generation time in development for performance analysis
    if (process.env.NODE_ENV !== 'production') {
      const endTime = Date.now();
      console.log(`Splash image generated in ${endTime - startTime}ms`);
    }
    
    return imageResponse;
  } catch (e) {
    console.error('Error generating splash image:', e);
    
    // Provide a simpler fallback image in case of errors
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: '#1a202c',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
          }}
        >
          This or That?
        </div>
      ),
      {
        width: 200,
        height: 200,
      }
    );
  }
} 