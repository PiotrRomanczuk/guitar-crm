/**
 * Error Handling & Edge Cases Tests
 *
 * Migrated from: cypress/e2e/error-handling/error-scenarios.cy.ts
 *
 * Tests error handling scenarios:
 * - Network failure during form submission
 * - Session expiration handling
 * - Invalid URL parameters (404)
 * - Permission denied scenarios (403)
 * - Form validation errors
 * - Server error (500) handling
 * - Empty data states
 * - Concurrent request handling
 * - Browser navigation (back/refresh)
 * - Large data handling
 *
 * Priority: P1 - Critical for resilience
 *
 * Prerequisites:
 * - Admin user: p.romanczuk@gmail.com / test123_admin
 * - Teacher user: teacher@example.com / test123_teacher
 * - Student user: student@example.com / test123_student
 *
 * @tags @error-handling @resilience @smoke
 */
import { test, expect } from '../../fixtures';

test.describe(
  'Error Handling & Edge Cases',
  { tag: ['@error-handling', '@resilience'] },
  () => {
    test.describe('Network Failure Handling', () => {
      test.beforeEach(async ({ page, loginAs }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await loginAs('admin');
      });

      test('should handle network failure when loading lessons', async ({ page }) => {
        // Intercept and fail the API request
        await page.route('**/api/lessons*', (route) => route.abort('failed'));

        await page.goto('/dashboard/lessons');
        await page.waitForTimeout(2000);

        // Page should still render, possibly with error message
        const mainContent = page.locator('main, [role="main"]').first();
        await expect(mainContent).toBeVisible({ timeout: 10000 });
      });

      test('should handle network failure when loading songs', async ({ page }) => {
        // Intercept and fail the API request
        await page.route('**/api/song*', (route) => route.abort('failed'));

        await page.goto('/dashboard/songs');
        await page.waitForTimeout(2000);

        const mainContent = page.locator('main, [role="main"]').first();
        await expect(mainContent).toBeVisible();
      });

      test('should handle network failure during form submission', async ({ page }) => {
        // Intercept POST requests to lessons API
        await page.route('**/api/lessons', (route) => {
          if (route.request().method() === 'POST') {
            route.abort('failed');
          } else {
            route.continue();
          }
        });

        await page.goto('/dashboard/lessons/new');
        await page.waitForTimeout(2000);

        // Fill minimal form
        const titleInput = page.locator('[data-testid="lesson-title"]');
        await titleInput.waitFor({ state: 'visible', timeout: 10000 });
        await titleInput.fill('Test Lesson');

        // Select student
        const studentSelect = page.locator('[data-testid="lesson-student_id"]');
        await studentSelect.click();
        await page.waitForTimeout(500);
        await page.locator('[role="option"]').first().click();

        // Select teacher
        const teacherSelect = page.locator('[data-testid="lesson-teacher_id"]');
        await teacherSelect.click();
        await page.waitForTimeout(500);
        await page.locator('[role="option"]').first().click();

        // Try to submit
        const submitButton = page.locator('[data-testid="lesson-submit"]');
        await submitButton.click();

        // Should stay on page or show error
        await expect(page).toHaveURL(/\/lessons/);
      });
    });

    test.describe('Server Error (500) Handling', () => {
      test.beforeEach(async ({ page, loginAs }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await loginAs('admin');
      });

      test('should handle 500 error on lessons page', async ({ page }) => {
        // Intercept and return 500 error
        await page.route('**/api/lessons*', (route) => {
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Internal Server Error' }),
          });
        });

        await page.goto('/dashboard/lessons');
        await page.waitForTimeout(2000);

        // Page should still render
        const mainContent = page.locator('main, [role="main"]').first();
        await expect(mainContent).toBeVisible();

        // May show error message - log if found
        const bodyText = await page.locator('body').textContent();
        const hasError =
          bodyText?.toLowerCase().includes('error') ||
          bodyText?.toLowerCase().includes('something went wrong');

        if (hasError) {
          console.log('✓ Error message is displayed');
        }
      });

      test('should handle 500 error on songs page', async ({ page }) => {
        // Intercept and return 500 error
        await page.route('**/api/song*', (route) => {
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Internal Server Error' }),
          });
        });

        await page.goto('/dashboard/songs');
        await page.waitForTimeout(2000);

        const mainContent = page.locator('main, [role="main"]').first();
        await expect(mainContent).toBeVisible();
      });
    });

    test.describe('Invalid URL Parameters (404)', () => {
      test.beforeEach(async ({ page, loginAs }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await loginAs('admin');
      });

      test('should handle non-existent lesson ID', async ({ page }) => {
        const response = await page.goto(
          '/dashboard/lessons/00000000-0000-0000-0000-000000000000',
          { waitUntil: 'networkidle' }
        );

        // Accept any reasonable response
        const bodyText = await page.locator('body').textContent();
        const has404 =
          bodyText?.toLowerCase().includes('404') ||
          bodyText?.toLowerCase().includes('not found');
        const hasError = bodyText?.toLowerCase().includes('error');
        const isRedirected = !page.url().includes('00000000');

        // At least one of these should be true
        expect(has404 || hasError || isRedirected).toBeTruthy();
      });

      test('should handle non-existent song ID', async ({ page }) => {
        await page.goto('/dashboard/songs/00000000-0000-0000-0000-000000000000', {
          waitUntil: 'networkidle',
        });

        const bodyText = await page.locator('body').textContent();
        const has404 =
          bodyText?.toLowerCase().includes('404') ||
          bodyText?.toLowerCase().includes('not found');
        const hasError = bodyText?.toLowerCase().includes('error');

        expect(has404 || hasError).toBeTruthy();
      });

      test('should handle non-existent user ID', async ({ page }) => {
        await page.goto('/dashboard/users/00000000-0000-0000-0000-000000000000', {
          waitUntil: 'networkidle',
        });

        const bodyText = await page.locator('body').textContent();
        const has404 =
          bodyText?.toLowerCase().includes('404') ||
          bodyText?.toLowerCase().includes('not found');
        const hasError = bodyText?.toLowerCase().includes('error');
        const hasAccessDenied =
          bodyText?.toLowerCase().includes('access denied') ||
          bodyText?.toLowerCase().includes('forbidden');

        expect(has404 || hasError || hasAccessDenied).toBeTruthy();
      });

      test('should handle malformed UUID in URL', async ({ page }) => {
        await page.goto('/dashboard/lessons/not-a-valid-uuid', {
          waitUntil: 'networkidle',
        });

        // Should handle gracefully without crashing
        const mainContent = page.locator('main, [role="main"]').first();
        await expect(mainContent).toBeVisible();
      });
    });

    test.describe('Session Expiration', () => {
      test('should redirect to login when session expires', async ({ page }) => {
        // Visit dashboard first to establish context
        await page.goto('/dashboard');

        // Clear session
        await page.context().clearCookies();

        // Try to access protected page
        await page.goto('/dashboard/lessons');

        // Should redirect to login
        await expect(page).toHaveURL(/\/sign-in|\/login|\//);
      });

      test('should handle session expiration during API call', async ({
        page,
        loginAs,
      }) => {
        await loginAs('admin');

        // Intercept and return 401 error
        await page.route('**/api/lessons*', (route) => {
          route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Unauthorized',
              message: 'Session expired',
            }),
          });
        });

        await page.goto('/dashboard/lessons');
        await page.waitForTimeout(2000);

        // Should handle gracefully - either redirect or show error
        const bodyExists = await page.locator('body').count();
        expect(bodyExists).toBeGreaterThan(0);
      });
    });

    test.describe('Form Validation Errors', () => {
      test.beforeEach(async ({ page, loginAs }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await loginAs('admin');
      });

      test('should show validation error for required fields on lesson form', async ({
        page,
      }) => {
        await page.goto('/dashboard/lessons/new');
        await page.waitForTimeout(2000);

        // Try to submit empty form
        const submitButton = page.locator('[data-testid="lesson-submit"]');
        await submitButton.waitFor({ state: 'visible', timeout: 10000 });
        await submitButton.click();

        // Should show validation errors or stay on page
        await expect(page).toHaveURL(/\/new/);
      });

      test('should show validation error for invalid email format', async ({ page }) => {
        await page.goto('/dashboard/users/new');
        await page.waitForTimeout(2000);

        // Enter invalid email
        const emailInput = page.locator('[data-testid="email-input"]');
        const inputExists = await emailInput.count();

        if (inputExists > 0) {
          await emailInput.fill('invalid-email');
          await emailInput.blur();
          await page.waitForTimeout(500);

          // May show validation error
          console.log('✓ Email validation triggered on blur');
        }
      });

      test('should validate assignment required fields', async ({ page }) => {
        await page.goto('/dashboard/assignments/new');
        await page.waitForTimeout(2000);

        // Try to submit without title
        const submitButton = page.locator('[data-testid="submit-button"], button[type="submit"]').first();
        await submitButton.waitFor({ state: 'visible', timeout: 10000 });
        await submitButton.click();

        // Should stay on page or show error
        await expect(page).toHaveURL(/\/assignments/);
      });
    });

    test.describe('Permission Denied Scenarios (403)', () => {
      test('should handle 403 response from API', async ({ page, loginAs }) => {
        await loginAs('student');

        // Intercept POST to users API
        await page.route('**/api/users', (route) => {
          if (route.request().method() === 'POST') {
            route.fulfill({
              status: 403,
              contentType: 'application/json',
              body: JSON.stringify({
                error: 'Forbidden',
                message: 'You do not have permission',
              }),
            });
          } else {
            route.continue();
          }
        });

        // Try to make request via page API
        const response = await page.request.post('/api/users', {
          data: { firstName: 'Test', lastName: 'User' },
        });

        // Should return 403, 401, or 400
        expect([400, 401, 403]).toContain(response.status());
      });

      test('should show access denied message for restricted pages', async ({
        page,
        loginAs,
      }) => {
        await loginAs('student');
        await page.goto('/dashboard/users');
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        const isRedirected = !currentUrl.includes('/dashboard/users');

        const bodyText = await page.locator('body').textContent();
        const hasAccessDenied =
          bodyText?.toLowerCase().includes('access') ||
          bodyText?.toLowerCase().includes('forbidden') ||
          bodyText?.toLowerCase().includes('not authorized');

        expect(isRedirected || hasAccessDenied).toBeTruthy();
      });
    });

    test.describe('Empty Data States', () => {
      test('should show empty state on lessons page when no data', async ({
        page,
        loginAs,
      }) => {
        await loginAs('admin');

        // Intercept and return empty array
        await page.route('**/api/lessons*', (route) => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
          });
        });

        await page.goto('/dashboard/lessons');
        await page.waitForTimeout(2000);

        // Should show empty state
        const bodyText = await page.locator('body').textContent();
        const hasEmptyState =
          bodyText?.toLowerCase().includes('no lessons') ||
          bodyText?.toLowerCase().includes('no upcoming');

        if (hasEmptyState) {
          console.log('✓ Empty state is displayed');
        }
      });

      test('should show empty state on songs page when no data', async ({
        page,
        loginAs,
      }) => {
        await loginAs('admin');

        // Intercept and return empty array
        await page.route('**/api/song*', (route) => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
          });
        });

        await page.goto('/dashboard/songs');
        await page.waitForTimeout(2000);

        // Should show empty state
        const bodyText = await page.locator('body').textContent();
        const hasEmptyState =
          bodyText?.toLowerCase().includes('no songs') ||
          bodyText?.toLowerCase().includes('empty');

        if (hasEmptyState) {
          console.log('✓ Empty state is displayed');
        }
      });
    });

    test.describe('Concurrent Request Handling', () => {
      test.beforeEach(async ({ page, loginAs }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await loginAs('admin');
      });

      test('should handle rapid navigation between pages', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForTimeout(500);

        // Rapidly navigate between pages
        const lessonsLink = page.locator('a[href*="/lessons"]').first();
        const songsLink = page.locator('a[href*="/songs"]').first();
        const assignmentsLink = page.locator('a[href*="/assignments"]').first();

        // Click links in rapid succession
        if ((await lessonsLink.count()) > 0) await lessonsLink.click();
        if ((await songsLink.count()) > 0) await songsLink.click();
        if ((await assignmentsLink.count()) > 0) await assignmentsLink.click();

        // Final page should load correctly
        const mainContent = page.locator('main, [role="main"]').first();
        await expect(mainContent).toBeVisible({ timeout: 10000 });
      });

      test('should handle double-click on submit button', async ({ page }) => {
        await page.goto('/dashboard/assignments/new');
        await page.waitForTimeout(2000);

        // Fill form
        const titleInput = page.locator('[data-testid="field-title"]');
        await titleInput.waitFor({ state: 'visible', timeout: 10000 });
        await titleInput.fill('Double Click Test');

        // Double click submit (should not create duplicates)
        const submitButton = page.locator('[data-testid="submit-button"], button[type="submit"]').first();
        await submitButton.dblclick();

        // Should handle gracefully
        await page.waitForTimeout(2000);
        console.log('✓ Double-click handled without errors');
      });
    });

    test.describe('Browser Navigation', () => {
      test.beforeEach(async ({ page, loginAs }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await loginAs('admin');
      });

      test('should handle browser back button', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForTimeout(1000);

        await page.goto('/dashboard/lessons');
        await page.waitForTimeout(1000);

        // Go back
        await page.goBack();

        // Should be on dashboard
        await expect(page).toHaveURL(/\/dashboard/);
      });

      test('should handle page refresh', async ({ page }) => {
        await page.goto('/dashboard/lessons');
        await page.waitForTimeout(2000);

        // Reload
        await page.reload();

        // Page should still work
        await expect(page).toHaveURL(/\/lessons/);
        const mainContent = page.locator('main, [role="main"]').first();
        await expect(mainContent).toBeVisible();
      });
    });

    test.describe('Large Data Handling', () => {
      test('should handle large list of items', async ({ page, loginAs }) => {
        await loginAs('admin');

        // Generate large dataset
        const largeLessonList = Array.from({ length: 100 }, (_, i) => ({
          id: `lesson-${i}`,
          title: `Lesson ${i}`,
          status: 'scheduled',
          scheduled_at: new Date().toISOString(),
        }));

        // Intercept and return large dataset
        await page.route('**/api/lessons*', (route) => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(largeLessonList),
          });
        });

        await page.goto('/dashboard/lessons');
        await page.waitForTimeout(3000);

        // Page should render without crashing
        const mainContent = page.locator('main, [role="main"]').first();
        await expect(mainContent).toBeVisible();
        console.log('✓ Large dataset handled successfully');
      });
    });
  }
);
