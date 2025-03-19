# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Authentication Improvements

- **Implemented Farcaster Auth-kit Integration**:

  - Added Sign in with Farcaster (SIWF) functionality
  - Created AuthProvider component for Auth-kit context
  - Implemented SignInButton component for the login UI
  - Added server-side signature verification
  - Implemented secure cookie-based sessions
  - Created User model in the database schema to store Farcaster user data

- **Protected Routes and Privacy**:

  - Implemented Next.js middleware for route protection
  - Created redirect mechanism for unauthenticated users
  - Added login prompt when accessing protected routes
  - Ensured proper security for authentication cookies

- **Authentication User Experience**:
  - Designed a clean authentication flow
  - Added loading states and error handling for authentication
  - Created context providers for authentication state management
  - Enhanced profile state to show user information after login

### Security Improvements

- **Fixed SQL Injection Vulnerability**:

  - Removed unsafe raw SQL queries using `$executeRawUnsafe` in vote processing
  - Replaced with safe Prisma methods using `update` with `increment` operation
  - Implemented proper query parameter handling to prevent injection attacks

- **Enhanced Input Validation**:

  - Added comprehensive input validation for frame message data
  - Implemented validation for buttonIndex and fid parameters
  - Added proper error handling for invalid input formats

- **Improved Error Handling**:
  - Added specific error handling for image loading failures in frame images
  - Implemented fallback mechanisms for unavailable images
  - Enhanced error responses with more specific error messages

### Monitoring and Performance

- **Error Monitoring with Sentry**:

  - Integrated Sentry for error tracking
  - Added custom error boundaries with Sentry integration
  - Implemented error tracking service for centralized error handling
  - Enhanced error reporting with contextual information

- **Performance Monitoring with Vercel Analytics**:

  - Added Vercel Analytics for performance tracking
  - Implemented custom event tracking
  - Created analytics service for centralized tracking logic
  - Enhanced developer insights with detailed performance metrics

- **Health Check and Monitoring**:
  - Created health check API endpoint
  - Implemented database connection validation
  - Added system status reporting
  - Enhanced monitoring capabilities with structured health data

### Implemented Improvements

- **Fixed Race Condition in Voting**:

  - Implemented database transactions to ensure data consistency during votes
  - Fixed potential inconsistencies between vote counts and user streak tracking
  - Improved streak calculation logic to handle edge cases

- **Updated Farcaster SDK Integration**:

  - Fixed `addFrame` implementation to correctly handle the latest SDK response format
  - Enhanced notification token handling in frame save functionality
  - Updated type definitions to match current Frame SDK version

- **Optimized Database Operations**:

  - Improved achievement checking to reduce unnecessary database queries
  - Consolidated achievement granting into a single transaction
  - Enhanced user streak tracking with more efficient queries

- **Consistent Button Handling**:

  - Implemented consistent button indices using BUTTON_TYPES constants
  - Fixed potential issues with button index mismatches between routes
  - Enhanced maintainability with proper button type definitions

- **Fixed Admin Page Parameter Handling**:
  - Resolved "Route '/admin/[fid]' used `params.fid`. `params` should be awaited" error by properly awaiting params
  - Added input validation for the fid parameter to prevent invalid ID issues
  - Enhanced error UI for displaying access denied and invalid ID errors
- **Enhanced Avatar Image Support**:

  - Configured Next.js to support SVG images from DiceBear API
  - Added content security policy for SVG images
  - Added specific remotePattern for the DiceBear API hostname and pathname

- **UI Loading Experience**:

  - Added skeleton loaders for content during data fetching
  - Improved loading states and animations across the application
  - Enhanced user feedback during async operations

- **Enhanced User Streak Tracking**:

  - Improved logic for detecting voting streaks
  - Added granular tracking for consecutive days
  - Fixed edge cases for timezone differences
  - Enhanced performance of streak calculations

- **Fixed Linter Errors**:
  - Resolved type safety issues in error handling code
  - Fixed input validation implementation for API endpoints
  - Corrected error type casting in catch blocks
  - Enhanced codebase cleanliness and maintainability

### Recent Updates

- **Admin Page and Image Handling Improvements (April 2025)**:

  - Fixed Admin page parameter handling with proper Promise resolution
  - Added proper SVG support for avatar images from DiceBear API
  - Enhanced error handling in the Admin dashboard
  - Fixed DOM nesting issues in components
  - Improved image handling with fallbacks and optimizations

- **Advanced Component Integration (March 2025)**:

  - Replaced basic VotingInterface with feature-rich ContextAwareTopicView
  - Added FirstTimeUserExperience for new user onboarding
  - Integrated DidYouKnow facts that appear after voting
  - Added DirectChallenge component for social sharing
  - Implemented FrameSavePrompt for better frame:add experience

- **Technical Improvements and Bug Fixes**:
  - Fixed PrismaClient browser environment error in edge runtime
  - Created edge-compatible API route for serving topic data
  - Improved error handling in frame image generation
  - Fixed type compatibility issues in ClientPage and related components

## [0.5.0] - 2025-04-25

### Admin Improvements and Bug Fixes

- **Fixed Admin Page Parameter Handling**:

  - Resolved the error "Route '/admin/[fid]' used `params.fid`. `params` should be awaited before using its properties"
  - Updated AdminPage component to properly await dynamic route parameters
  - Added input validation for fid parameter to prevent invalid ID issues
  - Enhanced error UI for displaying access denied and invalid ID errors

- **Enhanced Avatar Image Support**:

  - Configured Next.js to support SVG images from DiceBear API
  - Added content security policy for SVG images
  - Implemented fallback mechanism for failed avatar image loads
  - Replaced static avatar images with dynamically generated ones

- **Documentation Updates**:

  - Added comprehensive DOM nesting guidelines to implementation notes
  - Updated troubleshooting guide with image handling solutions
  - Enhanced README with component usage best practices
  - Added prioritized roadmap for future improvements

- **Development Experience**:
  - Added clear error messages for common development issues
  - Enhanced logging for API routes and database operations
  - Improved error recovery for development server

## [0.4.0] - 2025-04-15

### Critical Fixes

- **Fixed Admin Page Parameter Handling**:

  - Resolved the error "Route '/admin/[fid]' used `params.fid`. `params` should be awaited before using its properties"
  - Updated AdminPage component to properly await dynamic route parameters
  - Added proper type handling for dynamic route parameters
  - Enhanced error handling when admin user not found

- **PrismaClient Browser Error Resolution**:

  - Fixed the error "PrismaClient is unable to run in this browser environment" in frame image generation
  - Created an API-only solution for database access in edge functions
  - Implemented topic data cache to improve performance
  - Added fallback mechanism for when database connection fails

- **Type Compatibility Fixes**:
  - Resolved type error in ClientPage related to DirectChallenge component
  - Fixed issue where null values weren't assignable to "A" | "B" | undefined
  - Improved overall type safety across components
  - Added proper null checks for optional parameters

### UI Improvements

- **Enhanced Loading States**:

  - Added fine-grained loading indicators for vote actions
  - Implemented skeleton loaders for content that might take time to load
  - Added smooth transitions between loading and loaded states
  - Improved feedback during network operations

- **Mobile Responsiveness**:

  - Enhanced layout adjustments for small screens
  - Improved touch targets for better mobile usability
  - Fixed overflow issues on narrow viewports
  - Optimized font sizes and spacing for mobile devices

- **Accessibility Enhancements**:
  - Improved color contrast ratios throughout the application
  - Enhanced keyboard navigation and focus states
  - Added explanatory tooltips for cryptocurrency topics
  - Implemented proper ARIA attributes for interactive elements

### API Improvements

- **Edge-Compatible API Routes**:

  - Created dedicated API endpoint for safely retrieving current topic data
  - Implemented proper error handling with user-friendly fallbacks
  - Added caching headers to improve performance
  - Created API route for post-vote analytics

- **Performance Optimizations**:
  - Improved image loading strategy with Next.js Image optimizations
  - Reduced unnecessary re-renders in client components
  - Enhanced API response times with better caching
  - Implemented better error recovery strategies

### Framework Updates

- Updated to Next.js 15.2:

  - Fixed API route type compatibility issues with the new Next.js 15.2 type system
  - Ensured proper type definitions for route handlers with dynamic parameters
  - Optimized application to leverage redesigned error UI and improved stack traces
  - Configured for streaming metadata to improve initial page load performance
  - Addressed component type issues in ContextAwareTopicView and related components
  - Updated documentation with Next.js 15.2 compatibility notes

- Updated to Tailwind CSS v4:

  - Migrated from Tailwind CSS v3 to v4 for modern CSS capabilities
  - Implemented new PostCSS plugin system with `@tailwindcss/postcss`
  - Updated import syntax to use `@import "tailwindcss"` directives
  - Configured native CSS cascade layers with standard CSS `@layer` functionality
  - Set up CSS variables for theming with the `@theme inline` directive
  - Added improved, theme-compliant color mapping throughout the application
  - Created a comprehensive migration guide at `docs/TAILWIND_V4_UPGRADE.md`

- React 19 Compatibility:

  - Updated shadcn/ui components to work with React 19
  - Replaced deprecated `forwardRef` usage with direct function components
  - Added `data-slot` attributes to all components for React 19 compatibility
  - Removed `.displayName` assignments (no longer needed in React 19)
  - Ensured proper state management with latest React patterns
  - Updated event handling to align with React 19 improvements

- Component Architecture Improvements:
  - Restructured Dialog components for better type safety and usability
  - Enhanced accessibility of all components with proper attributes
  - Improved component prop interfaces for better TypeScript type checking
  - Standardized theme implementation across all components

### Summary of Enhancements

We've significantly improved the app with a focus on virality and user experience:

1. **Enhanced Social Features**:

   - Added friend challenges, "Friends Voted" context, and improved social sharing
   - Created educational "Did You Know?" facts
   - Enhanced Streak Saver prompt to prevent streak breaks

2. **UI/UX Improvements**:

   - Made frame:add button more prominent throughout the app
   - Enhanced dark mode and typography consistency
   - Improved animations and loading experience
   - Optimized images with Next.js Image component

3. **Technical Improvements**:
   - Enhanced code with better typing
   - Added animation utilities
   - Improved performance and loading experience
   - Implemented user-generated topic submissions with admin moderation

### Added

- User-Generated Topic Submissions:
  - Added ability for users to submit their own topic ideas
  - Created a user-friendly submission form with validation
  - Implemented category selection for better organization
  - Topic submissions are stored for admin review
- Admin Moderation System:
  - Created comprehensive admin panel for topic moderation
  - Implemented FID-based authentication for secure admin access
  - Added approval/rejection workflow with custom rejection reasons
  - Ability to convert approved submissions to active topics
  - Role-based permissions (moderator vs full admin)
  - Admin management tools for adding/removing admins
- Friends Voted Context:
  - Added visual display showing how friends voted compared to the user
  - Implemented percentage comparison between agreeing and disagreeing friends
  - Dynamic messaging that changes based on level of agreement
  - Visual indicators for friends with same/different choices
  - Friend avatars with choice indicators
- Direct Challenge Feature:
  - Added ability for users to challenge friends directly
  - Multiple sharing options (copy, web share, Warpcast DM)
  - Custom challenge messages based on user's choice
  - Smooth modal animations and visual feedback
  - Integrated with haptic feedback for a better experience
- "Did You Know?" Facts Feature:
  - Added informative facts that appear after voting
  - Customized facts based on topic categories
  - Dynamic messaging based on whether user's choice was popular or rare
  - Smooth animations for fact appearance with a slight delay after results
  - Educational content to increase app value and shareability
- Project consolidation completed (2025-03-18):
  - Merged features from both implementations into a single codebase

### Enhanced

- UI Polish and Dark Mode:
  - Improved dark mode with consistent color variables and theme support
  - Enhanced typography consistency throughout the application
  - Added custom animation utility classes for smoother transitions
  - Optimized spacing and layout for better visual hierarchy
  - Enhanced loading experience with phased loading messages
- Image Optimization:
  - Replaced standard img tags with Next.js Image component for better performance
  - Added proper image sizing and priority loading for critical images
  - Implemented responsive sizing with the sizes attribute
- Enhanced Streak Saver Prompt:
  - Redesigned the streak reminder UI with more compelling visuals
  - Added animated flame icon and progress bar
  - Implemented clearer messaging based on missed days
  - Added visual indicators for benefits of maintaining streaks
- Improved social sharing functionality:
  - Enhanced share messages with more compelling text, hashtags, and emojis
  - Customized messaging based on user choice and topic context
  - Added clear call-to-action in sharing text to drive virality
- Made Frame:add button more prominent throughout the app:
  - Redesigned save frame buttons with animations and visual highlights
  - Added gradient backgrounds, shadow effects, and emoji indicators
  - Implemented pulsing animation to draw attention to save functionality
  - Added explicit benefits list to the save prompt
  - Introduced a prominent post-vote call-to-action button for saving the frame

### Added

- Project consolidation completed (2025-03-18):
  - Merged features from both implementations into a single codebase
  - Updated to latest Next.js 15 and React 19
  - Ensured proper Farcaster Frame SDK integration (v0.0.31)
  - Configured Prisma database integration
  - Set up proper API routes for frame interactions
  - Created comprehensive documentation
- Consolidated project structure from two separate implementations
- Updated dependencies to the latest versions
- Improved TypeScript type definitions for Farcaster Frame SDK
- Integrated database functionality with Prisma
- Ensured proper API route handling for frames
- Updated Next.js configuration for handling frame manifest
- Properly configured environment variables
- Added comprehensive database schema for user data, topics, and votes
- Created `ClientPage` component to handle client-side interactivity
- Added simplified implementation of `LoadingResults` component
- Added basic `Confetti` animation component
- Implemented simplified `AudioService` for sound effects
- Implemented simplified `HapticService` for haptic feedback
- Created `SplashScreen` component for initial loading experience
- Added `FrameSavePrompt` component for post-voting experience
- Implemented `ErrorBoundary` component for better error handling
- Added `topicId` and `topicTitle` props to the `FrameSavePromptProps` interface in the `FrameSavePrompt` component
- Created documentation for SDK integration and Frame implementation
- Added proper error handling for the Frame discovery hook
- Implemented proper saveFrame function in the FrameDiscoveryHelper hook
- Streak tracking system to reward consistent voting
- Achievement system with badges for various accomplishments:
  - Streak-based achievements (3-day and 7-day streaks)
  - Vote count achievements (10 and 50 votes)
  - Rare opinion badge for voting with the minority
  - Trendsetter badge for early voters
  - Controversy lover badge for divisive topics
  - Category expert badge for voting on all topics in a category
- Personalized result cards with opinion labels:
  - "Rare Opinion" for choices with <20% agreement
  - "Popular Choice" for choices with >70% agreement
  - "Divisive Topic" for close votes (40-60% split)
- Network connection state monitoring with automatic reconnection
- Offline indicator for showing when users lose connection
- Performance optimization utilities for improved mobile experience:
  - Scroll performance optimizations
  - Device capability detection
  - Animation complexity reduction for low-end devices
  - Lazy loading for images and components
  - Core Web Vitals monitoring (LCP, FID, CLS)
- Debounce and throttle utilities for performance optimization
- Comprehensive testing strategy:
  - Unit tests for services and utilities using Jest
  - Integration tests for component interactions
  - End-to-end tests with Playwright for critical user flows
  - Code coverage reporting and thresholds
  - Automated testing in CI/CD pipeline
- Standardized documentation:
  - JSDoc comments for components and utilities
  - Markdown documentation for complex services
  - Component API documentation
  - Testing strategy documentation

### Enhanced UI/UX & Viral Features

- Completely redesigned the UI with modern, visually appealing components:

  - Added gradient backgrounds and animations for a more engaging experience
  - Implemented animated progress bars for vote percentages
  - Added decorative elements and subtle animations to increase visual appeal
  - Improved typography with gradient text for headings
  - Enhanced mobile responsiveness across all pages
  - Added dark mode theme with sleek, modern aesthetics
  - Implemented backdrop blur effects for depth and visual interest
  - Created animated spinners and loading indicators
  - Added hover animations to interactive elements

- Added numerous viral sharing features:

  - Implemented "Challenge Friends" button to directly challenge friends to vote
  - Created special badges like "Rare Opinion" and "Divisive Topic" to encourage sharing
  - Added social sharing options for both Farcaster and Twitter/X
  - Implemented personalized share text based on user's choice and voting results
  - Added contextual messages that adapt to different voting scenarios
  - Added "Copy Text" button for easy sharing across platforms

- Enhanced results page:

  - Added detailed voting statistics with animated progress bars
  - Created "Additional Stats" section with vote difference and participation metrics
  - Implemented related topics from the same category
  - Added popular topics from other categories to increase engagement
  - Created personalized messaging based on the user's choice

- Improved trending page:

  - Created a visually stunning trending topics page with ranking indicators
  - Implemented "Hot" badges and ranking indicators (#2, #3, etc.)
  - Added total vote count and topic statistics
  - Created a dedicated OG image for the trending page with dynamic content
  - Enhanced sharing options specific to trending topics

- Added new and improved Open Graph images:
  - Redesigned all OG images with modern gradients and decorative elements
  - Implemented dynamic OG image for trending topics page
  - Enhanced topic OG image with more vibrant colors and improved typography
  - Enhanced results page OG image with vote percentages
  - Added decorative elements to all OG images for improved social sharing
  - Created an engaging splash image for full-screen frame launches
  - Updated frame metadata to support the new splash image

### Streak & Achievement Systems

- Implemented comprehensive user engagement and gamification features:

  - Added user streaks system to track consecutive days of voting
  - Created achievements system with 8 achievement types:
    - Streak-based achievements (Streak Starter, Streak Master)
    - Vote count achievements (Dedicated Voter, Power Voter)
    - Opinion rarity achievement (Rare Opinion)
    - Early voter achievement (Trendsetter)
    - Contested topics achievement (Controversy Lover)
    - Category completion achievement (Category Expert)
  - Added visual badges with icons and colors for each achievement type
  - Implemented streak counter display on topic details page
  - Added achievements showcase on topic details page
  - Created personalized voting analysis with custom messages based on voting patterns
  - Added streak and achievement tracking in the database
  - Implemented automatic achievement unlocking based on user actions

- Enhanced frame message handling for persistence:

  - Updated frame API to pass user FID (Farcaster ID) between interactions
  - Created redirect mechanism to maintain context through frame interactions
  - Implemented state management for tracking user choices across interactions
  - Added FID parameter to related topic links to maintain user context
  - Enhanced voting API to track both votes and streaks

- Improved social proof and community features:
  - Added personalized messages based on voting patterns (rare opinion, majority, etc.)
  - Implemented vote analysis section to explain the significance of the user's choice
  - Added contextual sharing prompts based on voting patterns
  - Enhanced share text with personalized messaging

### Advanced Features

- Frame discovery enhancements:

  - frame:add integration for easy saving of the frame
  - Contextual save prompts after meaningful interactions
  - Clear visual instructions for saving the frame
  - Interactive tooltips explaining benefits of saving
  - Haptic feedback for save confirmation
  - Multiple prompt variants (modal, inline, tooltip)

- Haptic feedback integration:

  - Subtle vibration patterns for user interactions
  - Celebration patterns for achievements and milestones
  - HapticService implementation with various feedback intensities
  - User preference toggle for enabling/disabling haptic feedback
  - Integration with FTUE and voting celebrations

- First-Time User Experience (FTUE) implementation:

  - Multi-step onboarding flow for new users
  - Interactive tutorial explaining core features
  - First vote celebration with feature introductions
  - Progressive feature disclosure based on usage patterns
  - UserService for tracking first-time actions and feature introduction

- Notification system integration:

  - Token storage for user notifications
  - New topic announcements
  - Streak reminder notifications
  - Achievement unlocked notifications
  - Friend voting difference alerts
  - API endpoint for notification details

- Context-aware UI implementation:

  - Different experiences based on launch context
  - Special views for streak reminders
  - Achievement celebration screens
  - Friend challenge views with comparative voting
  - Support for various Frame v2 launch scenarios

- Animation components for enhanced user experience:

  - Confetti effects to celebrate achievements and milestones
  - Loading animation for results page with progress bars and messages
  - Close call animation highlighting tight voting results
  - Landslide victory animation for decisive voting outcomes
  - Rare opinion highlight for users with minority viewpoints

- Audio system integration:
  - Sound effects for user interactions and achievements
  - AudioService implementation with play/pause controls
  - Sound toggle button for user preference
  - Sprite-based audio for efficient loading

### Infrastructure

- Added GitHub Actions CI workflow for automated testing and builds
- Created environment variables validation script for improved development experience
- Fixed package dependencies and updated package-lock.json
- Updated npm scripts to automatically verify environment variables before startup
- Consolidated documentation by merging duplicate CHANGELOG files into a single source of truth
- Removed legacy ESLint configuration files (.eslintrc.js and .eslintrc.json) to complete the migration to ESLint v9 flat config
- Enhanced .gitignore file with comprehensive exclusions for common temporary files, build artifacts, and editor-specific files
- Improved ESLint configuration to properly support TypeScript and Jest with proper globals and rules
- Updated Next.js configuration to use custom ESLint setup instead of built-in linting
- Added Prettier for consistent code formatting with ESLint integration
- Implemented pre-commit hooks with Husky and lint-staged to enforce code quality
- Enhanced JSDoc comments for key components following coding best practices
- Conducted comprehensive codebase audit:
  - Identified 9 unused production dependencies and 13 unused development dependencies
  - Found 21 ESLint warnings related to unused variables and imports
  - Created AUDIT_REPORT.md with detailed findings and recommendations
  - Planned systematic cleanup to improve code quality and reduce package size
- Implemented dependency cleanup:
  - Removed unused production dependencies (html2canvas, gif.js, viem, wagmi, howler, react-tsparticles, tsparticles, tsparticles-slim, @tanstack/react-query)
  - Removed unused type definitions (@types/howler)
  - Created DEPENDENCY_CLEANUP_PLAN.md with verification procedures for dependencies
  - Reduced package size and improved maintenance burden
- Fixed all ESLint warnings:
  - Updated ESLint configuration to properly handle variables with underscore prefix
  - Fixed unused variable warnings throughout the codebase
  - Optimized imports in components and utility files
  - Improved code quality and readability
- Removed temporary planning and audit files after successful implementation:
  - Deleted AUDIT_REPORT.md now that all identified issues are fixed
  - Deleted DEPENDENCY_CLEANUP_PLAN.md after completing dependency cleanup
  - Deleted CLEANUP_PLAN.md as all tasks have been completed
  - Deleted PR_TEMPLATE.md since changes were directly applied

### Fixed

- Fixed Prisma client browser environment error by improving singleton pattern implementation
- Updated Next.js configuration to serve Farcaster manifest from .well-known directory
- Created API route for serving Frame Manifest at /.well-known/farcaster.json
- Added proper server/client separation to avoid Prisma client errors in browser
- Fixed Next.js configuration file extension from .ts to .js
- Enhanced error handling in server components
- Fixed SDK implementation to properly handle both client and server environments
- Removed duplicate nested project directory (`this-or-that-frame/`) after successful consolidation
- Created comprehensive directory structure documentation
- Created proper public asset directory and ensured all required static assets are in place
- Verified all API routes are properly implemented and functional
- Fixed TypeScript error in playwright.config.ts by changing 'reporters' to 'reporter'
- Added missing `utils.ts` file with streak and achievement utility functions
- Fixed runtime error related to missing middleware-manifest.json by clearing build cache
- Added 'clean' script to package.json for easy cache clearing
- Fixed UI rendering issues by updating field names to match database schema
- Corrected port references in URLs from 3000 to 3001 throughout the application
- Added sample topic to database to ensure content displays correctly
- Resolved missing component errors in the build process
- Fixed frame detection logic in the `

## [0.2.0] - 2025-03-17

### Fixed

- Resolved UI styling issues with shadcn/ui components by installing the correct `@tailwindcss/postcss` package
- Updated PostCSS configuration for compatibility with Tailwind CSS v4
- Resolved dependency conflicts between React 19 and testing libraries using `--legacy-peer-deps`
- Configured proper CSS layer structure following Tailwind CSS v4 requirements
- Fixed globals.css with proper `@theme inline` directive and layering

### Added

- Comprehensive documentation for setting up Tailwind CSS v4 with shadcn/ui and React 19
- Troubleshooting guide for common issues when upgrading to newer versions

## [0.1.0] - Initial Release

### Added

- Created base "This or That" Farcaster Frame with Next.js and Tailwind CSS
- Implemented daily choice voting system
- Added React 19 and Next.js 15 support
- Integrated shadcn/ui components for UI elements
- Set up initial project structure and configuration
