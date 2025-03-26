import { Metadata } from 'next';

// Define the static metadata
export const metadata: Metadata = {
  title: 'This or That - Frame Test',
  description: 'Vote on what you prefer in this or that choices',
  // Add frame metadata
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': `https://1bcfb18ffbcd.ngrok.app/api/frame/image`,
    'fc:frame:post_url': `https://1bcfb18ffbcd.ngrok.app/api/frame/post`,
    'fc:frame:button:1': 'Bitcoin',
    'fc:frame:button:2': 'Ethereum',
    'fc:frame:button:3': 'View Results',
  },
};

export default function FrameTestPage() {
  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-2xl mb-4">This or That Frame Test</h1>
        <p className="text-xl mb-6">Simple frame test with hardcoded options</p>
        
        <div className="flex justify-center space-x-8 mb-8">
          <div className="p-4 bg-blue-900 rounded-lg">
            <h2 className="font-bold mb-2">Option A</h2>
            <p>Bitcoin</p>
          </div>
          
          <div className="p-4 bg-purple-900 rounded-lg">
            <h2 className="font-bold mb-2">Option B</h2>
            <p>Ethereum</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-400">
          Use this URL in Warpcast Frame Playground:<br/>
          <code className="bg-gray-800 p-1 rounded text-xs">
            https://1bcfb18ffbcd.ngrok.app/frame-test
          </code>
        </p>
      </div>

      {/* Client-side script to initialize Frame SDK */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Wait for the SDK to load
            (function() {
              if (window.FrameSDK) {
                console.log("Frame SDK found, sending ready signal");
                window.FrameSDK.actions.ready();
              } else {
                console.log("Frame SDK not found - this is normal when viewing directly");
              }
            })();
          `,
        }}
      />
    </div>
  );
} 