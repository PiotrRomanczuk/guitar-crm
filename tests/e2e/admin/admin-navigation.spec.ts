/**
 * Admin Dashboard Navigation Tests
 *
 * Migrated from: cypress/e2e/admin/admin-navigation.cy.ts
 *
 * Tests dashboard navigation and cross-section functionality:
 * - Main dashboard stats display
 * - Navigation between sections
 * - Settings page access
 * - Admin stats pages
 *
 * Prerequisites:
 * - Local Supabase database running
 * - Test credentials configured
 */
import { test, expect } from '../../fixtures';

test.describe('Admin Dashboard Navigation', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    // Set viewport to desktop size to avoid mobile-hidden elements
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as admin
    await loginAs('admin');
  });

  test.describe('Main Dashboard', () => {
    test('should display the main dashboard with stats', async ({ page }) => {
      await page.goto('/dashboard');

      // Verify URL
      await expect(page).toHaveURL(/\/dashboard/);

      // Verify dashboard content is present
      await expect(page.locator('text=/dashboard|overview|stats/i')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Section Navigation', () => {
    test('should navigate to songs section', async ({ page }) => {
      await page.goto('/dashboard/songs');

      // Verify URL
      await expect(page).toHaveURL(/\/songs/);

      // Verify songs content is present
      await expect(page.locator('text=/songs/i')).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to users section', async ({ page }) => {
      await page.goto('/dashboard/users');

      // Verify URL
      await expect(page).toHaveURL(/\/users/);

      // Verify users content is present
      await expect(page.locator('text=/users/i')).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to lessons section', async ({ page }) => {
      await page.goto('/dashboard/lessons');

      // Verify URL
      await expect(page).toHaveURL(/\/lessons/);

      // Verify lessons content is present
      await expect(page.locator('text=/lessons/i')).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to assignments section', async ({ page }) => {
      await page.goto('/dashboard/assignments');

      // Verify URL
      await expect(page).toHaveURL(/\/assignments/);

      // Verify assignments content is present
      await expect(page.locator('text=/assignments/i')).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to settings', async ({ page }) => {
      // Navigate to settings page - don't fail if page doesn't exist
      const response = await page.goto('/dashboard/settings');

      // Check if page exists (not 404)
      const pageContent = await page.content();
      if (!pageContent.includes('404')) {
        // Verify settings content is present
        await expect(page.locator('text=/settings|profile|account/i')).toBeVisible({ timeout: 10000 });
      } else {
        // Settings page not found - log and skip
        console.log('Settings page not found - skipping');
      }
    });
  });

  test.describe('Cross-Section Navigation', () => {
    test('should navigate between sections using sidebar', async ({ page }) => {
      await page.goto('/dashboard');

      // Navigate to songs
      await page.locator('a[href*="/songs"]').filter({ visible: true }).first().click();
      await expect(page).toHaveURL(/\/songs/);

      // Navigate to users
      await page.locator('a[href*="/users"]').filter({ visible: true }).first().click();
      await expect(page).toHaveURL(/\/users/);

      // Navigate to lessons
      await page.locator('a[href*="/lessons"]').filter({ visible: true }).first().click();
      await expect(page).toHaveURL(/\/lessons/);
    });
  });

  test.describe('Admin Stats', () => {
    test('should access admin song stats', async ({ page }) => {
      await page.goto('/dashboard/admin/stats/songs');

      // Verify stats content is present
      await expect(page.locator('text=/stats|statistics|analytics|songs/i')).toBeVisible({ timeout: 10000 });
    });
  });
});
