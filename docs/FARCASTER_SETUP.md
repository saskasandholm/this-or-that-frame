# Farcaster Frame Setup

This document outlines the setup and configuration of the Farcaster Frame integration for the "This or That" application.

## Overview

The project implements a Farcaster Frame that allows users to vote on "This or That" topics directly from their Farcaster client. The frame is configured to:

1. Display a topic with two options
2. Collect votes from users
3. Store voting data in the Supabase database
4. Track user streaks and achievements

## Environment Variables

The following environment variables are required for the Farcaster Frame to function correctly:

```
NEXT_PUBLIC_APP_URL="https://frame-1epylemma-socialdaoai.vercel.app"
NEXT_PUBLIC_FRAME_IMAGE_URL="https://frame-1epylemma-socialdaoai.vercel.app/api/og"
NEXT_PUBLIC_FRAME_POST_URL="https://frame-1epylemma-socialdaoai.vercel.app/api/frame"
```

- `NEXT_PUBLIC_APP_URL`: The base URL of your deployed application
- `NEXT_PUBLIC_FRAME_IMAGE_URL`: The URL for Open Graph images and frame displays
- `NEXT_PUBLIC_FRAME_POST_URL`: The URL that handles frame button clicks/interactions

## Frame Configuration

The Frame configuration is defined in the `.well-known/farcaster` endpoint, which follows the Farcaster Frame specification. This endpoint returns a JSON object with the following structure:

```json
{
  "accountAssociation": {
    "header": "...",
    "payload": "...",
    "signature": "..."
  },
  "frame": {
    "version": "1",
    "name": "This or That?",
    "homeUrl": "https://your-app-url.com",
    "iconUrl": "https://your-app-url.com/api/splash",
    "imageUrl": "https://your-app-url.com/api/og",
    "buttonTitle": "Open App",
    "splashImageUrl": "https://your-app-url.com/api/splash",
    "splashBackgroundColor": "#1a202c",
    "webhookUrl": "https://your-app-url.com/api/frame"
  },
  "triggers": [
    {
      "type": "cast",
      "id": "vote",
      "url": "https://your-app-url.com/api/frame",
      "name": "Vote"
    }
  ]
}
```

## API Routes

The Frame implementation relies on the following API routes:

1. **`.well-known/farcaster` Route:**
   - Path: `src/app/api/well-known/farcaster/route.ts`
   - Purpose: Provides the Frame metadata following the Farcaster specification
   - Responds to: GET requests

2. **`/api/og` Route:**
   - Purpose: Generates Open Graph images for the topics
   - Used for: Frame displays and social media previews

3. **`/api/frame` Route:**
   - Purpose: Handles frame interactions (button clicks)
   - Processes: User votes and streak tracking

4. **`/api/splash` Route:**
   - Purpose: Serves the splash image for the Frame
   - Used by: iconUrl and splashImageUrl properties

## Testing Your Frame

To test the Farcaster Frame:

1. **Local Development:**
   - Start your development server: `npm run dev`
   - Use ngrok to expose your local server: `ngrok http 3000`
   - Test your frame on the [Warpcast Frame Playground](https://warpcast.com/~/developers/frames)
   - Enter your ngrok URL: `https://your-ngrok-url.ngrok.io/api`

2. **Production Testing:**
   - Once deployed, test your frame at [Warpcast Frame Playground](https://warpcast.com/~/developers/frames)
   - Enter your production URL: `https://frame-1epylemma-socialdaoai.vercel.app/api`

## Debugging Tips

1. **Check Frame Response Headers:**
   - Ensure your API routes return the correct Farcaster headers: `frame-v1`

2. **Verify Open Graph Images:**
   - Check that your OG images are being generated correctly
   - Test with the [Warpcast Frame Validator](https://warpcast.com/~/developers/frames)

3. **Common Issues:**
   - CORS errors: Ensure your API routes allow cross-origin requests
   - Missing environment variables: Verify all required variables are set in Vercel
   - Image dimensions: Frame images should be 1200x630px for optimal display

## Advanced Frame Features

The Frame implementation supports several advanced features:

1. **Frame Versioning:**
   - Currently using version 1 of the Frames specification
   - Can be updated to version 2 for additional features

2. **Action Delegation:**
   - When users interact with the Frame, actions are delegated to appropriate handlers
   - Implemented in the frame response handler

3. **User Authentication:**
   - Farcaster users are identified by their FID (Farcaster ID)
   - User data is stored in the database for tracking voting history and streaks 