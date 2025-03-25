# VotingInterfaceWrapper Component

*Last Updated: March 25, 2025*


The `VotingInterfaceWrapper` is an adapter component that enables seamless integration of the modern `VotingInterface` component with the existing application architecture, providing backward compatibility with the legacy `ContextAwareTopicView` API.

## Table of Contents

- [Overview](#overview)
- [Props](#props)
- [Usage](#usage)
- [Implementation Details](#implementation-details)
- [Adapter Pattern](#adapter-pattern)
- [Related Components](#related-components)
- [When to Use](#when-to-use)
- [Changelog](#changelog)

## Overview

The `VotingInterfaceWrapper` serves as a compatibility layer that accepts the same props as the `ContextAwareTopicView` component but internally uses the enhanced `VotingInterface` component. This approach allows for a gradual migration to the improved UI without breaking existing code that relies on the legacy component's API.

## Props

The component accepts all the same props as the `ContextAwareTopicView`:

| Prop                  | Type               | Required | Description                                               |
| --------------------- | ------------------ | -------- | --------------------------------------------------------- |
| `topicId`             | string             | Yes      | Unique identifier for the topic                           |
| `topicTitle`          | string             | Yes      | Title of the voting topic                                 |
| `optionA`             | string             | Yes      | Text for the first option                                 |
| `optionB`             | string             | Yes      | Text for the second option                                |
| `imageA`              | string             | No       | URL for the image representing option A                   |
| `imageB`              | string             | No       | URL for the image representing option B                   |
| `results`             | Object             | No       | Vote results including totalVotes, percentA, and percentB |
| `userVote`            | 'A' \| 'B' \| null | No       | Which option the user selected if they voted              |
| `isLoading`           | boolean            | No       | Whether the component is in a loading state               |
| `onVote`              | function           | Yes      | Callback function that accepts 'A' or 'B' when user votes |
| `hasVoted`            | boolean            | Yes      | Whether the current user has already voted                |
| `showDidYouKnow`      | boolean            | No       | Whether to show the Did You Know section                  |
| `showDirectChallenge` | boolean            | No       | Whether to show the Challenge a Friend section            |
| `isRareOpinion`       | boolean            | No       | Whether the user's opinion is rare                        |
| `isHighlyContested`   | boolean            | No       | Whether the topic is highly contested                     |
| `onTryAgain`          | function           | No       | Callback function to retry in case of errors              |
| `error`               | string \| null     | No       | Error message to display if something went wrong          |

## Usage

```tsx
import VotingInterfaceWrapper from '@/components/VotingInterfaceWrapper';

function TopicPage() {
  const handleVote = (option: 'A' | 'B') => {
    // Handle vote logic
  };

  return (
    <VotingInterfaceWrapper
      topicId="topic-1"
      topicTitle="Bitcoin vs Ethereum"
      optionA="Bitcoin"
      optionB="Ethereum"
      imageA="/images/options/bitcoin.jpg"
      imageB="/images/options/ethereum.jpg"
      onVote={handleVote}
      hasVoted={false}
      results={{
        totalVotes: 205,
        percentA: 58,
        percentB: 42,
      }}
      showDidYouKnow={true}
    />
  );
}
```

## Implementation Details

The `VotingInterfaceWrapper` implements the adapter pattern to:

1. Convert prop formats from the legacy `ContextAwareTopicView` format to the format expected by `VotingInterface`
2. Handle error states separately from the main component
3. Add additional sections like `FriendsVotedContext` and `DidYouKnow` that were part of the legacy component
4. Manage the Challenge UI based on `showDirectChallenge` prop

The component transforms the data structure of results from:

```typescript
{
  totalVotes: number;
  percentA: number;
  percentB: number;
}
```

to:

```typescript
{
  id: string;
  title: string;
  optionA: string;
  optionB: string;
  imageA?: string;
  imageB?: string;
  votesA: number;
  votesB: number;
}
```

Calculating the absolute vote counts based on percentages and total votes.

## Adapter Pattern

The wrapper demonstrates the adapter pattern in action:

1. It accepts the same interface as `ContextAwareTopicView`
2. It transforms data to the format required by `VotingInterface`
3. It adds or removes functionality to match the expected behavior
4. It maintains backward compatibility while enabling forward migration

This pattern is particularly useful when:

- Upgrading components without changing all consuming code
- Integrating third-party libraries with different APIs
- Gradually migrating to a new architecture

## Related Components

- `VotingInterface`: The enhanced UI component this wrapper adapts to
- `ContextAwareTopicView`: The legacy component this wrapper replaces
- `FriendsVotedContext`: Displays how friends voted on the same topic
- `DidYouKnow`: Displays interesting facts related to the topic

## When to Use

Use this wrapper when:

1. You want to use the enhanced `VotingInterface` in code that expects the `ContextAwareTopicView` API
2. You're gradually migrating your application to use the improved components
3. You need to maintain backward compatibility during a transition period

Once the migration is complete, direct usage of `VotingInterface` is recommended for new code.

## Changelog

| Version | Date       | Changes                |
| ------- | ---------- | ---------------------- |
| 1.0.0   | 2024-06-01 | Initial implementation |
