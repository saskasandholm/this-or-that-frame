import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getCurrentTopicForEdge } from '@/lib/topics';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    // Get the current topic using the edge-compatible function
    const currentTopic = await getCurrentTopicForEdge();

    // Define the width and height for the image
    const width = 1200;
    const height = 630;

    // If no active topic is found, return a default image
    if (!currentTopic) {
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
            <p style={{ fontSize: '36px', margin: '0 0 40px' }}>Choose between two options!</p>
          </div>
        ),
        {
          width,
          height,
        }
      );
    }

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
              marginBottom: '30px',
              width: '100%',
            }}
          >
            <h1 style={{ fontSize: '48px', margin: '0 0 10px' }}>This or That</h1>
            <p style={{ fontSize: '24px', opacity: '0.9' }}>Choose your preference!</p>
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
              marginBottom: '30px',
            }}
          >
            <h2 style={{ fontSize: '36px', margin: '0', textAlign: 'center' }}>
              {currentTopic.name}
            </h2>
          </div>

          {/* Options */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              width: '100%',
              marginBottom: '40px',
            }}
          >
            {/* Option A */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '15px',
                padding: '30px',
                width: '45%',
                height: '200px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <h3 style={{ fontSize: '36px', margin: '0 0 15px' }}>{currentTopic.optionA}</h3>
              {/* Image with fallback for option A */}
              {currentTopic.imageA ? (
                <img
                  src={currentTopic.imageA}
                  alt={currentTopic.optionA}
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                  }}
                  onError={e => {
                    // Handle image loading error by hiding the image element
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
            </div>

            {/* VS Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <p style={{ fontSize: '32px', fontWeight: 'bold' }}>VS</p>
            </div>

            {/* Option B */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '15px',
                padding: '30px',
                width: '45%',
                height: '200px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <h3 style={{ fontSize: '36px', margin: '0 0 15px' }}>{currentTopic.optionB}</h3>
              {/* Image with fallback for option B */}
              {currentTopic.imageB ? (
                <img
                  src={currentTopic.imageB}
                  alt={currentTopic.optionB}
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                  }}
                  onError={e => {
                    // Handle image loading error by hiding the image element
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
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
            <p>Cast your vote on Farcaster</p>
          </div>
        </div>
      ),
      {
        width,
        height,
      }
    );
  } catch (error) {
    console.error('Error generating frame image:', error);

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
          <p style={{ fontSize: '32px', margin: '0' }}>Choose between two options!</p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
