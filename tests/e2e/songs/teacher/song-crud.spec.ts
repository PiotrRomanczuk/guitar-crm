import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../../../helpers/auth';

/**
 * Teacher Song CRUD Test - Granular Steps
 *
 * Tests teacher-specific song management functionality
 * Each step is a separate test for easy debugging
 * Tests CREATE, READ, UPDATE, DELETE operations for songs
 *
 * Tags: @teacher @songs @crud
 */

// Test data with unique identifiers
const timestamp = Date.now();
const testSong = {
  title: `Teacher Song ${timestamp}`,
  titleEdited: `Teacher Song ${timestamp} EDITED`,
  author: 'Teacher Test Artist',
};

test.describe('Teacher Song CRUD', { tag: ['@teacher', '@songs', '@crud'] }, () => {
  // Increase timeout for these tests due to Next.js compilation
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    // Set viewport matching Cypress
    await page.setViewportSize({ width: 1280, height: 720 });

    // Login as admin (who has is_teacher=true)
    await loginAsAdmin(page);
  });

  // ===========================================
  // LIST PAGE TESTS
  // ===========================================
  test.describe('Songs List Page', () => {
    test('should display songs list with all required elements', async ({ page }) => {
      await page.goto('/dashboard/songs', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000); // Allow time for hydration
      await expect(page).toHaveURL(/.*\/songs/);

      // Verify table is displayed
      const table = page.locator('[data-testid="song-table"]');
      await expect(table).toBeVisible({ timeout: 10000 });

      // Verify search filter is functional
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
      await page.goto('/dashboard/songs/new', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000); // Allow time for hydration
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
      await page.goto('/dashboard/songs/new', { waitUntil: 'domcontentloaded' });

      // Wait for page to fully hydrate and compilation to complete
      await page.waitForTimeout(5000);

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
      await expect(saveButton).toBeEnabled();

      await saveButton.click();

      // Verify redirect (should leave /new page)
      await expect(page).not.toHaveURL(/.*\/new/, { timeout: 20000 });

      // Verify song appears in list
      await page.goto('/dashboard/songs', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const searchFilter = page.locator('#search-filter');
      await expect(searchFilter).toBeVisible({ timeout: 10000 });
      await searchFilter.focus();
      await searchFilter.clear();
      await searchFilter.fill(testSong.title);

      await page.waitForTimeout(1500); // Allow search to process

      const table = page.locator('[data-testid="song-table"]');
      await expect(table).toContainText(testSong.title, { timeout: 10000 });
    });
  });

  // ===========================================
  // EDIT FLOW
  // ===========================================
  test.describe('Edit Song Flow', () => {
    test('should edit song through detail page and verify changes', async ({ page }) => {
      // First, create a song to edit
      await page.goto('/dashboard/songs/new', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);

      const titleInput = page.locator('[data-testid="song-title"]');
      await expect(titleInput).toBeVisible({ timeout: 10000 });
      await titleInput.clear();
      await titleInput.fill(testSong.title);

      const authorInput = page.locator('[data-testid="song-author"]');
      await authorInput.clear();
      await authorInput.fill(testSong.author);

      await page.locator('[data-testid="song-level"]').selectOption('beginner');
      await page.locator('[data-testid="song-key"]').selectOption('C');

      const saveButton = page.locator('[data-testid="song-save"]');
      await expect(saveButton).toBeVisible();
      await expect(saveButton).toBeEnabled();
      await saveButton.click();

      // Wait for redirect
      await expect(page).not.toHaveURL(/.*\/new/, { timeout: 20000 });

      // Now navigate to songs list and find our test song
      await page.goto('/dashboard/songs', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const searchFilter = page.locator('#search-filter');
      await expect(searchFilter).toBeVisible({ timeout: 10000 });
      await searchFilter.focus();
      await searchFilter.clear();
      await searchFilter.fill(testSong.title);

      await page.waitForTimeout(1500); // Allow search to process

      // Click on song row in the table to go to detail page
      const songRow = page.locator('[data-testid="song-table"] [data-testid="song-row"]').first();
      await expect(songRow).toBeVisible({ timeout: 10000 });
      await songRow.click();
      await expect(page).toHaveURL(/.*\/songs\/[^/]+$/, { timeout: 10000 });

      // Navigate to edit form
      const editLink = page.locator('a[href*="/edit"]').first();
      await expect(editLink).toBeVisible({ timeout: 10000 });
      await editLink.click();
      await expect(page).toHaveURL(/.*\/edit/);

      // Wait for form to hydrate and compilation to complete
      await page.waitForTimeout(5000);

      // Update title and save
      const titleInputEdit = page.locator('[data-testid="song-title"]');
      await expect(titleInputEdit).toBeVisible({ timeout: 10000 });
      await titleInputEdit.clear();
      await titleInputEdit.fill(testSong.titleEdited);

      const saveButtonEdit = page.locator('[data-testid="song-save"]');
      await expect(saveButtonEdit).toBeVisible();
      await expect(saveButtonEdit).toBeEnabled();

      await saveButtonEdit.click();

      // Verify redirect away from edit page
      await expect(page).not.toHaveURL(/.*\/edit/, { timeout: 20000 });

      // Verify changes in list
      await page.goto('/dashboard/songs', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const searchFilterEdit = page.locator('#search-filter');
      await expect(searchFilterEdit).toBeVisible({ timeout: 10000 });
      await searchFilterEdit.focus();
      await searchFilterEdit.clear();
      await searchFilterEdit.fill(testSong.titleEdited);

      await page.waitForTimeout(1500); // Allow search to process

      const tableEdit = page.locator('[data-testid="song-table"]');
      await expect(tableEdit).toContainText(testSong.titleEdited, { timeout: 10000 });
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
