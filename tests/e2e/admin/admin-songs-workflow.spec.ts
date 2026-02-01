/**
 * Admin Songs CRUD Workflow
 *
 * Migrated from: cypress/e2e/admin/admin-songs-workflow.cy.ts
 *
 * Tests complete CRUD cycle for songs:
 * 1. Create - Fill form and submit
 * 2. Verify - Check item appears in list
 * 3. Edit - Update the created item
 * 4. Verify - Check changes are saved
 * 5. Delete - Remove the item
 * 6. Verify - Check item is removed
 *
 * Prerequisites:
 * - Local Supabase database running
 * - Test credentials configured
 */
import { test, expect } from '../../fixtures';

// Test data with unique identifiers
const timestamp = Date.now();
const testData = {
  title: `E2E Song ${timestamp}`,
  titleEdited: `E2E Song ${timestamp} EDITED`,
  author: 'E2E Test Artist',
};

test.describe('Admin Songs CRUD Workflow', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as admin
    await loginAs('admin');
  });

  test('1. CREATE: should create a new song', async ({ page }) => {
    await page.goto('/dashboard/songs/new');

    // Wait for form to be fully rendered and interactive
    await page.waitForSelector('[data-testid="song-title"]', {
      state: 'visible',
      timeout: 10000,
    });

    // Fill in required song form fields
    await page.fill('[data-testid="song-title"]', testData.title);
    await page.fill('[data-testid="song-author"]', testData.author);

    // Select required level field (native select)
    await page.selectOption('[data-testid="song-level"]', 'beginner');

    // Select required key field (native select)
    await page.selectOption('[data-testid="song-key"]', 'C');

    // Submit the form
    await page.waitForSelector('[data-testid="song-save"]', { state: 'visible' });
    await page.click('[data-testid="song-save"]');

    // Should redirect to song detail or list
    await expect(page).not.toHaveURL(/\/new/, { timeout: 15000 });
  });

  test('2. VERIFY CREATE: should find created song in list', async ({ page }) => {
    await page.goto('/dashboard/songs');

    // Wait for table to load
    await page.waitForSelector('[data-testid="song-table"], table', {
      state: 'visible',
      timeout: 10000,
    });

    // Wait for search filter to be visible
    await page.waitForSelector('#search-filter', { state: 'visible', timeout: 5000 });

    // Search for the created song
    await page.fill('#search-filter', testData.title);

    // Wait for debounce and results
    await page.waitForTimeout(1500);

    // Verify it appears in the list
    await expect(page.locator(`text=${testData.title}`)).toBeVisible({ timeout: 10000 });
  });

  test('3. EDIT: should update the song', async ({ page }) => {
    await page.goto('/dashboard/songs');

    // Wait for table to load
    await page.waitForSelector('#search-filter', { state: 'visible', timeout: 5000 });

    // Search for the song
    await page.fill('#search-filter', testData.title);
    await page.waitForTimeout(1500);

    // Click on the song row in the desktop table to go to detail page
    const songRow = page.locator('[data-testid="song-table"] [data-testid="song-row"]').first();
    await songRow.waitFor({ state: 'visible', timeout: 10000 });
    await songRow.click();

    await expect(page).toHaveURL(/\/songs\/[^/]+$/, { timeout: 10000 });

    // Click edit button/link
    const editButton = page.locator('a[href*="/edit"]').first();
    await editButton.waitFor({ state: 'visible', timeout: 5000 });
    await editButton.click();

    await expect(page).toHaveURL(/\/edit/);

    // Wait for form to load
    await page.waitForSelector('[data-testid="song-title"]', {
      state: 'visible',
      timeout: 10000,
    });

    // Update the title
    await page.fill('[data-testid="song-title"]', testData.titleEdited);

    // Save
    await page.waitForSelector('[data-testid="song-save"]', { state: 'visible' });
    await page.click('[data-testid="song-save"]');

    // Should redirect back
    await expect(page).not.toHaveURL(/\/edit/, { timeout: 15000 });
  });

  test('4. VERIFY EDIT: should find edited song in list', async ({ page }) => {
    await page.goto('/dashboard/songs');

    // Wait for table to load
    await page.waitForSelector('#search-filter', { state: 'visible', timeout: 5000 });

    // Search for the edited song
    await page.fill('#search-filter', testData.titleEdited);
    await page.waitForTimeout(1500);

    // Verify edited title appears in the desktop table
    await expect(page.locator('[data-testid="song-table"]')).toContainText(testData.titleEdited, {
      timeout: 10000,
    });
  });

  test('5. DELETE: should delete the song', async ({ page }) => {
    await page.goto('/dashboard/songs');

    // Wait for table to load
    await page.waitForSelector('#search-filter', { state: 'visible', timeout: 5000 });

    // Search for the song
    await page.fill('#search-filter', testData.titleEdited);
    await page.waitForTimeout(1500);

    // Wait for search results in table
    await expect(page.locator('[data-testid="song-table"]')).toContainText(testData.titleEdited, {
      timeout: 10000,
    });

    // Click delete button in the table row
    const deleteButton = page
      .locator('[data-testid="song-table"] [data-testid="song-delete-button"]')
      .first();
    await deleteButton.waitFor({ state: 'visible', timeout: 5000 });
    await deleteButton.click();

    // Confirm deletion in dialog
    const confirmButton = page.locator('[data-testid="delete-confirm-button"]');
    await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await confirmButton.click();

    // Wait for deletion to complete and dialog to close
    await expect(page.locator('[data-testid="delete-confirmation-dialog"]')).not.toBeVisible({
      timeout: 10000,
    });
  });

  test('6. VERIFY DELETE: should not find deleted song in list', async ({ page }) => {
    // Refresh page to get updated list
    await page.goto('/dashboard/songs');
    await page.waitForTimeout(2000);

    // Wait for either table or page to load
    await page.waitForSelector('[data-testid="song-table"], body', {
      state: 'visible',
      timeout: 15000,
    });

    // Wait for search filter to load
    await page.waitForSelector('#search-filter', { state: 'visible', timeout: 10000 });

    // Search for the deleted song
    await page.fill('#search-filter', testData.titleEdited);
    await page.waitForTimeout(2000);

    // Verify the song is not in the page (may show "No songs found" or empty table)
    await expect(page.locator(`text=${testData.titleEdited}`)).not.toBeVisible();
  });
});
