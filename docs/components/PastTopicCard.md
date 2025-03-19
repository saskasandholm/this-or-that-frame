# PastTopicCard Component

The `PastTopicCard` component displays past voting topics with their results, highlighting the winning option and showing vote distribution.

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

The `PastTopicCard` component presents completed voting topics in a visually engaging way, with a side-by-side comparison of both options, clear indication of the winner, and visual representation of vote distribution.

## Props

| Prop         | Type   | Required | Description                                         |
| ------------ | ------ | -------- | --------------------------------------------------- |
| `id`         | string | Yes      | Unique identifier for the topic                     |
| `title`      | string | Yes      | Title of the topic in "Option A vs Option B" format |
| `votesA`     | number | Yes      | Number of votes for Option A                        |
| `votesB`     | number | Yes      | Number of votes for Option B                        |
| `percentage` | number | Yes      | Percentage of votes for the winning option          |
| `winner`     | string | Yes      | Identifier of the winning option ("A" or "B")       |

## Usage Example

```tsx
import PastTopicCard from '@/components/PastTopicCard';

function PastTopics() {
  const pastTopics = [
    {
      id: 'past-1',
      title: 'Coffee vs Tea',
      votesA: 8742,
      votesB: 6531,
      percentage: 57,
      winner: 'A',
    },
    {
      id: 'past-2',
      title: 'Beach vs Mountains',
      votesA: 5243,
      votesB: 9721,
      percentage: 65,
      winner: 'B',
    },
  ];

  return (
    <div className="space-y-4">
      {pastTopics.map(topic => (
        <PastTopicCard
          key={topic.id}
          id={topic.id}
          title={topic.title}
          votesA={topic.votesA}
          votesB={topic.votesB}
          percentage={topic.percentage}
          winner={topic.winner}
        />
      ))}
    </div>
  );
}
```

## Visual Elements

1. **Option Labels**: Displays both options from the original topic
2. **Vote Counts**: Shows the number of votes each option received
3. **Winner Indication**: Highlights the winning option with a trophy icon and styling
4. **Progress Bar**: Visualizes the vote distribution between options
5. **Percentage Display**: Shows the percentage of votes for the winning option

## Implementation Details

The component includes several key features:

1. **Dynamic Option Extraction**: Parses the title to extract option names
2. **Conditional Styling**: Highlights the winning option with different styling
3. **Visual Vote Distribution**: Uses a progress bar to show relative vote counts
4. **Formatted Numbers**: Vote counts are formatted with thousand separators
5. **Trophy Icon**: Displays a trophy icon next to the winning option

## Styling

The component uses:

- Tailwind CSS for core styling
- Grid layout for side-by-side comparison
- Progress component for vote distribution visualization
- Conditional background colors for winner highlighting
- Shadow and border effects for card definition

## Animations

The component includes the following animations:

- Fade-in and slide-up animation on initial render
- Hover transition effects for better user interaction
- Subtle animation for the progress bar

## Related Components

- `TrendingTopicCard`: Similar card component for trending topics
- `VotingInterface`: Component for the active voting interface
- `Progress`: UI component used for vote distribution visualization

## Changelog

| Version | Date       | Changes                                                                          |
| ------- | ---------- | -------------------------------------------------------------------------------- |
| 1.0.0   | 2023-10-15 | Initial implementation with basic styling                                        |
| 1.1.0   | 2024-06-05 | Enhanced with split view, winner indication, and vote distribution visualization |
