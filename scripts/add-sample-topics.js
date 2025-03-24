#!/usr/bin/env node

/**
 * Add multiple sample topics to the database for demonstration purposes
 * This script creates various categories and topics that showcase the range
 * of binary choices possible in the application.
 * 
 * Run with: node scripts/add-sample-topics.js
 */

// Load environment variables from .env file
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Sample data organized by categories
const sampleData = [
  {
    category: {
      name: 'Food & Drink',
      description: 'Food and beverage preferences',
    },
    topics: [
      {
        name: 'Coffee vs Tea',
        optionA: 'Coffee',
        optionB: 'Tea',
        imageA: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop',
        imageB: 'https://images.unsplash.com/photo-1547825407-2d060104b7f8?w=800&h=600&fit=crop',
      },
      {
        name: 'Pizza vs Burger',
        optionA: 'Pizza',
        optionB: 'Burger',
        imageA: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop',
        imageB: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
      },
      {
        name: 'Chocolate vs Vanilla',
        optionA: 'Chocolate',
        optionB: 'Vanilla',
        imageA: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&h=600&fit=crop',
        imageB: 'https://images.unsplash.com/photo-1566454825481-1d394a001693?w=800&h=600&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Technology',
      description: 'Tech preferences and opinions',
    },
    topics: [
      {
        name: 'iOS vs Android',
        optionA: 'iOS',
        optionB: 'Android',
        imageA: 'https://images.unsplash.com/photo-1561026555-13539e82532f?w=800&h=600&fit=crop',
        imageB: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800&h=600&fit=crop',
      },
      {
        name: 'Desktop vs Laptop',
        optionA: 'Desktop',
        optionB: 'Laptop',
        imageA: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=600&fit=crop',
        imageB: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop',
      },
      {
        name: 'Wired vs Wireless',
        optionA: 'Wired',
        optionB: 'Wireless',
        imageA: 'https://images.unsplash.com/photo-1616011988042-7961f874ae8a?w=800&h=600&fit=crop',
        imageB: 'https://images.unsplash.com/photo-1655019604229-97881bcffced?w=800&h=600&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Entertainment',
      description: 'Movies, music, and media preferences',
    },
    topics: [
      {
        name: 'Movies vs TV Shows',
        optionA: 'Movies',
        optionB: 'TV Shows',
        imageA: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&h=600&fit=crop',
        imageB: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop',
      },
      {
        name: 'Reading Books vs Audiobooks',
        optionA: 'Reading Books',
        optionB: 'Audiobooks',
        imageA: 'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=800&h=600&fit=crop',
        imageB: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=600&fit=crop',
      },
      {
        name: 'Concerts vs Festivals',
        optionA: 'Concerts',
        optionB: 'Festivals',
        imageA: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop',
        imageB: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6a3?w=800&h=600&fit=crop',
      },
    ],
  },
  {
    category: {
      name: 'Lifestyle',
      description: 'Daily life preferences and choices',
    },
    topics: [
      {
        name: 'Early Bird vs Night Owl',
        optionA: 'Early Bird',
        optionB: 'Night Owl',
        imageA: 'https://images.unsplash.com/photo-1506368083636-6defb67639a7?w=800&h=600&fit=crop',
        imageB: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&h=600&fit=crop',
      },
      {
        name: 'City vs Countryside',
        optionA: 'City',
        optionB: 'Countryside',
        imageA: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop',
        imageB: 'https://images.unsplash.com/photo-1501179691627-eeaa65ea017c?w=800&h=600&fit=crop',
      },
      {
        name: 'Remote Work vs Office',
        optionA: 'Remote Work',
        optionB: 'Office',
        imageA: 'https://images.unsplash.com/photo-1610465299996-30f240ac2b1c?w=800&h=600&fit=crop',
        imageB: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=600&fit=crop',
      },
    ],
  },
];

/**
 * Creates a category if it doesn't exist
 * @param {Object} categoryData - Category information
 * @returns {Promise<Object>} - The created or found category
 */
async function createCategory(categoryData) {
  const { name, description } = categoryData;
  
  // Check if category already exists
  let category = await prisma.category.findFirst({
    where: { name },
  });

  if (!category) {
    console.log(`Creating category: ${name}...`);
    category = await prisma.category.create({
      data: {
        name,
        description,
        isActive: true,
      },
    });
    console.log(`✅ Category created: ${category.name}`);
  } else {
    console.log(`ℹ️ Category already exists: ${category.name}`);
  }
  
  return category;
}

/**
 * Creates a topic if it doesn't exist
 * @param {Object} topicData - Topic information
 * @param {number} categoryId - The ID of the category this topic belongs to
 * @returns {Promise<Object>} - The created or found topic
 */
async function createTopic(topicData, categoryId) {
  const { name, optionA, optionB, imageA, imageB } = topicData;
  
  // Check if topic already exists
  const existingTopic = await prisma.topic.findFirst({
    where: {
      name,
      categoryId,
    },
  });

  if (existingTopic) {
    console.log(`ℹ️ Topic already exists: ${existingTopic.name}`);
    return existingTopic;
  }

  // Create new topic with staggered dates to simulate an active timeline
  const now = new Date();
  const randomDays = Math.floor(Math.random() * 7); // Random number between 0-6
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - randomDays);
  
  const topic = await prisma.topic.create({
    data: {
      name,
      categoryId,
      optionA,
      optionB,
      imageA,
      imageB,
      isActive: true,
      startDate,
      // Most topics are active (null endDate), but some are completed
      endDate: Math.random() > 0.7 ? new Date() : null,
    },
  });

  console.log(`✅ Topic created: ${topic.name}`);
  return topic;
}

/**
 * Main function to populate the database with sample data
 */
async function main() {
  console.log('🚀 Adding sample topics...');

  // For each category in our sample data
  for (const data of sampleData) {
    const category = await createCategory(data.category);
    
    // Create all topics for this category
    for (const topicData of data.topics) {
      await createTopic(topicData, category.id);
    }
  }

  console.log('✨ Sample data creation complete!');
}

// Run the script
main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 