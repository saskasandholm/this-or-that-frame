# Database Setup for Frame Project

This document outlines the database setup for the Farcaster Frame project, including both local development and production environments.

## Overview

The project uses:
- **PostgreSQL** as the database (hosted on Supabase) for production
- **SQLite** for local development (optional)
- **Prisma ORM** for database access and migrations

## Production Environment (Vercel + Supabase)

### Environment Variables in Vercel

The following environment variables are configured in Vercel:

```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.akmdkvtmuawtyibimyhm.supabase.co:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.akmdkvtmuawtyibimyhm.supabase.co:5432/postgres?sslmode=require"
NEXTAUTH_SECRET="[SECURE_RANDOM_STRING]"
```

### Supabase Configuration

1. **Database:** PostgreSQL hosted on Supabase
2. **Connection Pooling:** Enabled via Supavisor (on port 6543)
3. **SSL:** Required for secure connections
4. **Network Restrictions:** None (accessible from all IPs)

### Preparing the Production Database

We've created a utility script to help prepare the production database before deployment:

```bash
npm run prepare-production-db
```

This script:
1. Temporarily switches your schema.prisma file to use PostgreSQL
2. Creates a temporary .env.production file with the correct connection strings
3. Runs `prisma migrate deploy` to apply migrations to the production database
4. Restores your development configuration

## Local Development Options

### Option 1: Connect to Supabase directly (When possible)

You can connect to the remote Supabase database for development by adding these to your `.env` file:

```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.akmdkvtmuawtyibimyhm.supabase.co:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.akmdkvtmuawtyibimyhm.supabase.co:5432/postgres?sslmode=require"
```

If you encounter SSL certificate issues, you may need to set up the PostgreSQL root certificate:

1. Download the root certificate from [https://cockroachlabs.cloud/clusters](https://cockroachlabs.cloud/clusters) or use the built-in `~/.postgresql/root.crt`
2. Add the following to your connection strings: `&sslcert=/path/to/your/root.crt`

### Option 2: Use SQLite for local development (Recommended)

For easier local development without worrying about remote connections:

1. In your `.env` file, use:
```
DATABASE_URL="file:./dev.db"
```

2. In `prisma/schema.prisma`, update for local development:
```prisma
// For production (Vercel + Supabase)
// datasource db {
//   provider  = "postgresql"
//   url       = env("DATABASE_URL")
//   directUrl = env("DIRECT_URL")
// }

// For local development
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**Important:** Before committing or deploying, make sure to run the preparation script mentioned above.

## Workflow: Local to Production

1. Develop locally using SQLite
2. Make schema changes in `prisma/schema.prisma`
3. Test with local database: `npx prisma db push`
4. When ready to deploy:
   - Run `npm run prepare-production-db` to migrate the production database
   - Commit and push to GitHub to trigger Vercel deployment

## Database Schema

The schema is defined in `prisma/schema.prisma` and includes models for:
- Users
- Categories
- Topics
- Votes
- User Streaks
- Achievements
- Topic Submissions
- Admin roles
- User activity tracking

## Making Schema Changes

1. Update the `prisma/schema.prisma` file with your changes
2. Run migrations:
   ```bash
   # For development (with SQLite)
   npx prisma db push
   
   # For production (on Vercel)
   npm run prepare-production-db
   ```

## Accessing the Database

### Using Prisma Client

```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Example query
async function getTopics() {
  const topics = await prisma.topic.findMany()
  return topics
}
```

### Using Supabase Client (for additional features)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Example for auth or storage features
const { data, error } = await supabase
  .from('topics')
  .select('*')
```

## Backup and Restore

Backups can be managed through the Supabase dashboard:
1. Go to **Project Settings > Database**
2. Use the **Backup** section to create and download backups 