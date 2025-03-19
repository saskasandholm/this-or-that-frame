# FriendLeaderboard Component

## Overview

The FriendLeaderboard component displays a social ranking interface that shows how users compare with their friends and global leaders based on activity scores. It enhances social engagement by fostering friendly competition and providing social proof through transparent ranking systems.

## Table of Contents

- [Props](#props)
- [Example Usage](#example-usage)
- [Dependencies](#dependencies)
- [Component Structure](#component-structure)
- [Best Practices](#best-practices)
- [Related Components](#related-components)
- [Changelog](#changelog)

## Props

| Prop               | Type                                | Required | Default   | Description                                             |
| ------------------ | ----------------------------------- | -------- | --------- | ------------------------------------------------------- |
| friends            | FriendData[]                        | Yes      | -         | Array of friends data to display in the leaderboard     |
| globalLeaders      | FriendData[]                        | Yes      | -         | Array of global leaders data to display                 |
| currentUserRank    | number                              | No       | undefined | The current user's rank to highlight their position     |
| period             | 'weekly' \| 'monthly' \| 'all-time' | No       | 'weekly'  | Time period for the leaderboard data                    |
| onShareLeaderboard | () => void                          | No       | undefined | Callback function when share button is clicked          |
| onViewProfile      | (fid: number) => void               | No       | undefined | Callback function when view profile button is clicked   |
| className          | string                              | No       | ''        | Additional CSS class names to apply to the root element |

### FriendData Interface

```typescript
interface FriendData {
  fid: number; // Farcaster ID
  username: string; // Display name
  avatarUrl?: string; // URL to avatar image
  score: number; // Activity score
  streak?: number; // Current activity streak
  rank: number; // Position in the leaderboard
  isFollowing: boolean; // Whether the current user follows this user
}
```

## Example Usage

### Basic Usage

```tsx
import FriendLeaderboard from '@/components/FriendLeaderboard';

function LeaderboardPage() {
  // Example data
  const friends = [
    { fid: 12345, username: 'alice', score: 520, streak: 7, rank: 1, isFollowing: true },
    { fid: 23456, username: 'bob', score: 480, streak: 3, rank: 2, isFollowing: true },
    // More friend data...
  ];

  const globalLeaders = [
    { fid: 34567, username: 'crypto_leader', score: 980, streak: 15, rank: 1, isFollowing: false },
    { fid: 45678, username: 'web3_expert', score: 870, streak: 12, rank: 2, isFollowing: true },
    // More global leader data...
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Community Leaderboard</h1>
      <FriendLeaderboard
        friends={friends}
        globalLeaders={globalLeaders}
        currentUserRank={42}
        period="weekly"
        onShareLeaderboard={() => alert('Share leaderboard')}
        onViewProfile={fid => console.log(`View profile of user with FID: ${fid}`)}
      />
    </div>
  );
}
```

### With Custom Styling

```tsx
<FriendLeaderboard
  friends={friends}
  globalLeaders={globalLeaders}
  currentUserRank={42}
  className="border-2 border-primary shadow-lg"
/>
```

## Dependencies

The FriendLeaderboard component depends on:

- UI Components:
  - Card, CardContent, CardDescription, CardHeader, CardTitle
  - Avatar
  - Badge
  - Button
  - Tabs, TabsContent, TabsList, TabsTrigger
- Icons:
  - Trophy, Users, Flame, Share2, TrendingUp (from lucide-react)

## Component Structure

The FriendLeaderboard is structured as follows:

1. **Card Container** - Contains the entire leaderboard

   - Card Header with title and optional share button
   - Card Content with tabs for different views

2. **Tab Navigation** - Allows switching between views:

   - Friends Tab - Shows rankings of connected friends
   - Global Tab - Shows rankings of top users across the platform

3. **Leaderboard Items** - Each row displays:

   - Rank number (highlighted for top 3)
   - User avatar and name
   - Optional streak indicator
   - Score display
   - Action buttons

4. **Empty State** - Displayed when no friends are found

## Best Practices

1. **Data Loading**:

   - Load data in small batches (10 items recommended)
   - Consider implementing virtual scrolling for large datasets
   - Add loading states for asynchronous data

2. **Customization**:

   - The component handles basic styling, but can be customized with the `className` prop
   - For more extensive customization, consider creating a variant of the component

3. **Interaction**:

   - Implement proper client-side handlers for share and profile viewing
   - Consider adding animations for rank changes when data updates

4. **Accessibility**:
   - The component includes screen reader text for interactive elements
   - Ensure proper keyboard navigation when implementing in your application

## Related Components

- [UserProfile Component](/docs/components/UserProfile.md) - For displaying user details
- [ActivityFeed Component](/docs/components/ActivityFeed.md) - For showing user activity
- [StatisticsCard Component](/docs/components/StatisticsCard.md) - For displaying user stats

## Changelog

| Version | Date       | Changes                                     |
| ------- | ---------- | ------------------------------------------- |
| 1.0.0   | 2024-03-19 | Initial implementation of FriendLeaderboard |
