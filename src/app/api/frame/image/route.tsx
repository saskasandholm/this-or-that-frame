import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import React from 'react';

// Use Edge Runtime for better performance with ImageResponse
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Route segment config
export const preferredRegion = 'auto';
export const revalidate = 0;

// Font loading
const interBold = fetch(
  new URL('https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2', import.meta.url)
).then((res) => res.arrayBuffer());

/**
 * Generates an image for the frame based on the topic
 */
export async function GET(req: NextRequest) {
  try {
    console.log('Frame image request received');
    
    // Get the topic ID from the query string if available
    const url = new URL(req.url);
    const topicId = url.searchParams.get('topicId');
    
    // Fetch topic data from the API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
    const topicUrl = new URL('/api/topics/current', baseUrl);
    if (topicId) {
      topicUrl.searchParams.set('topicId', topicId);
    }
    
    const response = await fetch(topicUrl);
    const data = await response.json();
    
    const { title = 'This or That', optionA = 'Option A', optionB = 'Option B' } = data;

    // Load the font
    const fontData = await interBold;
    
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
            fontFamily: 'Inter',
          }}
        >
          <h1 style={{ 
            fontSize: '72px', 
            margin: '0 0 20px',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>{title}</h1>
          
          <div style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-around',
            marginTop: '40px',
            marginBottom: '40px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '15px',
              padding: '30px',
              width: '40%',
              height: '150px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: '36px',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
            }}>
              {optionA}
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              VS
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '15px',
              padding: '30px',
              width: '40%',
              height: '150px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: '36px',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
            }}>
              {optionB}
            </div>
          </div>
          
          <p style={{ 
            fontSize: '24px', 
            opacity: '0.8',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>Vote in the daily poll!</p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: fontData,
            style: 'normal',
            weight: 700,
          },
        ],
      }
    );
  } catch (error) {
    console.error('Error generating image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
