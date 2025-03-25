# Database Optimization Plan

*Last Updated: March 25, 2025*


## Current Issues Identified

Based on the server logs and code review, we've identified several issues with the current database usage patterns:

1. **Frequent Prisma Connections**: Multiple Prisma queries being executed for each page load, with connection initialization overhead
2. **Redundant Queries**: Same queries being executed repeatedly within a single request lifecycle
3. **No Query Caching**: Every request triggers a fresh database query, even for rarely changing data
4. **Unoptimized Query Patterns**: Database queries being executed without proper batching or optimized access patterns
5. **Missing Connection Pooling**: No explicit connection pooling configuration for production environments

## Optimization Strategy

### 1. Prisma Connection Management

#### Problem:
Currently, Prisma client is initialized as a singleton in `src/lib/prisma.ts`, but multiple connections may still be created during server restarts or in serverless environments.

#### Solutions:

- **Enhanced Connection Pooling**:
  ```typescript
  // src/lib/prisma.ts
  import { PrismaClient } from '@prisma/client';

  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };

  export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      // Add connection pooling configuration for production
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
          // PostgreSQL connection pooling
          poolConfig: process.env.NODE_ENV === 'production' 
            ? {
                min: 2,
                max: 10,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
              }
            : undefined,
        },
      },
    });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
  
  // Proper shutdown handling
  if (process.env.NODE_ENV !== 'production') {
    process.on('beforeExit', async () => {
      await prisma.$disconnect();
    });
  }

  export default prisma;
  ```

- **Connection Monitoring and Metrics**:
  - Implement monitoring for connection pool usage and query performance
  - Add structured logging to track connection lifetimes

### 2. Query Caching Implementation

#### Problem:
Every page load triggers multiple fresh database queries, even for data that rarely changes (like active topics).

#### Solutions:

- **Implement Server-Side Cache**:
  ```typescript
  // src/lib/cache.ts
  import NodeCache from 'node-cache';
  
  // TTL in seconds, checkperiod is used for automatic delete check interval
  export const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

  export function getCachedOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cachedValue = cache.get<T>(key);
    if (cachedValue !== undefined) {
      console.log(`Cache hit for key: ${key}`);
      return Promise.resolve(cachedValue);
    }

    return fetchFn().then(result => {
      console.log(`Cache miss for key: ${key}, storing result`);
      cache.set(key, result, ttl);
      return result;
    });
  }

  export function invalidateCache(key: string): void {
    cache.del(key);
  }
  ```

- **Apply Caching to Topic Queries**:
  ```typescript
  // src/lib/topics.ts - Modified getCurrentTopic function
  import { prisma } from './prisma';
  import { getCachedOrFetch } from './cache';
  
  export async function getCurrentTopic() {
    return getCachedOrFetch('currentTopic', async () => {
      const now = new Date();
      
      return prisma.topic.findFirst({
        where: {
          isActive: true,
          startDate: {
            lte: now,
          },
          OR: [
            {
              endDate: null,
            },
            {
              endDate: {
                gte: now,
              },
            },
          ],
        },
        include: {
          category: true,
        },
        orderBy: {
          startDate: 'desc',
        },
      });
    }, 60); // Cache for 60 seconds
  }
  ```

- **Cache Invalidation Strategy**:
  - Implement automatic cache invalidation on data updates
  - Add manual invalidation for admin operations

### 3. Query Optimization

#### Problem:
The codebase shows multiple separate queries for related data that could be combined and optimized.

#### Solutions:

- **Optimized Data Loading Patterns**:
  ```typescript
  // src/app/page.tsx - Optimized data fetching
  export default async function HomePage({ searchParams }: Props) {
    const params = await searchParams;
    const loginRequired = params.login === 'required';
    
    // Combined query for active topic and its category
    let data;
    try {
      data = await getCachedOrFetch('homePageData', async () => {
        // Single query that gets everything needed for the homepage
        const activeTopic = await prisma.topic.findFirst({
          where: {
            isActive: true,
          },
          include: {
            category: true,
            // Include vote count in the same query
            _count: {
              select: { votes: true },
            },
          },
        });
        
        // Get trending topics in the same transaction
        const trendingTopics = await prisma.topic.findMany({
          where: { isActive: true },
          orderBy: { votesA: { _count: 'desc' }},
          take: 3,
          include: {
            category: true,
            _count: {
              select: { votes: true },
            },
          },
        });
        
        return { activeTopic, trendingTopics };
      }, 60); // Cache for 60 seconds
    } catch (error) {
      console.error('Error fetching page data:', error);
      // Continue with fallback data
      data = { activeTopic: null, trendingTopics: [] };
    }
    
    const { activeTopic, trendingTopics } = data;
    
    // Rest of the component remains the same
    // ...
  }
  ```

- **Batched Queries**:
  - Implement batch operations for multiple related data needs
  - Use Prisma's transaction API for consistency

### 4. Data Access Patterns

#### Problem:
Current data access is scattered throughout the codebase, leading to inconsistent patterns and duplicate queries.

#### Solutions:

- **Repository Pattern Implementation**:
  ```typescript
  // src/repositories/topicRepository.ts
  import { prisma } from '@/lib/prisma';
  import { getCachedOrFetch, invalidateCache } from '@/lib/cache';
  import { Topic, Category } from '@prisma/client';

  export interface TopicWithCategory extends Topic {
    category: Category;
  }
  
  export class TopicRepository {
    async getCurrentTopic(): Promise<TopicWithCategory | null> {
      return getCachedOrFetch('currentTopic', async () => {
        const now = new Date();
        
        return prisma.topic.findFirst({
          where: {
            isActive: true,
            startDate: { lte: now },
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
          include: {
            category: true,
          },
          orderBy: {
            startDate: 'desc',
          },
        });
      }, 60);
    }
    
    async getTrendingTopics(limit: number = 3): Promise<TopicWithCategory[]> {
      return getCachedOrFetch(`trendingTopics:${limit}`, async () => {
        return prisma.topic.findMany({
          where: { isActive: true },
          orderBy: [
            { votesA: 'desc' },
            { votesB: 'desc' },
          ],
          take: limit,
          include: {
            category: true,
          },
        });
      }, 120);
    }
    
    async recordVote(topicId: number, fid: number, choice: string): Promise<void> {
      await prisma.$transaction(async (tx) => {
        // Create vote record
        await tx.vote.upsert({
          where: {
            topicId_fid: {
              topicId,
              fid,
            },
          },
          update: {
            choice,
          },
          create: {
            topicId,
            fid,
            choice,
          },
        });
        
        // Update topic vote count
        await tx.topic.update({
          where: { id: topicId },
          data: {
            ...(choice === 'A' 
              ? { votesA: { increment: 1 } } 
              : { votesB: { increment: 1 } }),
          },
        });
        
        // Update user streak
        await tx.userStreak.upsert({
          where: { fid },
          update: {
            currentStreak: { increment: 1 },
            longestStreak: {
              increment: tx.userStreak.findUnique({
                where: { fid },
                select: { currentStreak: true, longestStreak: true },
              }).then(streak => 
                streak && streak.currentStreak >= streak.longestStreak ? 1 : 0
              ),
            },
            lastVoteDate: new Date(),
            totalVotes: { increment: 1 },
          },
          create: {
            fid,
            currentStreak: 1,
            longestStreak: 1,
            lastVoteDate: new Date(),
            totalVotes: 1,
          },
        });
      });
      
      // Invalidate affected caches
      invalidateCache('currentTopic');
      invalidateCache(`topic:${topicId}`);
      invalidateCache('trendingTopics:3');
    }
  }
  
  // Export a singleton instance
  export const topicRepository = new TopicRepository();
  ```

- **Service Layer for Business Logic**:
  ```typescript
  // src/services/topicService.ts
  import { topicRepository, TopicWithCategory } from '@/repositories/topicRepository';
  
  export class TopicService {
    async getCurrentTopic(): Promise<TopicWithCategory | null> {
      return topicRepository.getCurrentTopic();
    }
    
    async getTrendingTopics(limit: number = 3): Promise<TopicWithCategory[]> {
      return topicRepository.getTrendingTopics(limit);
    }
    
    async voteOnTopic(topicId: number, fid: number, choice: string): Promise<void> {
      // Validate input
      if (!topicId || !fid || !['A', 'B'].includes(choice)) {
        throw new Error('Invalid vote parameters');
      }
      
      // Apply business rules
      const topic = await topicRepository.getTopicById(topicId);
      if (!topic) {
        throw new Error('Topic not found');
      }
      
      if (!topic.isActive) {
        throw new Error('Cannot vote on inactive topic');
      }
      
      // Record vote
      await topicRepository.recordVote(topicId, fid, choice);
    }
  }
  
  export const topicService = new TopicService();
  ```

### 5. Database Monitoring & Analytics

#### Problem:
Currently lacking visibility into database performance and query patterns.

#### Solutions:

- **Implement Query Monitoring**:
  - Add structured logging for database queries in production
  - Implement monitoring for slow queries and connection pool usage

- **Performance Analytics Dashboard**:
  - Create admin dashboard with database performance metrics
  - Track and visualize query patterns and bottlenecks

## Implementation Plan

### Phase 1: Connection Pooling & Monitoring (Week 1)
- [x] Enhance Prisma client initialization with connection pooling
- [ ] Implement connection lifecycle monitoring
- [ ] Add structured logging for database operations

### Phase 2: Caching Implementation (Week 2)
- [ ] Implement caching library and helper functions
- [ ] Apply caching to frequently accessed queries
- [ ] Develop cache invalidation strategy

### Phase 3: Repository Pattern (Week 3-4)
- [ ] Implement repository classes for core entities
- [ ] Refactor data access code to use repositories
- [ ] Implement transaction handling for complex operations

### Phase 4: Query Optimization (Week 4-5)
- [ ] Identify and optimize high-impact queries
- [ ] Implement batched operations for related data
- [ ] Review and optimize database indexes

### Phase 5: Monitoring & Analytics (Week 6)
- [ ] Set up database performance monitoring
- [ ] Create admin dashboard for database metrics
- [ ] Implement alerting for database performance issues

## Expected Outcomes

1. **Improved Performance**: 50-70% reduction in database query time
2. **Reduced Server Load**: 40-60% fewer database connections
3. **Increased Scalability**: Support for 3x current user load without degradation
4. **Better Reliability**: Reduced error rates and improved fault tolerance
5. **Enhanced Visibility**: Comprehensive monitoring and performance analytics

## Success Metrics

1. **Query Response Time**: Average query time reduced by at least 50%
2. **Connection Efficiency**: Average active connections reduced by 40%
3. **Cache Effectiveness**: >80% cache hit rate for eligible queries
4. **Error Rate**: Database-related errors reduced by 90%
5. **Page Load Time**: Improved page load time by at least 30%

## Monitoring Strategy

We will implement monitoring at multiple levels:

1. **Application Level**:
   - Track query execution time
   - Monitor cache hit/miss rates
   - Log database-related errors

2. **Database Level**:
   - Monitor connection pool usage
   - Track query performance statistics
   - Analyze index usage and query plans

3. **System Level**:
   - Monitor database server resource usage
   - Track network latency between app and database
   - Analyze overall system performance

## Conclusion

Implementing this database optimization plan will significantly improve application performance, reduce server load, and enhance user experience. The structured approach ensures that improvements are measurable and sustainable, with clear success metrics to track progress.

By addressing connection management, query optimization, caching, and data access patterns, we'll create a robust foundation for future scalability and feature development while providing immediate performance benefits to current users. 
