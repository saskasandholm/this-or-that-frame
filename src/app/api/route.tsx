import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(_request: NextRequest) {
  try {
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
            backgroundColor: '#1a202c',
            color: 'white',
            padding: 40,
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 40,
            }}
          >
            This or That?
          </h1>

          <div
            style={{
              fontSize: 36,
              textAlign: 'center',
              marginBottom: 80,
              maxWidth: '80%',
            }}
          >
            A fun decision maker frame for Farcaster
          </div>

          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-around',
              gap: 40,
            }}
          >
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#3182ce',
                color: 'white',
                padding: '20px 30px',
                borderRadius: 16,
                fontSize: 36,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              This
            </div>

            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#e53e3e',
                color: 'white',
                padding: '20px 30px',
                borderRadius: 16,
                fontSize: 36,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              That
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 20,
              fontSize: 24,
              opacity: 0.8,
            }}
          >
            Loading...
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating splash image:', error);

    return new Response('Error generating image', { status: 500 });
  }
}
