# Vercel Deployment Documentation

This document tracks changes made to the configuration for Vercel deployment.

## Deployment Date

- Date: $(date)

## Existing Configuration

- `vercel.json` - Already configured with basic Next.js deployment settings
- `.vercelignore` - Present and configured
- Environment variables required as per `.env.example`

## Required Environment Variables for Vercel

The following environment variables need to be set in the Vercel dashboard:

```
# Required
NEXT_PUBLIC_APP_URL=https://frame-7rmy9wawk-saska-socials-projects.vercel.app

# Database URL (if using PostgreSQL or other DB on Vercel)
DATABASE_URL=

# Next.js authentication (required for security)
NEXTAUTH_SECRET=

# Frame URLs (update with production URLs)
NEXT_PUBLIC_FRAME_IMAGE_URL=https://frame-7rmy9wawk-saska-socials-projects.vercel.app/api/og
NEXT_PUBLIC_FRAME_POST_URL=https://frame-7rmy9wawk-saska-socials-projects.vercel.app/api/frame

# Sentry configuration (optional)
SENTRY_DSN=
SENTRY_ENVIRONMENT=production
```

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

## Build Status

- ✅ Local build successful
- TypeScript errors fixed
- ✅ Deployed to Vercel

## Deployment URL

- Preview: https://frame-7rmy9wawk-saska-socials-projects.vercel.app

## Post-Deployment Steps

1. Configure environment variables in the Vercel dashboard with the correct values
2. Validate the frame using Warpcast's frame validator
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

## Deployment Commands

### Manual Deployment

```
vercel
```

For production deployment:

```
vercel --prod
```

### Automated Deployment

The project includes an automated deployment script that sets all necessary environment variables:

```
node scripts/deploy.js
```

This script:

1. Loads environment variables from `.env`
2. Sets predefined environment variables for production
3. Executes Vercel deployment with all environment variables
4. Uses `--prod` and `--force` flags for a production deployment

You may need to update the script with the current deployment URL if you create a new deployment.
