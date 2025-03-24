const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Seed script for the This or That Farcaster Frame database
 * This populates the database with initial data for development and testing
 */

// Create categories
const categories = [
  {
    name: 'Technology',
    description: 'Questions about technology, software, and gadgets'
  },
  {
    name: 'Food & Drink',
    description: 'Questions about food preferences and beverages'
  },
  {
    name: 'Entertainment',
    description: 'Questions about movies, TV shows, and media'
  },
  {
    name: 'Lifestyle',
    description: 'Questions about daily life choices and preferences'
  },
  {
    name: 'Philosophy',
    description: 'Deep questions about life, existence, and beliefs'
  }
];

// Create sample topics
const topics = [
  {
    name: 'Morning Beverage',
    categoryName: 'Food & Drink',
    optionA: 'Coffee',
    optionB: 'Tea',
    imageA: 'https://images.unsplash.com/photo-1509042239860-f0ca3bf6d889?q=80&w=1000&auto=format&fit=crop',
    imageB: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1000&auto=format&fit=crop',
    isActive: true
  },
  {
    name: 'Operating System',
    categoryName: 'Technology',
    optionA: 'Windows',
    optionB: 'Mac OS',
    imageA: null,
    imageB: null,
    isActive: true
  },
  {
    name: 'Movie Night',
    categoryName: 'Entertainment',
    optionA: 'Action',
    optionB: 'Comedy',
    imageA: null,
    imageB: null,
    isActive: true
  }
];

// Create achievements
const achievements = [
  {
    name: 'First Vote',
    description: 'Cast your first vote',
    badgeIcon: '🎯',
    badgeColor: '#4f46e5',
    threshold: 1,
    type: 'votes',
    category: 'engagement',
    tier: 1,
    rarity: 'common'
  },
  {
    name: '10 Day Streak',
    description: 'Vote for 10 days in a row',
    badgeIcon: '🔥',
    badgeColor: '#f97316',
    threshold: 10,
    type: 'streak',
    category: 'loyalty',
    tier: 2,
    rarity: 'uncommon'
  },
  {
    name: '50 Votes',
    description: 'Cast 50 total votes',
    badgeIcon: '⭐',
    badgeColor: '#eab308',
    threshold: 50,
    type: 'votes',
    category: 'engagement',
    tier: 3,
    rarity: 'rare'
  }
];

/**
 * Main seed function
 */
async function seed() {
  console.log('Starting database seed...');
  
  try {
    // Create categories
    console.log('Creating categories...');
    for (const category of categories) {
      await prisma.category.upsert({
        where: { name: category.name },
        update: {}, // Don't update if exists
        create: category
      });
    }
    
    // Create topics with category associations
    console.log('Creating topics...');
    for (const topic of topics) {
      // Find category ID
      const category = await prisma.category.findUnique({
        where: { name: topic.categoryName }
      });
      
      if (!category) {
        console.warn(`Category "${topic.categoryName}" not found, skipping topic "${topic.name}"`);
        continue;
      }
      
      await prisma.topic.create({
        data: {
          name: topic.name,
          optionA: topic.optionA,
          optionB: topic.optionB,
          imageA: topic.imageA,
          imageB: topic.imageB,
          isActive: topic.isActive,
          categoryId: category.id
        }
      });
    }
    
    // Create achievements
    console.log('Creating achievements...');
    for (const achievement of achievements) {
      await prisma.achievement.upsert({
        where: { name: achievement.name },
        update: {}, // Don't update if exists
        create: achievement
      });
    }
    
    console.log('Seed completed successfully! 🌱');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seed()
  .catch((e) => {
    console.error('Unhandled error during seeding:', e);
    process.exit(1);
  });
