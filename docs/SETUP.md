# Setup Guide for This or That Frame Application

*Last Updated: March 25, 2025*


This guide will walk you through setting up the "This or That" Farcaster Frame application for local development.

## Prerequisites

- Node.js 18.0+ installed
- npm or yarn package manager
- Git for version control
- Basic knowledge of Next.js, Prisma, and React

## Clone the Repository

```bash
git clone https://github.com/yourusername/this-or-that.git
cd this-or-that
```

## Environment Setup

1. Create a `.env.local` file in the root directory with the following variables:

```
# Development SQLite database
DATABASE_URL="file:./prisma/dev.db"
DIRECT_URL="file:./prisma/dev.db"

# Local URLs for development
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_FRAME_POST_URL="http://localhost:3000/api/frame"
NEXT_PUBLIC_FRAME_IMAGE_URL="http://localhost:3000/api/og"

# Enable demo mode for testing without Farcaster auth
NEXT_PUBLIC_ALLOW_DEMO_FID=true
```

2. If you're using additional services (optional):

```
# Sentry for error tracking (optional)
SENTRY_DSN="your-sentry-dsn"

# NextAuth secret (required if using auth)
NEXTAUTH_SECRET="your-random-secure-string"
```

## Install Dependencies

Install all required packages:

```bash
npm install
```

## Database Setup

The application uses Prisma ORM with SQLite for local development and PostgreSQL for production. Here's how to set up the development database:

1. Generate the Prisma client:

```bash
npx prisma generate
```

2. Push the schema to create the SQLite database:

```bash
npx prisma db push
```

3. Seed the database with initial data (optional):

```bash
npm run seed
```

## Run the Development Server

Start the development server:

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## Verify Installation

Verify the installation by:

1. Opening [http://localhost:3000](http://localhost:3000) in your browser
2. Checking that the homepage loads without errors
3. Navigating to the `/demo` route to see example frame components

If you encounter any issues, refer to the [Troubleshooting](#troubleshooting) section below.

## Database Management

### View and Edit Data

You can use Prisma Studio to view and edit your database:

```bash
npx prisma studio
```

This will open a web interface at [http://localhost:5555](http://localhost:5555).

### Reset the Database

If you need to reset your database:

```bash
# Delete the SQLite database file
rm -f prisma/dev.db

# Recreate the database
npx prisma db push

# Re-seed the database (optional)
npm run seed
```

## Working with Environment-Specific Database Configuration

The application is configured to use different database setups for development and production:

- **Development**: SQLite database (file-based)
- **Production**: PostgreSQL database (hosted on Supabase)

The `scripts/setup-env.js` script automatically configures the correct schema based on the environment:

```bash
# To manually run the environment setup
node scripts/setup-env.js
```

## Additional Setup Steps

### Configure for Farcaster Authentication

If you want to test with real Farcaster authentication:

1. Create a Farcaster developer app at [https://warpcast.com/~/developers](https://warpcast.com/~/developers)
2. Add the authentication details to your `.env.local` file:

```
NEXT_PUBLIC_FARCASTER_AUTH_DOMAIN="your-domain.xyz"
NEXT_PUBLIC_FARCASTER_AUTH_CALLBACK_URL="http://localhost:3000/api/auth/farcaster"
```

### Set Up Admin User (Optional)

To access the admin dashboard:

```bash
npm run admin:init
```

This will create an admin user that you can use to access the `/admin` routes.

## Troubleshooting

### Browser Environment Errors

If you encounter errors related to "PrismaClient cannot be used in browser environments":

1. Make sure you are not importing the Prisma client directly in client components
2. Use the database utility functions in `src/lib/db.ts` which are designed to be safe for SSR/SSG
3. Check that server components are properly marked with the "use server" directive when needed

### Database Connection Issues

If you have issues connecting to the database:

1. Verify the SQLite file exists: `ls -la prisma/dev.db`
2. Ensure your `.env.local` file has the correct `DATABASE_URL` value
3. Try recreating the database:

```bash
rm -f prisma/dev.db
npx prisma db push
```

### Next.js Build Errors

If you encounter build errors:

1. Clean the Next.js cache: `npm run clean`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Run the build with verbose logging: `npm run build --verbose`

## Development Workflow

### Code Structure

- `/src/app` - Next.js routes and server components
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and shared logic
- `/prisma` - Database schema and migrations

### Key Development Commands

```bash
# Run development server
npm run dev

# Run linting
npm run lint

# Run tests
npm run test

# Format code
npm run format

# Build for production
npm run build
```

## Next Steps

After completing setup, you can:

1. Explore the codebase structure
2. Check out the demo routes at `/demo/*`
3. Test frame functionality with the Warpcast Frame Playground
4. Read the full documentation in the `/docs` directory

For detailed information on specific features, refer to:

- [Frame Implementation](/docs/FRAME_IMPLEMENTATION.md)
- [Database Schema](/docs/DATABASE_SCHEMA.md)
- [API Routes](/docs/api-routes.md)
- [Authentication](/docs/FARCASTER_AUTH.md)
