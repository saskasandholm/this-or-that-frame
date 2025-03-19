# Farcaster Frame Implementation

This document explains how the "This or That" Farcaster Frame is implemented, following the Farcaster Frame v2 specification.

## Overview

The "This or That" frame presents users with binary choices, collects their votes, and shows community results. The implementation follows the Farcaster Frame v2 specification, which requires specific meta tags in the HTML head and API endpoints to handle frame interactions.

## Frame Meta Tags

The frame is defined by meta tags in the HTML head of the main page:

```html
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="https://example.com/api/og/topic/123" />
<meta property="fc:frame:post_url" content="https://example.com/api/frame" />
<meta property="fc:frame:button:1" content="Option A" />
<meta property="fc:frame:button:2" content="Option B" />
<meta property="fc:frame:button:1:value" content="A" />
<meta property="fc:frame:button:2:value" content="B" />
<meta property="fc:frame:state" content="{\"topicId\":123}" />
<meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
```

These tags define:

- The frame version (`vNext`)
- The image to display (dynamically generated for each topic)
- The endpoint to post to when a button is clicked
- Two buttons for the binary choice
- Values to pass with each button click
- State to maintain between interactions
- The aspect ratio of the frame image

## UI Components

The frame interface is built with several React components:

### Primary Components

- **ClientPage**: The main client-side component that handles frame interactions and UI state
- **ContextAwareTopicView**: Manages the topic display and user interactions with voting options
- **SplashScreen**: Displays loading animation while data is being fetched
- **TrendingTopicCard**: Displays information about popular topics in a card format
- **PastTopicCard**: Shows historical topics and their voting results

### Support Components

- **DidYouKnow**: Displays interesting facts related to topics after voting
- **DirectChallenge**: Allows users to challenge friends to vote on the same topic
- **FrameSavePrompt**: Encourages users to save the frame in their Farcaster client
- **FirstTimeUserExperience**: Guides new users through the application

## API Endpoints

### 1. Initial Frame (`/`)

The root page serves the initial frame with meta tags. It:

- Fetches the current active topic from the database
- Generates dynamic meta tags with the topic details
- Renders a visual representation of the frame for browsers

### 2. Frame Interaction (`/api/frame`)

This endpoint handles POST requests when users click a button:

- Parses the frame message from the request
- Extracts the user's FID (Farcaster ID) and button choice
- Records the vote in the database
- Returns a new frame showing the results

### 3. Results View (`/api/frame/results`)

This endpoint handles redirects after viewing results:

- Processes the state from the previous frame
- Redirects to the topic details page

### 4. Open Graph Images (`/api/og/*`)

Several endpoints generate dynamic Open Graph images:

- `/api/og/topic/[topicId]`: Shows the topic question and options
- `/api/og/results/[topicId]`: Shows voting results with percentages
- `/api/og/trending`: Shows trending topics
- `/api/og/error`: Shows error states

### 5. Frame Manifest (`/.well-known/farcaster.json`)

Serves the frame manifest according to the specification:

```json
{
  "name": "This or That",
  "description": "Daily binary choices that reveal what the Farcaster community thinks",
  "category": "Social/Games",
  "icon": "https://example.com/images/app-icon.png",
  "splash": "https://example.com/images/app-splash.png",
  "splash_background_color": "#6941C6",
  "home_url": "https://example.com",
  "version": "1"
}
```

## User Flow

1. **Initial View**: User sees the topic question with two options
2. **Vote**: User clicks one of the two buttons
3. **Results**: User sees the voting results with percentages
4. **Details**: User can click to see detailed results and related topics
5. **Explore**: User can browse trending and past topics using tab navigation

## State Management

The frame maintains state between interactions using the `fc:frame:state` meta tag:

- `topicId`: The ID of the current topic
- `choice`: The user's selected option (after voting)
- `fid`: The user's Farcaster ID (when available)

Additional client-side state includes:

- User's voting choice
- Loading and error states
- Display state for auxiliary components (Did You Know, Direct Challenge, etc.)
- Active tab selection (Daily, Trending, Past)

## Error Handling and Recovery

The frame implementation includes robust error handling:

- Graceful fallbacks for missing topics
- Error boundaries for component failures
- Proper HTTP status codes for API errors
- Custom error frames with helpful messages
- `handleTryAgain` functionality for user-initiated retries after errors

## Frame SDK Integration

The project uses the official Farcaster Frame SDK (`@farcaster/frame-sdk`) for client-side interactions:

```typescript
import sdk from '@farcaster/frame-sdk';

// Initialize the SDK
useEffect(() => {
  const load = async () => {
    setContext(await sdk.context);
    sdk.actions.ready();
  };

  if (sdk && !isSDKLoaded) {
    setIsSDKLoaded(true);
    load();
  }
}, [isSDKLoaded]);

// Use SDK actions
const handleSaveFrame = async () => {
  const result = await sdk.actions.saveFrame();
  if (result.success) {
    // Handle successful save
  }
};
```

## Security and Optimizations

The frame implementation includes several security measures and optimizations:

### Security Measures

- **Input Validation**: All frame message data is validated before processing

  ```typescript
  function validateFrameMessage(data: any): {
    isValid: boolean;
    buttonIndex?: number;
    fid?: number;
    error?: string;
  } {
    if (!data || typeof data !== 'object') {
      return { isValid: false, error: 'Invalid request data format' };
    }
    // Additional validation checks...
  }
  ```

- **Safe Database Operations**: All database operations use parameterized queries

  ```typescript
  // Using safe Prisma methods instead of raw SQL
  await prisma.topic.update({
    where: { id: parsedTopicId },
    data: {
      votesA: isOptionA ? { increment: 1 } : undefined,
      votesB: !isOptionA ? { increment: 1 } : undefined,
    },
  });
  ```

- **Error Handling**: Comprehensive error handling with fallbacks
  ```tsx
  // Image error handling
  {
    currentTopic.imageA ? (
      <img
        src={currentTopic.imageA}
        alt={currentTopic.optionA}
        onError={e => {
          // Handle image loading error
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    ) : null;
  }
  ```

### Performance Optimizations

- **Database Transactions**: Prevent race conditions and ensure data consistency

  ```typescript
  await prisma.$transaction(async tx => {
    // All operations that should be atomic are performed here
    await tx.topic.update({
      /*...*/
    });
    await tx.vote.create({
      /*...*/
    });
    // Additional operations...
  });
  ```

- **Efficient Query Patterns**: Reduce database calls by optimizing queries

  ```typescript
  // Instead of multiple sequential queries
  const existingAchievements = await prisma.userAchievement.findMany({
    where: { fid },
    select: { achievementId: true },
  });

  const existingAchievementIds = existingAchievements.map(ua => ua.achievementId);

  // Get only achievements not already earned
  const allAchievements = await prisma.achievement.findMany({
    where: {
      NOT: {
        id: { in: existingAchievementIds },
      },
    },
  });
  ```

- **Type-Safety**: Comprehensive TypeScript typing for all frame message handling
  ```typescript
  // Button type constants for consistency
  const BUTTON_TYPES = {
    OPTION_A: 1,
    OPTION_B: 2,
    ADMIN: 3,
    VIEW_DETAILS: 1,
    VOTE_AGAIN: 2,
  };
  ```

## Testing

The frame implementation can be tested using:

- The Warpcast Frame Playground
- Direct API calls with simulated frame messages
- End-to-end tests with Playwright

## Resources

- [Farcaster Frame v2 Specification](https://docs.farcaster.xyz/reference/frames/spec)
- [Farcaster Frame SDK Documentation](https://www.npmjs.com/package/@farcaster/frame-sdk)

## Validation and Error Handling

We've implemented robust validation and error handling to ensure the Frame operates reliably:

### Input Validation

All frame messages are validated using specialized utilities in `src/app/api/topics/validation.ts`:

```typescript
// Example validation flow
try {
  // Validate button index and FID
  const { buttonIndex, fid } = await validateFrameMessage(req);

  // Further validation
  const topicId = validateTopicId(topicIdStr);

  // Process request with validated data
} catch (error: unknown) {
  // Handle validation errors specifically
  if (error instanceof ValidationError) {
    return formatErrorResponse(error);
  }
  // Handle other errors
}
```

### Error Types

We use proper error typing to improve debugging and error handling:

1. **Custom Error Classes**: `ValidationError` with status codes
2. **Typed Error Handling**: All catch blocks use `error: unknown` typing
3. **Error Differentiation**: Different handling for validation vs. system errors

### Database Transaction Safety

Vote processing and achievement tracking use transactions to prevent race conditions:

```typescript
await prisma.$transaction(async tx => {
  // Update vote count
  // Record user vote
  // Check for achievements
});
```

### Defensive Programming

We implement defensive checks throughout the codebase:

- Null/undefined checks before operations
- Type guards to ensure data has expected structure
- Fallback values for potentially missing data

## SDK Usage

// ... existing code ...

## Friend Leaderboards

The Friend Leaderboard feature enhances social engagement by allowing users to see how they compare with their friends and the global community. This section details the implementation of this feature.

### Components

#### FriendLeaderboard Component

The core of this feature is the `FriendLeaderboard` component, which:

- Displays a tabbed interface showing friends and global rankings
- Shows user scores, streaks, and rankings
- Provides options to share leaderboards and view profiles
- Implements an empty state when no friends are found

```tsx
// Example usage in a page component
<FriendLeaderboard
  friends={friendsData}
  globalLeaders={globalLeadersData}
  currentUserRank={userRank}
  period="weekly"
  onShareLeaderboard={handleShare}
  onViewProfile={handleProfileView}
/>
```

### Data Model

The leaderboard relies on these data structures:

```typescript
interface FriendData {
  fid: number; // Farcaster ID
  username: string; // Display name
  avatarUrl?: string; // URL to avatar image
  score: number; // Activity score
  streak?: number; // Current streak
  rank: number; // Position in the leaderboard
  isFollowing: boolean; // Whether the current user follows this user
}
```

### Data Fetching

Friend data is fetched from:

1. Farcaster social graph (for friend relationships)
2. Internal database (for activity scores and streaks)

The implementation uses a hybrid approach:

```typescript
// Pseudocode for data fetching
async function getFriendLeaderboard(userFid: number) {
  // Get user's friends from Farcaster API
  const friends = await farcasterClient.getUserFollowing(userFid);

  // Get activity data from internal database
  const activityData = await prisma.userActivity.findMany({
    where: {
      fid: { in: [...friends.map(f => f.fid), userFid] },
    },
    orderBy: { score: 'desc' },
  });

  // Calculate rankings and format data
  return activityData.map((data, index) => ({
    fid: data.fid,
    username: data.username,
    score: data.score,
    streak: data.streak,
    rank: index + 1,
    isFollowing: friends.some(f => f.fid === data.fid),
  }));
}
```

### Administrative Features

For admin users, additional features are implemented:

1. A dedicated admin page at `/admin/[fid]/friends`
2. Statistical cards showing usage metrics
3. Weekly and all-time leaderboard tabs
4. Implementation notes for the admin

### Integration Points

The Friend Leaderboard integrates with several system components:

1. **User Authentication**: Uses Farcaster ID for identifying users
2. **Activity Tracking**: Connects with the activity tracking system to get scores
3. **Pagination**: Implemented for large friend lists
4. **Avatar System**: Uses the Avatar component for user profile pictures

### Performance Considerations

To ensure optimal performance:

1. Friend lists are paginated to handle large datasets
2. Data is cached at the page level to reduce API calls
3. The component implements virtualization for long lists
4. Only top 10 entries are shown by default

### Security and Privacy

The implementation ensures:

1. Users can only see friends who have opted into leaderboards
2. Admin views require proper authorization
3. Activity data is anonymized for global leaderboards
4. Share functionality respects user privacy settings

## Validation and Error Handling
