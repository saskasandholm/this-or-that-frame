#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Determine environment
const isProd = process.env.NODE_ENV === 'production';
console.log(`Setting up for ${isProd ? 'production' : 'development'} environment`);

// Required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_APP_URL',
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXT_PUBLIC_FRAME_IMAGE_URL',
  'NEXT_PUBLIC_FRAME_POST_URL',
];

// Validate environment variables
function validateEnv() {
  const missingVars = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  // Handle missing variables
  if (missingVars.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Environment validation failed!');
    console.error('\x1b[31m%s\x1b[0m', 'The following required environment variables are missing:');
    missingVars.forEach((envVar) => {
      console.error(`  - ${envVar}`);
    });
    console.error(
      '\x1b[33m%s\x1b[0m',
      'Please set these variables in your .env file or environment.'
    );
    console.error('\x1b[33m%s\x1b[0m', 'See .env.example for reference.\n');
    process.exit(1);
  }

  console.log('\x1b[32m%s\x1b[0m', '✅ Environment validation passed!');
}

// Run validation
validateEnv();

if (isProd) {
  // In production, copy the production schema
  const source = path.join(process.cwd(), 'prisma', 'schema.production.prisma');
  const target = path.join(process.cwd(), 'prisma', 'schema.prisma');
  
  try {
    const content = fs.readFileSync(source, 'utf8');
    fs.writeFileSync(target, content);
    console.log('✅ Using PostgreSQL schema for production');
  } catch (error) {
    console.error('❌ Error setting up production schema:', error);
    process.exit(1);
  }
} else {
  // In development, ensure we're using the correct schema for local development
  const source = path.join(process.cwd(), 'prisma', 'schema.development.prisma');
  const target = path.join(process.cwd(), 'prisma', 'schema.prisma');
  
  // Check if development schema exists
  if (fs.existsSync(source)) {
    try {
      const content = fs.readFileSync(source, 'utf8');
      
      // Verify SQLite connection string format
      if (content.includes('provider = "sqlite"') && !content.includes('url = "file:./dev.db"')) {
        // Fix the connection string
        const fixedContent = content.replace(
          /url\s*=\s*".*?"/,
          'url      = "file:./dev.db"'
        );
        fs.writeFileSync(target, fixedContent);
      } else {
        fs.writeFileSync(target, content);
      }
      
      console.log('✅ Using development schema for local development');
      
      // Create empty dev.db file if it doesn't exist
      const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
      if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, '');
        console.log('✅ Created empty dev.db file');
      }
    } catch (error) {
      console.error('❌ Error setting up development schema:', error);
      // Don't exit on error, the current schema.prisma might be fine
      console.log('⚠️ Using existing schema.prisma file');
    }
  } else {
    console.log('ℹ️ No development schema found, using existing schema.prisma file');
  }
}

// End of script 