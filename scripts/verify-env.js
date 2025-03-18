#!/usr/bin/env node

/**
 * Validates that all required environment variables are set
 * Run this script before starting the application to catch missing env vars early
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

const requiredVars = [
  'NEXT_PUBLIC_APP_URL',
  'DATABASE_URL',
  'NEXT_PUBLIC_FRAME_IMAGE_URL',
  'NEXT_PUBLIC_FRAME_POST_URL',
];

const missingVars = requiredVars.filter(varName => {
  return !process.env[varName];
});

if (missingVars.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Environment validation failed!');
  console.error('\x1b[31m%s\x1b[0m', 'The following required environment variables are missing:');
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  console.error(
    '\x1b[33m%s\x1b[0m',
    'Please set these variables in your .env file or environment.'
  );
  console.error('\x1b[33m%s\x1b[0m', 'See .env.example for reference.\n');
  process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', '✅ Environment validation passed!');
process.exit(0);
