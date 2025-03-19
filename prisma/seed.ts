import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean up existing data
  await prisma.vote.deleteMany({});
  await prisma.userAchievement.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.topic.deleteMany({});
  await prisma.userStreak.deleteMany({});
  await prisma.topicSubmission.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.admin.deleteMany({});

  console.log('✅ Cleaned existing data');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Crypto Fundamentals',
        description: 'Basic concepts and principles of cryptocurrency and blockchain.',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Tech Philosophy',
        description: 'Broader discussions about technology and its impact.',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Trading & Markets',
        description: 'Topics related to trading, investing, and market dynamics.',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Culture & Lifestyle',
        description: 'How web3 and technology intersect with our daily lives.',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Farcaster-Specific',
        description: 'Topics specifically about Farcaster and its ecosystem.',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Get category IDs by name for easy reference
  const categoryIdsByName = categories.reduce(
    (acc, category) => {
      acc[category.name] = category.id;
      return acc;
    },
    {} as Record<string, number>
  );

  // Create topics
  const topics = [
    // Crypto Fundamentals
    {
      name: 'Store of Value or World Computer?',
      categoryId: categoryIdsByName['Crypto Fundamentals'],
      optionA: 'Bitcoin',
      optionB: 'Ethereum',
      imageA: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      imageB: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      isActive: true,
    },
    {
      name: 'Base Layer or Scaling Solution?',
      categoryId: categoryIdsByName['Crypto Fundamentals'],
      optionA: 'Layer 1',
      optionB: 'Layer 2',
      isActive: false,
    },

    // Tech Philosophy
    {
      name: 'Centralized Convenience or Decentralized Ownership?',
      categoryId: categoryIdsByName['Tech Philosophy'],
      optionA: 'Web2',
      optionB: 'Web3',
      imageA: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1',
      imageB: 'https://images.unsplash.com/photo-1639762681057-408e52192e55',
      isActive: false,
    },
    {
      name: "Humanity's Helper or Existential Threat?",
      categoryId: categoryIdsByName['Tech Philosophy'],
      optionA: 'AI: Beneficial',
      optionB: 'AI: Dangerous',
      isActive: false,
    },

    // Trading & Markets
    {
      name: "What's your current market sentiment?",
      categoryId: categoryIdsByName['Trading & Markets'],
      optionA: 'Bullish',
      optionB: 'Bearish',
      imageA: 'https://images.unsplash.com/photo-1607457561901-e6ec3a6d16cf',
      imageB: 'https://images.unsplash.com/photo-1611165243857-4a770b3ee3b6',
      isActive: true,
    },
    {
      name: 'Which strategy do you prefer?',
      categoryId: categoryIdsByName['Trading & Markets'],
      optionA: 'HODL',
      optionB: 'Active Trading',
      isActive: false,
    },

    // Culture & Lifestyle
    {
      name: 'Which work environment do you prefer?',
      categoryId: categoryIdsByName['Culture & Lifestyle'],
      optionA: 'Remote Work',
      optionB: 'Office',
      isActive: false,
    },
    {
      name: 'When are you most productive?',
      categoryId: categoryIdsByName['Culture & Lifestyle'],
      optionA: 'Morning',
      optionB: 'Night',
      isActive: false,
    },

    // Farcaster-Specific
    {
      name: 'What style of casts do you prefer?',
      categoryId: categoryIdsByName['Farcaster-Specific'],
      optionA: 'Short Casts',
      optionB: 'Long Threads',
      isActive: false,
    },
    {
      name: 'How do you prefer to use Farcaster?',
      categoryId: categoryIdsByName['Farcaster-Specific'],
      optionA: 'Web Client',
      optionB: 'Mobile App',
      isActive: false,
    },

    // The main active topic
    {
      name: 'Coffee vs Tea: Which do you prefer?',
      categoryId: categoryIdsByName['Culture & Lifestyle'],
      optionA: 'Coffee',
      optionB: 'Tea',
      imageA: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e',
      imageB: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3',
      isActive: true,
      votesA: 127,
      votesB: 89,
    },
  ];

  // Create all topics
  for (const topic of topics) {
    await prisma.topic.create({
      data: topic,
    });
  }

  console.log(`✅ Created ${topics.length} topics`);

  // Create achievements
  const achievements = [
    // Voting achievements
    {
      name: 'First Vote',
      description: 'Cast your first vote',
      badgeIcon: '🗳️',
      badgeColor: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
      threshold: 1,
      type: 'votes',
      category: 'voting',
      tier: 1,
      rarity: 'common',
    },
    {
      name: 'Regular Voter',
      description: 'Cast 10 votes',
      badgeIcon: '🔄',
      badgeColor: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
      threshold: 10,
      type: 'votes',
      category: 'voting',
      tier: 2,
      rarity: 'common',
    },
    {
      name: 'Voting Enthusiast',
      description: 'Cast 50 votes',
      badgeIcon: '⭐',
      badgeColor: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
      threshold: 50,
      type: 'votes',
      category: 'voting',
      tier: 3,
      rarity: 'uncommon',
    },
    {
      name: 'Voting Influencer',
      description: 'Cast 100 votes',
      badgeIcon: '🌟',
      badgeColor: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
      threshold: 100,
      type: 'votes',
      category: 'voting',
      tier: 4,
      rarity: 'rare',
    },
    {
      name: 'Voting Legend',
      description: 'Cast 500 votes',
      badgeIcon: '👑',
      badgeColor: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
      threshold: 500,
      type: 'votes',
      category: 'voting',
      tier: 5,
      rarity: 'epic',
    },

    // Streak achievements
    {
      name: '3-Day Streak',
      description: 'Vote for 3 days in a row',
      badgeIcon: '🔥',
      badgeColor: 'linear-gradient(135deg, #F59E0B, #EF4444)',
      threshold: 3,
      type: 'streak',
      category: 'streak',
      tier: 1,
      rarity: 'common',
    },
    {
      name: 'Week-long Streak',
      description: 'Vote for 7 days in a row',
      badgeIcon: '🔥🔥',
      badgeColor: 'linear-gradient(135deg, #F59E0B, #EF4444)',
      threshold: 7,
      type: 'streak',
      category: 'streak',
      tier: 2,
      rarity: 'uncommon',
    },
    {
      name: 'Two-week Streak',
      description: 'Vote for 14 days in a row',
      badgeIcon: '🔥🔥🔥',
      badgeColor: 'linear-gradient(135deg, #F59E0B, #EF4444)',
      threshold: 14,
      type: 'streak',
      category: 'streak',
      tier: 3,
      rarity: 'rare',
    },
    {
      name: 'Month-long Streak',
      description: 'Vote for 30 days in a row',
      badgeIcon: '🏆',
      badgeColor: 'linear-gradient(135deg, #F59E0B, #EF4444)',
      threshold: 30,
      type: 'streak',
      category: 'streak',
      tier: 4,
      rarity: 'epic',
    },
    {
      name: 'Season Champion',
      description: 'Vote for 90 days in a row',
      badgeIcon: '🏆🏆',
      badgeColor: 'linear-gradient(135deg, #F59E0B, #EF4444)',
      threshold: 90,
      type: 'streak',
      category: 'streak',
      tier: 5,
      rarity: 'legendary',
    },

    // Social achievements
    {
      name: 'First Share',
      description: 'Share a vote result for the first time',
      badgeIcon: '📢',
      badgeColor: 'linear-gradient(135deg, #10B981, #059669)',
      threshold: 1,
      type: 'social',
      category: 'social',
      tier: 1,
      rarity: 'common',
    },
    {
      name: 'Social Butterfly',
      description: 'Share 5 different vote results',
      badgeIcon: '🦋',
      badgeColor: 'linear-gradient(135deg, #10B981, #059669)',
      threshold: 5,
      type: 'social',
      category: 'social',
      tier: 2,
      rarity: 'uncommon',
    },
    {
      name: 'Viral Spreader',
      description: 'Share 10 different vote results',
      badgeIcon: '📊',
      badgeColor: 'linear-gradient(135deg, #10B981, #059669)',
      threshold: 10,
      type: 'social',
      category: 'social',
      tier: 3,
      rarity: 'rare',
    },

    // Exploration achievements
    {
      name: 'Topic Explorer',
      description: 'Vote in 3 different topic categories',
      badgeIcon: '🧭',
      badgeColor: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
      threshold: 3,
      type: 'categories',
      category: 'exploration',
      tier: 1,
      rarity: 'common',
    },
    {
      name: 'Topic Adventurer',
      description: 'Vote in 5 different topic categories',
      badgeIcon: '🗺️',
      badgeColor: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
      threshold: 5,
      type: 'categories',
      category: 'exploration',
      tier: 2,
      rarity: 'uncommon',
    },
    {
      name: 'Topic Connoisseur',
      description: 'Vote in all available topic categories',
      badgeIcon: '🌎',
      badgeColor: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
      threshold: 10,
      type: 'categories',
      category: 'exploration',
      tier: 3,
      rarity: 'rare',
    },

    // Special and rare achievements
    {
      name: 'Early Adopter',
      description: 'One of the first 1000 users to try This or That',
      badgeIcon: '🚀',
      badgeColor: 'linear-gradient(135deg, #EC4899, #D946EF)',
      threshold: 1,
      type: 'special',
      category: 'rare',
      tier: 1,
      rarity: 'epic',
      isShareable: true,
    },
    {
      name: 'Against the Crowd',
      description: 'Vote against the majority in 10 highly contested topics',
      badgeIcon: '��',
      badgeColor: 'linear-gradient(135deg, #EC4899, #D946EF)',
      threshold: 10,
      type: 'special',
      category: 'rare',
      tier: 2,
      rarity: 'rare',
    },
    {
      name: 'Trendsetter',
      description: 'Be among the first 100 to vote on a topic that becomes trending',
      badgeIcon: '📈',
      badgeColor: 'linear-gradient(135deg, #EC4899, #D946EF)',
      threshold: 1,
      type: 'special',
      category: 'rare',
      tier: 2,
      rarity: 'epic',
    },
  ];

  // Create all achievements
  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: achievement,
    });
  }

  console.log(`✅ Created ${achievements.length} achievements`);

  // Create an admin user for testing
  await prisma.admin.create({
    data: {
      fid: 1,
      permissions: 'full_admin',
      isActive: true,
    },
  });

  console.log('✅ Created admin user');

  console.log('✅ Database seeding completed!');
}

main()
  .catch(e => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
