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
 * Generates a results image for the frame
 */
export async function GET(req: NextRequest) {
  try {
    console.log('Results image request received');
    
    // Get the topic ID from the query string
    const url = new URL(req.url);
    const topicId = url.searchParams.get('topicId');
    const votedOption = url.searchParams.get('voted');
    
    if (!topicId) {
      console.error('Missing topicId parameter');
      return new Response('Missing topicId parameter', { status: 400 });
    }
    
    // Fetch topic data from the API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
    const topicUrl = new URL('/api/topics/current', baseUrl);
    topicUrl.searchParams.set('topicId', topicId);
    
    const response = await fetch(topicUrl);
    
    if (!response.ok) {
      console.error('Error fetching topic data:', response.statusText);
      return new Response('Error fetching topic data', { status: 500 });
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error('API error:', data.error);
      return new Response(data.error, { status: 500 });
    }
    
    // Get the vote data for this topic
    const votesUrl = new URL(`/api/votes/topic/${topicId}`, baseUrl);
    const votesResponse = await fetch(votesUrl);
    
    let votesA = 0;
    let votesB = 0;
    
    if (votesResponse.ok) {
      const votesData = await votesResponse.json();
      votesA = votesData.votesA || 0;
      votesB = votesData.votesB || 0;
    }
    
    const totalVotes = votesA + votesB;
    const percentA = totalVotes ? Math.round((votesA / totalVotes) * 100) : 0;
    const percentB = totalVotes ? Math.round((votesB / totalVotes) * 100) : 0;
    
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
            fontSize: '64px', 
            margin: '0 0 10px',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>{data.title || 'Results'}</h1>
          
          {/* Results Bars */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '800px',
            gap: '30px',
            margin: '40px 0',
          }}>
            {/* Option A Results */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}>
                <span style={{ 
                  fontSize: '32px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  {votedOption === 'A' && (
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#60a5fa',
                      display: 'inline-block',
                    }} />
                  )}
                  {data.optionA || 'Option A'}
                </span>
                <span style={{ 
                  fontSize: '32px',
                  fontWeight: 'bold',
                }}>
                  {percentA}%
                </span>
              </div>
              <div style={{
                height: '40px',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}>
                <div style={{
                  height: '100%',
                  width: `${percentA}%`,
                  backgroundColor: '#60a5fa',
                  borderRadius: '20px',
                }} />
              </div>
              <div style={{
                marginTop: '4px',
                fontSize: '18px',
                textAlign: 'right',
              }}>
                {votesA} votes
              </div>
            </div>
            
            {/* Option B Results */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}>
                <span style={{ 
                  fontSize: '32px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  {votedOption === 'B' && (
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#f472b6',
                      display: 'inline-block',
                    }} />
                  )}
                  {data.optionB || 'Option B'}
                </span>
                <span style={{ 
                  fontSize: '32px',
                  fontWeight: 'bold',
                }}>
                  {percentB}%
                </span>
              </div>
              <div style={{
                height: '40px',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}>
                <div style={{
                  height: '100%',
                  width: `${percentB}%`,
                  backgroundColor: '#f472b6',
                  borderRadius: '20px',
                }} />
              </div>
              <div style={{
                marginTop: '4px',
                fontSize: '18px',
                textAlign: 'right',
              }}>
                {votesB} votes
              </div>
            </div>
          </div>
          
          <p style={{ 
            fontSize: '24px', 
            opacity: '0.8',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            {totalVotes === 0 ? 'Be the first to vote!' : `Total votes: ${totalVotes}`}
          </p>
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
    console.error('Error generating results image:', error);
    return new Response('Error generating results image', { status: 500 });
  }
} 