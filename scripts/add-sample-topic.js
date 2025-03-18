#!/usr/bin/env node

/**
 * Add a sample topic to the database
 */

// Load environment variables from .env file
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adding sample topic...');

  // Check if Food & Drink category exists
  let category = await prisma.category.findFirst({
    where: { name: 'Food & Drink' },
  });

  // Create category if it doesn't exist
  if (!category) {
    console.log('Creating Food & Drink category...');
    category = await prisma.category.create({
      data: {
        name: 'Food & Drink',
        description: 'Food and beverage preferences',
        isActive: true,
      },
    });
    console.log('Category created:', category.name);
  }

  // Check if the Coffee vs Tea topic already exists
  const existingTopic = await prisma.topic.findFirst({
    where: {
      name: 'Coffee vs Tea',
      categoryId: category.id,
    },
  });

  if (existingTopic) {
    console.log('Topic already exists, activating it...');
    await prisma.topic.update({
      where: { id: existingTopic.id },
      data: {
        isActive: true,
        startDate: new Date(),
        endDate: null,
      },
    });
    console.log('Topic activated:', existingTopic.name);
    return;
  }

  // Create new topic
  const now = new Date();
  const topic = await prisma.topic.create({
    data: {
      name: 'Coffee vs Tea',
      categoryId: category.id,
      optionA: 'Coffee',
      optionB: 'Tea',
      isActive: true,
      startDate: now,
    },
  });

  console.log('Sample topic created:', topic.name);
  console.log('Option A:', topic.optionA);
  console.log('Option B:', topic.optionB);
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
