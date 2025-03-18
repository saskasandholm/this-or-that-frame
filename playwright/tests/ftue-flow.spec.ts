/**
 * @file ftue-flow.spec.ts
 * @description End-to-end tests for the First Time User Experience flow
 */

import { test, expect } from '@playwright/test';

test.describe('First Time User Experience Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure the test starts fresh
    await page.evaluate(() => localStorage.clear());

    // Navigate to the application
    await page.goto('/');

    // Wait for the app to load
    await page.waitForSelector('body', { state: 'attached' });
  });

  test('should display and complete FTUE for first-time users', async ({ page }) => {
    // Verify the FTUE modal is shown
    const ftueModal = page.locator('.ftue-modal, [data-testid="ftue-modal"]');
    await expect(ftueModal).toBeVisible();

    // Verify welcome step is displayed first
    await expect(page.getByText('Welcome to This or That!')).toBeVisible();

    // Navigate through the steps
    await page.getByRole('button', { name: 'Next' }).click();

    // Verify voting step is displayed
    await expect(page.getByText('Quick & Easy Voting')).toBeVisible();

    // Continue to next step
    await page.getByRole('button', { name: 'Next' }).click();

    // Verify streaks step is displayed
    await expect(page.getByText(/Build Your Streak/)).toBeVisible();

    // Continue to next step
    await page.getByRole('button', { name: 'Next' }).click();

    // Verify achievements step is displayed
    await expect(page.getByText(/Unlock Achievements/)).toBeVisible();

    // Complete the FTUE
    await page.getByRole('button', { name: "Let's Start!" }).click();

    // Wait for FTUE to disappear
    await expect(ftueModal).not.toBeVisible({ timeout: 2000 });

    // Verify the main app content is visible
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();

    // Verify FTUE is not shown on page refresh (since user completed it)
    await page.reload();
    await expect(ftueModal).not.toBeVisible();
  });

  test('should not show FTUE for returning users', async ({ page }) => {
    // Set localStorage to indicate user has completed FTUE
    await page.evaluate(() => {
      localStorage.setItem('ftue_completed', 'true');
    });

    // Reload the page
    await page.goto('/');

    // Verify the FTUE modal is not shown
    const ftueModal = page.locator('.ftue-modal, [data-testid="ftue-modal"]');
    await expect(ftueModal).not.toBeVisible();

    // Verify the main app content is visible immediately
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
  });

  test('should display haptic and audio controls for users who completed FTUE', async ({
    page,
  }) => {
    // Set localStorage to indicate user has completed FTUE
    await page.evaluate(() => {
      localStorage.setItem('ftue_completed', 'true');
    });

    // Load the page
    await page.goto('/');

    // Open settings/preferences (this may need adjustment based on your UI)
    await page.getByRole('button', { name: 'Settings' }).click();

    // Verify audio toggle is present
    const audioToggle = page.locator('[data-testid="audio-toggle"]');
    await expect(audioToggle).toBeVisible();

    // Verify haptic toggle is present
    const hapticToggle = page.locator('[data-testid="haptic-toggle"]');
    await expect(hapticToggle).toBeVisible();

    // Toggle haptic feedback off
    await hapticToggle.click();

    // Verify localStorage is updated
    const hapticEnabled = await page.evaluate(() => localStorage.getItem('hapticEnabled'));
    expect(hapticEnabled).toBe('false');

    // Toggle audio off
    await audioToggle.click();

    // Verify localStorage is updated
    const audioEnabled = await page.evaluate(() => localStorage.getItem('audioEnabled'));
    expect(audioEnabled).toBe('false');
  });
});
