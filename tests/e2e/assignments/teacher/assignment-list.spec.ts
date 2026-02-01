/**
 * Teacher Assignment List Test
 *
 * Migrated from: cypress/e2e/admin/admin-assignments-workflow.cy.ts (list portions)
 *
 * Tests assignment list functionality for teachers:
 * 1. List rendering - Verify assignments table/cards display correctly
 * 2. Search - Search assignments by keyword
 * 3. Filter by status - Filter assignments by status (not_started, in_progress, completed, etc.)
 * 4. Filter by student - Filter assignments by student
 * 5. Combined filters - Apply multiple filters together
 * 6. Clear filters - Reset all filters
 * 7. Navigation - Navigate to detail and create pages
 *
 * Prerequisites:
 * - Admin user with is_teacher=true: p.romanczuk@gmail.com / test123_admin
 * - Database has assignments and students available
 *
 * @tags @teacher @assignments @list @search @filter
 */
import { test, expect } from '../../../fixtures';

test.describe(
  'Teacher Assignment List',
  { tag: ['@teacher', '@assignments', '@list'] },
  () => {
    // Set viewport to desktop to avoid mobile-hidden elements
    test.beforeEach(async ({ page, loginAs }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      // Login as admin (who has is_teacher=true)
      await loginAs('admin');
    });

    test.describe('List Rendering', () => {
      test('should display assignments list page with header', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Verify we're on the assignments page
        await expect(page).toHaveURL(/\/dashboard\/assignments/);

        // Verify header is displayed
        await expect(page.locator('h1:has-text("Assignments")')).toBeVisible();
        await expect(
          page.locator('text=Manage student assignments and tasks')
        ).toBeVisible();
      });

      test('should display filter controls for teachers', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Verify search input exists
        const searchInput = page.locator('input[placeholder*="Search"]');
        await expect(searchInput).toBeVisible();
        await expect(searchInput).toBeEnabled();

        // Verify status filter exists
        const statusFilter = page.locator('text=Status').locator('..').locator('button');
        await expect(statusFilter.first()).toBeVisible();

        // Verify student filter exists for teachers
        const studentFilter = page.locator('text=Student').locator('..').locator('button');
        await expect(studentFilter.first()).toBeVisible();

        // Verify reset button exists
        const resetButton = page.locator('button:has-text("Reset Filters")');
        await expect(resetButton).toBeVisible();
      });

      test('should display "New Assignment" button for teachers', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Verify "New Assignment" button is visible
        const newButton = page.locator('a:has-text("New Assignment")');
        await expect(newButton).toBeVisible();
        await expect(newButton).toHaveAttribute('href', '/dashboard/assignments/new');
      });

      test('should display "Templates" button for teachers', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Verify "Templates" button is visible
        const templatesButton = page.locator('a:has-text("Templates")');
        await expect(templatesButton).toBeVisible();
        await expect(templatesButton).toHaveAttribute(
          'href',
          '/dashboard/assignments/templates'
        );
      });

      test('should display table or empty state', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Wait for loading to complete
        await page.waitForTimeout(1000);

        // Either table with assignments or empty state should be visible
        const table = page.locator('table');
        const emptyState = page.locator('text=No assignments yet');

        const hasTable = await table.isVisible().catch(() => false);
        const hasEmptyState = await emptyState.isVisible().catch(() => false);

        expect(hasTable || hasEmptyState).toBeTruthy();
      });

      test('should display table headers on desktop', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Check if table is visible (might be empty state instead)
        const table = page.locator('table');
        const hasTable = await table.isVisible().catch(() => false);

        if (hasTable) {
          // Verify table headers
          await expect(page.locator('th:has-text("Title")')).toBeVisible();
          await expect(page.locator('th:has-text("Student")')).toBeVisible();
          await expect(page.locator('th:has-text("Due Date")')).toBeVisible();
          await expect(page.locator('th:has-text("Status")')).toBeVisible();
        }
      });
    });

    test.describe('Search Functionality', () => {
      test('should search assignments by keyword', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const searchInput = page.locator('input[placeholder*="Search"]');
        await expect(searchInput).toBeVisible({ timeout: 10000 });

        // Type search term
        await searchInput.fill('practice');
        await page.waitForTimeout(500); // Wait for debounce

        // URL should contain search parameter
        await expect(page).toHaveURL(/search=practice/);
      });

      test('should clear search when input is cleared', async ({ page }) => {
        await page.goto('/dashboard/assignments?search=test');
        await page.waitForLoadState('networkidle');

        const searchInput = page.locator('input[placeholder*="Search"]');
        await expect(searchInput).toBeVisible({ timeout: 10000 });

        // Verify search param is in URL
        await expect(page).toHaveURL(/search=test/);

        // Clear search input
        await searchInput.clear();
        await page.waitForTimeout(500); // Wait for debounce

        // URL should no longer contain search parameter
        await expect(page).not.toHaveURL(/search=/);
      });

      test('should show empty state for non-matching search', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill('xyz123nonexistent456');
        await page.waitForTimeout(500);

        // Wait for results to update
        await page.waitForTimeout(1000);

        // Should show empty state or no results
        const hasEmptyState = await page
          .locator('text=/no assignments/i')
          .isVisible()
          .catch(() => false);
        const hasNoResults = await page
          .locator('text=/no results/i')
          .isVisible()
          .catch(() => false);
        const hasTableEmpty = await page
          .locator('table tbody tr')
          .count()
          .then((count) => count === 0)
          .catch(() => true);

        expect(hasEmptyState || hasNoResults || hasTableEmpty).toBeTruthy();
      });
    });

    test.describe('Status Filter', () => {
      test('should filter assignments by status - Not Started', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Find and click the status filter trigger
        const statusLabel = page.locator('text=Status').locator('..');
        const statusTrigger = statusLabel.locator('button').first();
        await statusTrigger.waitFor({ state: 'visible', timeout: 10000 });
        await statusTrigger.click();
        await page.waitForTimeout(300);

        // Select "Not Started" option
        await page.locator('[role="option"]:has-text("Not Started")').click();
        await page.waitForTimeout(500);

        // URL should contain status parameter
        await expect(page).toHaveURL(/status=not_started/);
      });

      test('should filter assignments by status - In Progress', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const statusLabel = page.locator('text=Status').locator('..');
        const statusTrigger = statusLabel.locator('button').first();
        await statusTrigger.click();
        await page.waitForTimeout(300);

        await page.locator('[role="option"]:has-text("In Progress")').click();
        await page.waitForTimeout(500);

        await expect(page).toHaveURL(/status=in_progress/);
      });

      test('should filter assignments by status - Completed', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const statusLabel = page.locator('text=Status').locator('..');
        const statusTrigger = statusLabel.locator('button').first();
        await statusTrigger.click();
        await page.waitForTimeout(300);

        await page.locator('[role="option"]:has-text("Completed")').click();
        await page.waitForTimeout(500);

        await expect(page).toHaveURL(/status=completed/);
      });

      test('should filter assignments by status - Overdue', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const statusLabel = page.locator('text=Status').locator('..');
        const statusTrigger = statusLabel.locator('button').first();
        await statusTrigger.click();
        await page.waitForTimeout(300);

        await page.locator('[role="option"]:has-text("Overdue")').click();
        await page.waitForTimeout(500);

        await expect(page).toHaveURL(/status=overdue/);
      });

      test('should clear status filter when "All Statuses" selected', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments?status=completed');
        await page.waitForLoadState('networkidle');

        const statusLabel = page.locator('text=Status').locator('..');
        const statusTrigger = statusLabel.locator('button').first();
        await statusTrigger.waitFor({ state: 'visible', timeout: 10000 });
        await statusTrigger.click();
        await page.waitForTimeout(300);

        await page.locator('[role="option"]:has-text("All Statuses")').click();
        await page.waitForTimeout(500);

        // URL should not contain status parameter
        await expect(page).not.toHaveURL(/status=/);
      });
    });

    test.describe('Student Filter', () => {
      test('should display student filter for teachers', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Verify student filter is visible (teachers can filter by student)
        const studentLabel = page.locator('text=Student').locator('..');
        const studentTrigger = studentLabel.locator('button').first();
        await expect(studentTrigger).toBeVisible();
      });

      test('should filter assignments by student', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Click to open student dropdown
        const studentLabel = page.locator('text=Student').locator('..');
        const studentTrigger = studentLabel.locator('button').first();
        await studentTrigger.waitFor({ state: 'visible', timeout: 10000 });
        await studentTrigger.click();
        await page.waitForTimeout(500); // Wait for students to load

        // Check if there are student options (besides "All Students")
        const studentOptions = page.locator(
          '[role="option"]:not(:has-text("All Students"))'
        );
        const studentCount = await studentOptions.count();

        if (studentCount > 0) {
          // Select first student option
          await studentOptions.first().click();
          await page.waitForTimeout(500);

          // URL should contain studentId parameter
          await expect(page).toHaveURL(/studentId=/);
        }
      });

      test('should clear student filter when "All Students" selected', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // First apply a student filter
        const studentLabel = page.locator('text=Student').locator('..');
        const studentTrigger = studentLabel.locator('button').first();
        await studentTrigger.click();
        await page.waitForTimeout(500);

        const studentOptions = page.locator(
          '[role="option"]:not(:has-text("All Students"))'
        );
        const studentCount = await studentOptions.count();

        if (studentCount > 0) {
          await studentOptions.first().click();
          await page.waitForTimeout(500);

          // Now clear the filter
          await studentTrigger.click();
          await page.waitForTimeout(300);
          await page.locator('[role="option"]:has-text("All Students")').click();
          await page.waitForTimeout(500);

          // URL should not contain studentId parameter
          await expect(page).not.toHaveURL(/studentId=/);
        }
      });
    });

    test.describe('Combined Filters', () => {
      test('should apply multiple filters together', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Apply search filter
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill('assignment');
        await page.waitForTimeout(500);

        // Apply status filter
        const statusLabel = page.locator('text=Status').locator('..');
        const statusTrigger = statusLabel.locator('button').first();
        await statusTrigger.click();
        await page.waitForTimeout(300);
        await page.locator('[role="option"]:has-text("Not Started")').click();
        await page.waitForTimeout(500);

        // URL should contain both parameters
        await expect(page).toHaveURL(/search=assignment/);
        await expect(page).toHaveURL(/status=not_started/);
      });

      test('should clear all filters with reset button', async ({ page }) => {
        // Navigate with filters applied
        await page.goto(
          '/dashboard/assignments?search=test&status=completed&studentId=some-id'
        );
        await page.waitForLoadState('networkidle');

        // Click reset button
        const resetButton = page.locator('button:has-text("Reset Filters")');
        await expect(resetButton).toBeVisible();
        await resetButton.click();
        await page.waitForTimeout(500);

        // URL should be clean (no filter params)
        await expect(page).not.toHaveURL(/search=/);
        await expect(page).not.toHaveURL(/status=/);
        await expect(page).not.toHaveURL(/studentId=/);
      });
    });

    test.describe('Filter State Persistence', () => {
      test('should maintain filters on page refresh', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Apply status filter
        const statusLabel = page.locator('text=Status').locator('..');
        const statusTrigger = statusLabel.locator('button').first();
        await statusTrigger.waitFor({ state: 'visible', timeout: 10000 });
        await statusTrigger.click();
        await page.waitForTimeout(300);
        await page.locator('[role="option"]:has-text("Completed")').click();
        await page.waitForTimeout(500);

        // Verify URL contains status param
        await expect(page).toHaveURL(/status=completed/);

        // Refresh the page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Verify URL still contains status param
        await expect(page).toHaveURL(/status=completed/);
      });

      test('should load with filters from URL params', async ({ page }) => {
        // Navigate directly with filters in URL
        await page.goto('/dashboard/assignments?status=in_progress&search=task');
        await page.waitForLoadState('networkidle');

        // Verify search input has the value from URL
        const searchInput = page.locator('input[placeholder*="Search"]');
        await expect(searchInput).toHaveValue('task');
      });
    });

    test.describe('Navigation', () => {
      test('should navigate to assignment detail when clicking on assignment', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Wait for table to load
        const table = page.locator('table');
        const hasTable = await table.isVisible().catch(() => false);

        if (hasTable) {
          // Check if there are any assignment rows
          const assignmentRows = page.locator('table tbody tr');
          const rowCount = await assignmentRows.count();

          if (rowCount > 0) {
            // Click on the first assignment row
            await assignmentRows.first().click();

            // Should navigate to assignment detail page
            await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
          }
        }
      });

      test('should navigate to create new assignment page', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Click "New Assignment" button
        const newButton = page.locator('a:has-text("New Assignment")');
        await newButton.click();

        // Should navigate to new assignment page
        await expect(page).toHaveURL('/dashboard/assignments/new');
      });

      test('should navigate to templates page', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Click "Templates" button
        const templatesButton = page.locator('a:has-text("Templates")');
        await templatesButton.click();

        // Should navigate to templates page
        await expect(page).toHaveURL('/dashboard/assignments/templates');
      });
    });

    test.describe('Mobile View', () => {
      test.beforeEach(async ({ page }) => {
        // Set viewport to mobile size
        await page.setViewportSize({ width: 375, height: 667 });
      });

      test('should display card view on mobile', async ({ page, loginAs }) => {
        await loginAs('admin');
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Wait for content to load
        await page.waitForTimeout(1000);

        // On mobile, table should be hidden
        const table = page.locator('.hidden.md\\:block table');
        await expect(table).not.toBeVisible();

        // Mobile cards should be visible (if there are assignments)
        const mobileCards = page.locator('.md\\:hidden');
        const hasMobileCards = await mobileCards.isVisible().catch(() => false);

        // Either mobile cards or empty state should be visible
        const emptyState = page.locator('text=No assignments yet');
        const hasEmptyState = await emptyState.isVisible().catch(() => false);

        expect(hasMobileCards || hasEmptyState).toBeTruthy();
      });

      test('should display filters on mobile', async ({ page, loginAs }) => {
        await loginAs('admin');
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Verify search input is visible on mobile
        const searchInput = page.locator('input[placeholder*="Search"]');
        await expect(searchInput).toBeVisible();

        // Verify reset button is visible on mobile
        const resetButton = page.locator('button:has-text("Reset Filters")');
        await expect(resetButton).toBeVisible();
      });
    });
  }
);
