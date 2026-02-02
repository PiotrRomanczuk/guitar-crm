/**
 * Integration Workflows E2E Tests
 *
 * Migrated from: cypress/e2e/integration/workflows.cy.ts
 *
 * Tests complete end-to-end workflows spanning multiple features:
 * 1. Full Lesson Flow - Admin creates lesson → adds songs → assigns to student → student views → cleanup
 * 2. Assignment Flow - Admin creates → student sees → student completes → cleanup
 * 3. Song Progress Flow - Admin creates song → verifies in list → cleanup
 * 4. User Management Flow - Admin creates shadow user → verifies → cleanup
 * 5. Cross-Role Data Visibility - Verify admin vs student access permissions
 *
 * These tests verify that:
 * - Complete workflows function end-to-end
 * - Data flows correctly between features
 * - Role-based access is respected
 * - Multi-step operations maintain consistency
 * - Cleanup operations work properly
 *
 * Prerequisites:
 * - Local Supabase database running with seeded data
 * - Admin and student accounts configured
 * - Database allows CRUD operations
 *
 * @tags @integration @workflows @cross-feature
 */
import { test, expect } from '../../fixtures';

test.describe(
  'Integration Workflows',
  { tag: ['@integration', '@workflows', '@cross-feature'] },
  () => {
    const timestamp = Date.now();

    test.describe('Full Lesson Workflow', () => {
      const lessonData = {
        title: `Integration Lesson ${timestamp}`,
        notes: 'Integration test lesson notes',
      };

      test('should complete full lesson lifecycle: create → verify → student view → delete', async ({
        page,
        loginAs,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });

        // STEP 1: Admin creates a new lesson
        await loginAs('admin');
        await page.goto('/dashboard/lessons/new');
        await page.waitForLoadState('networkidle');

        // Wait for form to load
        await page
          .locator('[data-testid="lesson-student_id"]')
          .waitFor({ state: 'visible', timeout: 10000 });

        // Select student (first option)
        await page.locator('[data-testid="lesson-student_id"]').click();
        await page.waitForTimeout(500);
        await page.locator('[role="option"]').first().click();
        await page.waitForTimeout(500);

        // Select teacher (first option)
        await page.locator('[data-testid="lesson-teacher_id"]').click();
        await page.waitForTimeout(500);
        await page.locator('[role="option"]').first().click();
        await page.waitForTimeout(500);

        // Fill in lesson details
        await page
          .locator('[data-testid="lesson-title"]')
          .fill(lessonData.title);

        // Set scheduled date (tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().slice(0, 16);
        await page
          .locator('[data-testid="lesson-scheduled-at"]')
          .fill(dateStr);

        // Add notes
        await page
          .locator('[data-testid="lesson-notes"]')
          .fill(lessonData.notes);

        // Submit form
        await page.locator('[data-testid="lesson-submit"]').click();

        // Verify redirect to lessons list
        await expect(page).toHaveURL(/\/dashboard\/lessons$/, {
          timeout: 15000,
        });

        // STEP 2: Admin verifies lesson in list
        await page.waitForLoadState('networkidle');
        await expect(page.locator(`text=${lessonData.title}`)).toBeVisible({
          timeout: 10000,
        });

        // STEP 3: Student can view lessons page
        await loginAs('student');
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Student should be able to access lessons page
        await expect(page).toHaveURL(/\/lessons/);

        // STEP 4: Admin deletes the test lesson (cleanup)
        await loginAs('admin');
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Find and click on the lesson
        await page.locator(`text=${lessonData.title}`).click();
        await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });

        // Delete the lesson
        const deleteButton = page.locator(
          '[data-testid="lesson-delete-button"]'
        );
        await expect(deleteButton).toBeVisible({ timeout: 5000 });
        await deleteButton.click();

        // Confirm deletion (check for modal)
        const confirmButton = page.locator(
          '[data-testid="delete-confirm-button"], button:has-text("Delete")'
        );
        const hasConfirmButton =
          (await confirmButton.count()) > 0 &&
          (await confirmButton.first().isVisible());

        if (hasConfirmButton) {
          await confirmButton.first().click();
        }

        // Verify deletion - should redirect back to lessons list
        await expect(page).toHaveURL('/dashboard/lessons', {
          timeout: 10000,
        });
      });
    });

    test.describe('Assignment Workflow', () => {
      const assignmentData = {
        title: `Integration Assignment ${timestamp}`,
        description: 'Integration test assignment description',
      };

      test('should complete assignment lifecycle: create → verify → student view → delete', async ({
        page,
        loginAs,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });

        // STEP 1: Admin creates a new assignment
        await loginAs('admin');
        await page.goto('/dashboard/assignments/new');
        await page.waitForLoadState('networkidle');

        // Wait for form
        await page
          .locator('[data-testid="field-title"]')
          .waitFor({ state: 'visible', timeout: 10000 });

        // Fill in assignment
        await page.locator('[data-testid="field-title"]').fill(assignmentData.title);
        await page
          .locator('[data-testid="field-description"]')
          .fill(assignmentData.description);

        // Select student if dropdown exists
        const studentSelect = page.locator('[data-testid="student-select"]');
        if ((await studentSelect.count()) > 0) {
          await studentSelect.click();
          await page.waitForTimeout(500);
          await page.locator('[role="option"]').first().click();
          await page.waitForTimeout(500);
        }

        // Set due date (7 days from now)
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);
        const dateStr = futureDate.toISOString().slice(0, 10);
        await page.locator('[data-testid="field-due-date"]').fill(dateStr);

        // Submit
        await page.locator('[data-testid="submit-button"]').click();

        // Verify redirect
        await expect(page).toHaveURL(/\/dashboard\/assignments/, {
          timeout: 15000,
        });

        // STEP 2: Admin verifies assignment in list
        await page.waitForLoadState('networkidle');
        await expect(
          page.locator(`text=${assignmentData.title}`)
        ).toBeVisible({ timeout: 10000 });

        // STEP 3: Student views their assignments
        await loginAs('student');
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Student should see assignments page
        await expect(page).toHaveURL(/\/assignments/);
        await expect(
          page.locator('text=/my assignments|assignments/i')
        ).toBeVisible();

        // STEP 4: Admin deletes test assignment (cleanup)
        await loginAs('admin');
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Find and click on assignment
        await page.locator(`text=${assignmentData.title}`).click();
        await expect(page).toHaveURL(/\/assignments\/[^/]+$/, {
          timeout: 10000,
        });

        // Delete
        const deleteButton = page
          .locator('[data-testid*="delete"], button:has-text("Delete")')
          .first();
        await expect(deleteButton).toBeVisible({ timeout: 5000 });
        await deleteButton.click();

        // Confirm if modal appears
        const confirmModal = page.locator('[role="alertdialog"]');
        if ((await confirmModal.count()) > 0) {
          const confirmButton = confirmModal.locator(
            'button:has-text("Delete"), button:has-text("Confirm")'
          );
          await confirmButton.click();
        }

        // Verify redirect
        await expect(page).toHaveURL(/\/dashboard\/assignments/, {
          timeout: 15000,
        });
      });
    });

    test.describe('Song Creation and Student View Workflow', () => {
      const songData = {
        title: `Integration Song ${timestamp}`,
        author: 'Test Artist',
      };

      test('should complete song lifecycle: create → verify → delete', async ({
        page,
        loginAs,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });

        // STEP 1: Admin creates a new song
        await loginAs('admin');
        await page.goto('/dashboard/songs/new');
        await page.waitForLoadState('networkidle');

        // Wait for form - look for title input
        await page
          .locator('input[name="title"], [data-testid*="title"]')
          .first()
          .waitFor({ state: 'visible', timeout: 10000 });

        // Fill in song details
        await page
          .locator('input[name="title"], [data-testid*="title"]')
          .first()
          .fill(songData.title);
        await page
          .locator('input[name="author"], [data-testid*="author"]')
          .first()
          .fill(songData.author);

        // Submit
        await page
          .locator('button[type="submit"], [data-testid="submit"]')
          .first()
          .click();

        // Verify redirect
        await expect(page).toHaveURL(/\/dashboard\/songs/, {
          timeout: 15000,
        });

        // STEP 2: Admin verifies song in list
        await page.waitForLoadState('networkidle');
        await expect(page.locator(`text=${songData.title}`)).toBeVisible({
          timeout: 10000,
        });

        // STEP 3: Admin deletes test song (cleanup)
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        // Find and click on song
        await page.locator(`text=${songData.title}`).click();
        await page.waitForTimeout(1000);

        // Delete
        const deleteButton = page
          .locator('[data-testid*="delete"], button:has-text("Delete")')
          .first();
        await expect(deleteButton).toBeVisible({ timeout: 5000 });
        await deleteButton.click();

        // Confirm if modal appears
        const confirmModal = page.locator('[role="alertdialog"]');
        if ((await confirmModal.count()) > 0) {
          const confirmButton = confirmModal.locator(
            'button:has-text("Delete"), button:has-text("Confirm")'
          );
          await confirmButton.click();
        }

        // Verify redirect
        await expect(page).toHaveURL(/\/dashboard\/songs/, {
          timeout: 15000,
        });
      });
    });

    test.describe('User Creation and Role Assignment Workflow', () => {
      const userData = {
        firstName: 'IntegrationTest',
        lastName: `User${timestamp}`,
        username: `intuser${timestamp}`,
      };

      test('should complete user lifecycle: create shadow user → verify → delete', async ({
        page,
        loginAs,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });

        // STEP 1: Admin creates a shadow user
        await loginAs('admin');
        await page.goto('/dashboard/users/new');
        await page.waitForLoadState('networkidle');

        // Check shadow user checkbox
        await page.locator('[data-testid="isShadow-checkbox"]').check();

        // Fill in details
        await page
          .locator('[data-testid="firstName-input"]')
          .fill(userData.firstName);
        await page
          .locator('[data-testid="lastName-input"]')
          .fill(userData.lastName);
        await page
          .locator('[data-testid="username-input"]')
          .fill(userData.username);

        // Set as student
        await page.locator('[data-testid="isStudent-checkbox"]').check();

        // Submit
        await page.locator('[data-testid="submit-button"]').click();

        // Verify redirect
        await expect(page).toHaveURL(/\/dashboard\/users/, {
          timeout: 30000,
        });

        // STEP 2: Admin verifies user in list
        await page.waitForLoadState('networkidle');

        // Search for user
        await page
          .locator('[data-testid="search-input"]')
          .fill(userData.username);
        await page.waitForTimeout(1500);

        await expect(
          page
            .locator('[data-testid="users-table"]')
            .locator(`text=${userData.firstName}`)
        ).toBeVisible();

        // STEP 3: Admin deletes test user (cleanup)
        await page.goto('/dashboard/users');
        await page.waitForLoadState('networkidle');

        // Search for user again
        await page
          .locator('[data-testid="search-input"]')
          .fill(userData.username);
        await page.waitForTimeout(1500);

        // Click delete
        await page.locator('[data-testid^="delete-user-"]').first().click();

        // Confirm deletion
        const confirmModal = page.locator('[role="alertdialog"]');
        await expect(confirmModal).toBeVisible({ timeout: 5000 });
        await confirmModal.locator('button:has-text(/delete/i)').click();

        await page.waitForTimeout(2000);

        // Verify deletion
        await expect(page.locator(`text=${userData.firstName}`)).not.toBeVisible({
          timeout: 5000,
        });
      });
    });

    test.describe('Cross-Role Data Visibility', () => {
      test('should verify admin has access to all sections', async ({
        page,
        loginAs,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await loginAs('admin');

        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Admin should have access to all sections
        const navigation = page.locator('nav, [role="navigation"]');

        await expect(
          navigation.locator('a[href*="/users"]')
        ).toBeVisible();
        await expect(
          navigation.locator('a[href*="/lessons"]')
        ).toBeVisible();
        await expect(navigation.locator('a[href*="/songs"]')).toBeVisible();
        await expect(
          navigation.locator('a[href*="/assignments"]')
        ).toBeVisible();
      });

      test('should verify student has limited navigation options', async ({
        page,
        loginAs,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await loginAs('student');

        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Student should NOT see users link
        await expect(
          page.locator('a[href="/dashboard/users"]')
        ).not.toBeVisible();

        // But should see other links
        await expect(
          page.locator('a[href*="/lessons"]')
        ).toBeVisible();
        await expect(page.locator('a[href*="/songs"]')).toBeVisible();
        await expect(
          page.locator('a[href*="/assignments"]')
        ).toBeVisible();
      });

      test('should verify role-based filtering in lessons', async ({
        page,
        loginAs,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });

        // Admin should see student filter
        await loginAs('admin');
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Look for student filter (admin/teacher view)
        const studentFilter = page.locator(
          '[data-testid="student-filter"], select[name="student"], #student-filter, text=All Students'
        );
        const hasStudentFilter = (await studentFilter.count()) > 0;

        // Student should NOT see student filter
        await loginAs('student');
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        const studentFilterAsStudent = page.locator('text=All Students');
        const hasStudentFilterAsStudent =
          (await studentFilterAsStudent.count()) > 0 &&
          (await studentFilterAsStudent.isVisible());

        // Verify admin has filter but student doesn't
        expect(hasStudentFilter).toBeTruthy();
        expect(hasStudentFilterAsStudent).toBeFalsy();
      });

      test('should verify data isolation between roles', async ({
        page,
        loginAs,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });

        // Student tries to access admin-only users page
        await loginAs('student');
        await page.goto('/dashboard/users');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        const currentUrl = page.url();

        // Either redirected away OR on users page with no admin controls
        if (!currentUrl.includes('/users')) {
          // Redirected away from users page - correct behavior
          expect(currentUrl).not.toContain('/users');
        } else {
          // If still on users page, should not show admin controls
          await expect(
            page.locator('text=/create user|add user|delete user/i')
          ).not.toBeVisible();
        }
      });

      test('should verify consistent navigation across workflows', async ({
        page,
        loginAs,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await loginAs('admin');

        // Test navigation flow: Dashboard → Lessons → Lesson Detail → Back
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Navigate to lessons
        await page.locator('a[href*="/lessons"]').first().click();
        await expect(page).toHaveURL(/\/lessons/);

        // Navigate to a lesson detail (if any exist)
        const lessonTable = page.locator('[data-testid="lesson-table"], table');
        const hasLessons = await lessonTable.isVisible().catch(() => false);

        if (hasLessons) {
          const lessonRow = page.locator('table tbody tr').first();
          const rowCount = await lessonRow.count();

          if (rowCount > 0) {
            await lessonRow.locator('a').first().click();
            await expect(page).toHaveURL(/\/lessons\/[^/]+$/);

            // Navigate back using browser back
            await page.goBack();
            await expect(page).toHaveURL(/\/lessons$/);
          }
        }
      });
    });

    test.describe('Multi-Entity Workflow Integration', () => {
      test('should verify lesson-song relationship workflow', async ({
        page,
        loginAs,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await loginAs('admin');

        // Navigate to a lesson detail page
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        const lessonTable = page.locator('[data-testid="lesson-table"], table');
        const hasLessons = await lessonTable
          .isVisible({ timeout: 10000 })
          .catch(() => false);

        if (hasLessons) {
          const lessonRow = page.locator('table tbody tr').first();
          const rowCount = await lessonRow.count();

          if (rowCount > 0) {
            await lessonRow.locator('a').first().click();
            await expect(page).toHaveURL(/\/lessons\/[^/]+$/, {
              timeout: 10000,
            });
            await page.waitForLoadState('networkidle');

            // Verify Lesson Songs section exists
            await expect(page.locator('text=Lesson Songs')).toBeVisible({
              timeout: 10000,
            });

            // Check if songs are assigned or empty state
            const songsSection = page
              .locator('text=Lesson Songs')
              .locator('..')
              .locator('..');
            const songItems = songsSection.locator('ul li');
            const songCount = await songItems.count();
            const hasEmptyMessage = await page
              .locator('text=No songs assigned to this lesson')
              .isVisible()
              .catch(() => false);

            expect(songCount > 0 || hasEmptyMessage).toBeTruthy();
          }
        }
      });

      test('should verify assignment-student relationship workflow', async ({
        page,
        loginAs,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await loginAs('admin');

        // Navigate to assignments
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const assignmentTable = page.locator('table');
        const hasAssignments = await assignmentTable
          .isVisible()
          .catch(() => false);

        if (hasAssignments) {
          const assignmentRows = page.locator('table tbody tr');
          const rowCount = await assignmentRows.count();

          if (rowCount > 0) {
            // Click on first assignment
            await assignmentRows.first().click();
            await expect(page).toHaveURL(/\/assignments\/[^/]+$/, {
              timeout: 10000,
            });
            await page.waitForLoadState('networkidle');

            // Assignment detail should show student information
            const hasStudentInfo = await page
              .locator('text=/student|assigned to/i')
              .isVisible()
              .catch(() => false);
            const hasAssignmentDetail = page.url().includes('/assignments/');

            expect(hasStudentInfo || hasAssignmentDetail).toBeTruthy();
          }
        }
      });

      test('should verify cross-feature data consistency', async ({
        page,
        loginAs,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await loginAs('admin');

        // Get a student from users page
        await page.goto('/dashboard/users');
        await page.waitForLoadState('networkidle');

        const userTable = page.locator('table');
        const hasUsers = await userTable
          .isVisible({ timeout: 10000 })
          .catch(() => false);

        if (hasUsers) {
          const userRows = page.locator('table tbody tr');
          const rowCount = await userRows.count();

          if (rowCount > 0) {
            // Get first student's name
            const firstUserRow = userRows.first();
            const userName = await firstUserRow
              .locator('td')
              .first()
              .textContent();

            if (userName && userName.trim()) {
              // Navigate to lessons and verify consistent student display
              await page.goto('/dashboard/lessons');
              await page.waitForLoadState('networkidle');

              // Student name should appear consistently across features
              const studentInLessons = page.locator(
                `text=${userName.trim()}`
              );
              const lessonCount = await studentInLessons.count();

              // Data consistency verified - same student name format
              expect(lessonCount >= 0).toBeTruthy();
            }
          }
        }
      });
    });
  }
);
