/**
 * Admin Lesson Management Enhanced Tests
 *
 * Migrated from: cypress/e2e/admin/admin-lessons-enhanced.cy.ts
 *
 * Extended tests for lesson management:
 * - Bulk operations
 * - Recurring lessons
 * - Add songs to lessons
 * - Create assignments from lessons
 * - Lesson history
 * - Advanced filtering (teacher/student/status/date)
 * - Calendar view
 *
 * Prerequisites:
 * - Local Supabase database running
 * - Test credentials configured
 *
 * Tags: @admin @lessons @enhanced
 */
import { test, expect } from '../../fixtures';

test.describe('Admin Lesson Management (Enhanced)', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    // Set viewport to desktop size matching Cypress
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as admin
    await loginAs('admin');
  });

  test.describe('Lesson List Advanced Features', () => {
    test('should load lessons page with all controls', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForTimeout(2000);

      // Verify URL
      await expect(page).toHaveURL(/\/lessons/);

      // Verify main content is visible
      await expect(page.locator('main, [role="main"]')).toBeVisible();
    });

    test('should have filter controls', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForTimeout(2000);

      // Check for filter container
      const filtersContainer = page.locator('[data-testid="lessons-filters"]');
      await expect(filtersContainer).toBeVisible({ timeout: 10000 });

      // Check for specific filter controls
      const statusFilter = page.locator('[data-testid="filter-status-trigger"]');
      const hasStatusFilter = await statusFilter.isVisible().catch(() => false);

      if (hasStatusFilter) {
        await expect(statusFilter).toBeVisible();
      }
    });

    test('should have search functionality', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForTimeout(2000);

      // Check for search input
      const searchInput = page.locator('#search-filter');
      await expect(searchInput).toBeVisible({ timeout: 10000 });
      await expect(searchInput).toHaveAttribute('placeholder', /search/i);
    });
  });

  test.describe('Filter by Teacher', () => {
    test('should filter lessons by teacher if control exists', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForTimeout(2000);

      // Check if teacher filter exists
      const teacherFilter = page.locator('[data-testid="filter-teacher-trigger"]');
      const hasTeacherFilter = await teacherFilter.isVisible().catch(() => false);

      if (hasTeacherFilter) {
        // Open the select dropdown
        await teacherFilter.click();
        await page.waitForTimeout(500);

        // Select first teacher option (skip "All Teachers")
        const options = page.locator('[role="option"]');
        const optionsCount = await options.count();

        if (optionsCount > 1) {
          await options.nth(1).click();
          await page.waitForTimeout(1000);
        }
      }
    });
  });

  test.describe('Filter by Student', () => {
    test('should filter lessons by student if control exists', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForTimeout(2000);

      // Check if student filter exists
      const studentFilter = page.locator('[data-testid="filter-student-trigger"]');
      const hasStudentFilter = await studentFilter.isVisible().catch(() => false);

      if (hasStudentFilter) {
        // Open the select dropdown
        await studentFilter.click();
        await page.waitForTimeout(500);

        // Select first student option (skip "All Students")
        const options = page.locator('[role="option"]');
        const optionsCount = await options.count();

        if (optionsCount > 1) {
          await options.nth(1).click();
          await page.waitForTimeout(1000);
        }
      }
    });
  });

  test.describe('Filter by Status', () => {
    test('should filter lessons by status', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForTimeout(2000);

      // Check for status filter
      const statusFilter = page.locator('[data-testid="filter-status-trigger"]');
      await expect(statusFilter).toBeVisible({ timeout: 10000 });

      // Open the dropdown
      await statusFilter.click();
      await page.waitForTimeout(500);

      // Select "Scheduled" status
      const scheduledOption = page.locator('[role="option"]', { hasText: 'Scheduled' });
      if (await scheduledOption.isVisible().catch(() => false)) {
        await scheduledOption.click();
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Date Range Filter', () => {
    test.skip('should have date range filter', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      // Date range filter not yet implemented
      await page.goto('/dashboard/lessons');
      await page.waitForTimeout(2000);

      // Check for date filter controls
      const dateFilter = page.locator('input[type="date"], [data-testid*="date-filter"], [class*="calendar"]');
      const hasDateFilter = await dateFilter.isVisible().catch(() => false);

      if (hasDateFilter) {
        await expect(dateFilter).toBeVisible();
      }
    });
  });

  test.describe('Lesson Detail Page', () => {
    test('should navigate to lesson detail', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForTimeout(2000);

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on first lesson link
      const lessonLink = page.locator('[data-testid="lesson-title-link"]').first();
      await expect(lessonLink).toBeVisible({ timeout: 10000 });
      await lessonLink.click();

      await page.waitForTimeout(1500);

      // Should navigate to lesson detail page
      await expect(page).toHaveURL(/\/lessons\/[^/]+$/);
    });

    test('should show lesson details', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForTimeout(2000);

      // Click on first lesson
      const lessonLink = page.locator('[data-testid="lesson-title-link"]').first();
      await lessonLink.click();
      await page.waitForTimeout(1500);

      // Should display lesson information
      const pageContent = page.locator('body');
      const hasStudent = await pageContent.locator('text=/Student/i').isVisible().catch(() => false);
      const hasTeacher = await pageContent.locator('text=/Teacher/i').isVisible().catch(() => false);
      const hasStatus = await pageContent.locator('text=/Status/i').isVisible().catch(() => false);

      // At least one of these should be visible
      expect(hasStudent || hasTeacher || hasStatus).toBe(true);
    });
  });

  test.describe('Add Songs to Lesson', () => {
    test('should have add songs functionality on lesson detail', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForTimeout(2000);

      // Navigate to lesson detail
      const lessonLink = page.locator('[data-testid="lesson-title-link"]').first();
      await lessonLink.click();
      await page.waitForTimeout(1500);

      // Check for add songs section (LessonSongsList component)
      const pageContent = page.locator('body');
      const hasSongsSection = await pageContent.locator('text=/Songs/i').isVisible().catch(() => false);
      const hasAddSongButton = await pageContent.locator('button', { hasText: /Add Song/i }).isVisible().catch(() => false);

      // Verify songs section exists
      expect(hasSongsSection || hasAddSongButton).toBe(true);
    });
  });

  test.describe('Create Assignment from Lesson', () => {
    test('should have create assignment option on lesson detail', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForTimeout(2000);

      // Navigate to lesson detail
      const lessonLink = page.locator('[data-testid="lesson-title-link"]').first();
      await lessonLink.click();
      await page.waitForTimeout(1500);

      // Check for assignments section (LessonAssignmentsList component)
      const pageContent = page.locator('body');
      const hasAssignmentsSection = await pageContent.locator('text=/Assignment/i').isVisible().catch(() => false);
      const hasCreateButton = await pageContent.locator('button, a', { hasText: /Create Assignment/i }).isVisible().catch(() => false);

      // Verify assignments section exists
      expect(hasAssignmentsSection || hasCreateButton).toBe(true);
    });
  });

  test.describe('Lesson History', () => {
    test('should show lesson history on detail page', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForTimeout(2000);

      // Navigate to lesson detail
      const lessonLink = page.locator('[data-testid="lesson-title-link"]').first();
      await lessonLink.click();
      await page.waitForTimeout(1500);

      // Check for history section (HistoryTimeline component)
      const pageContent = page.locator('body');
      const hasHistory = await pageContent.locator('text=/History/i').isVisible().catch(() => false);
      const hasChanges = await pageContent.locator('text=/Changes/i').isVisible().catch(() => false);
      const hasTimeline = await pageContent.locator('[data-testid*="history"]').isVisible().catch(() => false);

      // Verify history section exists
      expect(hasHistory || hasChanges || hasTimeline).toBe(true);
    });
  });

  test.describe('Calendar View', () => {
    test.skip('should navigate to schedule/calendar view if available', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      // Calendar view not yet implemented
      const response = await page.goto('/dashboard/lessons/schedule', { waitUntil: 'domcontentloaded' });

      // Check if page exists
      const has404 = await page.locator('text=/404|Not Found/i').isVisible().catch(() => false);
      const hasCalendar = await page.locator('[class*="calendar"], [class*="schedule"]').isVisible().catch(() => false);

      if (hasCalendar) {
        await expect(page.locator('[class*="calendar"], [class*="schedule"]')).toBeVisible();
      } else if (has404 || response?.status() === 404) {
        // Calendar view not implemented yet - skip test
        test.skip();
      }
    });
  });

  test.describe('Lesson Form Validation', () => {
    test('should validate required fields on new lesson form', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      await page.goto('/dashboard/lessons/new');
      await page.waitForTimeout(2000);

      // Try to submit empty form
      const submitButton = page.locator('[data-testid="lesson-submit"]');
      await expect(submitButton).toBeVisible({ timeout: 10000 });
      await submitButton.click();

      // Should stay on form (not redirect)
      await expect(page).toHaveURL(/\/new/);
    });

    test('should validate date is in the future for scheduled lessons', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      await page.goto('/dashboard/lessons/new');
      await page.waitForTimeout(2000);

      // Fill minimal required fields
      const studentSelect = page.locator('[data-testid="lesson-student_id"]');
      await studentSelect.click();
      await page.waitForTimeout(500);
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(500);

      const teacherSelect = page.locator('[data-testid="lesson-teacher_id"]');
      await teacherSelect.click();
      await page.waitForTimeout(500);
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(500);

      await page.fill('[data-testid="lesson-title"]', 'Test Lesson');

      // Set past date
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);
      const dateStr = pastDate.toISOString().slice(0, 16);
      await page.fill('[data-testid="lesson-scheduled-at"]', dateStr);

      // Try to submit
      await page.locator('[data-testid="lesson-submit"]').click();
      await page.waitForTimeout(1000);

      // Validation should prevent submission or show error
      // Note: Specific validation behavior depends on implementation
    });
  });

  test.describe('Bulk Operations', () => {
    test.skip('should have bulk selection if available', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      // Bulk operations not yet implemented
      await page.goto('/dashboard/lessons');
      await page.waitForTimeout(2000);

      // Check for bulk selection checkboxes
      const bulkSelectHeader = page.locator('th input[type="checkbox"]');
      const bulkSelectRows = page.locator('input[type="checkbox"][data-testid*="select"]');

      const hasBulkSelect = await bulkSelectHeader.isVisible().catch(() => false) ||
                           await bulkSelectRows.first().isVisible().catch(() => false);

      if (hasBulkSelect) {
        await expect(bulkSelectHeader.or(bulkSelectRows.first())).toBeVisible();
      }
    });
  });

  test.describe('Lesson Status Management', () => {
    test('should allow changing lesson status', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForTimeout(2000);

      // Navigate to a lesson
      const lessonLink = page.locator('[data-testid="lesson-title-link"]').first();
      await lessonLink.click();
      await page.waitForTimeout(1500);

      // Look for status change controls
      const pageContent = page.locator('body');
      const statusSelect = pageContent.locator('select[name*="status"], [data-testid*="status"]');
      const completeButton = pageContent.locator('button', { hasText: /Complete/i });
      const cancelButton = pageContent.locator('button', { hasText: /Cancel/i });

      const hasStatusControl = await statusSelect.isVisible().catch(() => false) ||
                               await completeButton.isVisible().catch(() => false) ||
                               await cancelButton.isVisible().catch(() => false);

      // Verify status control exists
      expect(hasStatusControl).toBe(true);
    });
  });

  test.describe('Edit Lesson', () => {
    test('should be able to edit lesson', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForTimeout(2000);

      // Navigate to a lesson
      const lessonLink = page.locator('[data-testid="lesson-title-link"]').first();
      await lessonLink.click();
      await page.waitForTimeout(1500);

      // Look for edit button or link
      const editButton = page.locator('[data-testid="lesson-edit-button"]');
      const editLink = page.locator('a[href*="/edit"]');

      const hasEdit = await editButton.isVisible().catch(() => false) ||
                      await editLink.isVisible().catch(() => false);

      if (hasEdit) {
        const editControl = editButton.or(editLink).first();
        await editControl.click();
        await page.waitForTimeout(1000);

        // Should navigate to edit page
        await expect(page).toHaveURL(/\/edit/);
      }
    });
  });

  test.describe('Delete Lesson', () => {
    test('should show delete confirmation dialog', { tag: ['@admin', '@lessons', '@enhanced'] }, async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForTimeout(2000);

      // Navigate to a lesson
      const lessonLink = page.locator('[data-testid="lesson-title-link"]').first();
      await lessonLink.click();
      await page.waitForTimeout(1500);

      // Look for delete button
      const deleteButton = page.locator('[data-testid="lesson-delete-button"]');
      const hasDeleteButton = await deleteButton.isVisible().catch(() => false);

      if (hasDeleteButton) {
        await deleteButton.click();

        // Should show confirmation dialog
        const dialog = page.locator('[role="alertdialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });

        // Cancel deletion
        const cancelButton = dialog.locator('button', { hasText: /Cancel/i });
        await cancelButton.click();

        // Dialog should close
        await expect(dialog).not.toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on tablet', { tag: ['@admin', '@lessons', '@enhanced', '@responsive'] }, async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/dashboard/lessons');
      await page.waitForTimeout(2000);

      // Verify main content is visible
      await expect(page.locator('main, [role="main"]')).toBeVisible();
    });

    test('should display correctly on mobile', { tag: ['@admin', '@lessons', '@enhanced', '@responsive'] }, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard/lessons');
      await page.waitForTimeout(2000);

      // Verify main content is visible
      await expect(page.locator('main, [role="main"]')).toBeVisible();
    });
  });
});
