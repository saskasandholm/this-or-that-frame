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

## State Management

The frame maintains state between interactions using the `fc:frame:state` meta tag:

- `topicId`: The ID of the current topic
- `choice`: The user's selected option (after voting)
- `fid`: The user's Farcaster ID (when available)

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

## Error Handling

The frame implementation includes robust error handling:

- Graceful fallbacks for missing topics
- Error boundaries for component failures
- Proper HTTP status codes for API errors
- Custom error frames with helpful messages

## Testing

The frame implementation can be tested using:

- The Warpcast Frame Playground
- Direct API calls with simulated frame messages
- End-to-end tests with Playwright

## Resources

- [Farcaster Frame v2 Specification](https://docs.farcaster.xyz/reference/frames/spec)
- [Farcaster Frame SDK Documentation](https://www.npmjs.com/package/@farcaster/frame-sdk)
