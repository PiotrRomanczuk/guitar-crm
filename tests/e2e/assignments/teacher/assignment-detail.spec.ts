/**
 * Teacher Assignment Detail Test
 *
 * Migrated from: cypress/e2e/features/student-assignment-completion.cy.ts (detail portions)
 *               cypress/e2e/admin/admin-assignments-workflow.cy.ts (view/edit navigation)
 *
 * Tests assignment detail page functionality for teachers:
 * 1. Detail view rendering - Verify assignment details display correctly
 * 2. Data display - Verify all assignment information is shown
 * 3. Navigation - Back to list, edit page, related entities
 * 4. Status display - Verify status badge rendering
 * 5. Related content - Verify student, teacher, lesson, songs display
 *
 * Prerequisites:
 * - Admin user with is_teacher=true: p.romanczuk@gmail.com / test123_admin
 * - Database has assignments available
 *
 * @tags @teacher @assignments @detail
 */
import { test, expect } from '../../../fixtures';

test.describe(
  'Teacher Assignment Detail',
  { tag: ['@teacher', '@assignments', '@detail'] },
  () => {
    // Set viewport to desktop to avoid mobile-hidden elements
    test.beforeEach(async ({ page, loginAs }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      // Login as admin (who has is_teacher=true)
      await loginAs('admin');
    });

    test.describe('Detail View Rendering', () => {
      test('should display assignment detail page when navigating from list', async ({
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
            await page.waitForLoadState('networkidle');

            // Should display assignment title (h1 heading)
            const heading = page.locator('h1');
            await expect(heading).toBeVisible();
          }
        }
      });

      test('should display back to assignments link', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Navigate to first assignment if available
        const assignmentRows = page.locator('table tbody tr');
        const rowCount = await assignmentRows.count().catch(() => 0);

        if (rowCount > 0) {
          await assignmentRows.first().click();
          await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
          await page.waitForLoadState('networkidle');

          // Verify back link is visible
          const backLink = page.locator('a:has-text("Back to Assignments")');
          await expect(backLink).toBeVisible();
          await expect(backLink).toHaveAttribute('href', '/dashboard/assignments');
        }
      });

      test('should display status badge', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const assignmentRows = page.locator('table tbody tr');
        const rowCount = await assignmentRows.count().catch(() => 0);

        if (rowCount > 0) {
          await assignmentRows.first().click();
          await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
          await page.waitForLoadState('networkidle');

          // Should display status badge (one of the possible statuses)
          const statusBadge = page.locator(
            'text=/Not Started|In Progress|Completed|Overdue/i'
          );
          await expect(statusBadge.first()).toBeVisible();
        }
      });

      test('should display description section', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const assignmentRows = page.locator('table tbody tr');
        const rowCount = await assignmentRows.count().catch(() => 0);

        if (rowCount > 0) {
          await assignmentRows.first().click();
          await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
          await page.waitForLoadState('networkidle');

          // Should display description heading
          const descriptionHeading = page.locator('h2:has-text("Description")');
          await expect(descriptionHeading).toBeVisible();
        }
      });
    });

    test.describe('Data Display', () => {
      test('should display student information', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const assignmentRows = page.locator('table tbody tr');
        const rowCount = await assignmentRows.count().catch(() => 0);

        if (rowCount > 0) {
          await assignmentRows.first().click();
          await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
          await page.waitForLoadState('networkidle');

          // Should display student section heading
          const studentHeading = page.locator('h3:has-text("Student")');
          await expect(studentHeading).toBeVisible();

          // Student should be a link or text
          const studentSection = studentHeading.locator('..');
          await expect(studentSection).toBeVisible();
        }
      });

      test('should display teacher information', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const assignmentRows = page.locator('table tbody tr');
        const rowCount = await assignmentRows.count().catch(() => 0);

        if (rowCount > 0) {
          await assignmentRows.first().click();
          await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
          await page.waitForLoadState('networkidle');

          // Should display teacher section heading
          const teacherHeading = page.locator('h3:has-text("Teacher")');
          await expect(teacherHeading).toBeVisible();
        }
      });

      test('should display due date information', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const assignmentRows = page.locator('table tbody tr');
        const rowCount = await assignmentRows.count().catch(() => 0);

        if (rowCount > 0) {
          await assignmentRows.first().click();
          await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
          await page.waitForLoadState('networkidle');

          // Should display due date section heading
          const dueDateHeading = page.locator('h3:has-text("Due Date")');
          await expect(dueDateHeading).toBeVisible();
        }
      });

      test('should display assignment history timeline', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const assignmentRows = page.locator('table tbody tr');
        const rowCount = await assignmentRows.count().catch(() => 0);

        if (rowCount > 0) {
          await assignmentRows.first().click();
          await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
          await page.waitForLoadState('networkidle');

          // Should display history timeline section
          const historyHeading = page.locator('text=Assignment History');
          await expect(historyHeading).toBeVisible();
        }
      });
    });

    test.describe('Navigation', () => {
      test('should navigate back to assignments list', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const assignmentRows = page.locator('table tbody tr');
        const rowCount = await assignmentRows.count().catch(() => 0);

        if (rowCount > 0) {
          await assignmentRows.first().click();
          await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
          await page.waitForLoadState('networkidle');

          // Click back link
          const backLink = page.locator('a:has-text("Back to Assignments")');
          await backLink.click();

          // Should navigate back to list
          await expect(page).toHaveURL('/dashboard/assignments');
        }
      });

      test('should navigate to student profile when clicking student link', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const assignmentRows = page.locator('table tbody tr');
        const rowCount = await assignmentRows.count().catch(() => 0);

        if (rowCount > 0) {
          await assignmentRows.first().click();
          await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
          await page.waitForLoadState('networkidle');

          // Find student section and click link if it exists
          const studentHeading = page.locator('h3:has-text("Student")');
          const studentSection = studentHeading.locator('..');
          const studentLink = studentSection.locator('a[href*="/dashboard/users/"]');

          const hasStudentLink = await studentLink.isVisible().catch(() => false);

          if (hasStudentLink) {
            await studentLink.click();
            await expect(page).toHaveURL(/\/dashboard\/users\/[^/]+$/);
          }
        }
      });

      test('should navigate to teacher profile when clicking teacher link', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const assignmentRows = page.locator('table tbody tr');
        const rowCount = await assignmentRows.count().catch(() => 0);

        if (rowCount > 0) {
          await assignmentRows.first().click();
          await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
          await page.waitForLoadState('networkidle');

          // Find teacher section and click link if it exists
          const teacherHeading = page.locator('h3:has-text("Teacher")');
          const teacherSection = teacherHeading.locator('..');
          const teacherLink = teacherSection.locator('a[href*="/dashboard/users/"]');

          const hasTeacherLink = await teacherLink.isVisible().catch(() => false);

          if (hasTeacherLink) {
            await teacherLink.click();
            await expect(page).toHaveURL(/\/dashboard\/users\/[^/]+$/);
          }
        }
      });

      test('should navigate to related lesson when clicking lesson link', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const assignmentRows = page.locator('table tbody tr');
        const rowCount = await assignmentRows.count().catch(() => 0);

        if (rowCount > 0) {
          await assignmentRows.first().click();
          await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
          await page.waitForLoadState('networkidle');

          // Check if related lesson section exists
          const lessonHeading = page.locator('h3:has-text("Related Lesson")');
          const hasLessonSection = await lessonHeading.isVisible().catch(() => false);

          if (hasLessonSection) {
            const lessonLink = lessonHeading
              .locator('..')
              .locator('a[href*="/dashboard/lessons/"]');

            const hasLessonLink = await lessonLink.isVisible().catch(() => false);

            if (hasLessonLink) {
              await lessonLink.click();
              await expect(page).toHaveURL(/\/dashboard\/lessons\/[^/]+$/);
            }
          }
        }
      });
    });

    test.describe('Related Content', () => {
      test('should display related songs section when available', async ({
        page,
      }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const assignmentRows = page.locator('table tbody tr');
        const rowCount = await assignmentRows.count().catch(() => 0);

        if (rowCount > 0) {
          await assignmentRows.first().click();
          await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
          await page.waitForLoadState('networkidle');

          // Check if related songs section exists (might not exist for all assignments)
          const relatedSongsHeading = page.locator('h3:has-text("Related Songs")');
          const hasRelatedSongs = await relatedSongsHeading
            .isVisible()
            .catch(() => false);

          if (hasRelatedSongs) {
            // Verify the section has content
            await expect(relatedSongsHeading).toBeVisible();

            // Should have at least one song link
            const songLinks = page.locator('a[href*="/dashboard/songs/"]');
            const songCount = await songLinks.count();
            expect(songCount).toBeGreaterThan(0);
          }
        }
      });

      test('should navigate to song when clicking song link', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const assignmentRows = page.locator('table tbody tr');
        const rowCount = await assignmentRows.count().catch(() => 0);

        if (rowCount > 0) {
          await assignmentRows.first().click();
          await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
          await page.waitForLoadState('networkidle');

          // Check if related songs section exists with links
          const songLinks = page.locator('a[href*="/dashboard/songs/"]');
          const hasSongLinks = await songLinks.first().isVisible().catch(() => false);

          if (hasSongLinks) {
            await songLinks.first().click();
            await expect(page).toHaveURL(/\/dashboard\/songs\/[^/]+$/);
          }
        }
      });
    });

    test.describe('Error Handling', () => {
      test('should show error for non-existent assignment', async ({ page }) => {
        // Navigate directly to a non-existent assignment
        await page.goto('/dashboard/assignments/00000000-0000-0000-0000-000000000000');
        await page.waitForLoadState('networkidle');

        // Should display error message
        const errorMessage = page.locator('text=Assignment not found');
        await expect(errorMessage).toBeVisible();
      });

      test('should show error for invalid assignment ID', async ({ page }) => {
        // Navigate directly to an invalid assignment ID
        await page.goto('/dashboard/assignments/invalid-id');
        await page.waitForLoadState('networkidle');

        // Should display error message
        const errorMessage = page.locator('text=Assignment not found');
        await expect(errorMessage).toBeVisible();
      });
    });

    test.describe('Mobile View', () => {
      test.beforeEach(async ({ page }) => {
        // Set viewport to mobile size
        await page.setViewportSize({ width: 375, height: 667 });
      });

      test('should display assignment detail on mobile', async ({
        page,
        loginAs,
      }) => {
        await loginAs('admin');
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Wait for content to load
        await page.waitForTimeout(1000);

        // On mobile, look for mobile cards or table rows
        const mobileCards = page.locator('.md\\:hidden a[href*="/assignments/"]');
        const tableRows = page.locator('table tbody tr');

        const hasMobileCards = await mobileCards.count().catch(() => 0);
        const hasTableRows = await tableRows.count().catch(() => 0);

        if (hasMobileCards > 0) {
          await mobileCards.first().click();
        } else if (hasTableRows > 0) {
          await tableRows.first().click();
        } else {
          // No assignments, skip test
          return;
        }

        await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
        await page.waitForLoadState('networkidle');

        // Should display assignment title
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();

        // Should display back link
        const backLink = page.locator('a:has-text("Back to Assignments")');
        await expect(backLink).toBeVisible();
      });

      test('should display responsive layout on mobile', async ({
        page,
        loginAs,
      }) => {
        await loginAs('admin');
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Navigate to first assignment
        const mobileCards = page.locator('.md\\:hidden a[href*="/assignments/"]');
        const tableRows = page.locator('table tbody tr');

        const hasMobileCards = await mobileCards.count().catch(() => 0);
        const hasTableRows = await tableRows.count().catch(() => 0);

        if (hasMobileCards > 0) {
          await mobileCards.first().click();
        } else if (hasTableRows > 0) {
          await tableRows.first().click();
        } else {
          return;
        }

        await expect(page).toHaveURL(/\/dashboard\/assignments\/[^/]+$/);
        await page.waitForLoadState('networkidle');

        // Description section should be visible
        const descriptionHeading = page.locator('h2:has-text("Description")');
        await expect(descriptionHeading).toBeVisible();

        // Student section should be visible
        const studentHeading = page.locator('h3:has-text("Student")');
        await expect(studentHeading).toBeVisible();
      });
    });
  }
);
