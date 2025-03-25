# Database Guide

*Last Updated: March 25, 2025*

This document provides a comprehensive overview of the database implementation for the Frame application, covering schema design, setup, and optimization strategies.

## Table of Contents

- [Database Schema](#database-schema)
- [Database Setup](#database-setup)
- [Database Optimization](#database-optimization)
- [Best Practices](#best-practices)

## Database Schema

### Core Models

#### User

The `User` model represents users authenticated via Farcaster.

```prisma
model User {
  id            String    @id @default(cuid())
  fid           Int?      @unique
  username      String?
  displayName   String?
  pfpUrl        String?
  bio           String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  votes         Vote[]
  topics        Topic[]   @relation("TopicAuthor")
  
  @@index([fid])
}
```

#### Topic

The `Topic` model represents a binary choice ("This or That") topic.

```prisma
model Topic {
  id          String    @id @default(cuid())
  title       String
  description String?
  authorId    String
  isActive    Boolean   @default(true)
  optionA     String
  optionB     String
  imageA      String?
  imageB      String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  author      User      @relation("TopicAuthor", fields: [authorId], references: [id])
  votes       Vote[]
  
  @@index([authorId])
  @@index([createdAt])
  @@index([isActive])
}
```

#### Vote

The `Vote` model represents a user's vote on a topic.

```prisma
model Vote {
  id        String    @id @default(cuid())
  topicId   String
  userId    String
  choice    Choice
  createdAt DateTime  @default(now())
  
  // Relations
  topic     Topic     @relation(fields: [topicId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([topicId, userId])
  @@index([topicId])
  @@index([userId])
  @@index([choice])
}

enum Choice {
  A
  B
}
```

#### Admin

The `Admin` model represents administrative users who can manage the platform.

```prisma
model Admin {
  id        String    @id @default(cuid())
  fid       Int       @unique
  username  String
  role      AdminRole @default(MODERATOR)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  @@index([fid])
}

enum AdminRole {
  ADMIN
  MODERATOR
}
```

## Database Setup

### Prerequisites

- PostgreSQL database (we recommend Supabase)
- Node.js environment for running Prisma migrations
- Database connection string

### Installation

1. Install Prisma CLI and client:

```bash
npm install prisma @prisma/client
```

2. Initialize Prisma with PostgreSQL:

```bash
npx prisma init --datasource-provider postgresql
```

3. Set up your database connection string in `.env`:

```
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

For Supabase, the connection string format is:

```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"
```

### Migrations

To create and run migrations:

1. Modify the Prisma schema in `prisma/schema.prisma`
2. Generate a migration:

```bash
npx prisma migrate dev --name init
```

3. Apply migrations in production:

```bash
npx prisma migrate deploy
```

### Seeding

To seed the database with initial data:

1. Create a seed script in `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample data
  await prisma.topic.create({
    data: {
      title: 'Mountains or Beach?',
      optionA: 'Mountains',
      optionB: 'Beach',
      author: {
        create: {
          fid: 1,
          username: 'sample_user',
          displayName: 'Sample User',
        },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

2. Run the seed script:

```bash
npx prisma db seed
```

## Database Optimization

### Performance Optimizations

#### Indexing Strategy

We've implemented the following indexes to improve query performance:

1. **User Model**:
   - Index on `fid` for fast Farcaster ID lookups

2. **Topic Model**:
   - Index on `authorId` for filtering topics by author
   - Index on `createdAt` for chronological sorting
   - Index on `isActive` for filtering active topics

3. **Vote Model**:
   - Unique compound index on `[topicId, userId]` to ensure one vote per topic per user
   - Index on `topicId` for querying votes by topic
   - Index on `userId` for querying a user's votes
   - Index on `choice` for aggregating vote counts

#### Query Optimization

For better performance, we follow these query patterns:

1. **Select Only Required Fields**:

```typescript
// Good - only select needed fields
const user = await prisma.user.findUnique({
  where: { fid: 123 },
  select: { id: true, username: true },
});

// Avoid - fetching all fields
const user = await prisma.user.findUnique({
  where: { fid: 123 },
});
```

2. **Use Pagination**:

```typescript
const topics = await prisma.topic.findMany({
  take: 10,
  skip: page * 10,
  orderBy: { createdAt: 'desc' },
});
```

3. **Optimize Nested Queries with `include`**:

```typescript
const topicsWithVoteCounts = await prisma.topic.findMany({
  include: {
    _count: {
      select: { votes: true },
    },
  },
});
```

### Connection Management

We implement proper connection management to prevent connection leaks:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
```

### Database Scaling Considerations

1. **Connection Pooling**:
   - For production, implement PgBouncer for connection pooling
   - Configure max connections based on expected load

2. **Read/Write Splitting**:
   - For higher scale, consider separating read and write operations

3. **Caching Strategy**:
   - Implement Redis caching for frequently accessed data
   - Cache vote counts and active topics

## Best Practices

1. **Use Transactions** for operations that require multiple writes
2. **Implement Soft Deletes** for data that might need to be recovered
3. **Regular Backup** of the database
4. **Performance Monitoring** using Prisma metrics
5. **Query Logging** for identifying slow queries

## References

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Indexing Strategies](https://www.postgresql.org/docs/current/indexes.html)
- [Supabase PostgreSQL Documentation](https://supabase.com/docs/guides/database) 