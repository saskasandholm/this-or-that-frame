import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const option = searchParams.get('option') || 'Option';
    const topic = searchParams.get('topic') || 'Topic';

    // Generate different background colors based on option
    const bgColor = option === 'A' ? '#4F46E5' : '#EC4899';
    const gradient =
      option === 'A'
        ? 'linear-gradient(135deg, #4F46E5, #2563EB)'
        : 'linear-gradient(135deg, #EC4899, #DB2777)';

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
            background: gradient,
            color: 'white',
            padding: '40px',
            position: 'relative',
            fontSize: '60px',
            fontWeight: 'bold',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              fontSize: '72px',
              fontWeight: 'bold',
              letterSpacing: '-0.05em',
            }}
          >
            {topic}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              fontSize: '24px',
              opacity: 0.8,
            }}
          >
            Option {option}
          </div>
        </div>
      ),
      {
        width: 500,
        height: 500,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
