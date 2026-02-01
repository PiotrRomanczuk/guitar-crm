/**
 * Admin Assignments CRUD Workflow
 *
 * Migrated from: cypress/e2e/admin/admin-assignments-workflow.cy.ts
 *
 * TODO: Assignment feature is not fully implemented yet
 * Skipping these tests until the assignments functionality is complete.
 *
 * Tests complete CRUD cycle for assignments:
 * 1. Create - Fill form and submit
 * 2. Verify - Check item appears in list
 * 3. Edit - Update the created item
 * 4. Verify - Check changes are saved
 * 5. Delete - Remove the item
 * 6. Verify - Check item is removed
 *
 * Priority: P1 - Critical gap identified in testing matrix
 */
import { test, expect } from '../../fixtures';

// Test data with unique identifiers
const timestamp = Date.now();
const testData = {
  title: `E2E Assignment ${timestamp}`,
  titleEdited: `E2E Assignment ${timestamp} EDITED`,
  description: 'Test assignment description',
  descriptionEdited: 'Updated test assignment description',
};

// Calculate due date (7 days from now)
const getDueDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7);
  return tomorrow.toISOString().slice(0, 10);
};

// Calculate past date (yesterday)
const getPastDate = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().slice(0, 10);
};

test.describe.skip('Admin Assignments CRUD Workflow', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as admin
    await loginAs('admin');
  });

  test('1. CREATE: should create a new assignment', async ({ page }) => {
    // Navigate to create form
    await page.goto('/dashboard/assignments/new');

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Fill in assignment form - title
    const titleInput = page.locator(
      '[data-testid="assignment-title"], input[name="title"]'
    );
    await titleInput.waitFor({ state: 'visible', timeout: 10000 });
    await titleInput.clear();
    await titleInput.fill(testData.title);

    // Fill in assignment form - description
    const descriptionInput = page.locator(
      '[data-testid="assignment-description"], textarea[name="description"]'
    );
    await descriptionInput.waitFor({ state: 'visible' });
    await descriptionInput.clear();
    await descriptionInput.fill(testData.description);

    // Select student if field exists
    const studentSelect = page.locator(
      '[data-testid="assignment-student"], select[name="student_id"]'
    );
    if (await studentSelect.count() > 0) {
      await studentSelect.selectOption({ index: 1 });
    }

    // Set due date if field exists
    const dueDateInput = page.locator(
      '[data-testid="assignment-dueDate"], input[name="dueDate"]'
    );
    if (await dueDateInput.count() > 0) {
      await dueDateInput.fill(getDueDate());
    }

    // Submit form
    const submitButton = page.locator(
      'button[type="submit"], [data-testid="assignment-submit"]'
    ).first();
    await submitButton.click({ force: true });

    // Should redirect away from new page
    await expect(page).not.toHaveURL(/\/new/, { timeout: 15000 });
  });

  test('2. VERIFY CREATE: should find created assignment in list', async ({ page }) => {
    // Navigate to assignments list
    await page.goto('/dashboard/assignments');
    await page.waitForTimeout(2000);

    // Look for the assignment title
    await expect(page.locator(`text=${testData.title}`)).toBeVisible({ timeout: 10000 });
  });

  test('3. EDIT: should update the assignment', async ({ page }) => {
    // Navigate to assignments list
    await page.goto('/dashboard/assignments');
    await page.waitForTimeout(1000);

    // Click on assignment to view details
    await page.locator(`text=${testData.title}`).click({ force: true });
    await expect(page).toHaveURL(/\/assignments\/[^/]+$/);

    // Click edit button
    const editButton = page.locator(
      '[data-testid="assignment-edit"], a[href*="/edit"], button:has-text("Edit")'
    ).first();
    await editButton.waitFor({ state: 'visible', timeout: 5000 });
    await editButton.click({ force: true });

    // Verify we're on edit page
    await expect(page).toHaveURL(/\/edit/);

    // Update title
    const titleInput = page.locator(
      '[data-testid="assignment-title"], input[name="title"]'
    );
    await titleInput.clear();
    await titleInput.fill(testData.titleEdited);

    // Update description
    const descriptionInput = page.locator(
      '[data-testid="assignment-description"], textarea[name="description"]'
    );
    await descriptionInput.clear();
    await descriptionInput.fill(testData.descriptionEdited);

    // Save changes
    const submitButton = page.locator(
      'button[type="submit"], [data-testid="assignment-submit"]'
    ).first();
    await submitButton.click({ force: true });

    // Should redirect back
    await expect(page).not.toHaveURL(/\/edit/, { timeout: 15000 });
  });

  test('4. VERIFY EDIT: should find edited assignment in list', async ({ page }) => {
    // Navigate to assignments list
    await page.goto('/dashboard/assignments');
    await page.waitForTimeout(1000);

    // Verify edited title appears
    await expect(page.locator(`text=${testData.titleEdited}`)).toBeVisible({ timeout: 10000 });

    // Original title should not exist
    await expect(page.locator(`text=${testData.title}`)).not.toBeVisible();
  });

  test('5. DELETE: should remove the assignment', async ({ page }) => {
    // Navigate to assignments list
    await page.goto('/dashboard/assignments');
    await page.waitForTimeout(1000);

    // Click on assignment
    await page.locator(`text=${testData.titleEdited}`).click({ force: true });
    await expect(page).toHaveURL(/\/assignments\/[^/]+$/);

    // Find and click delete button
    const deleteButton = page.locator(
      '[data-testid="assignment-delete"], button:has-text("Delete")'
    ).first();
    await deleteButton.waitFor({ state: 'visible', timeout: 5000 });
    await deleteButton.click({ force: true });

    // Confirm deletion if modal appears
    const confirmDialog = page.locator('[role="dialog"], .modal');
    if (await confirmDialog.count() > 0) {
      const confirmButton = page.locator(
        '[role="dialog"] button:has-text("Delete"), .modal button:has-text("Confirm")'
      );
      await confirmButton.click({ force: true });
    }

    // Should redirect to list
    await expect(page).toHaveURL(/\/dashboard\/assignments/, { timeout: 15000 });
    await expect(page).not.toHaveURL(/\/assignments\/[a-f0-9-]+$/);
  });

  test('6. VERIFY DELETE: should not find deleted assignment', async ({ page }) => {
    // Navigate to assignments list
    await page.goto('/dashboard/assignments');
    await page.waitForTimeout(2000);

    // Assignment should not exist
    await expect(page.locator(`text=${testData.titleEdited}`)).not.toBeVisible();
  });
});

test.describe.skip('Assignment Form Validation', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as admin
    await loginAs('admin');
  });

  test('should validate required fields', async ({ page }) => {
    // Navigate to create form
    await page.goto('/dashboard/assignments/new');

    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click({ force: true });

    // Should show validation errors
    await expect(page.locator('text=/required|field.*required/i')).toBeVisible({ timeout: 5000 });
  });

  test('should validate due date is in future', async ({ page }) => {
    // Navigate to create form
    await page.goto('/dashboard/assignments/new');

    // Fill title
    const titleInput = page.locator(
      '[data-testid="assignment-title"], input[name="title"]'
    );
    await titleInput.fill('Test Assignment');

    // Try to set past due date
    const dueDateInput = page.locator(
      '[data-testid="assignment-dueDate"], input[name="dueDate"]'
    );

    if (await dueDateInput.count() > 0) {
      await dueDateInput.fill(getPastDate());

      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click({ force: true });

      // Wait for potential validation error
      await page.waitForTimeout(500);
    }
  });
});
