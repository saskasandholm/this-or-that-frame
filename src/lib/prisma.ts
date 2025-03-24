import { PrismaClient, Prisma } from '@prisma/client';
import errorLogger, { ErrorSeverity } from './errorLogger';

/**
 * PrismaClient is attached to the `global` object in development to prevent
 * exhausting your database connection limit.
 * 
 * Learn more: 
 * https://pris.ly/d/help/next-js-best-practices
 */

// Check if we're running on the browser
const isBrowser = typeof window !== 'undefined';

// Define the global prisma object
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// Define connection options with environment-specific settings
const prismaOptions: Prisma.PrismaClientOptions = {
  log: process.env.NODE_ENV === 'development' 
    ? [
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' }
      ] 
    : [{ level: 'error', emit: 'stdout' }],
  // Add connection pooling configuration
  ...(process.env.NODE_ENV === 'production' && {
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  }),
};

let prisma: PrismaClient;

// Ensure only one instance of Prisma Client is created in development
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable to preserve connection between hot reloads
  const globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient;
  };
  
  if (!globalWithPrisma.prisma) {
    console.log('Creating new PrismaClient instance for development');
    globalWithPrisma.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  
  prisma = globalWithPrisma.prisma;
}

// Configure query logging in development
if (process.env.NODE_ENV === 'development' && !isBrowser) {
  // Middleware for query timing
  prisma.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const end = Date.now();
    console.log(`Query ${params.model}.${params.action} took ${end - start}ms`);
    return result;
  });
}

// Proper shutdown handling for all environments (server-side only)
if (!isBrowser && typeof process !== 'undefined' && typeof process.on === 'function') {
  process.on('beforeExit', async () => {
    try {
      await prisma.$disconnect();
      console.log('Disconnected from database');
    } catch (error) {
      errorLogger.log(error, 'prisma:disconnect', ErrorSeverity.ERROR);
    }
  });

  // Handle unexpected shutdowns
  process.on('SIGINT', async () => {
    try {
      await prisma.$disconnect();
      console.log('Disconnected from database due to app termination');
      process.exit(0);
    } catch (error) {
      console.error('Error during database disconnection:', error);
      process.exit(1);
    }
  });
}

/**
 * Helper function to safely execute database operations with error handling
 * This should ONLY be called from server components or API routes
 */
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallbackValue?: T,
  context: string = 'database-operation'
): Promise<T> {
  if (isBrowser) {
    console.error('Attempted to use safeDbOperation in browser environment');
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    throw new Error('Database operations cannot be performed in the browser');
  }

  try {
    return await operation();
  } catch (error) {
    errorLogger.log(error, `prisma:${context}`, ErrorSeverity.ERROR);
    
    // Provide better error analysis to identify common issues
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Connection issues - often transient
    if (errorMessage.includes('connection') || errorMessage.includes('timeout')) {
      console.warn('Database connection issue detected - this may be transient');
    }
    
    // If a transaction was active, try to rollback
    try {
      if (errorMessage.includes('transaction')) {
        await prisma.$executeRaw`ROLLBACK`;
      }
    } catch (rollbackError) {
      // Ignore rollback errors, as the original error is more important
    }
    
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    throw error;
  }
}

export { prisma };
