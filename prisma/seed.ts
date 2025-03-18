import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const categories = [
    {
      name: 'Food & Drink',
      description: 'Culinary preferences and choices',
    },
    {
      name: 'Entertainment',
      description: 'Movies, TV shows, music, and more',
    },
    {
      name: 'Lifestyle',
      description: 'Daily habits and preferences',
    },
    {
      name: 'Technology',
      description: 'Tech preferences and choices',
    },
    {
      name: 'Travel',
      description: 'Travel destinations and preferences',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // Get category IDs
  const foodCategory = await prisma.category.findUnique({
    where: { name: 'Food & Drink' },
  });

  const entertainmentCategory = await prisma.category.findUnique({
    where: { name: 'Entertainment' },
  });

  const lifestyleCategory = await prisma.category.findUnique({
    where: { name: 'Lifestyle' },
  });

  const techCategory = await prisma.category.findUnique({
    where: { name: 'Technology' },
  });

  const travelCategory = await prisma.category.findUnique({
    where: { name: 'Travel' },
  });

  if (
    !foodCategory ||
    !entertainmentCategory ||
    !lifestyleCategory ||
    !techCategory ||
    !travelCategory
  ) {
    throw new Error('Failed to create categories');
  }

  // Create topics
  const topics = [
    {
      name: 'Coffee vs Tea',
      categoryId: foodCategory.id,
      optionA: 'Coffee',
      optionB: 'Tea',
      isActive: true,
    },
    {
      name: 'Pizza vs Burger',
      categoryId: foodCategory.id,
      optionA: 'Pizza',
      optionB: 'Burger',
      isActive: false,
    },
    {
      name: 'Movies vs TV Shows',
      categoryId: entertainmentCategory.id,
      optionA: 'Movies',
      optionB: 'TV Shows',
      isActive: false,
    },
    {
      name: 'Early Bird vs Night Owl',
      categoryId: lifestyleCategory.id,
      optionA: 'Early Bird',
      optionB: 'Night Owl',
      isActive: false,
    },
    {
      name: 'iOS vs Android',
      categoryId: techCategory.id,
      optionA: 'iOS',
      optionB: 'Android',
      isActive: false,
    },
    {
      name: 'Beach vs Mountains',
      categoryId: travelCategory.id,
      optionA: 'Beach',
      optionB: 'Mountains',
      isActive: false,
    },
  ];

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: {
        id: -1, // This will always fail, forcing an insert
      },
      update: {},
      create: topic,
    });
  }

  // Create initial achievements
  console.log(`Creating initial achievements...`);

  const achievements = [
    {
      name: 'Streak Starter',
      description: 'Vote on 3 consecutive days',
      badgeIcon: '🔥',
      badgeColor: 'from-yellow-600 to-orange-600',
      threshold: 3,
      type: 'streak',
    },
    {
      name: 'Streak Master',
      description: 'Vote on 7 consecutive days',
      badgeIcon: '🔥🔥',
      badgeColor: 'from-orange-600 to-red-600',
      threshold: 7,
      type: 'streak',
    },
    {
      name: 'Dedicated Voter',
      description: 'Cast 10 total votes',
      badgeIcon: '🗳️',
      badgeColor: 'from-blue-600 to-blue-400',
      threshold: 10,
      type: 'votes',
    },
    {
      name: 'Power Voter',
      description: 'Cast 50 total votes',
      badgeIcon: '🗳️🗳️',
      badgeColor: 'from-blue-600 to-purple-600',
      threshold: 50,
      type: 'votes',
    },
    {
      name: 'Rare Opinion',
      description: 'Vote with the minority (less than 20%)',
      badgeIcon: '🦄',
      badgeColor: 'from-indigo-600 to-purple-600',
      threshold: 1,
      type: 'rare',
    },
    {
      name: 'Trendsetter',
      description: 'Be one of the first 10 voters on a topic',
      badgeIcon: '🌟',
      badgeColor: 'from-yellow-400 to-yellow-600',
      threshold: 1,
      type: 'early',
    },
    {
      name: 'Controversy Lover',
      description: 'Vote on 5 highly contested topics',
      badgeIcon: '⚔️',
      badgeColor: 'from-red-600 to-orange-600',
      threshold: 5,
      type: 'divisive',
    },
    {
      name: 'Category Expert',
      description: 'Vote on all topics in a category',
      badgeIcon: '🏆',
      badgeColor: 'from-purple-600 to-pink-600',
      threshold: 1,
      type: 'category',
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`Achievements created successfully!`);

  console.log('Database has been seeded!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
