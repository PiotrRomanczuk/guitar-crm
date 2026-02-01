/**
 * Teacher Lesson List Test
 *
 * Migrated from: cypress/e2e/integration/lesson-search-filter.cy.ts
 *
 * Tests lesson list functionality for teachers:
 * 1. List rendering - Verify lessons table displays correctly
 * 2. Search - Search lessons by keyword
 * 3. Filter by status - Filter lessons by status (scheduled, completed, etc.)
 * 4. Filter by student - Filter lessons by student
 * 5. Combined filters - Apply multiple filters
 * 6. Clear filters - Reset all filters
 *
 * Prerequisites:
 * - Admin user with is_teacher=true: p.romanczuk@gmail.com / test123_admin
 * - Database has lessons and students available
 *
 * @tags @teacher @lessons @list @search @filter
 */
import { test, expect } from '../../../fixtures';

test.describe('Teacher Lesson List', { tag: ['@teacher', '@lessons', '@list'] }, () => {
  test.beforeEach(async ({ page, loginAs }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as admin (who has is_teacher=true)
    await loginAs('admin');
  });

  test.describe('List Rendering', () => {
    test('should display lessons table', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Verify table is visible
      await expect(page.locator('[data-testid="lesson-table"]')).toBeVisible();
    });

    test('should display lessons filters section', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for filters section to load
      await page.waitForSelector('[data-testid="lessons-filters"]', {
        state: 'visible',
        timeout: 10000,
      });

      // Verify filters section is visible
      await expect(page.locator('[data-testid="lessons-filters"]')).toBeVisible();
    });

    test('should display lesson table headers', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"]', {
        state: 'visible',
        timeout: 10000,
      });

      // Verify table headers
      await expect(page.locator('th:has-text("Title")')).toBeVisible();
      await expect(page.locator('th:has-text("Student")')).toBeVisible();
      await expect(page.locator('th:has-text("Date")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
    });
  });

  test.describe('Search Functionality', () => {
    test('should search lessons by keyword', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for search input to be visible
      const searchInput = page.locator('#search-filter');
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });

      // Type search term
      await searchInput.fill('guitar');
      await page.waitForTimeout(500); // Wait for debounce

      // Verify URL contains search param
      await expect(page).toHaveURL(/search=guitar/);
    });

    test('should clear search when input is cleared', async ({ page }) => {
      await page.goto('/dashboard/lessons?search=test');
      await page.waitForLoadState('networkidle');

      // Wait for search input to be visible
      const searchInput = page.locator('#search-filter');
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });

      // Verify search param is in URL
      await expect(page).toHaveURL(/search=test/);

      // Clear search input
      await searchInput.clear();
      await page.waitForTimeout(500); // Wait for debounce

      // Verify search param is removed from URL
      await expect(page).not.toHaveURL(/search=/);
    });

    test('should show empty state for non-matching search', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for search input to be visible
      const searchInput = page.locator('#search-filter');
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });

      // Type non-existent search term
      await searchInput.fill('xyz123nonexistent456');
      await page.waitForTimeout(500); // Wait for debounce

      // Wait for results to update
      await page.waitForTimeout(1000);

      // Check for empty state or no results
      const hasEmptyState = await page
        .locator('text=/no lessons/i')
        .isVisible()
        .catch(() => false);
      const hasNoResults = await page
        .locator('text=/no results/i')
        .isVisible()
        .catch(() => false);
      const hasTableEmpty = await page
        .locator('[data-testid="lesson-table"] tbody tr')
        .count()
        .then((count) => count === 0)
        .catch(() => true);

      // At least one indicator should show no results
      expect(hasEmptyState || hasNoResults || hasTableEmpty).toBeTruthy();
    });
  });

  test.describe('Status Filter', () => {
    test('should filter lessons by status', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for status filter to be visible
      const statusTrigger = page.locator('[data-testid="filter-status-trigger"]');
      await statusTrigger.waitFor({ state: 'visible', timeout: 10000 });

      // Click to open status dropdown
      await statusTrigger.click();
      await page.waitForTimeout(300);

      // Select "Scheduled" option
      await page.locator('[role="option"]:has-text("Scheduled")').click();
      await page.waitForTimeout(500);

      // Verify URL contains status param
      await expect(page).toHaveURL(/status=SCHEDULED/);
    });

    test('should clear status filter when "All Lessons" selected', async ({ page }) => {
      await page.goto('/dashboard/lessons?status=SCHEDULED');
      await page.waitForLoadState('networkidle');

      // Wait for status filter to be visible
      const statusTrigger = page.locator('[data-testid="filter-status-trigger"]');
      await statusTrigger.waitFor({ state: 'visible', timeout: 10000 });

      // Click to open status dropdown
      await statusTrigger.click();
      await page.waitForTimeout(300);

      // Select "All Lessons" option
      await page.locator('[role="option"]:has-text("All Lessons")').click();
      await page.waitForTimeout(500);

      // Verify status param is removed from URL
      await expect(page).not.toHaveURL(/status=/);
    });
  });

  test.describe('Student Filter', () => {
    test('should display student filter for teachers', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for student filter to be visible (teachers can filter by student)
      const studentTrigger = page.locator('[data-testid="filter-student-trigger"]');
      await studentTrigger.waitFor({ state: 'visible', timeout: 10000 });

      // Verify student filter is visible
      await expect(studentTrigger).toBeVisible();
    });

    test('should filter lessons by student', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for student filter to be visible
      const studentTrigger = page.locator('[data-testid="filter-student-trigger"]');
      await studentTrigger.waitFor({ state: 'visible', timeout: 10000 });

      // Click to open student dropdown
      await studentTrigger.click();
      await page.waitForTimeout(300);

      // Check if there are student options (besides "All Students")
      const studentOptions = page.locator('[role="option"]:not(:has-text("All Students"))');
      const studentCount = await studentOptions.count();

      if (studentCount > 0) {
        // Select first student option
        await studentOptions.first().click();
        await page.waitForTimeout(500);

        // Verify URL contains studentId param
        await expect(page).toHaveURL(/studentId=/);
      }
    });

    test('should clear student filter when "All Students" selected', async ({ page }) => {
      // First, navigate with a student filter already applied
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Apply a student filter first
      const studentTrigger = page.locator('[data-testid="filter-student-trigger"]');
      await studentTrigger.waitFor({ state: 'visible', timeout: 10000 });
      await studentTrigger.click();
      await page.waitForTimeout(300);

      const studentOptions = page.locator('[role="option"]:not(:has-text("All Students"))');
      const studentCount = await studentOptions.count();

      if (studentCount > 0) {
        await studentOptions.first().click();
        await page.waitForTimeout(500);

        // Now clear the filter
        await studentTrigger.click();
        await page.waitForTimeout(300);
        await page.locator('[role="option"]:has-text("All Students")').click();
        await page.waitForTimeout(500);

        // Verify studentId param is removed from URL
        await expect(page).not.toHaveURL(/studentId=/);
      }
    });
  });

  test.describe('Combined Filters', () => {
    test('should apply multiple filters together', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Apply search filter
      const searchInput = page.locator('#search-filter');
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });
      await searchInput.fill('lesson');
      await page.waitForTimeout(500);

      // Apply status filter
      const statusTrigger = page.locator('[data-testid="filter-status-trigger"]');
      await statusTrigger.click();
      await page.waitForTimeout(300);
      await page.locator('[role="option"]:has-text("Scheduled")').click();
      await page.waitForTimeout(500);

      // Verify both params are in URL
      await expect(page).toHaveURL(/search=lesson/);
      await expect(page).toHaveURL(/status=SCHEDULED/);
    });

    test('should show "Clear Filters" button when filters are active', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Apply a filter
      const statusTrigger = page.locator('[data-testid="filter-status-trigger"]');
      await statusTrigger.waitFor({ state: 'visible', timeout: 10000 });
      await statusTrigger.click();
      await page.waitForTimeout(300);
      await page.locator('[role="option"]:has-text("Scheduled")').click();
      await page.waitForTimeout(500);

      // Verify "Clear Filters" button is visible
      await expect(page.locator('button:has-text("Clear Filters")')).toBeVisible();
    });

    test('should clear all filters when "Clear Filters" clicked', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Apply search filter
      const searchInput = page.locator('#search-filter');
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });
      await searchInput.fill('test');
      await page.waitForTimeout(500);

      // Apply status filter
      const statusTrigger = page.locator('[data-testid="filter-status-trigger"]');
      await statusTrigger.click();
      await page.waitForTimeout(300);
      await page.locator('[role="option"]:has-text("Scheduled")').click();
      await page.waitForTimeout(500);

      // Click "Clear Filters" button
      await page.locator('button:has-text("Clear Filters")').click();
      await page.waitForTimeout(500);

      // Verify all params are removed from URL
      await expect(page).not.toHaveURL(/search=/);
      await expect(page).not.toHaveURL(/status=/);
      await expect(page).not.toHaveURL(/studentId=/);

      // Verify search input is cleared
      await expect(searchInput).toHaveValue('');
    });
  });

  test.describe('Filter Persistence', () => {
    test('should maintain filters on page refresh', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Apply status filter
      const statusTrigger = page.locator('[data-testid="filter-status-trigger"]');
      await statusTrigger.waitFor({ state: 'visible', timeout: 10000 });
      await statusTrigger.click();
      await page.waitForTimeout(300);
      await page.locator('[role="option"]:has-text("Completed")').click();
      await page.waitForTimeout(500);

      // Verify URL contains status param
      await expect(page).toHaveURL(/status=COMPLETED/);

      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify URL still contains status param
      await expect(page).toHaveURL(/status=COMPLETED/);
    });

    test('should load with filters from URL params', async ({ page }) => {
      // Navigate directly with filters in URL
      await page.goto('/dashboard/lessons?status=SCHEDULED&search=guitar');
      await page.waitForLoadState('networkidle');

      // Wait for filters to be visible
      const searchInput = page.locator('#search-filter');
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });

      // Verify search input has the value from URL
      await expect(searchInput).toHaveValue('guitar');

      // Verify status filter shows "Scheduled"
      await expect(page.locator('[data-testid="filter-status-trigger"]')).toContainText(
        'Scheduled'
      );
    });
  });

  test.describe('Lesson Navigation', () => {
    test('should navigate to lesson detail when clicking on lesson', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"]', {
        state: 'visible',
        timeout: 10000,
      });

      // Check if there are any lessons in the table
      const lessonRows = page.locator('[data-testid="lesson-table"] tbody tr');
      const rowCount = await lessonRows.count();

      if (rowCount > 0) {
        // Click on the first lesson link
        const firstLessonLink = lessonRows.first().locator('a').first();
        await firstLessonLink.click();

        // Should navigate to lesson detail page
        await expect(page).toHaveURL(/\/dashboard\/lessons\/[^/]+$/);
      }
    });

    test('should navigate to create new lesson page', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Look for "Add" or "New Lesson" button
      const addButton = page.locator('a[href="/dashboard/lessons/new"], button:has-text("Add")');

      if ((await addButton.count()) > 0) {
        await addButton.first().click();
        await expect(page).toHaveURL('/dashboard/lessons/new');
      }
    });
  });
});
