import { PrismaClient } from '@prisma/client';

// Extend PrismaClient to include models that might not be automatically detected
const extendedPrismaClient = new PrismaClient().$extends({
  model: {
    // Add any custom methods if needed
  },
});

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: typeof extendedPrismaClient };

export const prisma = globalForPrisma.prisma || extendedPrismaClient;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
