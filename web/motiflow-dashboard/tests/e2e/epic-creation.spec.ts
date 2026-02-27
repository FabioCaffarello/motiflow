/**
 * Epic Creation E2E Test
 * 
 * End-to-end test for epic creation flow using Playwright.
 */

import { test, expect } from '@playwright/test';

test.describe('Epic Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to epics page
    await page.goto('/epics');
  });

  test('should create a new epic', async ({ page }) => {
    // Click create button
    await page.click('text=Create Epic');

    // Fill form
    await page.fill('input[name="title"]', 'E2E Test Epic');
    await page.fill('textarea[name="description"]', 'E2E Test Description');
    await page.selectOption('select[name="priority"]', 'HIGH');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation to epic detail page
    await page.waitForURL(/\/epics\/[^/]+/, { timeout: 5000 });

    // Verify epic was created
    await expect(page.locator('h1')).toContainText('E2E Test Epic');
    await expect(page.locator('text=E2E Test Description')).toBeVisible();
  });

  test('should show validation error for empty title', async ({ page }) => {
    await page.click('text=Create Epic');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Title is required')).toBeVisible();
  });
});
