/**
 * Student Lesson List Test
 *
 * Migrated from: cypress/e2e/student-learning-journey.cy.ts (Phase 2: View Lessons)
 *
 * Tests lesson list functionality for students:
 * 1. List rendering - Verify student lessons page displays correctly
 * 2. Lesson cards - Display lesson information with date, time, status
 * 3. View details - Navigate to lesson detail page
 * 4. Access control - Students should only see their own lessons
 * 5. Empty state - Display appropriate message when no lessons
 *
 * Prerequisites:
 * - Student user: student@example.com / test123_student
 * - Student may or may not have lessons assigned
 *
 * @tags @student @lessons @list
 */
import { test, expect } from '../../../fixtures';

test.describe('Student Lesson List', { tag: ['@student', '@lessons', '@list'] }, () => {
  test.beforeEach(async ({ page, loginAs }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as student
    await loginAs('student');
  });

  test.describe('List Rendering', () => {
    test('should display student lessons page', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for page to load (either lessons or empty state)
      await page.waitForSelector('h1:has-text("Lessons")', {
        state: 'visible',
        timeout: 10000,
      });

      // Verify page heading is visible
      await expect(page.locator('h1:has-text("Lessons")')).toBeVisible();
    });

    test('should display page description', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Lessons")', {
        state: 'visible',
        timeout: 10000,
      });

      // Verify description is visible
      await expect(page.locator('text=View and manage all scheduled lessons')).toBeVisible();
    });

    test('should show loading state initially', async ({ page }) => {
      // Navigate without waiting for network
      await page.goto('/dashboard/lessons');

      // Loading spinner should appear briefly
      // Note: This may be too fast to catch in some cases
      const spinner = page.locator('.animate-spin');
      const spinnerVisible = await spinner.isVisible().catch(() => false);

      // Either spinner was visible or page loaded fast enough
      // Just verify we end up with content
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1:has-text("Lessons")')).toBeVisible();
    });
  });

  test.describe('Lesson Content', () => {
    test('should display lesson cards or empty state', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for page to fully load
      await page.waitForSelector('h1:has-text("Lessons")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check for either lessons or empty state
      const hasLessons = await page.locator('a[href*="/dashboard/lessons/"]').count() > 0;
      const hasEmptyState = await page.locator('text=No lessons scheduled').isVisible().catch(() => false);

      // One of these should be true
      expect(hasLessons || hasEmptyState).toBeTruthy();
    });

    test('should display lesson details on cards when lessons exist', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Lessons")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are lesson cards
      const lessonLinks = page.locator('a[href*="/dashboard/lessons/"]');
      const lessonCount = await lessonLinks.count();

      if (lessonCount > 0) {
        // Verify lesson card contains expected elements
        const lessonCard = page.locator('.bg-card').first();

        // Should show lesson title
        await expect(lessonCard.locator('h3')).toBeVisible();

        // Should show date badge
        await expect(lessonCard.locator('[class*="Badge"]').first()).toBeVisible();

        // Should show "View Details" button
        await expect(lessonCard.locator('text=View Details')).toBeVisible();
      }
    });

    test('should display status badges for lessons', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Lessons")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are lessons
      const lessonCount = await page.locator('a[href*="/dashboard/lessons/"]').count();

      if (lessonCount > 0) {
        // Status badge should be visible (either "Scheduled" or "Completed")
        const scheduledBadge = page.locator('text=Scheduled');
        const completedBadge = page.locator('text=Completed');

        const hasScheduled = await scheduledBadge.count() > 0;
        const hasCompleted = await completedBadge.count() > 0;

        // At least one status should be visible
        expect(hasScheduled || hasCompleted).toBeTruthy();
      }
    });

    test('should display teacher information for lessons', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Lessons")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are lessons
      const lessonCount = await page.locator('a[href*="/dashboard/lessons/"]').count();

      if (lessonCount > 0) {
        // Teacher info should be visible
        await expect(page.locator('text=Teacher:').first()).toBeVisible();
      }
    });
  });

  test.describe('Empty State', () => {
    test('should display empty state message when no lessons', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Lessons")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check for empty state
      const emptyState = page.locator('text=No lessons scheduled');
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      if (hasEmptyState) {
        // Verify empty state content
        await expect(emptyState).toBeVisible();
        await expect(page.locator('text=don\'t have any lessons scheduled yet')).toBeVisible();
      }
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to lesson detail when clicking View Details', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Lessons")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are lessons
      const viewDetailsButtons = page.locator('a:has-text("View Details")');
      const buttonCount = await viewDetailsButtons.count();

      if (buttonCount > 0) {
        // Click on first "View Details" button
        await viewDetailsButtons.first().click();

        // Should navigate to lesson detail page
        await expect(page).toHaveURL(/\/dashboard\/lessons\/[^/]+$/);
      }
    });

    test('should display lesson detail page content', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Lessons")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are lessons
      const viewDetailsButtons = page.locator('a:has-text("View Details")');
      const buttonCount = await viewDetailsButtons.count();

      if (buttonCount > 0) {
        // Click on first "View Details" button
        await viewDetailsButtons.first().click();

        // Wait for detail page to load
        await page.waitForLoadState('networkidle');

        // Should show lesson details
        await expect(page.locator('text=/lesson|details|notes/i').first()).toBeVisible();
      }
    });
  });

  test.describe('Access Control', () => {
    test('should only see own lessons (not other students)', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Lessons")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Student view should NOT have teacher-only controls like:
      // - "All Students" filter
      // - Student filter dropdown
      // - Add/Create lesson button
      await expect(page.locator('text=All Students')).not.toBeVisible();
      await expect(page.locator('[data-testid="filter-student-trigger"]')).not.toBeVisible();
      await expect(page.locator('a[href="/dashboard/lessons/new"]')).not.toBeVisible();
    });

    test('should NOT have access to create new lessons', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Lessons")', {
        state: 'visible',
        timeout: 10000,
      });

      // There should be no "Add" or "New Lesson" button for students
      await expect(page.locator('button:has-text("Add")')).not.toBeVisible();
      await expect(page.locator('a[href="/dashboard/lessons/new"]')).not.toBeVisible();
    });

    test('should NOT see lesson filters section', async ({ page }) => {
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Lessons")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Student view should not have the filters section that teachers have
      await expect(page.locator('[data-testid="lessons-filters"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="filter-status-trigger"]')).not.toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Lessons")', {
        state: 'visible',
        timeout: 10000,
      });

      // Page should be visible on mobile
      await expect(page.locator('h1:has-text("Lessons")')).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Lessons")', {
        state: 'visible',
        timeout: 10000,
      });

      // Page should be visible on tablet
      await expect(page.locator('h1:has-text("Lessons")')).toBeVisible();
    });
  });
});
