/**
 * This script helps prepare the production database on Supabase
 * Run this script before deployment if you've made schema changes
 */

// This script assumes the following environment variables are set:
// DATABASE_URL - The connection string to your Supabase database with pgbouncer
// DIRECT_URL - The direct connection string to your Supabase database

import { execSync } from 'child_process';
import * as fs from 'fs';

// Temporarily create a .env.production file for Prisma CLI
const dotEnvFile = `
# Production database settings
DATABASE_URL=${process.env.DATABASE_URL || 'postgresql://postgres:qF07oYQMHgdBmScZ@db.akmdkvtmuawtyibimyhm.supabase.co:6543/postgres?pgbouncer=true&sslmode=require'}
DIRECT_URL=${process.env.DIRECT_URL || 'postgresql://postgres:qF07oYQMHgdBmScZ@db.akmdkvtmuawtyibimyhm.supabase.co:5432/postgres?sslmode=require'}
`;

// Save to temporary file
fs.writeFileSync('.env.production', dotEnvFile);

try {
  // Update schema.prisma for production
  const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
  const updatedSchema = schema
    .replace(
      // Replace local development setting with production setting
      /\/\/ For production[\s\S]*?\/\/ For local development\s*datasource db {[\s\S]*?}/,
      `datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}`
    );
  
  // Save updated schema
  fs.writeFileSync('prisma/schema.prisma.prod', updatedSchema);
  fs.renameSync('prisma/schema.prisma', 'prisma/schema.prisma.local');
  fs.renameSync('prisma/schema.prisma.prod', 'prisma/schema.prisma');
  
  console.log('Running Prisma migration deploy...');
  
  // Run the prisma migrate deploy command
  execSync('npx prisma migrate deploy --schema=./prisma/schema.prisma', { 
    env: { ...process.env, DOTENV_CONFIG_PATH: '.env.production' },
    stdio: 'inherit' 
  });
  
  console.log('Success! Production database is ready.');
  
} catch (error) {
  console.error('Error during production database preparation:', error);
} finally {
  // Clean up
  fs.unlinkSync('.env.production');
  
  // Restore schema.prisma for local development
  if (fs.existsSync('prisma/schema.prisma.local')) {
    fs.renameSync('prisma/schema.prisma', 'prisma/schema.prisma.prod');
    fs.renameSync('prisma/schema.prisma.local', 'prisma/schema.prisma');
  }
} 