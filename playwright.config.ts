/**
 * @file playwright.config.ts
 * @description Configuration for Playwright end-to-end tests
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory structure
  testDir: './playwright/tests',

  // Maximum time one test can run for
  timeout: 30 * 1000,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Number of retries for failing tests
  retries: process.env.CI ? 2 : 0,

  // Reporters to use
  reporter: [['html', { open: 'never' }], ['list']],

  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Take screenshot on test failure
    screenshot: 'only-on-failure',
  },

  // Projects for different environments and device types
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run web server before starting the tests
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
