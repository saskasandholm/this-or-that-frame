# OptimizedImage Component

The `OptimizedImage` component is a wrapper around Next.js's `Image` component that adds enhanced functionality for improved image loading, error handling, and performance optimization.

## Table of Contents

- [Overview](#overview)
- [Props](#props)
- [Usage Examples](#usage-examples)
- [Features](#features)
- [Implementation Details](#implementation-details)
- [Styling](#styling)
- [Error Handling](#error-handling)
- [Performance Considerations](#performance-considerations)
- [Related Components](#related-components)
- [Changelog](#changelog)

## Overview

The `OptimizedImage` component extends Next.js's built-in `Image` component with additional features such as loading states, error handling with fallback images, responsive sizing, and proper image optimization. This component should be used throughout the application for consistent image handling.

## Props

| Prop          | Type     | Required | Default                                                    | Description                                                   |
| ------------- | -------- | -------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| `src`         | string   | Yes      | -                                                          | Source URL of the image                                       |
| `alt`         | string   | Yes      | -                                                          | Alternative text for the image                                |
| `width`       | number   | No\*     | -                                                          | Width of the image (required if fill is false)                |
| `height`      | number   | No\*     | -                                                          | Height of the image (required if fill is false)               |
| `priority`    | boolean  | No       | false                                                      | Whether to prioritize loading this image                      |
| `className`   | string   | No       | ''                                                         | Additional CSS class names                                    |
| `onLoad`      | function | No       | -                                                          | Callback function when image loads                            |
| `fallbackSrc` | string   | No       | '/images/options/fallback.jpg'                             | Fallback image to show if loading fails                       |
| `fill`        | boolean  | No       | false                                                      | Whether to use fill mode (parent must have position:relative) |
| `sizes`       | string   | No       | "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" | Sizes attribute for responsive images                         |

\* Either width and height must be provided, or fill must be set to true.

## Usage Examples

### Basic Usage

```tsx
import { OptimizedImage } from '@/components/ui/OptimizedImage';

function ProductCard() {
  return (
    <div className="product-card">
      <OptimizedImage
        src="/images/products/headphones.jpg"
        alt="Noise-cancelling headphones"
        width={300}
        height={200}
        priority
      />
      <h3>Premium Headphones</h3>
    </div>
  );
}
```

### Fill Mode

```tsx
import { OptimizedImage } from '@/components/ui/OptimizedImage';

function CoverImage() {
  return (
    <div className="relative w-full h-64">
      <OptimizedImage src="/images/banner.jpg" alt="Banner image" fill className="object-cover" />
    </div>
  );
}
```

### With Custom Fallback

```tsx
import { OptimizedImage } from '@/components/ui/OptimizedImage';

function UserAvatar({ userId }) {
  return (
    <div className="avatar-container">
      <OptimizedImage
        src={`/api/users/${userId}/avatar`}
        alt="User avatar"
        width={50}
        height={50}
        fallbackSrc="/images/default-avatar.png"
        className="rounded-full"
      />
    </div>
  );
}
```

## Features

1. **Loading State Indicator**: Shows a placeholder while the image is loading
2. **Error Handling**: Displays a fallback image if the primary image fails to load
3. **Responsive Sizing**: Automatically adjusts based on viewport with the sizes attribute
4. **Lazy Loading**: Only loads images when they enter the viewport
5. **Optimization**: Leverages Next.js image optimization
6. **Fill Mode Support**: Can fill its parent container while maintaining aspect ratio

## Implementation Details

The `OptimizedImage` component uses React's `useState` to track loading and error states. It wraps Next.js's `Image` component with proper configuration and adds styling for loading states. Key implementation features include:

1. **Error Detection**: Using the `onError` callback to detect when images fail to load
2. **Loading State**: Using the `onLoad` callback to detect when images have loaded
3. **Dynamic Props**: Supporting both fixed dimensions and fill mode with dynamic props
4. **Proper Styling**: Adding transition effects for smooth appearance

## Styling

The component uses:

- Tailwind CSS for core styling
- CSS transitions for smooth appearance
- Loading skeleton with animation
- Proper image positioning with object-fit

## Error Handling

Error handling follows a multi-tiered approach:

1. **Client-Side Detection**: Detects 404s and other errors when loading images
2. **Fallback Image**: Displays a fallback image when errors occur
3. **Graceful Degradation**: Ensures UI remains usable even when images fail
4. **Loading Skeleton**: Provides visual feedback during loading

## Performance Considerations

- Leverages Next.js image optimization (resizing, format conversion)
- Uses appropriate `sizes` attribute for responsive loading
- Implements loading states to reduce layout shift
- Optional priority loading for critical above-the-fold images
- Uses proper caching headers when serving images

## Related Components

- `VotingInterface`: Uses OptimizedImage for option images
- `FriendsVotedContext`: Uses OptimizedImage for avatar images
- `TrendingTopicCard`: Uses OptimizedImage for topic thumbnails

## Changelog

| Version | Date       | Changes                           |
| ------- | ---------- | --------------------------------- |
| 1.0.0   | 2024-06-01 | Initial implementation            |
| 1.0.1   | 2024-06-02 | Added support for sizes attribute |
