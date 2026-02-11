import { test, expect } from '../../../fixtures';
import { fillLessonForm, submitForm } from '../../../helpers/form';

/**
 * Teacher Lesson CRUD Test
 *
 * Tests complete CRUD cycle for lessons as a teacher:
 * 1. Create - Fill form with teacher/student selection, scheduling, and submit
 * 2. Verify - Check lesson appears in list
 * 3. Edit - Update the created lesson
 * 4. Verify - Check changes are saved
 * 5. Delete - Remove the lesson
 * 6. Verify - Check lesson is removed
 *
 * Prerequisites:
 * - Admin user with is_teacher=true: p.romanczuk@gmail.com / test123_admin
 * - Database has 8 lessons, 4 students
 *
 * @tags @teacher @lessons @crud
 */
// Test data with unique identifiers - shared across all tests in this suite
const timestamp = Date.now();
const testData = {
  title: `E2E Teacher Lesson ${timestamp}`,
  titleEdited: `E2E Teacher Lesson ${timestamp} EDITED`,
  notes: 'E2E Test lesson notes for teacher',
  notesEdited: 'E2E Test lesson notes EDITED',
};

test.describe.serial('Teacher Lesson CRUD', { tag: ['@teacher', '@lessons', '@crud'] }, () => {
  // Set viewport to desktop to avoid mobile-hidden elements
  test.beforeEach(async ({ page, loginAs }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAs('admin');
  });

  test('1. CREATE: should create a new lesson', async ({ page }) => {
    await page.goto('/dashboard/lessons/new');
    await page.waitForLoadState('networkidle');

    // Wait for form to be ready
    await page.waitForSelector('[data-testid="lesson-student_id"]', { timeout: 10000 });

    // Calculate tomorrow's date for scheduling
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 16);

    // Select student
    await page.locator('[data-testid="lesson-student_id"]').click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(500);

    // Select teacher
    await page.locator('[data-testid="lesson-teacher_id"]').click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(500);

    // Fill lesson details
    await page.locator('[data-testid="lesson-title"]').fill(testData.title);
    await page.locator('[data-testid="lesson-scheduled-at"]').fill(dateStr);
    await page.locator('[data-testid="lesson-notes"]').fill(testData.notes);

    // Submit the form
    const submitButton = page.locator('[data-testid="lesson-submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Should redirect to lessons list
    await expect(page).toHaveURL(/\/dashboard\/lessons(\?.*)?$/, { timeout: 15000 });
  });

  test('2. VERIFY CREATE: should find created lesson in list', async ({ page }) => {
    await page.goto('/dashboard/lessons');

    // Wait for desktop table to load
    await page.waitForSelector('[data-testid="lesson-table"]', { timeout: 10000 });

    // Look for the lesson title in the desktop table
    await expect(
      page.locator('[data-testid="lesson-table"] [data-testid="lesson-title-link"]', {
        hasText: testData.title,
      })
    ).toBeVisible({ timeout: 10000 });
  });

  // Fixed in BMS-44: Database column renamed + field filtering in prepareLessonForDb()
  test('3. EDIT: should update the lesson', async ({ page }) => {
    await page.goto('/dashboard/lessons');
    await page.waitForSelector('[data-testid="lesson-table"]', { timeout: 10000 });

    // Click on the lesson title link
    await page
      .locator('[data-testid="lesson-table"] [data-testid="lesson-title-link"]', {
        hasText: testData.title,
      })
      .click();
    await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 5000 });

    // Click edit button
    await page.locator('[data-testid="lesson-edit-button"], a[href*="/edit"]').first().click();
    await expect(page).toHaveURL(/\/edit$/, { timeout: 5000 });
    await page.waitForLoadState('networkidle');

    // Update the title and notes
    await page.locator('[data-testid="lesson-title"]').clear();
    await page.locator('[data-testid="lesson-title"]').fill(testData.titleEdited);
    await page.locator('[data-testid="lesson-notes"]').clear();
    await page.locator('[data-testid="lesson-notes"]').fill(testData.notesEdited);

    // Save
    const submitButton = page.locator('[data-testid="lesson-submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Should redirect to lesson detail page
    await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 15000 });
  });

  test('4. VERIFY EDIT: should find edited lesson in list', async ({ page }) => {
    await page.goto('/dashboard/lessons');

    // Wait for desktop table to load
    await page.waitForSelector('[data-testid="lesson-table"]', { timeout: 10000 });

    // Verify edited title appears in the desktop table
    await expect(
      page.locator('[data-testid="lesson-table"] [data-testid="lesson-title-link"]', {
        hasText: testData.titleEdited,
      })
    ).toBeVisible({ timeout: 10000 });
  });

  test('3. DELETE: should delete the lesson', async ({ page }) => {
    await page.goto('/dashboard/lessons');

    // Wait for table to load
    await page.waitForSelector('[data-testid="lesson-table"]', { timeout: 10000 });

    // Click on the lesson title link in the desktop table (using original title since edit is skipped)
    await page
      .locator('[data-testid="lesson-table"] [data-testid="lesson-title-link"]', {
        hasText: testData.title,
      })
      .click();
    await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 5000 });

    // Click delete button
    await page.locator('[data-testid="lesson-delete-button"]').click({ timeout: 5000 });

    // Confirm deletion if dialog appears
    const confirmButton = page.locator(
      '[data-testid="delete-confirm-button"], button:has-text("Confirm"), button:has-text("Delete")'
    );

    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.first().click();
    }

    // Should redirect to lessons list
    await expect(page).toHaveURL('/dashboard/lessons', { timeout: 10000 });
  });

  test('4. VERIFY DELETE: should not find deleted lesson in list', async ({ page }) => {
    await page.goto('/dashboard/lessons');

    // Wait for table to load
    await page.waitForSelector('[data-testid="lesson-table"], table', { timeout: 10000 });

    // Verify deleted lesson is not in the list (using original title)
    await expect(page.locator(`text=${testData.title}`)).not.toBeVisible();
  });
});
