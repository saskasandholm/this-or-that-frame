#!/usr/bin/env node

/**
 * Validates that all required environment variables are set
 * Run this script before starting the application to catch missing env vars early
 */

// Load environment variables
require('dotenv').config();
// Remove unused imports
// const fs = require('fs');
// const path = require('path');

// Required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_APP_URL',
  'DATABASE_URL',
  'NEXT_PUBLIC_FRAME_IMAGE_URL',
  'NEXT_PUBLIC_FRAME_POST_URL',
  // Add other required environment variables here
];

// Optional environment variables with default values
const optionalEnvVars = {
  // 'VARIABLE_NAME': 'default value',
};

// Validate environment variables
function validateEnv() {
  const missingVars = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  // Set default values for optional variables
  for (const [envVar, defaultValue] of Object.entries(optionalEnvVars)) {
    if (!process.env[envVar]) {
      process.env[envVar] = defaultValue;
      console.log(`🔧 Setting default value for ${envVar}: ${defaultValue}`);
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
