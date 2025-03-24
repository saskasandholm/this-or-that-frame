import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Cache configuration for OG images
 * Setting to 0 for better control via Cache-Control headers
 */
export const revalidate = 0;

/**
 * Generates the Open Graph image for the Farcaster Frame
 * This endpoint is called when the frame is shared or displayed in a feed
 * 
 * @param {NextRequest} _req - The request object (unused but kept for type safety)
 * @returns {Promise<ImageResponse>} - The generated image response
 */
export async function GET(_req: NextRequest) {
  try {
    // Use try/catch for image loading to prevent entire response failure
    const backgroundGradient = 'linear-gradient(135deg, #4F46E5, #2563EB)';
    
    // Start timing the image generation
    const startTime = Date.now();
    
    // Generate the image
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
            background: backgroundGradient,
            color: 'white',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '40px',
            }}
          >
            <h1
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                textAlign: 'center',
                margin: 0,
              }}
            >
              This or That?
            </h1>
            <div
              style={{
                display: 'flex',
                gap: '40px',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  padding: '20px 40px',
                  background: '#4F46E5',
                  borderRadius: '16px',
                  fontSize: '48px',
                  fontWeight: 'bold',
                }}
              >
                This
              </div>
              <div
                style={{
                  fontSize: '36px',
                  opacity: 0.8,
                }}
              >
                or
              </div>
              <div
                style={{
                  padding: '20px 40px',
                  background: '#EC4899',
                  borderRadius: '16px',
                  fontSize: '48px',
                  fontWeight: 'bold',
                }}
              >
                That
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 628, // Approximately 1.91:1 ratio (1200/628 ≈ 1.91)
        // Set appropriate headers for caching and performance
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': process.env.NODE_ENV === 'production' 
            ? 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' 
            : 'no-cache, no-store',
        },
      }
    );
    
    // Log generation time in development for performance analysis
    if (process.env.NODE_ENV !== 'production') {
      const endTime = Date.now();
      console.log(`OG image generated in ${endTime - startTime}ms`);
    }
    
    return imageResponse;
  } catch (error) {
    console.error('Error generating OG image:', error);
    
    // Provide a fallback image response rather than failing completely
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: '#1F2937',
            color: 'white',
            padding: '40px',
          }}
        >
          <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
            This or That?
          </div>
          <div style={{ fontSize: '24px', marginTop: '20px' }}>
            Make your choice
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 628,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache, no-store',
        },
      }
    );
  }
}
