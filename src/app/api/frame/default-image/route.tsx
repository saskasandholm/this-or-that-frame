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
 * Generates a default image for the frame when no topics are available
 */
export async function GET(_req: NextRequest) {
  try {
    console.log('Default frame image request received');
    
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
            background: 'linear-gradient(to bottom right, #3B82F6, #10B981)',
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
          }}>This or That</h1>
          
          <div style={{
            fontSize: '48px',
            padding: '40px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '15px',
            marginBottom: '40px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
          }}>
            Vote on Daily Topics!
          </div>
          
          <div style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-around',
            marginBottom: '40px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '15px',
              padding: '20px',
              width: '30%',
              height: '100px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: '28px',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
            }}>
              Bitcoin
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              OR
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '15px',
              padding: '20px',
              width: '30%',
              height: '100px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: '28px',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
            }}>
              Ethereum
            </div>
          </div>
          
          <p style={{ 
            fontSize: '24px', 
            opacity: '0.8',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>New topics every day!</p>
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
    console.error('Error generating default image:', error);
    return new Response('Error generating image', { status: 500 });
  }
} 