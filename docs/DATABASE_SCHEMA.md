# Database Schema

This document outlines the database schema for the "This or That" Farcaster Frame application, implemented using Prisma ORM.

## Overview

The database schema is designed to support:

- Topic management with categories
- User voting and preferences
- Streak tracking and achievements
- Analytics and trending topics

## Models

### User

Stores information about Farcaster users who interact with the frame.

```prisma
model User {
  id        String   @id @default(cuid())
  fid       Int      @unique // Farcaster ID
  username  String?
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relationships
  votes     Vote[]
  streaks   Streak[]
  achievements Achievement[]

  // Settings and preferences
  notificationsEnabled Boolean @default(true)
  soundEnabled         Boolean @default(true)
  hapticEnabled        Boolean @default(true)

  // Stats
  totalVotes           Int     @default(0)
  consecutiveDays      Int     @default(0)
  lastVoteDate         DateTime?
}
```

### Category

Organizes topics into categories.

```prisma
model Category {
  id          String   @id @default(cuid())
  name        String
  description String?
  slug        String   @unique
  iconUrl     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relationships
  topics      Topic[]
}
```

### Topic

Represents a "This or That" question with two options.

```prisma
model Topic {
  id          String   @id @default(cuid())
  question    String
  optionA     String
  optionB     String
  isActive    Boolean  @default(false)
  startDate   DateTime
  endDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relationships
  category    Category @relation(fields: [categoryId], references: [id])
  categoryId  String
  votes       Vote[]

  // Stats
  totalVotes  Int      @default(0)
  votesA      Int      @default(0)
  votesB      Int      @default(0)
}
```

### Vote

Records a user's vote on a topic.

```prisma
model Vote {
  id        String   @id @default(cuid())
  choice    String   // "A" or "B"
  createdAt DateTime @default(now())

  // Relationships
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  topic     Topic    @relation(fields: [topicId], references: [id])
  topicId   String

  // Constraints
  @@unique([userId, topicId]) // One vote per user per topic
}
```

### Streak

Tracks a user's voting streak.

```prisma
model Streak {
  id            String   @id @default(cuid())
  startDate     DateTime
  endDate       DateTime?
  days          Int      @default(1)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relationships
  user          User     @relation(fields: [userId], references: [id])
  userId        String
}
```

### Achievement

Records user achievements and badges.

```prisma
model Achievement {
  id            String   @id @default(cuid())
  type          String   // e.g., "streak", "votes", "rare_opinion"
  name          String
  description   String
  iconUrl       String?
  unlockedAt    DateTime @default(now())

  // Relationships
  user          User     @relation(fields: [userId], references: [id])
  userId        String

  // Optional related data
  topicId       String?
  value         Int?     // For achievements with numeric values (e.g., streak days)

  @@unique([userId, type]) // One achievement of each type per user
}
```

### Notification

Stores notification tokens and preferences.

```prisma
model Notification {
  id            String   @id @default(cuid())
  token         String   @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // User association (optional - can have anonymous notifications)
  userId        String?

  // Preferences
  topicReminders Boolean  @default(true)
  streakReminders Boolean  @default(true)
  achievementAlerts Boolean  @default(true)
}
```

## Relationships

The schema includes the following relationships:

- One-to-Many:

  - Category → Topics
  - User → Votes
  - User → Streaks
  - User → Achievements
  - Topic → Votes

- Many-to-One:
  - Topic → Category
  - Vote → User
  - Vote → Topic
  - Streak → User
  - Achievement → User

## Indexes

Important indexes for performance:

```prisma
@@index([fid], name: "user_fid_idx")
@@index([isActive, startDate], name: "active_topic_idx")
@@index([userId, topicId], name: "user_topic_vote_idx")
@@index([userId, isActive], name: "user_active_streak_idx")
```

## Migrations

Database migrations are managed through Prisma:

```bash
# Create a new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations in production
npx prisma migrate deploy
```

## Seeding

Initial data is provided through the seed script:

```bash
# Run the seed script
npm run seed
```

The seed script creates:

- Default categories
- Initial topics
- Sample achievements

## Schema Evolution

As the application evolves, the schema may be extended to include:

- Social features (friends, challenges)
- More detailed analytics
- Additional achievement types
- Topic suggestions from users
