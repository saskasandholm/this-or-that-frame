# This or That - Project Overview

*Last Updated: March 25, 2025*


## What is "This or That"?

"This or That" is a Farcaster Frame application that presents users with binary choices on engaging topics, collects their votes, and shows how they compare with the community. This simple mechanic drives viral sharing as users discover where they stand relative to others.

## Key Features

- **Binary Choice Interface**: Present two options with clear visuals
- **Real-time Results**: Show percentage splits after voting
- **Topic Variety**: Categories including crypto, tech, culture, and Farcaster-specific topics
- **Daily Rotation**: Fresh choices each day to encourage regular returns
- **Share Results**: Allow users to share their choice and the results
- **Friend Leaderboards**: Compare with friends on the platform
- **Farcaster Authentication**: Sign in with Farcaster to track voting history
- **Wallet Integration**: Connect wallet for blockchain transactions (in progress)

## Technical Stack

- **Frontend**: Next.js 15.2, React 19, TailwindCSS v4
- **UI Components**: shadcn/ui
- **Backend**: Next.js API routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: Farcaster Auth-kit
- **Frames Integration**: Farcaster Frames v2 SDK
- **Wallet Connection**: Wagmi, Viem, Frames SDK wallet connector
- **Animations**: Framer Motion
- **Deployment**: Vercel

## Project Architecture

The application follows a modern React architecture with Next.js:

1. **App Router**: Leverages Next.js 15.2's app router for routing and layouts
2. **Server Components**: Uses React Server Components where appropriate
3. **Client Components**: Uses client components for interactive elements
4. **API Routes**: Implements API routes for Frame interactions and data operations
5. **Database**: Uses Prisma ORM for database operations
6. **Authentication**: Implements Farcaster authentication for user identification

## Core User Flows

### Basic Voting Flow

1. User views a topic with two options
2. User selects one option (A or B)
3. System records vote and displays community results
4. User can share their choice and the results

### Authentication Flow

1. User clicks "Sign in with Farcaster"
2. Auth-kit displays QR code or deep link
3. User approves sign-in in their Farcaster wallet
4. System creates authenticated session
5. User can now access personalized features

### Frame Flow

1. User encounters frame in Farcaster client
2. User clicks frame button to interact
3. Full application experience loads
4. User can vote, view results, and explore other features

## Development Status

The project is currently in active development:

- **Core Functionality**: Complete (voting, results, UI)
- **Enhanced Features**: Complete (social features, user experience improvements)
- **Technical Infrastructure**: Complete (database, API, error handling)
- **Authentication**: Complete (Farcaster sign-in)
- **Wallet Integration**: In Progress

See [UPDATED_PROJECT_PLAN.md](./UPDATED_PROJECT_PLAN.md) for the current implementation status and roadmap.

## Deployment

The application is deployed on Vercel, with:

- Production environment: [frame-m5nais423-saska-socials-projects.vercel.app](https://frame-m5nais423-saska-socials-projects.vercel.app)
- Continuous deployment from the main branch

## Getting Started

To get started with development:

1. Follow the [Setup Guide](./SETUP.md) to set up your development environment
2. Review the [Frame Implementation](./FRAME_IMPLEMENTATION.md) to understand how frames work
3. Check the [API Routes](./api-routes.md) documentation for backend functionality
4. See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) if you encounter issues
