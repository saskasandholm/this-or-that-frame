import { NextResponse } from 'next/server';

/**
 * Farcaster Frame Manifest API Endpoint
 * --------------------------------------
 * This API route serves the Farcaster Frame manifest file at /.well-known/farcaster.json
 * 
 * The manifest file follows the Farcaster Frame v2 specification and provides metadata
 * about the frame application including:
 * 
 * 1. Account Association: Cryptographically links the domain to a Farcaster account
 * 2. Frame Configuration: Metadata about the frame (name, URLs, images, etc.)
 * 3. Triggers: Defines how the frame can be launched from different contexts
 * 
 * Reference: https://docs.farcaster.xyz/reference/frames/spec
 * 
 * IMPORTANT: In production, replace the placeholder accountAssociation values 
 * with real values signed by your Farcaster account's custody address. To generate these:
 * 1. Create a payload with your domain: { domain: "yourdomain.com" }
 * 2. Sign this payload with your custody address using a tool like farcaster's auth kit
 * 3. Replace the header, payload, and signature values below
 */

/**
 * GET handler for the /.well-known/farcaster.json endpoint
 * @returns {NextResponse} JSON response containing the Frame manifest
 */
export async function GET() {
  // Get the application URL from environment variables or default to localhost
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  /**
   * Construct the manifest object according to the Farcaster specification
   * 
   * Structure:
   * - accountAssociation: Links domain to a Farcaster account
   * - frame: Core metadata about the frame application
   * - triggers: Defines entry points for the frame
   */
  return NextResponse.json({
    /**
     * Account Association
     * ------------------
     * Links this domain to a Farcaster account through cryptographic proof
     * The signature proves domain ownership by the account's custody address
     * 
     * In development, we use placeholder values
     * In production, replace with actual signed values for your domain
     */
    accountAssociation: {
      // Base64url encoded JFS header
      header: 'eyJhbGciOiJFUzI1NiIsImZjdCI6ImZjYS0xIiwiZmNhdSI6ImZyYW1lLmdqcy5kZXYifQ',
      // Base64url encoded payload containing a single property `domain`
      payload: 'eyJkb21haW4iOiJmcmFtZS5nanMuZGV2In0',
      // Base64url encoded signature bytes from custody address
      signature:
        'szgkqOWJ4ZGFWT6hRlhFR-CWGWQlB6du-rkP9_r8PSl3QlVrK0SytMV_CYS8z4pUCwYNTQ2LsM6f8DIkV91xAQ',
    },
    
    /**
     * Frame Configuration
     * ------------------
     * Core metadata about the frame application
     * This information is used by Farcaster clients to present and interact with the frame
     */
    frame: {
      // Manifest version (required)
      version: '1',
      
      // App name (required) - max 32 chars
      name: 'This or That?',
      
      // Default launch URL (required) - max 512 chars
      homeUrl: APP_URL,
      
      // Frame application icon URL - max 512 chars
      // Image should be 200x200px and < 1MB
      iconUrl: `${APP_URL}/api/splash`,
      
      // Default image to show when frame is rendered in a feed
      // Image should have 1.91:1 ratio (e.g., 1200x628px)
      imageUrl: `${APP_URL}/api/og`,
      
      // Default button title when frame is rendered in a feed - max 32 chars
      buttonTitle: 'Open App',
      
      // Splash image URL - max 512 chars
      // Image should be 200x200px and < 1MB
      splashImageUrl: `${APP_URL}/api/splash`,
      
      // Hex color code for splash background
      splashBackgroundColor: '#1a202c',
      
      // URL to which clients will POST events (required for notifications)
      webhookUrl: `${APP_URL}/api/frame`,
    },
    
    /**
     * Triggers Configuration
     * --------------------
     * Defines how users can launch the frame from different contexts within Farcaster clients
     * These are replacing the older "cast actions" and "composer actions" with a unified system
     */
    triggers: [
      {
        // Type of trigger - 'cast' is called when invoked from a cast
        type: 'cast',
        
        // Unique ID reported to the frame
        id: 'vote',
        
        // Handler URL for this trigger
        url: `${APP_URL}/api/frame`,
        
        // Display name for this trigger
        name: 'Vote',
      },
    ],
  });
}
