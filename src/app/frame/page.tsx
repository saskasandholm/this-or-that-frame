import { Metadata } from 'next';
import { getCurrentTopic } from '@/lib/db';

// Get the dynamic metadata for this page
export async function generateMetadata(): Promise<Metadata> {
  // Get base URL with fallback
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Get the current topic to use in button text
  let topic: any = null;
  try {
    topic = await getCurrentTopic();
  } catch (error) {
    console.error('Error fetching topic for frame:', error);
  }
  
  // Button text based on topic
  const optionA = topic?.optionA || 'Option A';
  const optionB = topic?.optionB || 'Option B';
  
  // Create the post URL with the topic ID if available
  const postUrl = topic 
    ? `${baseUrl}/api/frame/post?topicId=${topic.id}` 
    : `${baseUrl}/api/frame/post`;
  
  return {
    title: 'This or That - Frame',
    description: 'Vote on what you prefer in this or that choices',
    // Frame metadata as custom properties in the head
    openGraph: {
      title: 'This or That - Frame',
      description: 'Vote on what you prefer in this or that choices',
    },
    other: {
      'fc:frame': 'vNext',
      'fc:frame:image': `${baseUrl}/api/frame/image`,
      'fc:frame:post_url': postUrl,
      'fc:frame:button:1': optionA,
      'fc:frame:button:2': optionB,
      'fc:frame:button:3': 'View Results',
    },
  };
}

export default function FramePage() {
  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-2xl mb-4">This or That Frame</h1>
        <p className="text-xl">Loading frame...</p>
      </div>

      {/* Client-side script to initialize the Frame SDK */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Wait for the SDK to load
            (function() {
              if (window.FrameSDK) {
                console.log("Frame SDK found, sending ready signal");
                window.FrameSDK.actions.ready();
              } else {
                console.log("Frame SDK not found");
              }
            })();
          `,
        }}
      />
    </div>
  );
} 