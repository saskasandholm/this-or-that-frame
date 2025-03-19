import { Metadata, ResolvingMetadata } from 'next';
import { prisma } from '@/lib/prisma';
import ClientPage from '@/components/ClientPage';

export async function generateMetadata(_params: any, parent: ResolvingMetadata): Promise<Metadata> {
  const parentMetadata = await parent;
  const previousTitle = parentMetadata.title?.absolute || 'This or That';
  const previousDescription =
    parentMetadata.description || 'Vote on binary choices and see what the community thinks';

  return {
    title: previousTitle,
    description: previousDescription,
    openGraph: {
      title: previousTitle,
      description: previousDescription,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: previousTitle,
      description: previousDescription,
    },
  };
}

type Props = {
  searchParams: Promise<{
    login?: string;
  }>;
};

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const loginRequired = params.login === 'required';

  // Get the active topic
  let activeTopic;
  try {
    activeTopic = await prisma.topic.findFirst({
      where: {
        isActive: true,
      },
      include: {
        category: true,
      },
    });
  } catch (error) {
    console.error('Error fetching active topic:', error);
    // Continue with fallback data
  }

  // Get trending topics - Example data, would normally be fetched from DB
  const trendingTopics = [
    {
      id: '1',
      title: 'Apple vs Android',
      totalVotes: 5842,
      category: 'Tech',
      trend: 'Rising',
    },
    {
      id: '2',
      title: 'Pizza vs Burgers',
      totalVotes: 4721,
      category: 'Food',
      trend: 'Hot',
    },
    {
      id: '3',
      title: 'Movies vs Books',
      totalVotes: 3654,
      category: 'Entertainment',
      trend: 'Steady',
    },
  ];

  // Get the current server port
  const currentPort = process.env.PORT || '3000';

  // Base URL for API endpoints
  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${currentPort}`}`;

  // High-quality crypto images
  const cryptoImages = {
    bitcoin:
      'https://images.unsplash.com/photo-1543699565-003b8adda5fc?q=80&w=1280&auto=format&fit=crop',
    ethereum:
      'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=1280&auto=format&fit=crop',
  };

  // Get appropriate images based on topic content
  let imageA = activeTopic?.imageA;
  let imageB = activeTopic?.imageB;

  // If the topic is about Bitcoin/Ethereum, use high-quality images
  if (activeTopic?.optionA?.toLowerCase().includes('bitcoin')) {
    imageA = cryptoImages.bitcoin;
  } else if (activeTopic?.optionA?.toLowerCase().includes('ethereum')) {
    imageA = cryptoImages.ethereum;
  }

  if (activeTopic?.optionB?.toLowerCase().includes('bitcoin')) {
    imageB = cryptoImages.bitcoin;
  } else if (activeTopic?.optionB?.toLowerCase().includes('ethereum')) {
    imageB = cryptoImages.ethereum;
  }

  // Fallback images if no custom images are provided
  const defaultImageA =
    imageA ||
    `${baseUrl}/api/og?option=A&topic=${encodeURIComponent(activeTopic?.optionA || 'Option A')}`;
  const defaultImageB =
    imageB ||
    `${baseUrl}/api/og?option=B&topic=${encodeURIComponent(activeTopic?.optionB || 'Option B')}`;

  // Prepare the URLs for the frame
  const frameImageUrl = `${baseUrl}/api/frame/image`;
  const framePostUrl = activeTopic
    ? `${baseUrl}/api/frame/post?topicId=${activeTopic.id}`
    : `${baseUrl}/api/frame/post`;

  // Did You Know facts for the active topic
  const didYouKnowFacts = [
    'Bitcoin was created in 2009 by an unknown person or group using the pseudonym Satoshi Nakamoto.',
    'Ethereum was proposed in 2013 by programmer Vitalik Buterin and went live in 2015.',
    'Unlike Bitcoin which has a fixed supply of 21 million coins, Ethereum has no maximum supply limit.',
    'Bitcoin uses a consensus mechanism called Proof of Work, while Ethereum transitioned to Proof of Stake in 2022.',
  ];

  return (
    <>
      {/* Frame metadata - hidden from regular view but used by Farcaster */}
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content={frameImageUrl} />
      <meta property="fc:frame:post_url" content={framePostUrl} />
      <meta property="fc:frame:button:1" content="Vote Option A" />
      <meta property="fc:frame:button:2" content="Vote Option B" />
      <meta property="fc:frame:button:3" content="View Results" />

      <ClientPage
        topicTitle={activeTopic?.name || 'Bitcoin or Ethereum?'}
        topicOptions={
          activeTopic
            ? {
                optionA: activeTopic.optionA,
                optionB: activeTopic.optionB,
                imageA: defaultImageA,
                imageB: defaultImageB,
              }
            : {
                optionA: 'Bitcoin',
                optionB: 'Ethereum',
                imageA: cryptoImages.bitcoin,
                imageB: cryptoImages.ethereum,
              }
        }
        currentTopicId={activeTopic?.id?.toString() || 'sample-1'}
        frameImageUrl={frameImageUrl}
        framePostUrl={framePostUrl}
        frameButtonText="Share on Farcaster"
        welcomeMessage="Welcome to This or That!"
        appDescription="Join thousands of users in the Farcaster community voting on daily topics. Express your opinion, discover what others think, and challenge your friends."
        howItWorks={[
          'Vote on daily topics',
          'See real-time community results',
          'Share topics with friends',
          'Earn streaks by voting daily',
        ]}
        trendingTopics={trendingTopics}
        didYouKnowFacts={didYouKnowFacts}
        showFirstTimeExperience={true}
        loginRequired={loginRequired}
      />
    </>
  );
}
