# Week 1 Implementation Guide: Production Optimization

*Last Updated: March 25, 2025*


This guide provides detailed implementation steps for the first week of our roadmap, focusing on production environment optimization and initial content development.

## 1. Error Monitoring with Sentry

### Implementation Steps

1. **Install Sentry SDK:**

```bash
npm install @sentry/nextjs
```

2. **Configure Sentry:**

Create the Sentry configuration files:

```bash
npx @sentry/wizard@latest -i nextjs
```

3. **Update Sentry configuration files:**

```javascript
// sentry.server.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === 'development',
  environment: process.env.NODE_ENV,
});
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === 'development',
  environment: process.env.NODE_ENV,

  // Add context for specific errors
  beforeSend(event) {
    // Modify the event before sending to Sentry
    if (event.user) {
      // Don't send user's personal identifiable information
      delete event.user.ip_address;
    }
    return event;
  },
});
```

4. **Add custom error boundaries with Sentry integration:**

```tsx
// src/components/SentryErrorBoundary.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class SentryErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="error-container">
            <h2>Something went wrong</h2>
            <p>We've been notified and are working to fix the issue.</p>
            <button onClick={() => this.setState({ hasError: false })}>Try Again</button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default SentryErrorBoundary;
```

5. **Add environment variables:**

```
# .env
SENTRY_DSN=https://your-sentry-dsn.ingest.sentry.io/project
```

## 2. Performance Monitoring with Vercel Analytics

### Implementation Steps

1. **Install Vercel Analytics:**

```bash
npm install @vercel/analytics
```

2. **Configure Vercel Analytics in your layout file:**

```tsx
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

3. **Add custom event tracking:**

```tsx
// src/lib/analytics.ts
import { track } from '@vercel/analytics';

export const trackEvent = (
  eventName: string,
  properties?: Record<string, string | number | boolean>
) => {
  track(eventName, properties);
};

// Usage example
trackEvent('vote_submitted', {
  topicId: '123',
  choice: 'A',
  isAuthenticated: true,
});
```

## 3. Health Check Endpoint

### Implementation Steps

1. **Create a health check API endpoint:**

```typescript
// src/app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Get service status
    const status = {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date(),
      database: 'connected',
      version: process.env.APP_VERSION || '1.0.0',
    };

    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
```

2. **Create a monitoring script to check health periodically:**

```typescript
// scripts/monitor-health.js
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');

const HEALTH_CHECK_URL = process.env.HEALTH_CHECK_URL;
const ALERT_EMAIL = process.env.ALERT_EMAIL;

async function checkHealth() {
  try {
    const response = await fetch(HEALTH_CHECK_URL);
    const data = await response.json();

    if (!response.ok || data.status !== 'healthy') {
      await sendAlert(`Health check failed: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    await sendAlert(`Health check error: ${error.message}`);
  }
}

async function sendAlert(message) {
  // Configure email transporter
  const transporter = nodemailer.createTransport({
    // Your email configuration
  });

  await transporter.sendMail({
    from: 'monitor@yourapp.com',
    to: ALERT_EMAIL,
    subject: 'Health Check Alert',
    text: message,
  });
}

// Run health check
checkHealth();
```

## 4. Database Query Optimization

### Implementation Steps

1. **Add indexes to the Prisma schema for frequently accessed fields:**

```prisma
// prisma/schema.prisma

model Topic {
  id          String   @id @default(cuid())
  // existing fields

  // Add indexes
  @@index([isActive, startDate], name: "active_topic_idx")
  @@index([categoryId], name: "category_topic_idx")
}

model Vote {
  id        String   @id @default(cuid())
  // existing fields

  // Add indexes
  @@index([topicId], name: "topic_vote_idx")
  @@index([userId], name: "user_vote_idx")
  @@index([createdAt], name: "vote_date_idx")
}

model User {
  id        String   @id @default(cuid())
  fid       Int      @unique
  // existing fields

  // Add indexes
  @@index([fid], name: "user_fid_idx")
  @@index([lastVoteDate], name: "user_activity_idx")
}
```

2. **Generate the migration and apply it:**

```bash
npx prisma migrate dev --name add_performance_indexes
```

3. **Optimize common queries by adding pagination and limiting result sets:**

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get active topic with efficient query
export async function getActiveTopic() {
  return await prisma.topic.findFirst({
    where: {
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });
}

// Get user votes with pagination
export async function getUserVotes(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [votes, total] = await Promise.all([
    prisma.vote.findMany({
      where: { userId },
      include: {
        topic: {
          select: {
            id: true,
            question: true,
            optionA: true,
            optionB: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.vote.count({ where: { userId } }),
  ]);

  return {
    votes,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
}
```

## 5. Caching Layer Implementation

### Implementation Steps

1. **Install Redis for caching:**

```bash
npm install redis
```

2. **Create a Redis client service:**

```typescript
// src/lib/redis.ts
import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Redis client
let client: ReturnType<typeof createClient>;

export async function getRedisClient() {
  if (!client) {
    client = createClient({ url: redisUrl });

    client.on('error', err => {
      console.error('Redis Client Error:', err);
    });

    await client.connect();
  }

  return client;
}

// Cache helper functions
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = await getRedisClient();
  const value = await redis.get(key);

  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch (e) {
    return null;
  }
}

export async function cacheSet(key: string, value: any, expiryInSeconds = 3600): Promise<void> {
  const redis = await getRedisClient();
  await redis.set(key, JSON.stringify(value), { EX: expiryInSeconds });
}

export async function cacheDelete(key: string): Promise<void> {
  const redis = await getRedisClient();
  await redis.del(key);
}
```

3. **Implement caching for API responses:**

```typescript
// src/app/api/topics/current/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getActiveTopic } from '@/lib/db';
import { cacheGet, cacheSet } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const cacheKey = 'current_topic';

    // Try to get from cache first
    const cachedTopic = await cacheGet(cacheKey);
    if (cachedTopic) {
      return NextResponse.json(cachedTopic);
    }

    // If not in cache, fetch from database
    const topic = await getActiveTopic();

    if (!topic) {
      return NextResponse.json({ error: 'No active topic found' }, { status: 404 });
    }

    // Cache the result for 5 minutes (300 seconds)
    await cacheSet(cacheKey, topic, 300);

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error fetching current topic:', error);
    return NextResponse.json({ error: 'Failed to fetch current topic' }, { status: 500 });
  }
}
```

4. **Add cache invalidation when data changes:**

```typescript
// src/app/api/votes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cacheDelete } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const { topicId, userId, choice } = await req.json();

    // Record the vote
    await prisma.vote.create({
      data: {
        topicId,
        userId,
        choice,
      },
    });

    // Invalidate related caches
    await Promise.all([
      cacheDelete('current_topic'),
      cacheDelete(`topic_${topicId}`),
      cacheDelete(`user_votes_${userId}`),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}
```

## 6. Content Development Tasks

### Implementation Steps

1. **Create new topics across categories:**

```typescript
// prisma/seed-topics.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTopics() {
  // Define categories if not already defined
  const categories = [
    { name: 'Crypto', slug: 'crypto', description: 'Cryptocurrency topics' },
    { name: 'Tech', slug: 'tech', description: 'Technology topics' },
    { name: 'Culture', slug: 'culture', description: 'Cultural topics' },
    { name: 'Farcaster', slug: 'farcaster', description: 'Farcaster-specific topics' },
  ];

  // Upsert categories
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  // Get category IDs
  const categoryMap = await prisma.category.findMany();
  const categoryIds = Object.fromEntries(categoryMap.map(c => [c.slug, c.id]));

  // Define new topics
  const newTopics = [
    {
      question: 'Bitcoin vs Ethereum',
      optionA: 'Bitcoin',
      optionB: 'Ethereum',
      categoryId: categoryIds.crypto,
      startDate: new Date(Date.now() + 86400000), // tomorrow
      isActive: true,
    },
    {
      question: 'Mobile vs Desktop',
      optionA: 'Mobile',
      optionB: 'Desktop',
      categoryId: categoryIds.tech,
      startDate: new Date(Date.now() + 86400000 * 2), // day after tomorrow
      isActive: true,
    },
    // ... add more topics here
  ];

  // Create topics
  for (const topic of newTopics) {
    await prisma.topic.create({ data: topic });
  }

  console.log('Topics seeded successfully');
}

seedTopics()
  .catch(e => {
    console.error('Error seeding topics:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

2. **Create "Did You Know?" facts for each category:**

```typescript
// prisma/seed-facts.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFacts() {
  // Get categories
  const categories = await prisma.category.findMany();

  // Define facts for each category
  const factsByCategory = {
    crypto: [
      "Bitcoin's creator Satoshi Nakamoto remains anonymous to this day.",
      "Ethereum's smart contracts enable thousands of decentralized applications.",
      'The total supply of Bitcoin is capped at 21 million coins.',
      'Vitalik Buterin proposed Ethereum when he was just 19 years old.',
      'The first Bitcoin transaction was for two pizzas, costing 10,000 BTC.',
    ],
    tech: [
      'The first computer bug was an actual moth found in a Harvard Mark II computer in 1947.',
      'The average smartphone today has more computing power than all of NASA had during the Apollo moon landing.',
      "The world's first website is still online at info.cern.ch.",
      "Over 90% of the world's data has been created in just the last few years.",
      'The first computer programmer was a woman, Ada Lovelace.',
    ],
    // ... add facts for other categories
  };

  // Create facts in database
  for (const category of categories) {
    const facts = factsByCategory[category.slug];
    if (!facts) continue;

    for (const factText of facts) {
      await prisma.didYouKnowFact.create({
        data: {
          text: factText,
          categoryId: category.id,
        },
      });
    }
  }

  console.log('Facts seeded successfully');
}

seedFacts()
  .catch(e => {
    console.error('Error seeding facts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

3. **Design enhanced OG images with dynamic content:**

```typescript
// src/app/api/og/results/[topicId]/route.tsx
import { ImageResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getTopic, getVoteStats } from '@/lib/db';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const topicId = params.topicId;

    // Get topic and vote stats
    const [topic, stats] = await Promise.all([
      getTopic(topicId),
      getVoteStats(topicId),
    ]);

    if (!topic) {
      return new Response('Topic not found', { status: 404 });
    }

    // Calculate percentages
    const totalVotes = stats.votesA + stats.votesB;
    const percentA = totalVotes > 0 ? Math.round((stats.votesA / totalVotes) * 100) : 0;
    const percentB = totalVotes > 0 ? Math.round((stats.votesB / totalVotes) * 100) : 0;

    // Generate image
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#111827',
            color: 'white',
            fontFamily: 'sans-serif',
            position: 'relative',
            padding: 40,
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: '#3b82f6',
              padding: '8px 16px',
              borderTopLeftRadius: 8,
            }}
          >
            This or That
          </div>

          <h1 style={{ fontSize: 60, margin: 0, textAlign: 'center' }}>
            {topic.question}
          </h1>

          <div style={{ display: 'flex', width: '100%', marginTop: 40 }}>
            <div style={{ flex: 1, padding: 20, textAlign: 'center' }}>
              <h2 style={{ fontSize: 36, margin: 0 }}>{topic.optionA}</h2>
              <div
                style={{
                  fontSize: 80,
                  fontWeight: 'bold',
                  color: '#3b82f6',
                }}
              >
                {percentA}%
              </div>
            </div>

            <div
              style={{
                width: 2,
                backgroundColor: '#4b5563',
                margin: '0 20px',
              }}
            />

            <div style={{ flex: 1, padding: 20, textAlign: 'center' }}>
              <h2 style={{ fontSize: 36, margin: 0 }}>{topic.optionB}</h2>
              <div
                style={{
                  fontSize: 80,
                  fontWeight: 'bold',
                  color: '#ec4899',
                }}
              >
                {percentB}%
              </div>
            </div>
          </div>

          <div style={{ fontSize: 24, marginTop: 20 }}>
            Total Votes: {totalVotes.toLocaleString()}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
```

## Next Steps

After implementing these Week 1 tasks:

1. Deploy the changes to production
2. Monitor error logs in Sentry to identify any issues
3. Review performance metrics in Vercel Analytics
4. Validate that the health check endpoint is working correctly
5. Test database performance with the new indexes
6. Verify that the caching layer is working as expected
7. Prepare for Week 2 tasks focusing on the user feedback system and Auth-kit setup
