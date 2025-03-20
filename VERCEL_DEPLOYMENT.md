# Vercel Deployment Documentation

This document tracks changes made to the configuration for Vercel deployment.

## Deployment Date

- Date: March 21, 2024

## Current Deployment

- Production URL: https://frame-1epylemma-socialdaoai.vercel.app
- Frame API URL: https://frame-1epylemma-socialdaoai.vercel.app/api

## Existing Configuration

- `vercel.json` - Already configured with basic Next.js deployment settings
- `.vercelignore` - Present and configured
- Environment variables required as per `.env.example`

## Required Environment Variables for Vercel

The following environment variables need to be set in the Vercel dashboard:

```
# Required
NEXT_PUBLIC_APP_URL=https://frame-1epylemma-socialdaoai.vercel.app

# Database URL (if using PostgreSQL or other DB on Vercel)
DATABASE_URL=

# Next.js authentication (required for security)
NEXTAUTH_SECRET=

# Frame URLs (update with production URLs)
NEXT_PUBLIC_FRAME_IMAGE_URL=https://frame-1epylemma-socialdaoai.vercel.app/api/og
NEXT_PUBLIC_FRAME_POST_URL=https://frame-1epylemma-socialdaoai.vercel.app/api/frame

# Sentry configuration (optional)
SENTRY_DSN=
SENTRY_ENVIRONMENT=production
```

## Deployment Configuration

- GitHub Integration: Enabled (auto-deploys on push to main branch)
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `yarn install`

## Changes Made During Deployment

1. Updated `.vercelignore` to exclude unnecessary files from deployment:

   ```
   this-or-that-frame-backup.tar.gz
   .git
   .github
   node_modules
   temp_backup
   __tests__
   playwright
   *.log
   .env.local
   .env
   README.md
   CHANGELOG.md
   DIRECTORY_STRUCTURE.md
   VERCEL_DEPLOYMENT.md
   ```

2. Fixed TypeScript error in `src/components/ui/pagination.tsx`:

   - Added proper type for pages array: `type PageIdentifier = number | 'ellipsis-start' | 'ellipsis-end';`
   - Updated array declaration to include type: `const pages: PageIdentifier[] = [];`

3. Fixed TypeScript error in `src/lib/ContextProvider.tsx`:

   - Added SDK context type: `type SDKContextType = any;`
   - Fixed typing of frameContext variable: `let frameContext: SDKContextType | null = null;`
   - Fixed contextFid variable typing: `let contextFid: number | null = null;`
   - Changed OR operators to nullish coalescing operators: `contextFid = (typedContext.user?.fid ?? typedContext.fid ?? null);`

4. Updated deployment script to use the correct URLs:
   - Changed all references from old preview URL to the current production URL
   - Renamed script to use .cjs extension for proper CommonJS compatibility

## Build Status

- ✅ Local build successful
- ✅ TypeScript errors fixed
- ✅ Deployed to Vercel
- ✅ Build completed successfully with minor warnings (related to OpenTelemetry dependencies)

## Frame Validation

To validate that your frame is working correctly:

1. Visit the Warpcast Frame Playground at https://warpcast.com/~/developers/frames
2. Enter your frame API URL: https://frame-1epylemma-socialdaoai.vercel.app/api
3. The playground will check:
   - Frame metadata and image URL validity
   - Button functionality
   - POST request handling
   - Frame response structure

### Expected Behaviors

#### Wallet Integration

- The "Connect Wallet" button will show a warning icon when accessed directly via web browser. This is expected behavior.
- Wallet connection only works properly when the frame is accessed through the Farcaster client (Warpcast).
- This is because the wallet connector requires the Farcaster Frame SDK context which is only available in the Farcaster client environment.

## Post-Deployment Steps

1. Configure environment variables in the Vercel dashboard with the correct values
2. Validate the frame using Warpcast's Frame Playground
3. Update the `scripts/deploy.js` file with the new deployment URL for future deployments
4. Test primary functionality to ensure everything works as expected

## Rollback Instructions

If you need to revert any changes:

1. For configuration file changes, refer to the specific changes documented above.
2. For environment variables, use the Vercel dashboard to modify or remove them.
3. To completely remove the deployment, use: `vercel remove [project-name]`

## Deployment Steps

1. ✅ Verify project configuration
2. ✅ Fix TypeScript errors for successful build
3. ✅ Set up environment variables in Vercel
4. ✅ Deploy project to Vercel
5. ✅ Validate frame functionality

## Deployment Commands

### Manual Deployment

```bash
vercel deploy --prod
```

### Automated Deployment

The project is set up for automatic deployments:

1. Push changes to the `main` branch
2. Vercel will automatically detect changes and start a new deployment
3. Monitor deployment status in the Vercel dashboard

## Troubleshooting

### Common Issues

1. **Frame Not Detected**

   - Make sure your frame API URL is correct (https://frame-1epylemma-socialdaoai.vercel.app/api)
   - Verify that all environment variables are set correctly
   - Check server logs for any API errors

2. **Wallet Connection Issues**

   - Remember that wallet connection only works within the Farcaster client
   - The warning icon is expected when viewing directly on the web
   - Test wallet functionality through the Warpcast Frame Playground

3. **Environment Variable Problems**
   - If the frame doesn't display correctly, check that all environment variables are set
   - Ensure URLs are using the correct domain (frame-1epylemma-socialdaoai.vercel.app)

## Future Maintenance

1. When updating the project, always test changes locally before deploying
2. After deployment, validate frame functionality using the Warpcast Frame Playground
3. Keep the deployment script updated with the current production URL
4. Monitor Vercel logs for any errors or performance issues
