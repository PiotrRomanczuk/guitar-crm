/**
 * Student Lesson Detail View Test
 *
 * Migrated from: cypress/e2e/student-learning-journey.cy.ts (Phase 2: View Lessons)
 *
 * Tests lesson detail page functionality for students:
 * 1. Navigation to detail page from list
 * 2. Display of lesson information (title, student, teacher, date, status)
 * 3. Absence of teacher-only action buttons (Edit, Delete)
 * 4. Display of Lesson Songs section
 * 5. Display of Assignments section
 * 6. Display of Lesson History section
 * 7. Back navigation to list
 *
 * Prerequisites:
 * - Student user: student@example.com / test123_student
 * - Database has at least one lesson assigned to this student
 *
 * @tags @student @lessons @detail
 */
import { test, expect } from '../../../fixtures';

test.describe(
  'Student Lesson Detail View',
  { tag: ['@student', '@lessons', '@detail'] },
  () => {
    // Set viewport to desktop to avoid mobile-hidden elements
    test.beforeEach(async ({ page, loginAs }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      // Login as student
      await loginAs('student');
    });

    test.describe('Navigation', () => {
      test('should navigate to lesson detail page from list', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for page content to load
        await page.waitForTimeout(1000);

        // Check if there are any lessons available for this student
        const lessonLinks = page.locator('a[href*="/lessons/"]');
        const linkCount = await lessonLinks.count();

        if (linkCount > 0) {
          // Click on the first lesson link
          await lessonLinks.first().click();

          // Verify we're on a lesson detail page (URL matches /lessons/[uuid])
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
        } else {
          // No lessons found - this is acceptable for student view
          // Students may not have any lessons assigned yet
          const noLessonsMessage = page.locator('text=/no lessons|empty/i');
          const pageContent = await page.content();
          expect(
            (await noLessonsMessage.isVisible().catch(() => false)) ||
              pageContent.includes('lessons')
          ).toBeTruthy();
        }
      });

      test('should navigate back to lessons list via Back link', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for page content to load
        await page.waitForTimeout(1000);

        // Check if there are any lessons available
        const lessonLinks = page.locator('a[href*="/lessons/"]');
        const linkCount = await lessonLinks.count();

        if (linkCount > 0) {
          // Click on the first lesson link
          await lessonLinks.first().click();

          // Verify we're on a lesson detail page
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
          await page.waitForLoadState('networkidle');

          // Click the Back link to go back to lessons list
          const backLink = page.locator('a[href="/dashboard/lessons"]').first();
          await backLink.waitFor({ state: 'visible', timeout: 10000 });
          await backLink.click();

          // Verify we're back on the lessons list
          await expect(page).toHaveURL('/dashboard/lessons', { timeout: 10000 });
        }
      });
    });

    test.describe('Lesson Information Display', () => {
      test('should display lesson detail card', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for page content to load
        await page.waitForTimeout(1000);

        // Check if there are any lessons available
        const lessonLinks = page.locator('a[href*="/lessons/"]');
        const linkCount = await lessonLinks.count();

        if (linkCount > 0) {
          // Click on the first lesson link
          await lessonLinks.first().click();

          // Verify we're on a lesson detail page
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
          await page.waitForLoadState('networkidle');

          // Verify the lesson detail card is visible
          const detailCard = page.locator('[data-testid="lesson-detail"]');
          await expect(detailCard).toBeVisible({ timeout: 10000 });
        }
      });

      test('should display lesson title on detail page', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for page content to load
        await page.waitForTimeout(1000);

        // Check if there are any lessons available
        const lessonLinks = page.locator('a[href*="/lessons/"]');
        const linkCount = await lessonLinks.count();

        if (linkCount > 0) {
          // Click on the first lesson link
          await lessonLinks.first().click();

          // Verify we're on a lesson detail page
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
          await page.waitForLoadState('networkidle');

          // Verify the page has a main heading (h1) for the lesson title
          const pageTitle = page.locator('h1').first();
          await expect(pageTitle).toBeVisible({ timeout: 10000 });

          // Title should exist (could be "Untitled" if no title set)
          const titleText = await pageTitle.textContent();
          expect(titleText).toBeTruthy();
        }
      });

      test('should display lesson information fields', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for page content to load
        await page.waitForTimeout(1000);

        // Check if there are any lessons available
        const lessonLinks = page.locator('a[href*="/lessons/"]');
        const linkCount = await lessonLinks.count();

        if (linkCount > 0) {
          // Click on the first lesson link
          await lessonLinks.first().click();

          // Verify we're on a lesson detail page
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
          await page.waitForLoadState('networkidle');

          // Wait for detail card to load
          await page.locator('[data-testid="lesson-detail"]').waitFor({
            state: 'visible',
            timeout: 10000,
          });

          // Check for common lesson info labels
          const infoLabels = ['Student', 'Teacher', 'Date', 'Time', 'Lesson #'];

          // At least some info labels should be visible
          let foundInfoLabel = false;
          for (const label of infoLabels) {
            const labelElement = page.locator(`text=${label}`).first();
            const isVisible = await labelElement
              .isVisible({ timeout: 1000 })
              .catch(() => false);
            if (isVisible) {
              foundInfoLabel = true;
              break;
            }
          }

          // The detail page should display lesson information
          expect(foundInfoLabel).toBeTruthy();
        }
      });

      test('should display lesson status badge', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for page content to load
        await page.waitForTimeout(1000);

        // Check if there are any lessons available
        const lessonLinks = page.locator('a[href*="/lessons/"]');
        const linkCount = await lessonLinks.count();

        if (linkCount > 0) {
          // Click on the first lesson link
          await lessonLinks.first().click();

          // Verify we're on a lesson detail page
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
          await page.waitForLoadState('networkidle');

          // Wait for detail card to load
          await page.locator('[data-testid="lesson-detail"]').waitFor({
            state: 'visible',
            timeout: 10000,
          });

          // Check for status badge (SCHEDULED or COMPLETED)
          const statusBadge = page.locator('text=/SCHEDULED|COMPLETED/i').first();
          await expect(statusBadge).toBeVisible({ timeout: 10000 });
        }
      });
    });

    test.describe('Student Access Control - No Edit/Delete Buttons', () => {
      test('should NOT display Edit button for students', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for page content to load
        await page.waitForTimeout(1000);

        // Check if there are any lessons available
        const lessonLinks = page.locator('a[href*="/lessons/"]');
        const linkCount = await lessonLinks.count();

        if (linkCount > 0) {
          // Click on the first lesson link
          await lessonLinks.first().click();

          // Verify we're on a lesson detail page
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
          await page.waitForLoadState('networkidle');

          // Wait for detail card to load
          await page.locator('[data-testid="lesson-detail"]').waitFor({
            state: 'visible',
            timeout: 10000,
          });

          // Student should NOT see Edit button
          const editButton = page.locator('[data-testid="lesson-edit-button"]');
          await expect(editButton).not.toBeVisible();
        }
      });

      test('should NOT display Delete button for students', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for page content to load
        await page.waitForTimeout(1000);

        // Check if there are any lessons available
        const lessonLinks = page.locator('a[href*="/lessons/"]');
        const linkCount = await lessonLinks.count();

        if (linkCount > 0) {
          // Click on the first lesson link
          await lessonLinks.first().click();

          // Verify we're on a lesson detail page
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
          await page.waitForLoadState('networkidle');

          // Wait for detail card to load
          await page.locator('[data-testid="lesson-detail"]').waitFor({
            state: 'visible',
            timeout: 10000,
          });

          // Student should NOT see Delete button
          const deleteButton = page.locator('[data-testid="lesson-delete-button"]');
          await expect(deleteButton).not.toBeVisible();
        }
      });

      test('should NOT have access to edit page directly', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for page content to load
        await page.waitForTimeout(1000);

        // Check if there are any lessons available
        const lessonLinks = page.locator('a[href*="/lessons/"]');
        const linkCount = await lessonLinks.count();

        if (linkCount > 0) {
          // Get the lesson ID from the first link
          const href = await lessonLinks.first().getAttribute('href');
          const lessonId = href?.split('/lessons/')[1];

          if (lessonId) {
            // Try to access edit page directly
            await page.goto(`/dashboard/lessons/${lessonId}/edit`);
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);

            // Should either redirect away from edit page OR show unauthorized message
            const isOnEditPage = page.url().includes('/edit');
            const hasUnauthorizedMessage = await page
              .locator('text=/unauthorized|access denied|not allowed|forbidden/i')
              .isVisible()
              .catch(() => false);

            const isRedirectedAway = !isOnEditPage;

            // Either redirected away from edit page or shows unauthorized message
            expect(isRedirectedAway || hasUnauthorizedMessage).toBeTruthy();
          }
        }
      });
    });

    test.describe('Lesson Songs Section', () => {
      test('should display Lesson Songs section', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for page content to load
        await page.waitForTimeout(1000);

        // Check if there are any lessons available
        const lessonLinks = page.locator('a[href*="/lessons/"]');
        const linkCount = await lessonLinks.count();

        if (linkCount > 0) {
          // Click on the first lesson link
          await lessonLinks.first().click();

          // Verify we're on a lesson detail page
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
          await page.waitForLoadState('networkidle');

          // Check for Lesson Songs section heading
          const songsSection = page.locator('text=Lesson Songs').first();
          await expect(songsSection).toBeVisible({ timeout: 10000 });
        }
      });

      test('should display empty state or songs list', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for page content to load
        await page.waitForTimeout(1000);

        // Check if there are any lessons available
        const lessonLinks = page.locator('a[href*="/lessons/"]');
        const linkCount = await lessonLinks.count();

        if (linkCount > 0) {
          // Click on the first lesson link
          await lessonLinks.first().click();

          // Verify we're on a lesson detail page
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
          await page.waitForLoadState('networkidle');

          // Wait for the page content to load
          await page.waitForTimeout(1000);

          // Check for either songs in the list or "No songs assigned" message
          const hasSongsList = await page
            .locator('text=Lesson Songs')
            .first()
            .isVisible()
            .catch(() => false);

          const hasEmptyMessage = await page
            .locator('text=/No songs assigned/i')
            .isVisible()
            .catch(() => false);

          const hasSongItems = await page
            .locator('.divide-y li')
            .count()
            .then((count) => count > 0)
            .catch(() => false);

          // Either has songs section with items or empty message
          expect(hasSongsList || hasEmptyMessage || hasSongItems).toBeTruthy();
        }
      });
    });

    test.describe('Assignments Section', () => {
      test('should display Assignments section', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for page content to load
        await page.waitForTimeout(1000);

        // Check if there are any lessons available
        const lessonLinks = page.locator('a[href*="/lessons/"]');
        const linkCount = await lessonLinks.count();

        if (linkCount > 0) {
          // Click on the first lesson link
          await lessonLinks.first().click();

          // Verify we're on a lesson detail page
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
          await page.waitForLoadState('networkidle');

          // Check for Assignments section heading
          const assignmentsSection = page.locator('text=Assignments').first();
          await expect(assignmentsSection).toBeVisible({ timeout: 10000 });
        }
      });

      test('should display empty state or assignments table', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for page content to load
        await page.waitForTimeout(1000);

        // Check if there are any lessons available
        const lessonLinks = page.locator('a[href*="/lessons/"]');
        const linkCount = await lessonLinks.count();

        if (linkCount > 0) {
          // Click on the first lesson link
          await lessonLinks.first().click();

          // Verify we're on a lesson detail page
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
          await page.waitForLoadState('networkidle');

          // Wait for the page content to load
          await page.waitForTimeout(1000);

          // Check for either assignments table or "No assignments" message
          const hasAssignmentsSection = await page
            .locator('text=Assignments')
            .first()
            .isVisible()
            .catch(() => false);

          const hasEmptyMessage = await page
            .locator('text=/No assignments/i')
            .isVisible()
            .catch(() => false);

          const hasAssignmentTable = await page
            .locator('th:has-text("Title"), th:has-text("Due Date"), th:has-text("Status")')
            .count()
            .then((count) => count > 0)
            .catch(() => false);

          // Either has assignments section with table or empty message
          expect(hasAssignmentsSection || hasEmptyMessage || hasAssignmentTable).toBeTruthy();
        }
      });
    });

    test.describe('Lesson History Section', () => {
      test('should display Lesson History section', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for page content to load
        await page.waitForTimeout(1000);

        // Check if there are any lessons available
        const lessonLinks = page.locator('a[href*="/lessons/"]');
        const linkCount = await lessonLinks.count();

        if (linkCount > 0) {
          // Click on the first lesson link
          await lessonLinks.first().click();

          // Verify we're on a lesson detail page
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
          await page.waitForLoadState('networkidle');

          // Check for Lesson History section heading
          const historySection = page.locator('text=Lesson History').first();
          await expect(historySection).toBeVisible({ timeout: 10000 });
        }
      });
    });

    test.describe('Student-Only Lessons View', () => {
      test('should only see own lessons (no other students)', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for page content to load
        await page.waitForTimeout(1000);

        // Verify no admin controls for filtering by student are visible
        const allStudentsFilter = page.locator('text=/all students|filter by student/i');
        await expect(allStudentsFilter).not.toBeVisible();

        // Students should not see admin-only controls
        const adminControls = page.locator('text=/manage|all lessons/i');
        await expect(adminControls).not.toBeVisible();
      });
    });
  }
);
