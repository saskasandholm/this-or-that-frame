// This script seeds test data for the This or That frame app
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test data...');

  // First, create or find a category
  const category = await prisma.category.upsert({
    where: { name: 'Cryptocurrency' },
    update: {},
    create: {
      name: 'Cryptocurrency',
      description: 'Topics related to cryptocurrencies and blockchain technology',
      isActive: true,
    },
  });
  
  console.log(`Category created/found: ${category.id} - ${category.name}`);

  // Create another category
  const techCategory = await prisma.category.upsert({
    where: { name: 'Technology' },
    update: {},
    create: {
      name: 'Technology',
      description: 'Topics related to software, frameworks, and programming',
      isActive: true,
    },
  });
  
  console.log(`Category created/found: ${techCategory.id} - ${techCategory.name}`);

  // Create a Bitcoin vs Ethereum topic
  const topic = await prisma.topic.create({
    data: {
      name: "Bitcoin vs Ethereum",
      optionA: "Bitcoin",
      optionB: "Ethereum",
      imageA: "https://images.unsplash.com/photo-1543699565-003b8adda5fc?w=1200&h=630&fit=crop",
      imageB: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=1200&h=630&fit=crop",
      votesA: 0,
      votesB: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      isActive: true,
      category: {
        connect: { id: category.id }
      }
    },
  });
  
  console.log(`Created test topic: ${topic.id}`);

  // Add another topic (inactive by default)
  const topic2 = await prisma.topic.create({
    data: {
      name: "React vs Angular",
      optionA: "React",
      optionB: "Angular",
      imageA: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=1200&h=630&fit=crop",
      imageB: "https://images.unsplash.com/photo-1678830369836-0cfe8077145f?w=1200&h=630&fit=crop",
      votesA: 0,
      votesB: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      isActive: false, // This one is inactive
      category: {
        connect: { id: techCategory.id }
      }
    },
  });
  
  console.log(`Created inactive topic: ${topic2.id}`);
  
  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 