#!/usr/bin/env node

/**
 * Deploy script for Vercel
 * Sets environment variables and handles deployment with necessary flags
 */

const { execSync } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Define environment variables for production deployment
const prodEnvVars = {
  // Updated to the latest production URL
  NEXT_PUBLIC_APP_URL: 'https://frame-lovat.vercel.app',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./prod.db',
  NEXT_PUBLIC_FRAME_IMAGE_URL: 'https://frame-lovat.vercel.app/api/og',
  NEXT_PUBLIC_FRAME_POST_URL: 'https://frame-lovat.vercel.app/api/frame',
  SENTRY_ENVIRONMENT: 'production',
  SKIP_SENTRY_SETUP: 'true' // Skip Sentry setup for now
};

// Set environment variables for Vercel
console.log('Setting environment variables for Vercel deployment...');

// Deploy to Vercel with env variables directly passed
console.log('Deploying to Vercel...');
try {
  let deployCommand = 'vercel';
  
  // Add environment variables
  Object.entries(prodEnvVars).forEach(([key, value]) => {
    deployCommand += ` -e ${key}=${value}`;
  });
  
  // Add deployment flags
  deployCommand += ' --prod --force';
  
  // Execute the deploy command
  console.log(`Running: ${deployCommand}`);
  execSync(deployCommand, { stdio: 'inherit' });
  console.log('Deployment completed successfully!');
} catch (error) {
  console.error('Deployment failed:', error.message);
  process.exit(1);
}
