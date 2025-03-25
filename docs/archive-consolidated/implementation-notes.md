# Implementation Notes

*Last Updated: March 25, 2025*


## Frame Manifest Implementation

The Frame Manifest is implemented by serving a JSON file at the `.well-known/farcaster.json` path. This is achieved through:

1. A rewrite rule in `next.config.js` that routes requests for `/.well-known/farcaster.json` to an API endpoint:

```javascript
async rewrites() {
  return [
    {
      source: '/.well-known/farcaster.json',
      destination: '/api/well-known/farcaster',
    },
  ];
}
```

2. An API route at `src/app/api/well-known/farcaster/route.ts` that serves the Frame Manifest with proper account association:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return NextResponse.json({
    accountAssociation: {
      // These values should be replaced with properly signed values in production
      header: 'eyJhbGciOiJFUzI1NiIsImZjdCI6ImZjYS0xIiwiZmNhdSI6ImZyYW1lLmdqcy5kZXYifQ',
      payload: 'eyJkb21haW4iOiJmcmFtZS5nanMuZGV2In0',
      signature:
        'szgkqOWJ4ZGFWT6hRlhFR-CWGWQlB6du-rkP9_r8PSl3QlVrK0SytMV_CYS8z4pUCwYNTQ2LsM6f8DIkV91xAQ',
    },
    frame: {
      version: '1',
      name: 'This or That?',
      homeUrl: APP_URL,
      iconUrl: `${APP_URL}/api/splash`,
      imageUrl: `${APP_URL}/api/og`,
      buttonTitle: 'Open App',
      splashImageUrl: `${APP_URL}/api/splash`,
      splashBackgroundColor: '#1a202c',
      webhookUrl: `${APP_URL}/api/frame`,
    },
    triggers: [
      {
        type: 'cast',
        id: 'vote',
        url: `${APP_URL}/api/frame`,
        name: 'Vote',
      },
    ],
  });
}
```

## Prisma Client in Next.js

Prisma Client needs special handling in Next.js applications to avoid errors when running in browser environments. We've implemented a singleton pattern in `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

This approach:

1. Creates a single PrismaClient instance
2. Attaches it to the `globalThis` object to avoid multiple instances
3. Only instantiates a new client if one doesn't already exist

## Database Structure

The database schema is defined in `prisma/schema.prisma` and includes the following models:

1. `Category` - Groupings for topics (e.g., Food & Drink, Technology)
2. `Topic` - Individual "This or That" questions with two options
3. `Vote` - Records of user votes on specific topics
4. `UserStreak` - Tracks consecutive daily voting for gamification
5. `Achievement` - Defines achievements users can earn
6. `UserAchievement` - Records of achievements earned by users

## Server vs. Client Components

We maintain a clear separation between server and client components:

1. **Server Components**:

   - Generate metadata for SEO and Frame meta tags
   - Fetch data from the database using Prisma
   - Render the initial HTML

2. **Client Components**:
   - Handle user interactions
   - Manage local state
   - Connect to the Frame SDK
   - Make API calls to server endpoints

## API Routes

The application exposes several API endpoints:

1. `/api/frame` - Handles Frame interaction POST requests and records votes
2. `/api/og` - Generates Open Graph images for embeds
3. `/api/splash` - Serves the splash image shown during Frame launch
4. `/api/votes` - Processes user votes and updates streaks/achievements
5. `/api/topics` - Provides topic data for the application
6. `/api/results` - Returns voting results for topics
7. `/.well-known/farcaster.json` - Serves the Frame Manifest

## Environment Variables

The application uses the following environment variables:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="this-is-a-secret-key-change-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

In production, ensure these are properly set with appropriate values.

## Changelog

- **v1.0.0** (Initial Documentation): Created implementation notes for Frame Manifest and server-side rendering
- **v1.0.1** (Build Fixes): Fixed Prisma client integration issues and data model inconsistencies
- **v1.0.2** (UI Fixes): Fixed DOM nesting issues in components and resolved missing avatar images

## Prisma Client Integration Fixes

During the build process, several issues were identified related to Prisma client integration:

1. **UserStreak Model Type Mismatch**: The `fid` field in utils.ts was being converted to a string, but the schema expected a number.

   ```typescript
   // Fixed from
   fid: String(fid),

   // To
   fid: Number(fid),
   ```

2. **Non-existent Models**: Several services were referring to a `User` model that doesn't exist in our schema.

   - NotificationService was updated to use a placeholder implementation
   - UserService was refactored to work with the UserStreak model

3. **Database Schema Alignment**: Services were updated to better align with the actual database schema:
   - UserService now uses the UserStreak model for tracking user activity
   - Feature introduction is handled with a simplified implementation based on vote counts
   - First-time user experience tracking uses the UserStreak model

These changes ensure that the application code properly reflects the database schema defined in `prisma/schema.prisma` and prevents type errors during build.

## UI Component Improvements

### DOM Nesting Structure

When working with shadcn/ui components, we've identified an important consideration regarding the DOM structure:

- `CardDescription` components render as `<p>` elements in HTML
- `Badge` components render as `<div>` elements in HTML

This creates a potential issue since in HTML, paragraph elements (`<p>`) cannot contain block-level elements like `<div>`. To fix this issue, we've restructured our component hierarchy to ensure proper HTML nesting:

```tsx
// Before: Incorrect nesting
<CardHeader>
  <CardTitle>Topic Title</CardTitle>
  <CardDescription className="flex justify-between">
    <span>Total votes: 12,345</span>
    <Badge>Closed</Badge> // Causes HTML validation error
  </CardDescription>
</CardHeader>

// After: Correct nesting
<CardHeader>
  <div className="flex justify-between items-center mb-1">
    <CardTitle>Topic Title</CardTitle>
    <Badge>Closed</Badge>
  </div>
  <CardDescription>
    Total votes: 12,345
  </CardDescription>
</CardHeader>
```

### Image Resources Management

To handle avatar images in the application, we've implemented two strategies:

1. **Dynamic Avatar Generation**: Instead of using static image files that might be missing, we've switched to using the DiceBear API for generating consistent avatar images:

```tsx
// Before
const friendsMock = [
  { fid: '1', username: 'alice', avatar: '/images/avatars/alice.jpg', choice: 'A' },
  // other friends
];

// After
const friendsMock = [
  {
    fid: '1',
    username: 'alice',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    choice: 'A',
  },
  // other friends
];
```

2. **Fallback Images**: For cases where an image might not be available, we've added fallback mechanisms:

```tsx
<Image
  src={avatar || '/images/default-avatar.png'}
  alt={username}
  fill
  sizes="24px"
  className="object-cover"
  onError={e => {
    e.currentTarget.src = '/images/default-avatar.png';
  }}
/>
```

These improvements enhance the application's resilience to missing resources and ensure proper HTML structure, preventing hydration errors and improving accessibility.
