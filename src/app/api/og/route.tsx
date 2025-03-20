import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(_req: NextRequest) {
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
            background: 'linear-gradient(135deg, #4F46E5, #2563EB)',
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
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
