# FRAME_TESTING.md (ARCHIVED)

*Last Updated: March 25, 2025*

> **NOTICE**: This file has been archived. The content has been consolidated into 
> [FRAME_GUIDE.md](consolidated/FRAME_GUIDE.md).
> Please refer to that document for the most up-to-date information.

---

# Frame Testing Guide

*Last Updated: March 25, 2024*


This document provides instructions for testing your Farcaster Frame after deployment.

## Testing with Frame Playground

The Warpcast Frame Playground is the official tool for testing Farcaster Frames. It provides enhanced testing capabilities for both v1 and v2 frames, including wallet interactions and dynamic content.

### Step 1: Access the Playground

1. Go to [Warpcast Frame Playground](https://warpcast.com/~/developers/frames)
2. You'll need to be logged into Warpcast to access this tool

### Step 2: Test the Frame

1. Enter your frame URL: `https://frame-1epylemma-socialdaoai.vercel.app/api`
2. The playground will automatically validate your frame and show a preview
3. You can test different user contexts and wallet interactions directly in the playground

### Step 3: Evaluate Results

The playground will check:

- Frame metadata (title, image, aspect ratio)
- Response headers
- Button functionality
- POST request handling
- Wallet integration
- Dynamic content based on user context

If any issues are found, the playground will show detailed error messages to help you troubleshoot.

## Expected Behaviors

### Initial Load

- The frame should load with an image and buttons
- Any text content should be visible and formatted correctly

### Button Interactions

- Clicking buttons should trigger the appropriate actions
- Post-click frames should load correctly with updated content

### Wallet Functionality

- The "Connect Wallet" button will only function properly within the Farcaster client environment
- When testing directly via web browser, it will show a warning icon (this is expected)
- When testing in Warpcast, wallet connection should work as intended

## Troubleshooting Common Issues

### Frame Not Loading

If your frame doesn't load in the playground:

1. **Check URL Format**: Make sure you're using `https://frame-1epylemma-socialdaoai.vercel.app/api`
2. **Verify API Route**: Ensure your API route is correctly implemented and responding to GET requests
3. **Check Environment Variables**: Verify all environment variables are set correctly in Vercel
4. **Inspect Server Logs**: Look at Vercel logs for any errors in the API route

### Image Not Displaying

If the frame image isn't showing:

1. **Check Image URL**: Verify `NEXT_PUBLIC_FRAME_IMAGE_URL` is set correctly
2. **Image Size**: Ensure the image meets Farcaster's requirements (ratio of 1.91:1 recommended)
3. **CORS Issues**: Make sure your server allows cross-origin requests for images

### Button Actions Not Working

If buttons don't trigger the expected actions:

1. **Verify POST Endpoint**: Check that your `/api/frame` endpoint correctly handles POST requests
2. **Button Configuration**: Confirm button labels and targets are correctly defined
3. **Response Format**: Ensure your API returns properly formatted Frame responses

### Wallet Connection Issues

The wallet connection feature has specific behavior:

1. **Testing Outside Warpcast**: The "Connect Wallet" button will show a warning icon when accessed directly - this is normal
2. **Testing in Warpcast**: The wallet connection should work properly in the Frame Playground
3. **Connection Flow**: When connected, the UI should update to show connected state and wallet address

## Advanced Testing Tips

### Testing Different Scenarios

1. **User Authentication**: Test both authenticated and unauthenticated states
2. **Error Handling**: Intentionally trigger errors to ensure graceful degradation
3. **Multiple Interactions**: Test multi-step flows that require several button clicks

### Performance Considerations

1. **Response Time**: Frame responses should be fast (under 300ms ideally)
2. **Image Optimization**: Ensure images are properly optimized for quick loading
3. **Caching**: Implement appropriate caching headers for static assets

## Integration with Farcaster Ecosystem

Your frame may interact with other Farcaster features:

1. **User Context**: Test how your frame uses the fid and other user information
2. **Casts**: If your frame creates casts, verify they appear correctly
3. **Notifications**: If implemented, test that notifications work as expected

## Resources

- [Farcaster Frames Documentation](https://docs.farcaster.xyz/developers/frames/getting-started)
- [Frames v2 Documentation](https://docs.farcaster.xyz/developers/frames/v2/getting-started)
- [Farcaster Best Practices](https://docs.farcaster.xyz/developers/frames/best-practices)
- [Warpcast Frame Playground](https://warpcast.com/~/developers/frames)
