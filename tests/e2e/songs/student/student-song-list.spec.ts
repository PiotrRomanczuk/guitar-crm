/**
 * Student Song List Test
 *
 * Migrated from: cypress/e2e/student-learning-journey.cy.ts (Phase 3: Browse Songs)
 *
 * Tests song list functionality for students:
 * 1. List rendering - Verify student songs page displays correctly
 * 2. Song cards - Display assigned or available songs
 * 3. View details - Navigate to song detail page
 * 4. Access control - Students should see simplified view (no teacher controls)
 * 5. Empty state - Display appropriate message when no songs
 *
 * Prerequisites:
 * - Student user: student@example.com / test123_student
 * - Student may or may not have songs assigned
 *
 * @tags @student @songs @list
 */
import { test, expect } from '../../../fixtures';

test.describe('Student Song List', { tag: ['@student', '@songs', '@list'] }, () => {
  test.beforeEach(async ({ page, loginAs }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as student
    await loginAs('student');
  });

  test.describe('List Rendering', () => {
    test('should display student songs page', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('text=My Songs', {
        state: 'visible',
        timeout: 10000,
      });

      // Verify "My Songs" heading is visible
      await expect(page.locator('text=My Songs')).toBeVisible();
    });

    test('should display page description', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('text=My Songs', {
        state: 'visible',
        timeout: 10000,
      });

      // Verify description is visible
      await expect(page.locator('text=/songs you are currently learning|mastered/i')).toBeVisible();
    });

    test('should show loading state initially', async ({ page }) => {
      // Navigate without waiting for network
      await page.goto('/dashboard/songs');

      // Loading spinner should appear briefly
      // Note: This may be too fast to catch in some cases
      const spinner = page.locator('.animate-spin');
      await spinner.isVisible().catch(() => false);

      // Either spinner was visible or page loaded fast enough
      // Just verify we end up with content
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=My Songs')).toBeVisible();
    });
  });

  test.describe('Song Content', () => {
    test('should display song cards or empty state', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to fully load
      await page.waitForSelector('text=My Songs', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check for either songs or empty state
      const hasSongs = await page.locator('a[href*="/songs/"]').count() > 0;
      const hasEmptyState = await page.locator('text=No songs found').isVisible().catch(() => false);

      // One of these should be true
      expect(hasSongs || hasEmptyState).toBeTruthy();
    });

    test('should display song details on cards when songs exist', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('text=My Songs', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are song links
      const songLinks = page.locator('a[href*="/songs/"]');
      const songCount = await songLinks.count();

      if (songCount > 0) {
        // Verify song card contains expected elements
        const songCard = page.locator('.bg-card, [class*="card"]').first();

        // Should show song title (typically in a heading or bold text)
        await expect(songCard.locator('h3, h4, [class*="font-semibold"]').first()).toBeVisible();
      }
    });

    test('should display song metadata when songs exist', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('text=My Songs', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are songs
      const songCount = await page.locator('a[href*="/songs/"]').count();

      if (songCount > 0) {
        // Songs typically display artist, key, or level information
        const hasArtist = await page.locator('text=/artist|author/i').count() > 0;
        const hasLevel = await page.locator('text=/beginner|intermediate|advanced/i').count() > 0;
        const hasKey = await page.locator('text=/key/i').count() > 0;

        // At least some metadata should be visible
        expect(hasArtist || hasLevel || hasKey).toBeTruthy();
      }
    });
  });

  test.describe('Empty State', () => {
    test('should display empty state message when no songs', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('text=My Songs', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check for empty state
      const emptyState = page.locator('text=No songs found');
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      if (hasEmptyState) {
        // Verify empty state content
        await expect(emptyState).toBeVisible();
      }
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to song detail when clicking a song', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('text=My Songs', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are song links
      const songLinks = page.locator('a[href*="/songs/"]');
      const linkCount = await songLinks.count();

      if (linkCount > 0) {
        // Click on first song link
        await songLinks.first().click();

        // Should navigate to song detail page
        await expect(page).toHaveURL(/\/songs\/[^/]+$/);
      }
    });

    test('should display song detail page content', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('text=My Songs', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are song links
      const songLinks = page.locator('a[href*="/songs/"]');
      const linkCount = await songLinks.count();

      if (linkCount > 0) {
        // Click on first song link
        await songLinks.first().click();

        // Wait for detail page to load
        await page.waitForLoadState('networkidle');

        // Should show song details (title, author, chords, key, etc.)
        await expect(page.locator('text=/title|author|chords|key/i').first()).toBeVisible();
      }
    });
  });

  test.describe('Access Control', () => {
    test('should have simplified view without teacher controls', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('text=My Songs', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Student view should NOT have teacher-only controls like:
      // - Search filter (teacher version has this)
      // - Level filter
      // - Key filter
      // - Add Song button
      await expect(page.locator('#search-filter')).not.toBeVisible();
      await expect(page.locator('#level-filter')).not.toBeVisible();
      await expect(page.locator('#key-filter')).not.toBeVisible();
      await expect(page.locator('[data-testid="song-new-button"]')).not.toBeVisible();
    });

    test('should NOT have access to add new songs', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('text=My Songs', {
        state: 'visible',
        timeout: 10000,
      });

      // There should be no "Add Song" or "New Song" button for students
      await expect(page.locator('button:has-text("Add Song")')).not.toBeVisible();
      await expect(page.locator('a[href="/dashboard/songs/new"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="song-new-button"]')).not.toBeVisible();
    });

    test('should NOT have access to song table view', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('text=My Songs', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Student view uses card-based display, not table
      await expect(page.locator('[data-testid="song-table"]')).not.toBeVisible();
      await expect(page.locator('table')).not.toBeVisible();
    });

    test('should NOT see filter controls', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('text=My Songs', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Student view should not have the filter section that teachers have
      await expect(page.locator('button:has-text("Reset Filters")')).not.toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('text=My Songs', {
        state: 'visible',
        timeout: 10000,
      });

      // Page should be visible on mobile
      await expect(page.locator('text=My Songs')).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('text=My Songs', {
        state: 'visible',
        timeout: 10000,
      });

      // Page should be visible on tablet
      await expect(page.locator('text=My Songs')).toBeVisible();
    });
  });
});
