import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ClientPage from '../components/ClientPage';

export const metadata: Metadata = {
  title: 'This or That - Daily Choices',
  description: 'Vote on daily binary choices and see what the Farcaster community thinks',
  openGraph: {
    title: 'This or That - Daily Choices',
    description: 'Vote on daily binary choices and see what the Farcaster community thinks',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: 'This or That Frame',
      },
    ],
  },
};

// Frame metadata
export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default async function Home() {
  // Get the current topic
  const now = new Date();
  const currentTopic = await prisma.topic.findFirst({
    where: {
      isActive: true,
      startDate: {
        lte: now,
      },
      OR: [
        {
          endDate: null,
        },
        {
          endDate: {
            gte: now,
          },
        },
      ],
    },
    orderBy: {
      startDate: 'desc',
    },
    include: {
      category: true,
    },
  });

  // Prepare URLs
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const frameImageUrl = `${appUrl}/api/og${currentTopic ? `/topic/${currentTopic.id}` : ''}`;
  const framePostUrl = `${appUrl}/api/frame`;

  // Prepare data for client component
  const pageData = {
    currentTopic: currentTopic
      ? {
          id: currentTopic.id,
          name: currentTopic.name,
          optionA: currentTopic.optionA,
          optionB: currentTopic.optionB,
          category: currentTopic.category.name,
          // Add default image placeholders if actual images aren't available
          imageA: currentTopic.imageA || '/images/placeholder-a.png',
          imageB: currentTopic.imageB || '/images/placeholder-b.png',
        }
      : null,
    frameImageUrl,
    framePostUrl,
  };

  return (
    <>
      {/* Client component with all the interactive features */}
      <ClientPage pageData={pageData} />

      {/* Frame Meta Tags */}
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={frameImageUrl} />
        <meta property="fc:frame:post_url" content={framePostUrl} />
        <meta
          property="fc:frame:button:1"
          content={currentTopic ? currentTopic.optionA : 'Option A'}
        />
        <meta
          property="fc:frame:button:2"
          content={currentTopic ? currentTopic.optionB : 'Option B'}
        />
        {currentTopic && (
          <>
            <meta property="fc:frame:button:1:value" content="A" />
            <meta property="fc:frame:button:2:value" content="B" />
            <meta
              property="fc:frame:state"
              content={JSON.stringify({ topicId: currentTopic.id })}
            />
          </>
        )}
        <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
      </head>
    </>
  );
}
