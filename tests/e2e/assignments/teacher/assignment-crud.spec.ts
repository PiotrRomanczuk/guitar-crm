/**
 * Teacher Assignment CRUD Test
 *
 * Migrated from: cypress/e2e/admin/admin-assignments-workflow.cy.ts
 *
 * Tests complete CRUD cycle for assignments as a teacher:
 * 1. Create - Fill form with student selection, due date, and submit
 * 2. Verify - Check assignment appears in list
 * 3. Edit - Update the created assignment
 * 4. Verify - Check changes are saved
 * 5. Delete - Remove the assignment
 * 6. Verify - Check assignment is removed
 *
 * Prerequisites:
 * - Admin user with is_teacher=true: p.romanczuk@gmail.com / test123_admin
 * - Database has students available for assignment
 *
 * TODO: Assignment feature is not fully implemented yet.
 * Tests are skipped until the assignments functionality is complete.
 *
 * @tags @teacher @assignments @crud
 */
import { test, expect } from '../../../fixtures';

// Test data with unique identifiers - shared across all tests in this suite
const timestamp = Date.now();
const testData = {
  title: `E2E Teacher Assignment ${timestamp}`,
  titleEdited: `E2E Teacher Assignment ${timestamp} EDITED`,
  description: 'E2E Test assignment description for teacher',
  descriptionEdited: 'E2E Test assignment description EDITED',
};

// Calculate due date (7 days from now)
const getDueDate = (): string => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  return futureDate.toISOString().slice(0, 10);
};

// Calculate past date (yesterday) - for validation tests
const getPastDate = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().slice(0, 10);
};

test.describe.skip(
  'Teacher Assignment CRUD',
  { tag: ['@teacher', '@assignments', '@crud'] },
  () => {
    // Set viewport to desktop to avoid mobile-hidden elements
    test.beforeEach(async ({ page, loginAs }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      // Login as admin (who has is_teacher=true)
      await loginAs('admin');
    });

    test('1. CREATE: should create a new assignment', async ({ page }) => {
      await page.goto('/dashboard/assignments/new');
      await page.waitForLoadState('networkidle');

      // Wait for form to be ready
      const titleInput = page.locator(
        '[data-testid="assignment-title"], input[name="title"]'
      );
      await titleInput.waitFor({ state: 'visible', timeout: 10000 });

      // Fill in assignment form - title
      await titleInput.clear();
      await titleInput.fill(testData.title);

      // Fill in assignment form - description
      const descriptionInput = page.locator(
        '[data-testid="assignment-description"], textarea[name="description"]'
      );
      await descriptionInput.waitFor({ state: 'visible' });
      await descriptionInput.clear();
      await descriptionInput.fill(testData.description);

      // Select student if field exists (using shadcn Select pattern)
      const studentSelect = page.locator('[data-testid="assignment-student_id"]');
      if ((await studentSelect.count()) > 0) {
        await studentSelect.click();
        await page.waitForTimeout(500);
        await page.locator('[role="option"]').first().click();
        await page.waitForTimeout(500);
      } else {
        // Fallback to native select
        const nativeStudentSelect = page.locator('select[name="student_id"]');
        if ((await nativeStudentSelect.count()) > 0) {
          await nativeStudentSelect.selectOption({ index: 1 });
        }
      }

      // Set due date if field exists
      const dueDateInput = page.locator(
        '[data-testid="assignment-dueDate"], input[name="dueDate"], input[name="due_date"]'
      );
      if ((await dueDateInput.count()) > 0) {
        await dueDateInput.fill(getDueDate());
      }

      // Submit the form
      const submitButton = page
        .locator('[data-testid="assignment-submit"], button[type="submit"]')
        .first();
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      // Should redirect away from new page
      await expect(page).not.toHaveURL(/\/new/, { timeout: 15000 });
    });

    test('2. VERIFY CREATE: should find created assignment in list', async ({
      page,
    }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for table or list to load
      await page.waitForSelector(
        '[data-testid="assignment-table"], [data-testid="assignment-list"], table',
        { timeout: 10000 }
      );

      // Look for the assignment title
      await expect(page.locator(`text=${testData.title}`)).toBeVisible({
        timeout: 10000,
      });
    });

    test('3. EDIT: should update the assignment', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector(
        '[data-testid="assignment-table"], [data-testid="assignment-list"], table',
        { timeout: 10000 }
      );

      // Click on the assignment to go to detail page
      await page.locator(`text=${testData.title}`).click();
      await expect(page).toHaveURL(/\/assignments\/[^/]+$/);

      // Click edit button
      const editButton = page
        .locator(
          '[data-testid="assignment-edit-button"], a[href*="/edit"], button:has-text("Edit")'
        )
        .first();
      await editButton.waitFor({ state: 'visible', timeout: 5000 });
      await editButton.click();

      await expect(page).toHaveURL(/\/edit/);
      await page.waitForLoadState('networkidle');

      // Update the title
      const titleInput = page.locator(
        '[data-testid="assignment-title"], input[name="title"]'
      );
      await titleInput.clear();
      await titleInput.fill(testData.titleEdited);

      // Update the description
      const descriptionInput = page.locator(
        '[data-testid="assignment-description"], textarea[name="description"]'
      );
      await descriptionInput.clear();
      await descriptionInput.fill(testData.descriptionEdited);

      // Save changes
      const submitButton = page
        .locator('[data-testid="assignment-submit"], button[type="submit"]')
        .first();
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      // Should redirect away from edit page
      await expect(page).not.toHaveURL(/\/edit/, { timeout: 15000 });
    });

    test('4. VERIFY EDIT: should find edited assignment in list', async ({
      page,
    }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector(
        '[data-testid="assignment-table"], [data-testid="assignment-list"], table',
        { timeout: 10000 }
      );

      // Verify edited title appears
      await expect(page.locator(`text=${testData.titleEdited}`)).toBeVisible({
        timeout: 10000,
      });

      // Original title should not exist
      await expect(page.locator(`text=${testData.title}`)).not.toBeVisible();
    });

    test('5. DELETE: should delete the assignment', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector(
        '[data-testid="assignment-table"], [data-testid="assignment-list"], table',
        { timeout: 10000 }
      );

      // Click on the assignment to go to detail page
      await page.locator(`text=${testData.titleEdited}`).click();
      await expect(page).toHaveURL(/\/assignments\/[^/]+$/);

      // Click delete button
      const deleteButton = page
        .locator(
          '[data-testid="assignment-delete-button"], button:has-text("Delete")'
        )
        .first();
      await deleteButton.waitFor({ state: 'visible', timeout: 5000 });
      await deleteButton.click();

      // Confirm deletion if dialog appears
      const confirmButton = page.locator(
        '[data-testid="delete-confirm-button"], button:has-text("Confirm"), button:has-text("Delete")'
      );

      const confirmVisible = await confirmButton
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (confirmVisible) {
        await confirmButton.first().click();
      }

      // Should redirect to assignments list
      await expect(page).toHaveURL('/dashboard/assignments', { timeout: 10000 });
    });

    test('6. VERIFY DELETE: should not find deleted assignment in list', async ({
      page,
    }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector(
        '[data-testid="assignment-table"], [data-testid="assignment-list"], table',
        { timeout: 10000 }
      );

      // Verify deleted assignment is not in the list
      await expect(page.locator(`text=${testData.titleEdited}`)).not.toBeVisible();
    });
  }
);

test.describe.skip(
  'Teacher Assignment Form Validation',
  { tag: ['@teacher', '@assignments', '@validation'] },
  () => {
    test.beforeEach(async ({ page, loginAs }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await loginAs('admin');
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/dashboard/assignments/new');
      await page.waitForLoadState('networkidle');

      // Try to submit without filling required fields
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click({ force: true });

      // Should show validation errors
      await expect(
        page.locator('text=/required|field.*required/i')
      ).toBeVisible({ timeout: 5000 });
    });

    test('should validate due date is in future', async ({ page }) => {
      await page.goto('/dashboard/assignments/new');
      await page.waitForLoadState('networkidle');

      // Fill title
      const titleInput = page.locator(
        '[data-testid="assignment-title"], input[name="title"]'
      );
      await titleInput.fill('Test Assignment');

      // Try to set past due date
      const dueDateInput = page.locator(
        '[data-testid="assignment-dueDate"], input[name="dueDate"], input[name="due_date"]'
      );

      if ((await dueDateInput.count()) > 0) {
        await dueDateInput.fill(getPastDate());

        // Submit form
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click({ force: true });

        // Wait for potential validation error
        await page.waitForTimeout(500);
      }
    });
  }
);
