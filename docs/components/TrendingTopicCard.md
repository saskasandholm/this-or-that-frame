# TrendingTopicCard Component

The `TrendingTopicCard` component displays trending topics in a visually appealing card format, showing key information like ranking, category, vote count, and trend direction.

## Table of Contents

- [Overview](#overview)
- [Props](#props)
- [Usage Example](#usage-example)
- [Visual Elements](#visual-elements)
- [Implementation Details](#implementation-details)
- [Styling](#styling)
- [Animations](#animations)
- [Related Components](#related-components)
- [Changelog](#changelog)

## Overview

The `TrendingTopicCard` component is designed to showcase trending topics in a visually engaging way, with animations, icons, and clear information hierarchy. It displays the topic's rank, title, category, total votes, and trending direction.

## Props

| Prop               | Type   | Required | Description                                                              |
| ------------------ | ------ | -------- | ------------------------------------------------------------------------ |
| `topic`            | Object | Yes      | Topic information containing id, title, total votes, category, and trend |
| `topic.id`         | string | Yes      | Unique identifier for the topic                                          |
| `topic.title`      | string | Yes      | Title of the topic (typically in "X vs Y" format)                        |
| `topic.totalVotes` | number | Yes      | Total number of votes on the topic                                       |
| `topic.category`   | string | Yes      | Category the topic belongs to (e.g., "Technology", "Food")               |
| `topic.trend`      | string | Yes      | Trend indicator (e.g., "+42%", "-5%")                                    |
| `rank`             | number | Yes      | Numerical ranking of the topic                                           |

## Usage Example

```tsx
import TrendingTopicCard from '@/components/TrendingTopicCard';

function TrendingTopics() {
  const trendingTopics = [
    {
      id: 'trending-1',
      title: 'Apple vs Android',
      totalVotes: 12489,
      category: 'Technology',
      trend: '+42%',
    },
    {
      id: 'trending-2',
      title: 'Pizza vs Burgers',
      totalVotes: 8921,
      category: 'Food',
      trend: '+28%',
    },
  ];

  return (
    <div className="space-y-4">
      {trendingTopics.map((topic, index) => (
        <TrendingTopicCard key={topic.id} topic={topic} rank={index + 1} />
      ))}
    </div>
  );
}
```

## Visual Elements

1. **Rank Badge**: Displays the topic's ranking with a circular badge
2. **Category Badge**: Shows the topic category with an appropriate icon
3. **Trend Indicator**: Displays the trend direction with color coding (green for positive, red for negative)
4. **Topic Title**: Prominently displays the topic title
5. **Vote Count**: Shows the total number of votes with a user icon

## Implementation Details

The component includes several key features:

1. **Dynamic Category Icons**: Different icons are displayed based on the topic category
2. **Conditional Styling**: The trend indicator changes color based on whether the trend is positive or negative
3. **Formatted Numbers**: Vote counts are formatted with thousand separators for better readability
4. **Hover Effects**: The card has subtle hover animations for better user interaction

## Styling

The component uses:

- Tailwind CSS for core styling
- Border and shadow effects for card definition
- Color-coded trend indicators
- Custom SVG icons for categories
- Badge components for compact information display

## Animations

The component includes the following animations:

- Fade-in and slide-up animation on initial render
- Hover transition effects for shadow and title color
- Smooth transitions for interactive elements

## Related Components

- `PastTopicCard`: Similar card component for displaying past topics
- `VotingInterface`: Component for the actual voting interface
- `Badge`: UI component used for category display

## Changelog

| Version | Date       | Changes                                                        |
| ------- | ---------- | -------------------------------------------------------------- |
| 1.0.0   | 2023-10-15 | Initial implementation with basic styling                      |
| 1.1.0   | 2024-06-05 | Enhanced with animations, icons, and improved visual hierarchy |
