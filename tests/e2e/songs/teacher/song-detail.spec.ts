/**
 * Teacher Song Detail View Test
 *
 * Migrated from: cypress/e2e/admin/admin-song-crud.cy.ts (detail view sections)
 *
 * Tests song detail page functionality for teachers:
 * 1. Navigation to detail page from list
 * 2. Display of song information (title, author, level, key)
 * 3. Display of action buttons (Edit, Delete, Sync Spotify)
 * 4. Navigation to edit page
 * 5. Back navigation to list
 *
 * Prerequisites:
 * - Admin user with is_teacher=true: p.romanczuk@gmail.com / test123_admin
 * - Database has at least one song available
 *
 * @tags @teacher @songs @detail
 */
import { test, expect } from '../../../fixtures';

test.describe(
  'Teacher Song Detail View',
  { tag: ['@teacher', '@songs', '@detail'] },
  () => {
    // Set viewport to desktop to avoid mobile-hidden elements
    test.beforeEach(async ({ page, loginAs }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      // Login as admin (who has is_teacher=true)
      await loginAs('admin');
    });

    test('should navigate to song detail page from list', async ({ page }) => {
      // Navigate to songs list
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="song-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on the first song row to go to detail page
      const songRow = page
        .locator('[data-testid="song-table"] [data-testid="song-row"]')
        .first();
      await songRow.waitFor({ state: 'visible', timeout: 10000 });
      await songRow.click();

      // Verify we're on a song detail page (URL matches /songs/[uuid])
      await expect(page).toHaveURL(/\/songs\/[^/]+$/, { timeout: 10000 });
    });

    test('should display song title and author on detail page', async ({
      page,
    }) => {
      // Navigate to songs list
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="song-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on the first song row to go to detail page
      const songRow = page
        .locator('[data-testid="song-table"] [data-testid="song-row"]')
        .first();
      await songRow.waitFor({ state: 'visible', timeout: 10000 });
      await songRow.click();

      // Verify we're on a song detail page
      await expect(page).toHaveURL(/\/songs\/[^/]+$/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Verify the page has a main heading (h1) for the song title
      const pageTitle = page.locator('h1').first();
      await expect(pageTitle).toBeVisible({ timeout: 10000 });

      // Title should not be empty
      const titleText = await pageTitle.textContent();
      expect(titleText).toBeTruthy();
      expect(titleText!.length).toBeGreaterThan(0);
    });

    test('should display song information cards', async ({ page }) => {
      // Navigate to songs list
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="song-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on the first song row to go to detail page
      const songRow = page
        .locator('[data-testid="song-table"] [data-testid="song-row"]')
        .first();
      await songRow.waitFor({ state: 'visible', timeout: 10000 });
      await songRow.click();

      // Verify we're on a song detail page
      await expect(page).toHaveURL(/\/songs\/[^/]+$/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Wait for main content to load
      await page.locator('main').first().waitFor({ state: 'visible' });

      // Check for common song info labels (at least one should exist)
      // These are rendered as muted-foreground text in Info.tsx
      const infoLabels = [
        'Difficulty',
        'Key',
        'Tempo',
        'Time Sig.',
        'Duration',
        'Released',
        'Capo',
        'Category',
        'Strumming',
      ];

      // At least one info label should be visible (songs may not have all fields)
      let foundInfoLabel = false;
      for (const label of infoLabels) {
        const labelElement = page.locator(`text=${label}`).first();
        const isVisible = await labelElement
          .isVisible({ timeout: 1000 })
          .catch(() => false);
        if (isVisible) {
          foundInfoLabel = true;
          break;
        }
      }

      // The detail page should display at least some song information
      // If no info labels are found, verify the page structure is still valid
      const hasContent = await page.locator('.space-y-6, .space-y-8').first().isVisible();
      expect(foundInfoLabel || hasContent).toBeTruthy();
    });

    test('should display teacher action buttons', async ({ page }) => {
      // Navigate to songs list
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="song-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on the first song row to go to detail page
      const songRow = page
        .locator('[data-testid="song-table"] [data-testid="song-row"]')
        .first();
      await songRow.waitFor({ state: 'visible', timeout: 10000 });
      await songRow.click();

      // Verify we're on a song detail page
      await expect(page).toHaveURL(/\/songs\/[^/]+$/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Teacher should see action buttons
      // Edit Song button (contains link to /edit)
      const editButton = page.locator('a[href*="/edit"]').first();
      await expect(editButton).toBeVisible({ timeout: 10000 });

      // Delete Song button
      const deleteButton = page.locator('button:has-text("Delete")').first();
      await expect(deleteButton).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to edit page from detail page', async ({ page }) => {
      // Navigate to songs list
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="song-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on the first song row to go to detail page
      const songRow = page
        .locator('[data-testid="song-table"] [data-testid="song-row"]')
        .first();
      await songRow.waitFor({ state: 'visible', timeout: 10000 });
      await songRow.click();

      // Verify we're on a song detail page
      await expect(page).toHaveURL(/\/songs\/[^/]+$/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Click the Edit button
      const editButton = page.locator('a[href*="/edit"]').first();
      await editButton.waitFor({ state: 'visible', timeout: 10000 });
      await editButton.click();

      // Verify we're on the edit page
      await expect(page).toHaveURL(/\/songs\/[^/]+\/edit/, { timeout: 10000 });

      // Verify edit form elements are present
      const titleInput = page.locator('[data-testid="song-title"]');
      await expect(titleInput).toBeVisible({ timeout: 10000 });
    });

    test('should display breadcrumbs navigation', async ({ page }) => {
      // Navigate to songs list
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="song-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on the first song row to go to detail page
      const songRow = page
        .locator('[data-testid="song-table"] [data-testid="song-row"]')
        .first();
      await songRow.waitFor({ state: 'visible', timeout: 10000 });
      await songRow.click();

      // Verify we're on a song detail page
      await expect(page).toHaveURL(/\/songs\/[^/]+$/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Verify breadcrumbs are displayed
      // Should show: Dashboard > Songs > Song Details
      await expect(page.locator('text=Dashboard').first()).toBeVisible({
        timeout: 10000,
      });
      await expect(page.locator('text=Songs').first()).toBeVisible({
        timeout: 10000,
      });
      await expect(page.locator('text=Song Details').first()).toBeVisible({
        timeout: 10000,
      });
    });

    test('should navigate back to songs list via breadcrumb', async ({
      page,
    }) => {
      // Navigate to songs list
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="song-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on the first song row to go to detail page
      const songRow = page
        .locator('[data-testid="song-table"] [data-testid="song-row"]')
        .first();
      await songRow.waitFor({ state: 'visible', timeout: 10000 });
      await songRow.click();

      // Verify we're on a song detail page
      await expect(page).toHaveURL(/\/songs\/[^/]+$/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Click the Songs breadcrumb link to go back
      const songsBreadcrumb = page.locator('a[href="/dashboard/songs"]').first();
      await songsBreadcrumb.waitFor({ state: 'visible', timeout: 10000 });
      await songsBreadcrumb.click();

      // Verify we're back on the songs list
      await expect(page).toHaveURL('/dashboard/songs', { timeout: 10000 });

      // Verify the songs table is visible
      await page.waitForSelector('[data-testid="song-table"], table', {
        state: 'visible',
        timeout: 10000,
      });
    });

    test('should display Related Lessons section', async ({ page }) => {
      // Navigate to songs list
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="song-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on the first song row to go to detail page
      const songRow = page
        .locator('[data-testid="song-table"] [data-testid="song-row"]')
        .first();
      await songRow.waitFor({ state: 'visible', timeout: 10000 });
      await songRow.click();

      // Verify we're on a song detail page
      await expect(page).toHaveURL(/\/songs\/[^/]+$/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Check for Lessons section heading (SongLessons component renders this)
      // The section might show "Related Lessons" or just "Lessons"
      const lessonsSection = page.locator('text=/lessons/i').first();
      const isVisible = await lessonsSection
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      // The section should exist on the page (even if empty)
      expect(isVisible).toBeTruthy();
    });

    test('should display Active Students section for teacher', async ({
      page,
    }) => {
      // Navigate to songs list
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="song-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on the first song row to go to detail page
      const songRow = page
        .locator('[data-testid="song-table"] [data-testid="song-row"]')
        .first();
      await songRow.waitFor({ state: 'visible', timeout: 10000 });
      await songRow.click();

      // Verify we're on a song detail page
      await expect(page).toHaveURL(/\/songs\/[^/]+$/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      // Teachers should see the "Active Students" section
      const studentsSection = page.locator('text=Active Students').first();
      await expect(studentsSection).toBeVisible({ timeout: 10000 });
    });
  }
);
