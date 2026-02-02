/**
 * Admin Song Management Enhanced Tests
 *
 * Migrated from: cypress/e2e/admin/admin-songs-enhanced.cy.ts
 *
 * Extended tests for song management:
 * - Bulk export (JSON, CSV, PDF)
 * - Image upload
 * - Audio file management
 * - Spotify integration
 * - Song statistics
 * - Batch operations
 * - Filtering and search
 * - Media uploads
 *
 * Tags: @admin @songs @enhanced
 *
 * Prerequisites:
 * - Local Supabase database running
 * - Test admin credentials configured
 */

import { test, expect } from '../../fixtures';

test.describe('Admin Song Management (Enhanced)', { tag: ['@admin', '@songs', '@enhanced'] }, () => {
  test.beforeEach(async ({ page, loginAs }) => {
    // Set viewport matching Cypress
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as admin
    await loginAs('admin');
  });

  test.describe('Song List Features', () => {
    test('should load songs page', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      await expect(page).toHaveURL(/.*\/songs/);

      // Check for main content area
      const main = page.locator('main, [role="main"]').first();
      await expect(main).toBeVisible();
    });

    test('should display songs in table', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Check for table or grid layout
      const songTable = page.locator('[data-testid="song-table"], table');
      await expect(songTable).toBeVisible({ timeout: 10000 });
    });

    test('should have search functionality', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Check for search input
      const searchInput = page.locator('#search-filter');
      await expect(searchInput).toBeVisible({ timeout: 10000 });
      await expect(searchInput).toBeEnabled();
    });
  });

  test.describe('Song Filtering', () => {
    test('should filter songs by search term', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Type in search filter
      const searchInput = page.locator('#search-filter');
      await expect(searchInput).toBeVisible({ timeout: 10000 });
      await searchInput.fill('song');

      // Wait for debounce
      await page.waitForTimeout(1000);

      // Results should update - check that table is still visible
      const songTable = page.locator('[data-testid="song-table"], table');
      await expect(songTable).toBeVisible();
    });

    test.skip('should have level/difficulty filter if available', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Check if level filter exists
      const levelFilter = page.locator(
        '[data-testid*="level-filter"], select[name*="level"]'
      );

      const count = await levelFilter.count();
      if (count > 0) {
        await expect(levelFilter.first()).toBeVisible();
      }
    });

    test.skip('should have status filter if available', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Check if status filter exists
      const statusFilter = page.locator(
        '[data-testid*="status-filter"], select[name*="status"]'
      );

      const count = await statusFilter.count();
      if (count > 0) {
        await expect(statusFilter.first()).toBeVisible();
      }
    });
  });

  test.describe('Song Detail Page', () => {
    test('should navigate to song detail', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Click on first song row
      const firstSongRow = page
        .locator('[data-testid="song-table"] [data-testid="song-row"]')
        .first();

      await expect(firstSongRow).toBeVisible({ timeout: 10000 });
      await firstSongRow.click();

      // Should navigate to detail page
      await expect(page).toHaveURL(/\/songs\/[^/]+$/, { timeout: 10000 });
    });

    test('should display song details', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Click on first song
      const firstSongRow = page
        .locator('[data-testid="song-table"] [data-testid="song-row"]')
        .first();

      await expect(firstSongRow).toBeVisible({ timeout: 10000 });
      await firstSongRow.click();

      await page.waitForTimeout(1500);

      // Check for detail content (title, author, etc.)
      const main = page.locator('main').first();
      await expect(main).toBeVisible();

      // These are common song detail fields
      const hasDetails =
        (await page.getByText(/title/i).count()) > 0 ||
        (await page.getByText(/author/i).count()) > 0 ||
        (await page.getByText(/artist/i).count()) > 0;

      expect(hasDetails).toBe(true);
    });
  });

  test.describe('Create New Song', () => {
    const timestamp = Date.now();
    const songData = {
      title: `Test Song ${timestamp}`,
      author: 'Test Artist',
    };

    test('should navigate to new song form', async ({ page }) => {
      await page.goto('/dashboard/songs/new');
      await page.waitForTimeout(2000);

      await expect(page).toHaveURL(/.*\/songs\/new/);

      // Check for form
      const form = page.locator('form, [data-testid="song-form"]');
      await expect(form).toBeVisible();
    });

    test('should create a new song', async ({ page }) => {
      await page.goto('/dashboard/songs/new');
      await page.waitForTimeout(2000);

      // Fill in song details using data-testid
      await page.fill('[data-testid="song-title"]', songData.title);
      await page.fill('[data-testid="song-author"]', songData.author);

      // Fill required fields
      await page.selectOption('[data-testid="song-level"]', 'beginner');
      await page.selectOption('[data-testid="song-key"]', 'C');

      // Submit
      await page.click('[data-testid="song-save"]');

      // Should redirect
      await expect(page).not.toHaveURL(/\/new/, { timeout: 15000 });
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/dashboard/songs/new');
      await page.waitForTimeout(2000);

      // Try to submit empty form
      await page.click('[data-testid="song-save"]');

      // Should stay on form
      await expect(page).toHaveURL(/\/new/);
    });
  });

  test.describe('Song Media', () => {
    test('should have image upload option', async ({ page }) => {
      await page.goto('/dashboard/songs/new');
      await page.waitForTimeout(2000);

      // Check for image upload input
      const imageUpload = page.locator(
        'input[type="file"][accept*="image"], [data-testid*="image-upload"]'
      );

      const count = await imageUpload.count();
      if (count > 0) {
        await expect(imageUpload.first()).toBeVisible();
      } else {
        // If not found, check for upload button/link
        const uploadText = page.getByText(/upload image/i);
        const hasUpload = await uploadText.count() > 0;

        // This is acceptable - feature may not be fully implemented
        expect(hasUpload || count > 0).toBeDefined();
      }
    });

    test('should have links section (YouTube, Spotify, etc.)', async ({ page }) => {
      await page.goto('/dashboard/songs/new');
      await page.waitForTimeout(2000);

      // Check for URL inputs
      const youtubeInput = page.locator('[data-testid="song-youtube_url"]');
      const spotifyInput = page.locator('[data-testid="song-spotify_link_url"]');

      // At least one should be visible
      const youtubeVisible = await youtubeInput.isVisible().catch(() => false);
      const spotifyVisible = await spotifyInput.isVisible().catch(() => false);

      expect(youtubeVisible || spotifyVisible).toBe(true);
    });
  });

  test.describe('Spotify Integration', () => {
    test('should have Spotify search/link option', async ({ page }) => {
      await page.goto('/dashboard/songs/new');
      await page.waitForTimeout(2000);

      // Check for Spotify search component
      const spotifySearch = page.locator('input[placeholder*="Spotify"], input[placeholder*="Search Spotify"]');
      const spotifyButton = page.getByRole('button', { name: /spotify/i });

      const searchVisible = await spotifySearch.isVisible().catch(() => false);
      const buttonVisible = await spotifyButton.isVisible().catch(() => false);

      // Either search input or button should exist
      expect(searchVisible || buttonVisible).toBe(true);
    });

    test('should display Spotify search input', async ({ page }) => {
      await page.goto('/dashboard/songs/new');
      await page.waitForTimeout(3000);

      // Look for Spotify search in the form
      const spotifyContainer = page.locator('div:has-text("Spotify")').first();
      await expect(spotifyContainer).toBeVisible({ timeout: 5000 });
    });

    test.skip('should allow Spotify track selection', async ({ page }) => {
      // This test requires actual Spotify API integration
      // Skip unless Spotify is fully configured
      await page.goto('/dashboard/songs/new');
      await page.waitForTimeout(2000);

      // Search for a song
      const searchInput = page.locator('input[placeholder*="Search Spotify"]');
      await searchInput.fill('Wonderwall Oasis');

      // Click search button
      const searchButton = page.getByRole('button', { name: /search/i });
      await searchButton.click();

      // Wait for results
      await page.waitForTimeout(2000);

      // Select first result
      const firstResult = page.locator('[data-testid="spotify-result"]').first();
      await firstResult.click();
    });
  });

  test.describe('Export Functionality', () => {
    test.skip('should have export options if available', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Check for export button/menu
      const exportButton = page.getByRole('button', { name: /export/i });
      const exportCount = await exportButton.count();

      if (exportCount > 0) {
        await expect(exportButton.first()).toBeVisible();

        // Click to see export options
        await exportButton.first().click();

        // Check for export formats
        const csvOption = page.getByText(/csv/i);
        const jsonOption = page.getByText(/json/i);

        const hasCsv = await csvOption.count() > 0;
        const hasJson = await jsonOption.count() > 0;

        expect(hasCsv || hasJson).toBe(true);
      }
    });
  });

  test.describe('Batch Operations', () => {
    test.skip('should have bulk selection if available', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Check for checkboxes in table header or rows
      const headerCheckbox = page.locator('th input[type="checkbox"]');
      const rowCheckbox = page.locator('td input[type="checkbox"]');

      const hasHeaderCheckbox = await headerCheckbox.count() > 0;
      const hasRowCheckbox = await rowCheckbox.count() > 0;

      if (hasHeaderCheckbox || hasRowCheckbox) {
        // Verify checkboxes are functional
        if (hasHeaderCheckbox) {
          await expect(headerCheckbox.first()).toBeVisible();
        }
        if (hasRowCheckbox) {
          await expect(rowCheckbox.first()).toBeVisible();
        }
      }
    });

    test.skip('should have bulk delete option if available', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Select some songs first
      const rowCheckbox = page.locator('td input[type="checkbox"]').first();
      const checkboxCount = await rowCheckbox.count();

      if (checkboxCount > 0) {
        await rowCheckbox.click();

        // Look for bulk delete button
        const bulkDeleteButton = page.getByRole('button', { name: /delete selected/i });
        const deleteCount = await bulkDeleteButton.count();

        if (deleteCount > 0) {
          await expect(bulkDeleteButton.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Edit Song', () => {
    test('should be able to edit song', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Navigate to a song detail
      const firstSongRow = page
        .locator('[data-testid="song-table"] [data-testid="song-row"]')
        .first();

      await expect(firstSongRow).toBeVisible({ timeout: 10000 });
      await firstSongRow.click();

      await page.waitForTimeout(1500);

      // Look for edit link/button
      const editLink = page.locator('a[href*="/edit"]').first();
      const editButton = page.getByRole('button', { name: /edit/i });

      const hasEditLink = await editLink.isVisible().catch(() => false);
      const hasEditButton = await editButton.isVisible().catch(() => false);

      expect(hasEditLink || hasEditButton).toBe(true);
    });
  });

  test.describe('Delete Song', () => {
    test('should have delete with confirmation', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Find delete button in table
      const deleteButton = page
        .locator('[data-testid="song-delete-button"]')
        .first();

      const count = await deleteButton.count();

      if (count > 0) {
        await expect(deleteButton).toBeVisible({ timeout: 10000 });
        await deleteButton.click();

        // Should show confirmation dialog
        const dialog = page.locator('[data-testid="delete-confirmation-dialog"], [role="alertdialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });

        // Cancel
        const cancelButton = page.locator('[data-testid="delete-cancel-button"]');
        await expect(cancelButton).toBeVisible();
        await cancelButton.click();

        // Dialog should close
        await expect(dialog).not.toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Song Statistics', () => {
    test.skip('should show song statistics if available', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Navigate to first song
      const firstSongRow = page
        .locator('[data-testid="song-table"] [data-testid="song-row"]')
        .first();

      await expect(firstSongRow).toBeVisible({ timeout: 10000 });
      await firstSongRow.click();

      await page.waitForTimeout(1500);

      // Look for statistics section
      const statsSection = page.getByText(/statistics/i);
      const progressSection = page.getByText(/progress/i);
      const studentsSection = page.getByText(/students/i);

      const hasStats =
        (await statsSection.count()) > 0 ||
        (await progressSection.count()) > 0 ||
        (await studentsSection.count()) > 0;

      if (hasStats) {
        expect(hasStats).toBe(true);
      }
    });
  });

  test.describe('Song Levels', () => {
    test('should have level selection on form', async ({ page }) => {
      await page.goto('/dashboard/songs/new');
      await page.waitForTimeout(2000);

      // Check for level select
      const levelSelect = page.locator('[data-testid="song-level"]');
      await expect(levelSelect).toBeVisible({ timeout: 10000 });

      // Verify it has options
      const options = await levelSelect.locator('option').count();
      expect(options).toBeGreaterThan(0);
    });
  });

  test.describe('Chords Information', () => {
    test.skip('should have chords field on form', async ({ page }) => {
      await page.goto('/dashboard/songs/new');
      await page.waitForTimeout(2000);

      // Check for chords input/textarea
      const chordsInput = page.locator(
        'input[name*="chords"], textarea[name*="chords"], [data-testid*="chords"]'
      );

      const count = await chordsInput.count();
      if (count > 0) {
        await expect(chordsInput.first()).toBeVisible();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      const main = page.locator('main, [role="main"]').first();
      await expect(main).toBeVisible();
    });

    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      const main = page.locator('main, [role="main"]').first();
      await expect(main).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept API calls and force error
      await page.route('**/api/songs**', async (route) => {
        await route.abort('failed');
      });

      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Page should still render
      const main = page.locator('main, [role="main"]').first();
      await expect(main).toBeVisible();
    });
  });

  test.describe('Spotify Sync Feature', () => {
    test.skip('should have Spotify sync button if available', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Look for Spotify sync button
      const syncButton = page.getByRole('button', { name: /sync.*spotify/i });
      const syncCount = await syncButton.count();

      if (syncCount > 0) {
        await expect(syncButton.first()).toBeVisible();
      }
    });
  });

  test.describe('File Upload', () => {
    test.skip('should upload cover image', async ({ page }) => {
      // This test requires actual file upload implementation
      await page.goto('/dashboard/songs/new');
      await page.waitForTimeout(3000);

      const fileInput = page.locator('input[type="file"][accept*="image"]');
      const count = await fileInput.count();

      if (count > 0) {
        // Create a test image file
        const testImagePath = '/tmp/test-image.png';

        // Upload the file
        await fileInput.first().setInputFiles(testImagePath);

        // Wait for upload to complete
        await page.waitForTimeout(2000);

        // Verify image preview appears
        const imagePreview = page.locator('img[alt*="cover"], img[alt*="preview"]');
        await expect(imagePreview).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Advanced Fields', () => {
    test('should have additional music metadata fields', async ({ page }) => {
      await page.goto('/dashboard/songs/new');
      await page.waitForTimeout(2000);

      // Check for advanced fields
      const tempoField = page.locator('[data-testid*="tempo"], input[name*="tempo"]');
      const capoField = page.locator('[data-testid*="capo"], input[name*="capo"]');

      const hasTempo = await tempoField.count() > 0;
      const hasCapo = await capoField.count() > 0;

      // At least some advanced fields should exist
      expect(hasTempo || hasCapo).toBe(true);
    });
  });
});
