import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getTopicById, getTopicStats } from '@/lib/topics';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    // Get the topic ID from query parameters
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get('topicId');

    if (!topicId) {
      return new Response('Missing topicId parameter', { status: 400 });
    }

    // Get the topic details
    const topic = await getTopicById(parseInt(topicId));

    if (!topic) {
      return new Response('Topic not found', { status: 404 });
    }

    // Get topic stats
    const stats = await getTopicStats(parseInt(topicId));

    if (!stats) {
      return new Response('Topic stats not found', { status: 404 });
    }

    const { totalVotes, percentageA, percentageB } = stats;

    // Calculate progress bar widths based on percentages
    const barAWidth = Math.max(percentageA, 10); // Ensure bar is at least 10% width for visibility
    const barBWidth = Math.max(percentageB, 10); // Ensure bar is at least 10% width for visibility

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom right, #4F46E5, #7C3AED)',
            color: 'white',
            padding: '40px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '20px',
              width: '100%',
            }}
          >
            <h1 style={{ fontSize: '48px', margin: '0 0 10px' }}>This or That</h1>
            <p style={{ fontSize: '24px', opacity: '0.9' }}>Results</p>
          </div>

          {/* Topic Question */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '15px',
              padding: '20px',
              width: '90%',
              marginBottom: '20px',
            }}
          >
            <h2 style={{ fontSize: '36px', margin: '0', textAlign: 'center' }}>{topic.name}</h2>
          </div>

          {/* Total votes */}
          <div
            style={{
              fontSize: '20px',
              marginBottom: '30px',
              opacity: '0.8',
            }}
          >
            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} total
          </div>

          {/* Results */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: '30px',
              marginBottom: '40px',
            }}
          >
            {/* Option A Result */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{topic.optionA}</span>
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{percentageA}%</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '30px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '15px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${barAWidth}%`,
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '15px',
                  }}
                />
              </div>
            </div>

            {/* Option B Result */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{topic.optionB}</span>
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{percentageB}%</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '30px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '15px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${barBWidth}%`,
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '15px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              opacity: '0.8',
            }}
          >
            <p>Vote on more topics on Farcaster</p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating results image:', error);

    // Return a fallback image in case of an error
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
            background: 'linear-gradient(to bottom right, #4F46E5, #7C3AED)',
            color: 'white',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '72px', margin: '0 0 20px' }}>This or That</h1>
          <p style={{ fontSize: '32px', margin: '0' }}>Results coming soon...</p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
