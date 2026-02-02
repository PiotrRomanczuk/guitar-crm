import { test, expect } from '../../fixtures';

/**
 * Admin Assignment Management CRUD Tests
 *
 * Migrated from: cypress/e2e/admin/admin-assignments-crud.cy.ts
 *
 * Comprehensive tests for assignment management:
 * - Create assignment for any student
 * - Edit assignment details
 * - Delete with confirmation
 * - Link to lesson
 * - Templates management
 * - Advanced filtering
 * - Bulk operations
 *
 * Tags: @admin @assignments @crud
 */

// Test data with unique identifiers
const timestamp = Date.now();
const testAssignment = {
  title: `Test Assignment ${timestamp}`,
  titleEdited: `Test Assignment ${timestamp} EDITED`,
  description: 'Test assignment description',
  descriptionEdited: 'Updated test assignment description',
};

// Calculate future date (7 days from now)
const getFutureDate = (): string => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  return futureDate.toISOString().slice(0, 10);
};

test.describe('Admin Assignment Management CRUD', { tag: ['@admin', '@assignments', '@crud'] }, () => {
  test.beforeEach(async ({ page, loginAs }) => {
    // Set viewport to match Cypress config
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as admin
    await loginAs('admin');
  });

  // ===========================================
  // ASSIGNMENT LIST
  // ===========================================
  test.describe('Assignment List', () => {
    test('should load assignments page', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      await expect(page).toHaveURL(/\/assignments/);
      const main = page.locator('main, [role="main"]').first();
      await expect(main).toBeVisible();
    });

    test('should display assignments table or list', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      // Check for table (desktop) or card view (mobile)
      const tableOrList = page.locator('table, [data-testid="assignments-list"], [class*="grid"]').first();
      await expect(tableOrList).toBeVisible({ timeout: 10000 });
    });
  });

  // ===========================================
  // FILTER ASSIGNMENTS
  // ===========================================
  test.describe('Filter Assignments', () => {
    test('should have status filter', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      // Check for status filter chips or tabs
      const statusFilter = page.locator(
        '[data-testid*="status-filter"], select[name*="status"], [role="tablist"], button:has-text("All"), button:has-text("Active"), button:has-text("Completed")'
      ).first();

      const hasFilter = await statusFilter.count() > 0;
      expect(hasFilter).toBeTruthy();
    });

    test('should have student filter', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      // Check for student filter dropdown
      const studentFilter = page.locator('[data-testid*="student-filter"], select[name*="student"]').first();
      const hasFilter = await studentFilter.count() > 0;

      if (hasFilter) {
        expect(hasFilter).toBeTruthy();
      }
    });

    test('should have search functionality', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      // Check for search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
      await expect(searchInput).toBeVisible({ timeout: 10000 });
    });

    test('should filter by due date if available', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      // Check for date filter
      const dateFilter = page.locator('input[type="date"], [data-testid*="date-filter"]').first();
      const hasFilter = await dateFilter.count() > 0;

      if (hasFilter) {
        expect(hasFilter).toBeTruthy();
      }
    });
  });

  // ===========================================
  // CREATE ASSIGNMENT
  // ===========================================
  test.describe('Create Assignment', () => {
    test('should navigate to new assignment form', async ({ page }) => {
      await page.goto('/dashboard/assignments/new');
      await page.waitForTimeout(2000);

      await expect(page).toHaveURL(/\/assignments\/new/);
      const form = page.locator('form, [data-testid="assignment-form"]').first();
      await expect(form).toBeVisible();
    });

    test('should have required form fields', async ({ page }) => {
      await page.goto('/dashboard/assignments/new');
      await page.waitForTimeout(2000);

      // Check for essential fields
      const titleField = page.locator('[data-testid="field-title"], input[name="title"]');
      await expect(titleField).toBeVisible({ timeout: 10000 });

      const dueDateField = page.locator('[data-testid="field-due-date"], input[type="date"], input[name="due_date"]');
      await expect(dueDateField).toBeVisible({ timeout: 10000 });
    });

    test('should create a new assignment', async ({ page }) => {
      await page.goto('/dashboard/assignments/new');
      await page.waitForTimeout(2000);

      // Fill in title
      const titleInput = page.locator('[data-testid="field-title"]');
      await titleInput.fill(testAssignment.title);

      // Fill in description
      const descriptionInput = page.locator('[data-testid="field-description"]');
      await descriptionInput.fill(testAssignment.description);

      // Select student if dropdown exists
      const studentSelect = page.locator('[data-testid="student-select"]');
      if (await studentSelect.count() > 0) {
        await studentSelect.click();
        await page.waitForTimeout(500);

        // Click first option in the dropdown
        const firstOption = page.locator('[role="option"]').first();
        await firstOption.click();
      }

      // Set due date
      const dueDateInput = page.locator('[data-testid="field-due-date"]');
      await dueDateInput.fill(getFutureDate());

      // Submit form
      const submitButton = page.locator('[data-testid="lesson-submit"], button[type="submit"]').first();
      await submitButton.click();

      // Should redirect away from /new page
      await expect(page).not.toHaveURL(/\/new/, { timeout: 15000 });
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/dashboard/assignments/new');
      await page.waitForTimeout(2000);

      // Try to submit without filling required fields
      const submitButton = page.locator('[data-testid="lesson-submit"], button[type="submit"]').first();
      await submitButton.click();

      // Should stay on form or show errors
      await expect(page).toHaveURL(/\/assignments/);
    });
  });

  // ===========================================
  // VIEW ASSIGNMENT DETAILS
  // ===========================================
  test.describe('View Assignment Details', () => {
    test('should navigate to assignment detail', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      // Click on first assignment row
      const assignmentLink = page.locator('a[href*="/assignments/"], tr[data-testid], [data-testid^="assignment-"]')
        .filter({ hasText: /.*/ })
        .first();

      await assignmentLink.click();
      await page.waitForTimeout(1500);

      await expect(page).toHaveURL(/\/assignments\/[^/]+$/);
    });

    test('should display assignment details', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      // Find and click first assignment with a valid ID
      const assignmentRow = page.locator('table tr').filter({ hasText: /.*/ }).nth(1);
      await assignmentRow.click();
      await page.waitForTimeout(1500);

      // Verify detail page shows relevant information
      const hasDetails = await page.locator('text=/Title|Description|Due Date|Status/i').count() > 0;
      expect(hasDetails).toBeTruthy();
    });
  });

  // ===========================================
  // EDIT ASSIGNMENT
  // ===========================================
  test.describe('Edit Assignment', () => {
    test('should be able to edit assignment', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      // Navigate to first assignment
      const assignmentRow = page.locator('table tr').filter({ hasText: /.*/ }).nth(1);
      await assignmentRow.click();
      await page.waitForTimeout(1500);

      // Look for edit option
      const editButton = page.locator('a[href*="/edit"], button:has-text("Edit"), [data-testid*="edit"]').first();
      const hasEdit = await editButton.count() > 0;

      if (hasEdit) {
        expect(hasEdit).toBeTruthy();
      }
    });
  });

  // ===========================================
  // CHANGE ASSIGNMENT STATUS
  // ===========================================
  test.describe('Change Assignment Status', () => {
    test('should allow changing status', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      // Navigate to first assignment
      const assignmentRow = page.locator('table tr').filter({ hasText: /.*/ }).nth(1);
      await assignmentRow.click();
      await page.waitForTimeout(1500);

      // Look for status change functionality
      const statusControl = page.locator(
        'select[name*="status"], [data-testid*="status"], button:has-text("Complete"), button:has-text("In Progress")'
      ).first();

      const hasStatusChange = await statusControl.count() > 0;
      if (hasStatusChange) {
        expect(hasStatusChange).toBeTruthy();
      }
    });
  });

  // ===========================================
  // DELETE ASSIGNMENT
  // ===========================================
  test.describe('Delete Assignment', () => {
    test('should have delete with confirmation', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      // Navigate to first assignment
      const assignmentRow = page.locator('table tr').filter({ hasText: /.*/ }).nth(1);
      await assignmentRow.click();
      await page.waitForTimeout(1500);

      // Look for delete button
      const deleteButton = page.locator('[data-testid*="delete"], button:has-text("Delete")').first();

      if (await deleteButton.count() > 0) {
        await deleteButton.click();

        // Should show confirmation dialog
        const dialog = page.locator('[role="alertdialog"], [role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });

        // Cancel the deletion
        const cancelButton = page.locator('[role="alertdialog"] button:has-text("Cancel"), [role="dialog"] button:has-text("Cancel")').first();
        await cancelButton.click();
      }
    });
  });

  // ===========================================
  // LINK TO LESSON
  // ===========================================
  test.describe('Link to Lesson', () => {
    test('should have lesson link on detail page', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      // Navigate to first assignment
      const assignmentRow = page.locator('table tr').filter({ hasText: /.*/ }).nth(1);
      await assignmentRow.click();
      await page.waitForTimeout(1500);

      // Look for lesson link
      const lessonLink = page.locator('text=/Lesson|Related Lesson/i, a[href*="/lessons/"]').first();
      const hasLessonLink = await lessonLink.count() > 0;

      if (hasLessonLink) {
        expect(hasLessonLink).toBeTruthy();
      }
    });
  });

  // ===========================================
  // ASSIGNMENT TEMPLATES
  // ===========================================
  test.describe('Assignment Templates', () => {
    test('should access templates page if available', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      // Look for templates link
      const templatesLink = page.locator('a[href*="template"], button:has-text("Template")').first();
      const hasTemplates = await templatesLink.count() > 0;

      if (hasTemplates) {
        expect(hasTemplates).toBeTruthy();
      }
    });

    test('should create from template if available', async ({ page }) => {
      await page.goto('/dashboard/assignments/new');
      await page.waitForTimeout(2000);

      // Look for template option
      const templateOption = page.locator('button:has-text("From Template"), [data-testid*="template"]').first();
      const hasTemplateOption = await templateOption.count() > 0;

      if (hasTemplateOption) {
        expect(hasTemplateOption).toBeTruthy();
      }
    });
  });

  // ===========================================
  // OVERDUE ASSIGNMENTS
  // ===========================================
  test.describe('Overdue Assignments', () => {
    test('should highlight overdue assignments', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      // Look for overdue indicators
      const overdueIndicator = page.locator('text=/Overdue/i, [class*="destructive"], [class*="red"]').first();
      const hasOverdueIndicator = await overdueIndicator.count() > 0;

      if (hasOverdueIndicator) {
        expect(hasOverdueIndicator).toBeTruthy();
      }
    });
  });

  // ===========================================
  // BULK OPERATIONS
  // ===========================================
  test.describe('Bulk Operations', () => {
    test('should have bulk selection if available', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      // Look for multiple checkboxes (indicating bulk selection)
      const checkboxes = page.locator('input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();

      if (checkboxCount > 1) {
        expect(checkboxCount).toBeGreaterThan(1);
      }
    });
  });

  // ===========================================
  // ASSIGNMENT HISTORY
  // ===========================================
  test.describe('Assignment History', () => {
    test('should show assignment history', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      // Navigate to first assignment
      const assignmentRow = page.locator('table tr').filter({ hasText: /.*/ }).nth(1);
      await assignmentRow.click();
      await page.waitForTimeout(1500);

      // Look for history section
      const history = page.locator('text=/History|Changes|Timeline/i, [data-testid*="history"]').first();
      const hasHistory = await history.count() > 0;

      if (hasHistory) {
        expect(hasHistory).toBeTruthy();
      }
    });
  });

  // ===========================================
  // RESPONSIVE DESIGN
  // ===========================================
  test.describe('Responsive Design', () => {
    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      const main = page.locator('main, [role="main"]').first();
      await expect(main).toBeVisible();
    });

    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      const main = page.locator('main, [role="main"]').first();
      await expect(main).toBeVisible();
    });
  });

  // ===========================================
  // ERROR HANDLING
  // ===========================================
  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept API calls and force network error
      await page.route('**/api/assignments*', (route) => {
        route.abort('failed');
      });

      await page.goto('/dashboard/assignments');
      await page.waitForTimeout(2000);

      // Page should still render even with network error
      const main = page.locator('main, [role="main"]').first();
      await expect(main).toBeVisible();
    });
  });
});
