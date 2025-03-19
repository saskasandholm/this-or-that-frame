# VotingInterface Component

The `VotingInterface` component provides a polished and interactive voting experience for the "This or That" application. It enables users to vote on binary options and view results with animations and visual feedback.

## Table of Contents

- [Overview](#overview)
- [Props](#props)
- [Usage Examples](#usage-examples)
- [Component States](#component-states)
- [Dependencies](#dependencies)
- [Implementation Details](#implementation-details)
- [Styling](#styling)
- [Accessibility](#accessibility)
- [Performance Considerations](#performance-considerations)
- [Related Components](#related-components)
- [Changelog](#changelog)

## Overview

The `VotingInterface` component displays a binary choice voting interface with images, animations, and results visualization. It handles various states including loading, voted, and error states, with smooth transitions and visual feedback.

## Props

| Prop             | Type       | Required | Description                                                              |
| ---------------- | ---------- | -------- | ------------------------------------------------------------------------ |
| `topic`          | Object     | Yes      | Topic information containing id, title, options, images, and vote counts |
| `topic.id`       | string     | Yes      | Unique identifier for the topic                                          |
| `topic.title`    | string     | Yes      | Title of the voting topic                                                |
| `topic.optionA`  | string     | Yes      | Text for the first option                                                |
| `topic.optionB`  | string     | Yes      | Text for the second option                                               |
| `topic.imageA`   | string     | No       | URL for the image representing option A                                  |
| `topic.imageB`   | string     | No       | URL for the image representing option B                                  |
| `topic.votesA`   | number     | Yes      | Current vote count for option A                                          |
| `topic.votesB`   | number     | Yes      | Current vote count for option B                                          |
| `onVote`         | function   | Yes      | Callback function that accepts 'A' or 'B' when user votes                |
| `hasVoted`       | boolean    | Yes      | Whether the current user has already voted                               |
| `selectedOption` | 'A' \| 'B' | No       | Which option the user selected if they voted                             |
| `isLoading`      | boolean    | No       | Whether the component is in a loading state                              |

## Usage Examples

### Basic Usage

```tsx
import VotingInterface from '@/components/VotingInterface';

function TopicPage() {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | undefined>(undefined);

  const handleVote = (option: 'A' | 'B') => {
    setSelectedOption(option);
    setHasVoted(true);
    // Call API to record vote
  };

  return (
    <VotingInterface
      topic={{
        id: 'topic-1',
        title: 'Bitcoin vs Ethereum',
        optionA: 'Bitcoin',
        optionB: 'Ethereum',
        imageA: '/images/options/bitcoin.jpg',
        imageB: '/images/options/ethereum.jpg',
        votesA: 120,
        votesB: 85,
      }}
      onVote={handleVote}
      hasVoted={hasVoted}
      selectedOption={selectedOption}
    />
  );
}
```

### Loading State

```tsx
<VotingInterface
  topic={{
    id: 'topic-2',
    title: 'Mountains vs Beach',
    optionA: 'Mountains',
    optionB: 'Beach',
    imageA: '/images/options/mountains.jpg',
    imageB: '/images/options/beach.jpg',
    votesA: 0,
    votesB: 0,
  }}
  onVote={() => {}}
  hasVoted={false}
  isLoading={true}
/>
```

## Component States

The component manages several states:

1. **Default State**: Shows both options for voting
2. **Hover State**: Visual feedback when hovering over options
3. **Loading State**: Shows skeleton loaders while loading
4. **Voted State**: Shows which option the user selected and displays vote percentages
5. **Results State**: Shows vote counts and percentages in a visually appealing way

## Dependencies

- `react`
- `framer-motion`: For animations and transitions
- `@/components/ui/button`: For voting buttons
- `@/components/ui/card`: For the container
- `@/components/ui/skeleton`: For loading states
- `@/components/ui/progress`: For showing vote percentages
- `@/components/ui/tooltip`: For displaying additional information
- `@/components/ui/OptimizedImage`: For optimized image loading

## Implementation Details

The component is built with the following key features:

1. **Responsive Design**: Adapts to different screen sizes
2. **Framer Motion Animations**: Uses motion components for smooth animations
3. **Vote Calculation**: Automatically calculates percentages for display
4. **Contextual Tooltips**: Shows additional information for certain topics
5. **Optimized Image Handling**: Uses the OptimizedImage component for better loading and fallbacks

## Styling

The component uses:

- Tailwind CSS for core styling
- CSS variables for theme customization
- Framer Motion for animations
- Custom gradients for visual appeal
- Backdrop blur effects for modern UI appearance

## Accessibility

- Proper contrast ratios for text and backgrounds
- Keyboard navigable interface
- Semantic HTML structure
- Appropriate ARIA attributes
- Screen reader friendly text alternatives

## Performance Considerations

- Uses image optimization with the OptimizedImage component
- Implements lazy loading for off-screen content
- Employs CSS transitions for smoother animations on lower-end devices
- Uses conditional rendering to reduce unnecessary DOM elements

## Related Components

- `VotingInterfaceWrapper`: Adapter component that makes VotingInterface compatible with the legacy API
- `FriendsVotedContext`: Displays how friends voted on the same topic
- `DidYouKnow`: Displays interesting facts related to the topic
- `OptimizedImage`: Handles image optimization and fallbacks

## Changelog

| Version | Date       | Changes                                            |
| ------- | ---------- | -------------------------------------------------- |
| 1.0.0   | 2023-10-15 | Initial implementation                             |
| 1.1.0   | 2023-11-20 | Added tooltips for crypto terms                    |
| 1.2.0   | 2024-03-01 | Added performance optimizations                    |
| 1.3.0   | 2024-06-01 | Integrated OptimizedImage for better image loading |
