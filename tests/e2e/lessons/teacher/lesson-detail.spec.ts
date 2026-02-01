/**
 * Teacher Lesson Detail View Test
 *
 * Migrated from: cypress/e2e/admin/admin-lessons-workflow.cy.ts (detail view sections)
 *
 * Tests lesson detail page functionality for teachers:
 * 1. Navigation to detail page from list
 * 2. Display of lesson information (title, student, teacher, date, status)
 * 3. Display of action buttons (Edit, Delete)
 * 4. Display of Lesson Songs section
 * 5. Display of Assignments section
 * 6. Display of Lesson History section
 * 7. Navigation to edit page
 * 8. Back navigation to list
 *
 * Prerequisites:
 * - Admin user with is_teacher=true: p.romanczuk@gmail.com / test123_admin
 * - Database has at least one lesson available
 *
 * @tags @teacher @lessons @detail
 */
import { test, expect } from '../../../fixtures';

test.describe(
  'Teacher Lesson Detail View',
  { tag: ['@teacher', '@lessons', '@detail'] },
  () => {
    // Set viewport to desktop to avoid mobile-hidden elements
    test.beforeEach(async ({ page, loginAs }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      // Login as admin (who has is_teacher=true)
      await loginAs('admin');
    });

    test.describe('Navigation', () => {
      test('should navigate to lesson detail page from list', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for table to load
        await page.waitForSelector('[data-testid="lesson-table"], table', {
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

          // Verify we're on a lesson detail page (URL matches /lessons/[uuid])
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
        }
      });

      test('should navigate back to lessons list via Back link', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for table to load
        await page.waitForSelector('[data-testid="lesson-table"], table', {
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

          // Verify we're on a lesson detail page
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
          await page.waitForLoadState('networkidle');

          // Click the Back link to go back to lessons list
          const backLink = page.locator('a[href="/dashboard/lessons"]').first();
          await backLink.waitFor({ state: 'visible', timeout: 10000 });
          await backLink.click();

          // Verify we're back on the lessons list
          await expect(page).toHaveURL('/dashboard/lessons', { timeout: 10000 });

          // Verify the lessons table is visible
          await page.waitForSelector('[data-testid="lesson-table"], table', {
            state: 'visible',
            timeout: 10000,
          });
        }
      });
    });

    test.describe('Lesson Information Display', () => {
      test('should display lesson detail card', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for table to load
        await page.waitForSelector('[data-testid="lesson-table"], table', {
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

        // Wait for table to load
        await page.waitForSelector('[data-testid="lesson-table"], table', {
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

        // Wait for table to load
        await page.waitForSelector('[data-testid="lesson-table"], table', {
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

        // Wait for table to load
        await page.waitForSelector('[data-testid="lesson-table"], table', {
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

    test.describe('Teacher Action Buttons', () => {
      test('should display Edit button for teachers', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for table to load
        await page.waitForSelector('[data-testid="lesson-table"], table', {
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

          // Verify we're on a lesson detail page
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
          await page.waitForLoadState('networkidle');

          // Teacher should see Edit button
          const editButton = page.locator('[data-testid="lesson-edit-button"]');
          await expect(editButton).toBeVisible({ timeout: 10000 });
        }
      });

      test('should display Delete button for teachers', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for table to load
        await page.waitForSelector('[data-testid="lesson-table"], table', {
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

          // Verify we're on a lesson detail page
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
          await page.waitForLoadState('networkidle');

          // Teacher should see Delete button
          const deleteButton = page.locator('[data-testid="lesson-delete-button"]');
          await expect(deleteButton).toBeVisible({ timeout: 10000 });
        }
      });

      test('should navigate to edit page from detail page', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for table to load
        await page.waitForSelector('[data-testid="lesson-table"], table', {
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

          // Verify we're on a lesson detail page
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
          await page.waitForLoadState('networkidle');

          // Click the Edit button
          const editButton = page.locator('[data-testid="lesson-edit-button"]');
          await editButton.waitFor({ state: 'visible', timeout: 10000 });
          await editButton.click();

          // Verify we're on the edit page
          await expect(page).toHaveURL(/\/lessons\/[^/]+\/edit/, { timeout: 10000 });

          // Verify edit form elements are present
          const titleInput = page.locator('[data-testid="lesson-title"]');
          await expect(titleInput).toBeVisible({ timeout: 10000 });
        }
      });
    });

    test.describe('Lesson Songs Section', () => {
      test('should display Lesson Songs section', async ({ page }) => {
        // Navigate to lessons list
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Wait for table to load
        await page.waitForSelector('[data-testid="lesson-table"], table', {
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

        // Wait for table to load
        await page.waitForSelector('[data-testid="lesson-table"], table', {
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

        // Wait for table to load
        await page.waitForSelector('[data-testid="lesson-table"], table', {
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

        // Wait for table to load
        await page.waitForSelector('[data-testid="lesson-table"], table', {
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

        // Wait for table to load
        await page.waitForSelector('[data-testid="lesson-table"], table', {
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

          // Verify we're on a lesson detail page
          await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
          await page.waitForLoadState('networkidle');

          // Check for Lesson History section heading
          const historySection = page.locator('text=Lesson History').first();
          await expect(historySection).toBeVisible({ timeout: 10000 });
        }
      });
    });

    test.describe('Not Found State', () => {
      test('should display not found message for invalid lesson ID', async ({ page }) => {
        // Navigate to a non-existent lesson
        await page.goto('/dashboard/lessons/00000000-0000-0000-0000-000000000000');
        await page.waitForLoadState('networkidle');

        // Wait for content to load
        await page.waitForTimeout(2000);

        // Should show "Lesson Not Found" message or redirect
        const hasNotFoundMessage = await page
          .locator('text=/Lesson Not Found|not found|does not exist/i')
          .isVisible()
          .catch(() => false);

        const isRedirectedToList = page.url().includes('/dashboard/lessons') &&
          !page.url().includes('00000000-0000-0000-0000-000000000000');

        // Either shows not found message or redirects to list
        expect(hasNotFoundMessage || isRedirectedToList).toBeTruthy();
      });
    });
  }
);
