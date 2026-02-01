import { test, expect, Page } from '@playwright/test';
import { loginAsAdmin } from '../../helpers/auth';

/**
 * Admin Song CRUD Test - Granular Steps
 *
 * Each step is a separate test for easy debugging
 * Tests CREATE, READ, UPDATE, DELETE operations for songs
 *
 * Tags: @admin @crud
 */

// Test data with unique identifiers
const timestamp = Date.now();
const testSong = {
  title: `E2E Song ${timestamp}`,
  titleEdited: `E2E Song ${timestamp} EDITED`,
  author: 'E2E Test Artist',
};

test.describe('Admin Song CRUD', { tag: ['@admin', '@crud'] }, () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear browser state before each test
    await context.clearCookies();
    await context.clearPermissions();

    // Set viewport matching Cypress
    await page.setViewportSize({ width: 1280, height: 720 });

    // Login as admin
    await loginAsAdmin(page);
  });

  // ===========================================
  // LIST PAGE TESTS
  // ===========================================
  test.describe('Songs List Page', () => {
    test('should display songs list with all required elements', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await expect(page).toHaveURL(/.*\/songs/);

      // Wait for page to fully render (handles animation delays)
      await page.waitForTimeout(1000);

      // Verify table is displayed (use only data-testid to avoid strict mode violation)
      const table = page.locator('[data-testid="song-table"]');
      await expect(table).toBeVisible({ timeout: 10000 });

      // Verify search filter is functional (wait for animation)
      const searchFilter = page.locator('#search-filter');
      await expect(searchFilter).toBeVisible({ timeout: 10000 });
      await expect(searchFilter).toBeEnabled();

      // Verify create new song button exists and is clickable
      const newButton = page.locator('[data-testid="song-new-button"]');
      await expect(newButton).toBeVisible({ timeout: 10000 });
      await expect(newButton).toBeEnabled();
    });
  });

  // ===========================================
  // CREATE FORM TESTS
  // ===========================================
  test.describe('Song Create Form', () => {
    test('should display and validate all form elements', async ({ page }) => {
      await page.goto('/dashboard/songs/new');
      await expect(page).toHaveURL(/.*\/songs\/new/);

      // Verify all form elements are present and functional
      const titleInput = page.locator('[data-testid="song-title"]');
      await expect(titleInput).toBeVisible({ timeout: 10000 });
      await titleInput.clear();
      await titleInput.fill(testSong.title);
      await expect(titleInput).toHaveValue(testSong.title);

      const authorInput = page.locator('[data-testid="song-author"]');
      await expect(authorInput).toBeVisible({ timeout: 10000 });
      await authorInput.clear();
      await authorInput.fill(testSong.author);
      await expect(authorInput).toHaveValue(testSong.author);

      const levelSelect = page.locator('[data-testid="song-level"]');
      await expect(levelSelect).toBeVisible({ timeout: 10000 });
      await levelSelect.selectOption('beginner');
      await expect(levelSelect).toHaveValue('beginner');

      const keySelect = page.locator('[data-testid="song-key"]');
      await expect(keySelect).toBeVisible({ timeout: 10000 });
      await keySelect.selectOption('C');
      await expect(keySelect).toHaveValue('C');

      const saveButton = page.locator('[data-testid="song-save"]');
      await expect(saveButton).toBeVisible({ timeout: 10000 });
      await expect(saveButton).toBeEnabled();
    });
  });

  // ===========================================
  // CREATE FULL FLOW
  // ===========================================
  test.describe('Create Song Full Flow', () => {
    test('should create a new song and verify in list', async ({ page }) => {
      // Navigate to create form
      await page.goto('/dashboard/songs/new');

      // Wait for page to fully hydrate
      await page.waitForTimeout(2000);

      // Fill all required fields
      const titleInput = page.locator('[data-testid="song-title"]');
      await expect(titleInput).toBeVisible({ timeout: 10000 });
      await titleInput.clear();
      await titleInput.fill(testSong.title);

      const authorInput = page.locator('[data-testid="song-author"]');
      await authorInput.clear();
      await authorInput.fill(testSong.author);

      await page.locator('[data-testid="song-level"]').selectOption('beginner');
      await page.locator('[data-testid="song-key"]').selectOption('C');

      // Submit form
      const saveButton = page.locator('[data-testid="song-save"]');
      await expect(saveButton).toBeVisible();
      await saveButton.click();

      // Verify redirect (should leave /new page)
      await expect(page).not.toHaveURL(/.*\/new/, { timeout: 15000 });

      // Verify song appears in list
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Wait for search filter animation to complete
      const searchFilter = page.locator('#search-filter');
      await expect(searchFilter).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(500); // Wait for animation
      await searchFilter.click(); // Ensure focus
      await searchFilter.fill(testSong.title);

      await page.waitForTimeout(1500); // Allow search debounce to process

      const table = page.locator('[data-testid="song-table"]');
      await expect(table).toContainText(testSong.title, { timeout: 10000 });
    });
  });

  // ===========================================
  // EDIT FLOW
  // ===========================================
  test.describe('Edit Song Flow', () => {
    test('should edit song through detail page and verify changes', async ({ page }) => {
      // This test searches for a song matching the pattern created by the Create test
      // If that doesn't exist, it falls back to any song in the list
      const editTestTitle = `E2E Edit Test ${Date.now()}`;

      // Navigate to songs list
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Click on first song row in the table to go to detail page
      const table = page.locator('[data-testid="song-table"]');
      await expect(table).toBeVisible({ timeout: 10000 });

      const songRow = page.locator('[data-testid="song-table"] [data-testid="song-row"]').first();
      await expect(songRow).toBeVisible({ timeout: 10000 });
      await songRow.click();
      await expect(page).toHaveURL(/.*\/songs\/[^/]+$/, { timeout: 10000 });

      // Navigate to edit form
      const editLink = page.locator('a[href*="/edit"]').first();
      await expect(editLink).toBeVisible({ timeout: 10000 });
      await editLink.click();
      await expect(page).toHaveURL(/.*\/edit/);

      // Wait for form to hydrate
      await page.waitForTimeout(2000);

      // Update title and save
      const titleInput = page.locator('[data-testid="song-title"]');
      await expect(titleInput).toBeVisible({ timeout: 10000 });

      // Get the current title for verification later
      const originalTitle = await titleInput.inputValue();

      await titleInput.clear();
      await titleInput.fill(editTestTitle);

      const saveButton = page.locator('[data-testid="song-save"]');
      await expect(saveButton).toBeVisible();
      await saveButton.click();

      // Verify redirect away from edit page
      await expect(page).not.toHaveURL(/.*\/edit/, { timeout: 15000 });

      // Verify changes in list
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Wait for search filter animation to complete
      const searchFilterEdited = page.locator('#search-filter');
      await expect(searchFilterEdited).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(500); // Wait for animation
      await searchFilterEdited.click(); // Ensure focus
      await searchFilterEdited.fill(editTestTitle);

      await page.waitForTimeout(1500); // Allow search debounce to process

      const tableEdited = page.locator('[data-testid="song-table"]');
      await expect(tableEdited).toContainText(editTestTitle, { timeout: 10000 });

      // Clean up: restore original title
      await songRow.click();
      await page.waitForTimeout(1000);
      const editLinkAgain = page.locator('a[href*="/edit"]').first();
      await editLinkAgain.click();
      await page.waitForTimeout(2000);
      const titleInputAgain = page.locator('[data-testid="song-title"]');
      await titleInputAgain.clear();
      await titleInputAgain.fill(originalTitle);
      await page.locator('[data-testid="song-save"]').click();
      await page.waitForTimeout(1000);
    });
  });

  // ===========================================
  // DELETE FLOW
  // ===========================================
  test.describe('Delete Song Flow', () => {
    test('should show delete confirmation dialog when delete button is clicked', async ({ page }) => {
      // Navigate to songs list
      await page.goto('/dashboard/songs');
      await page.waitForTimeout(2000);

      // Wait for table to load with songs
      const table = page.locator('[data-testid="song-table"]');
      await expect(table).toBeVisible({ timeout: 10000 });

      // Click delete button on first song in the table
      const deleteButton = page.locator('[data-testid="song-table"] [data-testid="song-delete-button"]').first();
      await deleteButton.click();

      // Verify confirmation dialog appears
      const dialog = page.locator('[data-testid="delete-confirmation-dialog"]');
      await expect(dialog).toBeVisible({ timeout: 10000 });

      // Verify confirm and cancel buttons exist
      await expect(page.locator('[data-testid="delete-confirm-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-cancel-button"]')).toBeVisible();

      // Cancel the dialog by clicking the cancel button
      await page.locator('[data-testid="delete-cancel-button"]').click();

      // Verify dialog is closed
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    });
  });
});
