/**
 * Admin Lessons CRUD Workflow
 *
 * Migrated from: cypress/e2e/admin/admin-lessons-workflow.cy.ts
 *
 * Tests complete CRUD cycle for lessons:
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
  title: `E2E Lesson ${timestamp}`,
  titleEdited: `E2E Lesson ${timestamp} EDITED`,
  notes: 'E2E Test lesson notes',
};

test.describe('Admin Lessons CRUD Workflow', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as admin
    await loginAs('admin');
  });

  test('1. CREATE: should create a new lesson', async ({ page }) => {
    await page.goto('/dashboard/lessons/new');

    // Wait for form to load - the SelectTrigger has the data-testid
    await page.waitForSelector('[data-testid="lesson-student_id"]', {
      state: 'visible',
      timeout: 10000,
    });

    // Select first available student using shadcn Select
    // Click the trigger to open the dropdown
    await page.click('[data-testid="lesson-student_id"]');
    await page.waitForTimeout(500);

    // Click the first option in the dropdown
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(500);

    // Select first available teacher using shadcn Select
    await page.click('[data-testid="lesson-teacher_id"]');
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(500);

    // Fill in lesson form
    await page.fill('[data-testid="lesson-title"]', testData.title);

    // Set scheduled date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 16);
    await page.fill('[data-testid="lesson-scheduled-at"]', dateStr);

    // Add notes
    await page.fill('[data-testid="lesson-notes"]', testData.notes);

    // Submit the form
    await page.waitForSelector('[data-testid="lesson-submit"]', { state: 'visible' });
    await page.click('[data-testid="lesson-submit"]');

    // Should redirect to lessons list with success message
    await expect(page).toHaveURL(/\/dashboard\/lessons/, { timeout: 15000 });
    await expect(page).not.toHaveURL(/\/new/);
  });

  test('2. VERIFY CREATE: should find created lesson in list', async ({ page }) => {
    await page.goto('/dashboard/lessons');

    // Wait for table to load
    await page.waitForSelector('[data-testid="lesson-table"], table', {
      state: 'visible',
      timeout: 10000,
    });

    // Look for the lesson title in the table
    await expect(page.locator(`text=${testData.title}`)).toBeVisible({ timeout: 10000 });
  });

  test('3. EDIT: should update the lesson', async ({ page }) => {
    await page.goto('/dashboard/lessons');
    await page.waitForTimeout(2000);

    // Click on the lesson to go to detail page
    await page.locator(`text=${testData.title}`).click();
    await expect(page).toHaveURL(/\/lessons\/[^/]+$/);

    // Click edit button
    const editButton = page.locator('[data-testid="lesson-edit-button"], a[href*="/edit"]').first();
    await editButton.waitFor({ state: 'visible', timeout: 5000 });
    await editButton.click();
    await expect(page).toHaveURL(/\/edit/);
    await page.waitForTimeout(2000);

    // Update the title
    await page.fill('[data-testid="lesson-title"]', testData.titleEdited);

    // Save
    await page.locator('[data-testid="lesson-submit"], button[type="submit"]').first().click();

    // Should redirect back
    await expect(page).not.toHaveURL(/\/edit/, { timeout: 15000 });
  });

  test('4. VERIFY EDIT: should find edited lesson in list', async ({ page }) => {
    await page.goto('/dashboard/lessons');

    // Verify edited title appears
    await expect(page.locator(`text=${testData.titleEdited}`)).toBeVisible({ timeout: 10000 });
  });

  test('5. DELETE: should delete the lesson', async ({ page }) => {
    await page.goto('/dashboard/lessons');

    // Click on the lesson to go to detail page
    await page.locator(`text=${testData.titleEdited}`).click();
    await expect(page).toHaveURL(/\/lessons\/[^/]+$/);

    // Click delete button
    await page.waitForSelector('[data-testid="lesson-delete-button"]', {
      state: 'visible',
      timeout: 5000,
    });
    await page.click('[data-testid="lesson-delete-button"]');

    // Confirm deletion (if dialog appears)
    const confirmButton = page.locator(
      '[data-testid="delete-confirm-button"], button:has-text("Confirm"), button:has-text("Delete")'
    );
    const confirmButtonVisible = await confirmButton.first().isVisible().catch(() => false);

    if (confirmButtonVisible) {
      await confirmButton.first().click();
    }

    // Should redirect to lessons list
    await expect(page).toHaveURL('/dashboard/lessons', { timeout: 10000 });
  });

  test('6. VERIFY DELETE: should not find deleted lesson in list', async ({ page }) => {
    await page.goto('/dashboard/lessons');

    // Wait for table to load
    await page.waitForSelector('[data-testid="lesson-table"], table', {
      state: 'visible',
      timeout: 10000,
    });

    // Verify deleted lesson is not in the list
    await expect(page.locator(`text=${testData.titleEdited}`)).not.toBeVisible();
  });
});
