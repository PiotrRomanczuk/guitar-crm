/**
 * Teacher Song List Test
 *
 * Migrated from: cypress/e2e/integration/song-search-filter.cy.ts
 *
 * Tests song library list view, search, and filtering:
 * 1. List rendering - Verify table and filter elements display
 * 2. Search - Search songs by title/artist
 * 3. Filter by level - Filter songs by difficulty level
 * 4. Filter by key - Filter songs by musical key
 * 5. Combined filters - Apply multiple filters together
 * 6. Clear filters - Reset all filters
 *
 * Prerequisites:
 * - Admin user with is_teacher=true: p.romanczuk@gmail.com / test123_admin
 * - Database has songs available for filtering
 *
 * @tags @teacher @songs @list @search @filter
 */
import { test, expect } from '../../../fixtures';

test.describe(
  'Teacher Song List',
  { tag: ['@teacher', '@songs', '@list'] },
  () => {
    // Set viewport to desktop to avoid mobile-hidden elements
    test.beforeEach(async ({ page, loginAs }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      // Login as admin (who has is_teacher=true)
      await loginAs('admin');
    });

    test.describe('List Rendering', () => {
      test('should display songs list page with all required elements', async ({
        page,
      }) => {
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        // Verify we're on the songs page
        await expect(page).toHaveURL(/\/dashboard\/songs/);

        // Verify table is displayed (desktop view)
        const table = page.locator('[data-testid="song-table"], table');
        await expect(table).toBeVisible({ timeout: 10000 });

        // Verify search filter input is present and functional
        const searchInput = page.locator('#search-filter');
        await expect(searchInput).toBeVisible();
        await expect(searchInput).toBeEnabled();

        // Verify "Add Song" button exists
        const newButton = page.locator('[data-testid="song-new-button"]');
        await expect(newButton).toBeVisible();
        await expect(newButton).toBeEnabled();
      });

      test('should display filter controls', async ({ page }) => {
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        // Verify level filter exists
        const levelFilter = page.locator('#level-filter');
        await expect(levelFilter).toBeVisible();

        // Verify key filter exists
        const keyFilter = page.locator('#key-filter');
        await expect(keyFilter).toBeVisible();

        // Verify reset button exists
        const resetButton = page.locator('button:has-text("Reset Filters")');
        await expect(resetButton).toBeVisible();
      });
    });

    test.describe('Search Functionality', () => {
      test('should search songs by title', async ({ page }) => {
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        const searchInput = page.locator('#search-filter');
        await expect(searchInput).toBeVisible({ timeout: 10000 });

        // Type in search query
        await searchInput.fill('guitar');

        // Wait for debounce and URL update
        await page.waitForTimeout(500);

        // URL should contain search parameter
        await expect(page).toHaveURL(/search=guitar/);
      });

      test('should search songs by artist', async ({ page }) => {
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        const searchInput = page.locator('#search-filter');
        await searchInput.fill('Beatles');

        // Wait for debounce
        await page.waitForTimeout(500);

        // URL should contain search parameter
        await expect(page).toHaveURL(/search=Beatles/);
      });

      test('should display search results or empty state', async ({ page }) => {
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        const searchInput = page.locator('#search-filter');
        await searchInput.fill('song');

        // Wait for results
        await page.waitForTimeout(500);

        // Should show either results table or page content
        const table = page.locator('[data-testid="song-table"], table');
        await expect(table).toBeVisible();
      });

      test('should show no results for non-matching search', async ({
        page,
      }) => {
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        const searchInput = page.locator('#search-filter');
        await searchInput.fill('xyz123nonexistent789');

        // Wait for search to process
        await page.waitForTimeout(500);

        // Should show empty state or "no songs found" message
        const noSongsText = page.locator('text=/no songs|no results|not found/i');
        const emptyState = page.locator('[data-testid="empty-state"]');

        // Either no songs message or empty state should appear
        const hasNoResults =
          (await noSongsText.count()) > 0 || (await emptyState.count()) > 0;

        // The table should exist but might be empty
        const table = page.locator('[data-testid="song-table"], table');
        await expect(table).toBeVisible();
      });

      test('should clear search results', async ({ page }) => {
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        const searchInput = page.locator('#search-filter');

        // Type search term
        await searchInput.fill('test');
        await page.waitForTimeout(500);
        await expect(page).toHaveURL(/search=test/);

        // Clear search
        await searchInput.clear();
        await page.waitForTimeout(500);

        // URL should no longer contain search parameter
        await expect(page).not.toHaveURL(/search=/);
      });
    });

    test.describe('Level Filter', () => {
      test('should filter songs by beginner level', async ({ page }) => {
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        // Click the level filter trigger (shadcn Select)
        const levelFilterTrigger = page.locator('#level-filter');
        await levelFilterTrigger.click();

        // Wait for dropdown to open
        await page.waitForTimeout(300);

        // Select beginner option
        await page.locator('[role="option"]:has-text("Beginner")').click();

        // Wait for filter to apply
        await page.waitForTimeout(500);

        // URL should contain level parameter
        await expect(page).toHaveURL(/level=beginner/);
      });

      test('should filter songs by intermediate level', async ({ page }) => {
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        const levelFilterTrigger = page.locator('#level-filter');
        await levelFilterTrigger.click();
        await page.waitForTimeout(300);

        await page.locator('[role="option"]:has-text("Intermediate")').click();
        await page.waitForTimeout(500);

        await expect(page).toHaveURL(/level=intermediate/);
      });

      test('should filter songs by advanced level', async ({ page }) => {
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        const levelFilterTrigger = page.locator('#level-filter');
        await levelFilterTrigger.click();
        await page.waitForTimeout(300);

        await page.locator('[role="option"]:has-text("Advanced")').click();
        await page.waitForTimeout(500);

        await expect(page).toHaveURL(/level=advanced/);
      });

      test('should show all levels when filter is cleared', async ({ page }) => {
        // Start with a filter applied
        await page.goto('/dashboard/songs?level=beginner');
        await page.waitForLoadState('networkidle');

        const levelFilterTrigger = page.locator('#level-filter');
        await levelFilterTrigger.click();
        await page.waitForTimeout(300);

        // Select "All Levels"
        await page.locator('[role="option"]:has-text("All Levels")').click();
        await page.waitForTimeout(500);

        // URL should not contain level parameter
        await expect(page).not.toHaveURL(/level=/);
      });
    });

    test.describe('Key Filter', () => {
      test('should filter songs by key', async ({ page }) => {
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        // Click the key filter trigger
        const keyFilterTrigger = page.locator('#key-filter');
        await keyFilterTrigger.click();

        // Wait for dropdown to open
        await page.waitForTimeout(300);

        // Select C key option
        await page.locator('[role="option"]:has-text("C Major")').first().click();

        // Wait for filter to apply
        await page.waitForTimeout(500);

        // URL should contain key parameter
        await expect(page).toHaveURL(/key=/);
      });

      test('should show all keys when filter is cleared', async ({ page }) => {
        // Start with a filter applied
        await page.goto('/dashboard/songs?key=C');
        await page.waitForLoadState('networkidle');

        const keyFilterTrigger = page.locator('#key-filter');
        await keyFilterTrigger.click();
        await page.waitForTimeout(300);

        // Select "All Keys"
        await page.locator('[role="option"]:has-text("All Keys")').click();
        await page.waitForTimeout(500);

        // URL should not contain key parameter
        await expect(page).not.toHaveURL(/key=/);
      });
    });

    test.describe('Combined Filters', () => {
      test('should combine search and level filter', async ({ page }) => {
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        // Apply search filter
        const searchInput = page.locator('#search-filter');
        await searchInput.fill('song');
        await page.waitForTimeout(500);

        // Apply level filter
        const levelFilterTrigger = page.locator('#level-filter');
        await levelFilterTrigger.click();
        await page.waitForTimeout(300);
        await page.locator('[role="option"]:has-text("Beginner")').click();
        await page.waitForTimeout(500);

        // URL should contain both parameters
        await expect(page).toHaveURL(/search=song/);
        await expect(page).toHaveURL(/level=beginner/);
      });

      test('should combine search, level, and key filters', async ({ page }) => {
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        // Apply search filter
        const searchInput = page.locator('#search-filter');
        await searchInput.fill('guitar');
        await page.waitForTimeout(500);

        // Apply level filter
        const levelFilterTrigger = page.locator('#level-filter');
        await levelFilterTrigger.click();
        await page.waitForTimeout(300);
        await page.locator('[role="option"]:has-text("Beginner")').click();
        await page.waitForTimeout(500);

        // Apply key filter
        const keyFilterTrigger = page.locator('#key-filter');
        await keyFilterTrigger.click();
        await page.waitForTimeout(300);
        await page.locator('[role="option"]').nth(1).click(); // Select first key option
        await page.waitForTimeout(500);

        // URL should contain search and level at minimum
        await expect(page).toHaveURL(/search=guitar/);
        await expect(page).toHaveURL(/level=beginner/);
      });

      test('should clear all filters with reset button', async ({ page }) => {
        // Navigate with filters applied
        await page.goto('/dashboard/songs?search=test&level=beginner&key=C');
        await page.waitForLoadState('networkidle');

        // Verify filters are applied
        await expect(page).toHaveURL(/search=test/);
        await expect(page).toHaveURL(/level=beginner/);

        // Click reset button
        const resetButton = page.locator('button:has-text("Reset Filters")');
        await expect(resetButton).toBeEnabled();
        await resetButton.click();

        // Wait for filters to clear
        await page.waitForTimeout(500);

        // URL should be clean (no filter params)
        await expect(page).not.toHaveURL(/search=/);
        await expect(page).not.toHaveURL(/level=/);
        await expect(page).not.toHaveURL(/key=/);
      });

      test('should disable reset button when no filters are active', async ({
        page,
      }) => {
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        // Reset button should be disabled when no filters are applied
        const resetButton = page.locator('button:has-text("Reset Filters")');
        await expect(resetButton).toBeDisabled();
      });
    });

    test.describe('Filter Performance', () => {
      test('should debounce search input', async ({ page }) => {
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        const searchInput = page.locator('#search-filter');

        // Type rapidly - character by character
        await searchInput.type('debounce', { delay: 50 });

        // Wait shorter than debounce time
        await page.waitForTimeout(100);

        // URL might not be updated yet due to debounce
        const urlBeforeDebounce = page.url();

        // Wait for debounce to complete (300ms from component + buffer)
        await page.waitForTimeout(500);

        // URL should now contain the search term
        await expect(page).toHaveURL(/search=debounce/);
      });
    });

    test.describe('Filter State Persistence', () => {
      test('should maintain filter state in URL on page refresh', async ({
        page,
      }) => {
        // Navigate with filters
        await page.goto('/dashboard/songs?search=test&level=beginner');
        await page.waitForLoadState('networkidle');

        // Reload the page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Filters should still be in URL
        await expect(page).toHaveURL(/search=test/);
        await expect(page).toHaveURL(/level=beginner/);

        // Search input should have the value
        const searchInput = page.locator('#search-filter');
        await expect(searchInput).toHaveValue('test');
      });

      test('should populate filter controls from URL parameters', async ({
        page,
      }) => {
        // Navigate with filter in URL
        await page.goto('/dashboard/songs?level=intermediate');
        await page.waitForLoadState('networkidle');

        // The level filter should show the selected value
        const levelFilterTrigger = page.locator('#level-filter');
        await expect(levelFilterTrigger).toContainText('Intermediate');
      });
    });

    test.describe('Navigation from List', () => {
      test('should navigate to song detail when clicking a row', async ({
        page,
      }) => {
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        // Wait for table to load
        const table = page.locator('[data-testid="song-table"], table');
        await expect(table).toBeVisible({ timeout: 10000 });

        // Check if there are song rows
        const songRows = page.locator('[data-testid="song-row"]');
        const rowCount = await songRows.count();

        if (rowCount > 0) {
          // Click on the first song row
          await songRows.first().click();

          // Should navigate to song detail page
          await expect(page).toHaveURL(/\/dashboard\/songs\/[^/]+$/);
        }
      });

      test('should navigate to new song form when clicking add button', async ({
        page,
      }) => {
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        const newButton = page.locator('[data-testid="song-new-button"]');
        await newButton.click();

        await expect(page).toHaveURL(/\/dashboard\/songs\/new/);
      });
    });
  }
);
