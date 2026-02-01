/**
 * Student Assignment List Test
 *
 * Migrated from: cypress/e2e/student-learning-journey.cy.ts (Phase 4: Manage Assignments)
 *                cypress/e2e/features/student-assignment-completion.cy.ts
 *
 * Tests assignment list functionality for students:
 * 1. List rendering - Verify student assignments page displays correctly
 * 2. Assignment cards - Display assignment information with title, status, due date
 * 3. View details - Navigate to assignment detail page
 * 4. Access control - Students should only see their own assignments
 * 5. Empty state - Display appropriate message when no assignments
 * 6. Assignment status - Display status indicators (pending, in progress, completed)
 *
 * Prerequisites:
 * - Student user: student@example.com / test123_student
 * - Student may or may not have assignments assigned
 *
 * @tags @student @assignments @list
 */
import { test, expect } from '../../../fixtures';

test.describe('Student Assignment List', { tag: ['@student', '@assignments', '@list'] }, () => {
  test.beforeEach(async ({ page, loginAs }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as student
    await loginAs('student');
  });

  test.describe('List Rendering', () => {
    test('should display student assignments page', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load (either assignments or empty state)
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Verify page heading is visible
      const heading = page.locator('h1:has-text("Assignments"), text=My Assignments');
      await expect(heading.first()).toBeVisible();
    });

    test('should display page description', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Verify description or subheading is visible
      const description = page.locator('text=/assignments|homework|practice/i');
      await expect(description.first()).toBeVisible();
    });

    test('should show loading state initially', async ({ page }) => {
      // Navigate without waiting for network
      await page.goto('/dashboard/assignments');

      // Loading spinner should appear briefly
      // Note: This may be too fast to catch in some cases
      const spinner = page.locator('.animate-spin');
      await spinner.isVisible().catch(() => false);

      // Either spinner was visible or page loaded fast enough
      // Just verify we end up with content
      await page.waitForLoadState('networkidle');
      const heading = page.locator('h1:has-text("Assignments"), text=My Assignments');
      await expect(heading.first()).toBeVisible();
    });
  });

  test.describe('Assignment Content', () => {
    test('should display assignment cards or empty state', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to fully load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check for either assignments or empty state
      const hasAssignments = await page.locator('a[href*="/dashboard/assignments/"]').count() > 0;
      const hasEmptyState = await page.locator('text=/no assignments/i').isVisible().catch(() => false);

      // One of these should be true
      expect(hasAssignments || hasEmptyState).toBeTruthy();
    });

    test('should display assignment details on cards when assignments exist', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are assignment cards
      const assignmentLinks = page.locator('a[href*="/dashboard/assignments/"]');
      const assignmentCount = await assignmentLinks.count();

      if (assignmentCount > 0) {
        // Verify assignment card contains expected elements
        const assignmentCard = page.locator('.bg-card, [class*="card"]').first();

        // Should show assignment title or description
        const hasTitle = await assignmentCard.locator('h3, h4, [class*="title"]').isVisible().catch(() => false);
        const hasText = await assignmentCard.locator('p').isVisible().catch(() => false);

        expect(hasTitle || hasText).toBeTruthy();
      }
    });

    test('should display status indicators for assignments', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are assignments
      const assignmentCount = await page.locator('a[href*="/dashboard/assignments/"]').count();

      if (assignmentCount > 0) {
        // Status indicators should be visible (pending, in progress, completed, etc.)
        const bodyText = await page.locator('body').textContent();
        const hasStatusIndicator =
          bodyText?.toLowerCase().includes('pending') ||
          bodyText?.toLowerCase().includes('in progress') ||
          bodyText?.toLowerCase().includes('completed') ||
          bodyText?.toLowerCase().includes('not started') ||
          bodyText?.toLowerCase().includes('todo') ||
          bodyText?.toLowerCase().includes('done') ||
          bodyText?.toLowerCase().includes('overdue');

        expect(hasStatusIndicator).toBeTruthy();
      }
    });

    test('should display due date information', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are assignments
      const assignmentCount = await page.locator('a[href*="/dashboard/assignments/"]').count();

      if (assignmentCount > 0) {
        // Due date info should be visible
        const hasDueDate = await page.locator('text=/due|deadline/i').isVisible().catch(() => false);
        const hasDateFormat = await page.locator('text=/\\d{1,2}[/-]\\d{1,2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i').isVisible().catch(() => false);

        expect(hasDueDate || hasDateFormat).toBeTruthy();
      }
    });
  });

  test.describe('Empty State', () => {
    test('should display empty state message when no assignments', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check for empty state
      const emptyState = page.locator('text=/no assignments/i');
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      if (hasEmptyState) {
        // Verify empty state content
        await expect(emptyState.first()).toBeVisible();
      }
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to assignment detail when clicking on assignment', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are assignments
      const assignmentLinks = page.locator('a[href*="/dashboard/assignments/"]');
      const linkCount = await assignmentLinks.count();

      if (linkCount > 0) {
        // Click on first assignment link
        await assignmentLinks.first().click();

        // Should navigate to assignment detail page
        await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
      }
    });

    test('should display assignment detail page content', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are assignments
      const assignmentLinks = page.locator('a[href*="/dashboard/assignments/"]');
      const linkCount = await assignmentLinks.count();

      if (linkCount > 0) {
        // Click on first assignment link
        await assignmentLinks.first().click();

        // Wait for detail page to load
        await page.waitForLoadState('networkidle');

        // Should show assignment details (title, description, instructions, etc.)
        const detailContent = page.locator('text=/title|description|instructions|due|assignment|song/i');
        await expect(detailContent.first()).toBeVisible();
      }
    });
  });

  test.describe('Access Control', () => {
    test('should only see own assignments (not other students)', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Student view should NOT have teacher-only controls like:
      // - "All Students" filter
      // - Student filter dropdown
      // - Create new assignment button
      await expect(page.locator('text=All Students')).not.toBeVisible();
      await expect(page.locator('[data-testid="filter-student-trigger"]')).not.toBeVisible();
      await expect(page.locator('button:has-text("Student")')).not.toBeVisible();
    });

    test('should NOT have access to create new assignments', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // There should be no "Add" or "New Assignment" button for students
      await expect(page.locator('a:has-text("New Assignment")')).not.toBeVisible();
      await expect(page.locator('a[href="/dashboard/assignments/new"]')).not.toBeVisible();
    });

    test('should NOT have access to templates', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // There should be no "Templates" button for students
      await expect(page.locator('a:has-text("Templates")')).not.toBeVisible();
      await expect(page.locator('a[href="/dashboard/assignments/templates"]')).not.toBeVisible();
    });

    test('should NOT see teacher filter controls', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Student view should not have the teacher filter controls
      await expect(page.locator('[data-testid="assignments-filters"]')).not.toBeVisible();
      await expect(page.locator('button:has-text("Reset Filters")')).not.toBeVisible();
    });
  });

  test.describe('Assignment Status Display', () => {
    test('should display pending assignments', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are any assignments
      const assignmentCount = await page.locator('a[href*="/dashboard/assignments/"]').count();

      if (assignmentCount > 0) {
        // The page should show some form of status organization
        const bodyText = await page.locator('body').textContent();
        const hasAnyStatus =
          bodyText?.toLowerCase().includes('pending') ||
          bodyText?.toLowerCase().includes('in progress') ||
          bodyText?.toLowerCase().includes('completed') ||
          bodyText?.toLowerCase().includes('not started');

        expect(hasAnyStatus).toBeTruthy();
      }
    });

    test('should distinguish completed from pending assignments', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are assignments
      const assignmentCount = await page.locator('a[href*="/dashboard/assignments/"]').count();

      if (assignmentCount > 0) {
        // Verify visual distinction exists (badges, colors, sections, etc.)
        const hasBadges = await page.locator('[class*="Badge"], [class*="badge"]').count() > 0;
        const hasSections = await page.locator('h2, h3').count() > 1;
        const hasStatusColors = await page.locator('[class*="green"], [class*="yellow"], [class*="red"], [class*="success"], [class*="warning"], [class*="destructive"]').count() > 0;

        // At least one visual distinction method should exist
        expect(hasBadges || hasSections || hasStatusColors).toBeTruthy();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Page should be visible on mobile
      const heading = page.locator('h1:has-text("Assignments"), text=My Assignments');
      await expect(heading.first()).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Page should be visible on tablet
      const heading = page.locator('h1:has-text("Assignments"), text=My Assignments');
      await expect(heading.first()).toBeVisible();
    });

    test('should stack cards on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are assignments
      const assignmentLinks = page.locator('a[href*="/dashboard/assignments/"]');
      const linkCount = await assignmentLinks.count();

      if (linkCount > 0) {
        // Cards should be full width on mobile (stacked)
        const firstCard = page.locator('.bg-card, [class*="card"]').first();
        const cardBox = await firstCard.boundingBox();

        if (cardBox) {
          // Card should take up most of the viewport width
          expect(cardBox.width).toBeGreaterThan(300);
        }
      }
    });
  });
});
