# Database Setup and Configuration

*Last Updated: March 25, 2025*


This document outlines the database setup for the "This or That" Farcaster Frame application, focusing on how the Prisma ORM is configured to work optimally in both development and production environments.

## Overview

The application uses:
- **SQLite** for local development (fast, embedded database)
- **PostgreSQL** with Supabase for production deployment
- **Prisma ORM** for database access and migrations

This dual-database approach provides fast local development while maintaining production-grade reliability.

## Environment-Specific Database Configuration

The application is configured to automatically use the appropriate database based on the environment:

### Development Environment

In development, the application uses SQLite for:
- Zero configuration setup
- No network latency or connection issues
- Fast query execution
- Simple local development experience

### Production Environment

In production, the application uses PostgreSQL with:
- Connection pooling for high performance
- Full transaction support
- Advanced query capabilities
- Supabase for managed database hosting

## Database Setup

### 1. Environment Variables

The following environment variables are used:

```env
# For PostgreSQL in production (with connection pooling)
DATABASE_URL="postgresql://user:password@host:6543/dbname?pgbouncer=true&sslmode=require"

# Direct connection for migrations
DIRECT_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

### 2. Schema Configuration

We use different schema files for development and production:

- `prisma/schema.development.prisma` - SQLite configuration for development
- `prisma/schema.production.prisma` - PostgreSQL configuration for production
- `prisma/schema.prisma` - Active schema file (copied from the appropriate source)

These files are automatically managed by our environment setup scripts.

### 3. Initialization Scripts

The application includes scripts to configure the environment:

- `scripts/setup-env.js` - Sets up the appropriate database schema based on environment
- `scripts/verify-env.js` - Validates that all required environment variables are present

## Prisma Client Configuration

The Prisma client is configured with several optimizations:

### 1. Singleton Pattern

The client uses a singleton pattern to prevent connection exhaustion:

```typescript
// src/lib/prisma.ts
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### 2. Browser-Safe Implementation

The client is configured to be safe for use in Next.js environments by:
- Detecting browser vs server environments
- Preventing initialization in browser contexts
- Providing appropriate fallbacks

```typescript
// Detect if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Initialize PrismaClient safely (only on server)
export const prisma = isBrowser
  ? (null as unknown as PrismaClient) // Return null for browser environment
  : globalForPrisma.prisma ?? new PrismaClient(prismaOptions);
```

### 3. Connection Pooling

Production environments use connection pooling for optimal performance:

```typescript
const prismaOptions: Prisma.PrismaClientOptions = {
  log: [...],
  // Add connection pooling configuration for production
  ...(process.env.NODE_ENV === 'production' && {
    datasources: {
      db: {
        url: process.env.DATABASE_URL, // Uses PgBouncer for connection pooling
      },
    },
  }),
};
```

### 4. Safe Database Operations

A helper function is provided for safe database operations:

```typescript
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallbackValue?: T,
  context: string = 'database-operation'
): Promise<T> {
  // Safe execution logic with error handling
}
```

## Database Access Pattern

To ensure proper database access, we follow these patterns:

### 1. Server-Only Database Access

Database operations should only be performed in:
- Server components (pages in `app` directory)
- API routes
- Server actions

### 2. Data Access Layer

A dedicated data access layer is implemented in `src/lib/db.ts` that provides:
- Type-safe database functions
- Error handling and fallbacks
- Consistent query patterns

Example:
```typescript
// src/lib/db.ts
export async function getCurrentTopic(): Promise<Topic | null> {
  return safeDbOperation(
    async () => {
      const currentTopic = await prisma.topic.findFirst({
        where: { isActive: true },
        include: { category: true },
        orderBy: { createdAt: 'desc' }
      });
      
      return currentTopic;
    },
    null,
    'getCurrentTopic'
  );
}
```

## Database Migrations

Database migrations are managed through Prisma:

```bash
# Create a new migration (development)
npx prisma migrate dev --name <migration_name>

# Apply migrations (production)
npx prisma migrate deploy
```

## Seeding

The database can be seeded with initial data:

```bash
# Run the seed script
npm run seed
```

## Troubleshooting

Common database-related issues and solutions:

### Connection Issues

If experiencing connection issues in development:
1. Verify SQLite file exists in `prisma/dev.db`
2. Run `npx prisma generate` to ensure client is up to date
3. Run `node scripts/setup-env.js` to reset the development environment

### PrismaClient Error in Browser

If you see "PrismaClient cannot be used in the browser" errors:
1. Ensure you're not importing `prisma` directly in client components
2. Only use the database access layer (`src/lib/db.ts`) in server components
3. Use the `"use server"` directive when needed in React Server Components

### Schema Sync Issues

If schema and database are out of sync:
1. Run `npx prisma db push` to push schema changes
2. Run `npx prisma generate` to update the client

## Best Practices

1. **Never import `prisma` directly in client components**
2. Use the dedicated `db.ts` functions for database access
3. Add proper error handling for database operations
4. Test database functions with appropriate fallbacks 
