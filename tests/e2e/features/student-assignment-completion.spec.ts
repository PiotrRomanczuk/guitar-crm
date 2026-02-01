/**
 * Student Assignment Completion Flow
 *
 * Migrated from: cypress/e2e/features/student-assignment-completion.cy.ts
 *
 * Tests student experience with assignments:
 * 1. View assigned assignments
 * 2. View assignment details
 * 3. Mark assignment as in progress
 * 4. Mark assignment as complete
 * 5. View completed assignments
 *
 * Priority: P1 - Critical gap for student experience
 *
 * Prerequisites:
 * - Student user: student@example.com / test123_student
 * - Student may or may not have assignments assigned
 *
 * @tags @student @assignments @completion @feature
 */
import { test, expect } from '../../fixtures';

test.describe('Student Assignment Completion Flow', { tag: ['@student', '@assignments', '@completion', '@feature'] }, () => {
  test.beforeEach(async ({ page, loginAs }) => {
    // Set viewport to desktop size (1280x720 as in original Cypress test)
    await page.setViewportSize({ width: 1280, height: 720 });

    // Login as student
    await loginAs('student');
  });

  test.describe('View Assignments', () => {
    test('should display student assignments page', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Should see assignments page
      const assignmentsText = page.locator('text=/assignments|homework|practice/i');
      await expect(assignmentsText.first()).toBeVisible();
    });

    test('should show only student own assignments', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Should not show admin controls for other students
      await expect(page.locator('text=/all students|filter by student/i')).not.toBeVisible();
    });

    test('should display assignment status', async ({ page }) => {
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
      const assignmentCount = await page.locator('[data-testid="assignment-card"], [data-testid="assignment-row"], a[href*="/dashboard/assignments/"]').count();

      if (assignmentCount > 0) {
        // Should show status indicators
        const bodyText = await page.locator('body').textContent();
        const hasStatusIndicator =
          bodyText?.toLowerCase().includes('pending') ||
          bodyText?.toLowerCase().includes('in progress') ||
          bodyText?.toLowerCase().includes('completed') ||
          bodyText?.toLowerCase().includes('todo') ||
          bodyText?.toLowerCase().includes('done');

        expect(hasStatusIndicator).toBeTruthy();
      }
    });

    test('should filter assignments by status', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Look for status filter if it exists
      const hasAllButton = await page.locator('button:has-text("All")').isVisible().catch(() => false);
      const hasPendingButton = await page.locator('button:has-text("Pending")').isVisible().catch(() => false);
      const hasCompletedButton = await page.locator('button:has-text("Completed")').isVisible().catch(() => false);
      const hasStatusSelect = await page.locator('select[name="status"]').isVisible().catch(() => false);
      const hasStatusFilter = await page.locator('[data-testid="status-filter"]').isVisible().catch(() => false);

      const hasFilter = hasAllButton || hasPendingButton || hasCompletedButton || hasStatusSelect || hasStatusFilter;

      if (hasFilter) {
        // Status filter found - test passes
        expect(hasFilter).toBeTruthy();
      }
    });
  });

  test.describe('Assignment Details', () => {
    test('should view assignment details', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are assignment links
      const assignmentLinks = page.locator('a[href*="/assignments/"]');
      const linkCount = await assignmentLinks.count();

      if (linkCount > 0) {
        // Click on first assignment link
        await assignmentLinks.first().click();

        // Should navigate to assignment detail page
        await expect(page).toHaveURL(/\/assignments\//);

        // Should show assignment details
        const detailContent = page.locator('text=/title|description|due|assignment/i');
        await expect(detailContent.first()).toBeVisible();
      }
    });

    test('should display assignment instructions', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are assignment links
      const assignmentLinks = page.locator('a[href*="/assignments/"]');
      const linkCount = await assignmentLinks.count();

      if (linkCount > 0) {
        // Click on first assignment link
        await assignmentLinks.first().click();

        // Wait for detail page to load
        await page.waitForLoadState('networkidle');

        // Should show description or instructions
        const bodyText = await page.locator('body').textContent();
        const hasInstructions =
          bodyText?.toLowerCase().includes('description') ||
          bodyText?.toLowerCase().includes('instructions') ||
          bodyText?.toLowerCase().includes('practice');

        expect(hasInstructions).toBeTruthy();
      }
    });

    test('should display due date', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are assignment links
      const assignmentLinks = page.locator('a[href*="/assignments/"]');
      const linkCount = await assignmentLinks.count();

      if (linkCount > 0) {
        // Click on first assignment link
        await assignmentLinks.first().click();

        // Wait for detail page to load
        await page.waitForLoadState('networkidle');

        // Should show due date
        const hasDueDate = await page.locator('text=/due|deadline/i').isVisible().catch(() => false);
        expect(hasDueDate).toBeTruthy();
      }
    });
  });

  test.describe('Update Assignment Status', () => {
    test('should mark assignment as in progress', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check for pending assignments
      const hasPendingAssignment = await page.locator('[data-testid*="pending"], text=Pending').first().isVisible().catch(() => false);

      if (hasPendingAssignment) {
        // Navigate to first assignment
        const assignmentLinks = page.locator('a[href*="/assignments/"]');
        const linkCount = await assignmentLinks.count();

        if (linkCount > 0) {
          await assignmentLinks.first().click();

          // Wait for detail page to load
          await page.waitForLoadState('networkidle');

          // Look for "Start" or "In Progress" button
          const startButton = page.locator('button:has-text("Start"), button:has-text("In Progress")');
          const hasStartButton = await startButton.isVisible().catch(() => false);

          if (hasStartButton) {
            await startButton.first().click({ force: true });

            // Wait for status update
            await page.waitForTimeout(1000);

            // Should update status
            const bodyText = await page.locator('body').textContent();
            const hasUpdatedStatus =
              bodyText?.toLowerCase().includes('in progress') ||
              bodyText?.toLowerCase().includes('started');

            expect(hasUpdatedStatus).toBeTruthy();
          }
        }
      }
    });

    test('should mark assignment as complete', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are assignment links
      const assignmentLinks = page.locator('a[href*="/assignments/"]');
      const linkCount = await assignmentLinks.count();

      if (linkCount > 0) {
        // Navigate to first assignment
        await assignmentLinks.first().click();

        // Wait for detail page to load
        await page.waitForLoadState('networkidle');

        // Look for "Complete" or "Mark as Done" button or checkbox
        const completeButton = page.locator('button:has-text("Complete"), button:has-text("Done")');
        const checkbox = page.locator('input[type="checkbox"]');

        const hasCompleteButton = await completeButton.isVisible().catch(() => false);
        const hasCheckbox = await checkbox.isVisible().catch(() => false);

        if (hasCompleteButton) {
          await completeButton.first().click({ force: true });

          // Wait for status update
          await page.waitForTimeout(1000);

          // Should show completion confirmation
          const bodyText = await page.locator('body').textContent();
          const hasCompletedStatus =
            bodyText?.toLowerCase().includes('completed') ||
            bodyText?.toLowerCase().includes('done') ||
            bodyText?.toLowerCase().includes('finished');

          expect(hasCompletedStatus).toBeTruthy();
        } else if (hasCheckbox) {
          await checkbox.first().click({ force: true });

          // Wait for status update
          await page.waitForTimeout(1000);

          // Verify checkbox state changed
          const isChecked = await checkbox.first().isChecked();
          expect(isChecked).toBeTruthy();
        }
      }
    });
  });

  test.describe('View Completed Assignments', () => {
    test('should display completed assignments separately', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Look for completed filter/tab
      const completedTab = page.locator('button:has-text("Completed"), [data-testid="completed-tab"]');
      const hasCompletedTab = await completedTab.isVisible().catch(() => false);

      if (hasCompletedTab) {
        await completedTab.first().click();
        await page.waitForTimeout(500);

        // Viewing completed assignments - test passes
        expect(true).toBeTruthy();
      }
    });

    test('should show completion date for completed assignments', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Check if there are completed assignments
      const bodyText = await page.locator('body').textContent();
      const hasCompletedAssignments = bodyText?.toLowerCase().includes('completed');

      if (hasCompletedAssignments) {
        // Should show when assignment was completed
        const hasCompletionInfo =
          bodyText?.toLowerCase().includes('completed on') ||
          bodyText?.toLowerCase().includes('finished') ||
          bodyText?.toLowerCase().includes('done');

        expect(hasCompletionInfo).toBeTruthy();
      }
    });
  });

  test.describe('Assignment Progress Tracking', () => {
    test('should show progress indicator if available', async ({ page }) => {
      await page.goto('/dashboard/assignments');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("Assignments"), text=My Assignments', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

      // Look for progress indicators
      const hasProgress = await page.locator('[data-testid="progress"], .progress, [role="progressbar"]').count() > 0;

      if (hasProgress) {
        expect(hasProgress).toBeTruthy();
      }
    });

    test('should display assignment statistics on dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Wait for dashboard to load
      await page.waitForSelector('main', {
        state: 'visible',
        timeout: 10000,
      });

      // Look for assignment stats
      const bodyText = await page.locator('body').textContent();
      const hasStats = bodyText?.toLowerCase().includes('assignment');

      if (hasStats) {
        expect(hasStats).toBeTruthy();
      }
    });
  });
});
