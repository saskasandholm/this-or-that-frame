# Directory Structure

This document outlines the complete directory structure of the This-or-That Frame project, explaining the purpose of each file and directory, and identifying any duplicates that need to be addressed.

## Overview

The project currently has two implementations mixed together:

1. The main project at `/Users/saskasandholm/frame`
2. A nested project at `/Users/saskasandholm/frame/this-or-that-frame`

This has led to confusion and duplication. Below is a detailed analysis of the current structure with recommendations for cleanup.

## Root Directory

- `.env` - Environment variables for the primary project, includes database connection
- `.env.example` - Example environment file with documentation
- `.git/` - Git repository information
- `.gitignore` - Specifies intentionally untracked files
- `.github/` - GitHub configuration files
  - `workflows/` - GitHub Actions workflow configurations
    - `ci.yml` - Continuous Integration workflow
- `.next/` - Next.js build directory (generated during development/build)
- `CHANGELOG.md` - Records of all notable changes to the project
- `CLEANUP_PLAN.md` - Step-by-step plan for cleaning up the project structure
- `DIRECTORY_STRUCTURE.md` - This file, documenting the project structure
- `README.md` - Project overview, features, and setup instructions
- `__tests__/` - Test files for unit and integration tests
- `docs/` - Project documentation
- `jest.config.js` - Configuration for Jest testing framework
- `jest.setup.js` - Setup file for Jest tests
- `next-env.d.ts` - TypeScript declarations for Next.js
- `next.config.js` - Next.js configuration
- `node_modules/` - External dependencies installed via npm
- `package-lock.json` - Dependency lock file for npm
- `package.json` - Project dependencies and scripts
- `playwright.config.ts` - Configuration for Playwright e2e tests
- `playwright/` - End-to-end tests using Playwright
- `postcss.config.js` - PostCSS configuration (using Tailwind v4)
- `prisma/` - Database schema and migrations using Prisma ORM
- `public/` - Static assets served by Next.js
  - `audio/` - Sound effects and audio assets
  - `images/` - Image assets including app-icon.png and app-splash.png
  - `js/` - Static JavaScript files
  - Various SVG files (next.svg, vercel.svg, etc.)
- `scripts/` - Utility scripts for the project
  - `verify-env.js` - Environment variable validation script
- `src/` - Source code for the application
- `tailwind.config.js` - Tailwind CSS configuration
- `this-or-that-frame-backup.tar.gz` - Archive of the previous nested project (can be removed after verification)
- `tsconfig.json` - TypeScript configuration

## Source Code (`src/`)

### `src/app/`

Next.js App Router directory containing pages and API routes:

- `globals.css` - Global CSS styles with Tailwind directives
- `layout.tsx` - Root layout component
- `page.tsx` - Main page component (Frame entry point)
- `api/` - API routes
  - `frame/` - Frame API handlers
    - `route.ts` - Handles frame interactions
    - `results/route.ts` - Handles results redirects
  - `notifications/` - Notification-related API endpoints
    - `[id]/route.ts` - Access individual notifications
  - `og/` - Open Graph image generation
    - `route.tsx` - Default OG image
    - `error/route.tsx` - Error state OG image
    - `results/[topicId]/route.tsx` - Results OG image
    - `topic/[topicId]/route.tsx` - Topic OG image
    - `trending/route.tsx` - Trending topics OG image
  - `topics/` - Topic-related API endpoints
    - `current/route.ts` - Current active topic
  - `votes/` - Vote-related API endpoints
    - `route.ts` - Record votes
    - `friends/route.ts` - Friend vote comparisons
  - `well-known/` - Well-known URL handlers
    - `farcaster/route.ts` - Farcaster manifest

### `src/components/`

React components:

- `FirstTimeUserExperience.tsx` - Onboarding flow for new users
- `FirstVoteCelebration.tsx` - Celebration component for first votes
- `FrameSavePrompt.tsx` - Prompts users to save the frame
- `SplashScreen.tsx` - Loading screen with asset preloading
- `VotingInterface.tsx` - Interface for voting on topics
- `ContextAwareTopicView.tsx` - Topic view that adapts to user context
- `ui/` - Reusable UI components
  - `FeedbackToggle.tsx` - Toggle for audio/haptic feedback
  - `ChannelLink.tsx` - Component for linking to Farcaster channels

### `src/lib/`

Utility functions and services:

- `AsyncErrorHandler.ts` - Handles asynchronous errors
- `ConnectionStateProvider.tsx` - Manages network connection state
- `ContextProvider.tsx` - Provides frame context to components
- `ErrorBoundary.tsx` - Catches and handles React errors
- `FrameDiscoveryHelper.ts` - Helps users discover and save frames
- `FrameManifestManager.ts` - Manages frame manifest information
- `performanceOptimizations.ts` - Utilities for performance optimization
- `prisma.ts` - Prisma client singleton

### `src/services/`

Service modules for business logic:

- `AudioService.ts` - Manages audio playback
- `HapticService.ts` - Manages haptic feedback
- `UserService.ts` - Manages user-related operations

### `src/types/`

TypeScript type definitions:

- `farcaster-frame-sdk.d.ts` - Type declarations for the Farcaster Frame SDK

## Duplicate Project (Removed)

The `this-or-that-frame/` directory contained a separate implementation of the same project. It has been consolidated into the main project and removed to avoid confusion.

Key differences from the main project were:

- Used newer dependencies (React 19, Next.js 15.2)
- Had fewer features but a more up-to-date structure
- Contained its own prisma schema and configurations

An archive of this directory exists as `this-or-that-frame-backup.tar.gz` and can be deleted once everything is verified to be working.

## Database Structure (`prisma/`)

- `schema.prisma` - Database schema defining models
- `migrations/` - Database migration files
- `seed.ts` - Seed script for populating initial data
- `dev.db` - SQLite database file

## Documentation (`docs/`)

- `DATABASE_SCHEMA.md` - Database schema documentation
- `FRAME_IMPLEMENTATION.md` - Farcaster Frame implementation details
- `SETUP.md` - Project setup guide

## Public Directory (`public/`)

Static assets served by Next.js:

- `audio/` - Sound effects for user interactions
- `images/` - Static image assets
  - `app-icon.png` - Application icon used in the Farcaster manifest
  - `app-splash.png` - Splash image used in the Farcaster manifest
- `js/` - Static JavaScript files
- Various SVG files (next.svg, vercel.svg, etc.) - Design assets

## Cleanup Recommendations

1. **Complete Project Cleanup Status**

   - ✅ Duplicate project removed (`this-or-that-frame/`)
   - ✅ Backup directory removed after verification
   - ✅ Public assets properly organized
   - ✅ Environment variables configured

2. **Final Cleanup (Optional)**

   ```
   # After ensuring everything is working
   rm -rf this-or-that-frame-backup.tar.gz
   ```

3. **Ensure Project Maintenance**
   - Keep documentation updated with any new changes
   - Run `npm audit` regularly to check for security vulnerabilities
   - Verify the environment with `npm run verify-env` when making configuration changes

## File Purposes and Dependencies

### Critical Files:

- `src/app/page.tsx` - Main frame entry point (depends on prisma, lib/FrameManifestManager)
- `src/app/api/frame/route.ts` - Frame interaction handler (depends on prisma)
- `prisma/schema.prisma` - Database schema definition
- `src/lib/prisma.ts` - Prisma client for database access
- `public/images/app-icon.png` - Application icon required by Farcaster manifest
- `public/images/app-splash.png` - Splash image required by Farcaster manifest

### Configuration Files:

- `.env` - Environment configuration (critical for prisma connection)
- `next.config.js` - Handles frame manifest URL routing
- `tailwind.config.js` - UI styling configuration
- `postcss.config.js` - Tailwind integration with CSS

### Component Hierarchy:

- `src/app/layout.tsx` → Root layout
  - `src/app/page.tsx` → Main page
    - `src/components/SplashScreen.tsx` → Initial loading
    - `src/components/ContextAwareTopicView.tsx` → Topic display
    - `src/components/VotingInterface.tsx` → Voting UI
    - `src/components/FirstTimeUserExperience.tsx` → New user onboarding
