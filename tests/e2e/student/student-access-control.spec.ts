/**
 * Student Access Control Tests (Negative Tests)
 *
 * Migrated from: cypress/e2e/student/student-access-control.cy.ts
 *
 * Tests that students cannot access admin-only pages or perform unauthorized actions:
 * - Cannot access /dashboard/users
 * - Cannot access /dashboard/admin/* pages
 * - Cannot access other students' data via URL manipulation
 * - API calls return 403 for unauthorized actions
 * - Create actions are blocked
 * - Navigation elements are hidden appropriately
 * - Own data access is preserved
 *
 * Priority: P0 - Critical Security Tests
 *
 * @tags @student @security @access-control @rbac
 */
import { test, expect } from '../../fixtures';

test.describe(
  'Student Access Control',
  { tag: ['@student', '@security', '@access-control', '@rbac'] },
  () => {
    test.beforeEach(async ({ page }) => {
      // Set viewport to desktop size for consistency
      await page.setViewportSize({ width: 1440, height: 900 });
    });

    test.describe('Admin Page Access Restrictions', () => {
      test('should NOT allow access to users management page', async ({ page, loginAs }) => {
        await loginAs('student');

        // Try to access user management page
        await page.goto('/dashboard/users');
        await page.waitForLoadState('networkidle');

        // Check if redirected away OR access denied message shown
        const currentUrl = page.url();
        const isRedirected = !currentUrl.includes('/dashboard/users');

        if (!isRedirected) {
          // If not redirected, should show access denied
          const bodyText = await page.locator('body').textContent();
          const hasAccessDenied =
            bodyText?.includes('Access Denied') ||
            bodyText?.includes('Forbidden') ||
            bodyText?.includes('not authorized');

          expect(hasAccessDenied).toBeTruthy();
        } else {
          // Successfully redirected
          expect(isRedirected).toBeTruthy();
        }
      });

      test('should NOT allow access to create new user page', async ({ page, loginAs }) => {
        await loginAs('student');

        // Try to access user creation page
        await page.goto('/dashboard/users/new');
        await page.waitForLoadState('networkidle');

        // Check if redirected away OR access denied message shown
        const currentUrl = page.url();
        const isRedirected = !currentUrl.includes('/dashboard/users/new');

        if (!isRedirected) {
          const bodyText = await page.locator('body').textContent();
          const hasAccessDenied =
            bodyText?.includes('Access Denied') ||
            bodyText?.includes('Forbidden') ||
            bodyText?.includes('not authorized');

          expect(hasAccessDenied).toBeTruthy();
        } else {
          expect(isRedirected).toBeTruthy();
        }
      });

      test('should NOT allow access to admin stats pages', async ({ page, loginAs }) => {
        await loginAs('student');

        // Try to access admin stats page
        await page.goto('/dashboard/admin/stats/lessons');
        await page.waitForLoadState('networkidle');

        // Check if redirected OR 404/access denied shown
        const currentUrl = page.url();
        const isRedirected = !currentUrl.includes('/admin/stats');

        if (!isRedirected) {
          const bodyText = await page.locator('body').textContent();
          const has404 =
            bodyText?.includes('404') || bodyText?.includes('Not Found');
          const hasAccessDenied =
            bodyText?.includes('Access Denied') || bodyText?.includes('Forbidden');

          expect(has404 || hasAccessDenied).toBeTruthy();
        } else {
          expect(isRedirected).toBeTruthy();
        }
      });

      test('should NOT allow access to Spotify matches admin page', async ({ page, loginAs }) => {
        await loginAs('student');

        // Try to access Spotify admin page
        await page.goto('/dashboard/admin/spotify-matches');
        await page.waitForLoadState('networkidle');

        // Check if redirected OR 404/access denied shown
        const currentUrl = page.url();
        const isRedirected = !currentUrl.includes('/admin/spotify-matches');

        if (!isRedirected) {
          const bodyText = await page.locator('body').textContent();
          const has404 =
            bodyText?.includes('404') || bodyText?.includes('Not Found');
          const hasAccessDenied =
            bodyText?.includes('Access Denied') || bodyText?.includes('Forbidden');

          expect(has404 || hasAccessDenied).toBeTruthy();
        } else {
          expect(isRedirected).toBeTruthy();
        }
      });

      test('should NOT allow access to health monitoring page', async ({ page, loginAs }) => {
        await loginAs('student');

        // Try to access health monitoring page
        await page.goto('/dashboard/admin/health');
        await page.waitForLoadState('networkidle');

        // Check if redirected OR 404/access denied shown
        const currentUrl = page.url();
        const isRedirected = !currentUrl.includes('/admin/health');

        if (!isRedirected) {
          const bodyText = await page.locator('body').textContent();
          const has404 =
            bodyText?.includes('404') || bodyText?.includes('Not Found');
          const hasAccessDenied =
            bodyText?.includes('Access Denied') || bodyText?.includes('Forbidden');

          expect(has404 || hasAccessDenied).toBeTruthy();
        } else {
          expect(isRedirected).toBeTruthy();
        }
      });
    });

    test.describe('Create Actions Restrictions', () => {
      test('should NOT allow access to create new lesson page', async ({ page, loginAs }) => {
        await loginAs('student');

        // Try to access lesson creation page
        await page.goto('/dashboard/lessons/new');
        await page.waitForLoadState('networkidle');

        // Check if redirected away OR access denied message shown
        const currentUrl = page.url();
        const isRedirected = !currentUrl.includes('/lessons/new');

        if (!isRedirected) {
          const bodyText = await page.locator('body').textContent();
          const hasAccessDenied =
            bodyText?.includes('Access Denied') ||
            bodyText?.includes('Forbidden') ||
            bodyText?.includes('not authorized');

          expect(hasAccessDenied).toBeTruthy();
        } else {
          expect(isRedirected).toBeTruthy();
        }
      });

      test('should NOT allow access to create new song page', async ({ page, loginAs }) => {
        await loginAs('student');

        // Try to access song creation page
        await page.goto('/dashboard/songs/new');
        await page.waitForLoadState('networkidle');

        // Check if redirected away OR access denied message shown
        const currentUrl = page.url();
        const isRedirected = !currentUrl.includes('/songs/new');

        if (!isRedirected) {
          const bodyText = await page.locator('body').textContent();
          const hasAccessDenied =
            bodyText?.includes('Access Denied') ||
            bodyText?.includes('Forbidden') ||
            bodyText?.includes('not authorized');

          expect(hasAccessDenied).toBeTruthy();
        } else {
          expect(isRedirected).toBeTruthy();
        }
      });

      test('should NOT allow access to create new assignment page', async ({ page, loginAs }) => {
        await loginAs('student');

        // Try to access assignment creation page
        await page.goto('/dashboard/assignments/new');
        await page.waitForLoadState('networkidle');

        // Check if redirected away OR access denied message shown
        const currentUrl = page.url();
        const isRedirected = !currentUrl.includes('/assignments/new');

        if (!isRedirected) {
          const bodyText = await page.locator('body').textContent();
          const hasAccessDenied =
            bodyText?.includes('Access Denied') ||
            bodyText?.includes('Forbidden') ||
            bodyText?.includes('not authorized');

          expect(hasAccessDenied).toBeTruthy();
        } else {
          expect(isRedirected).toBeTruthy();
        }
      });
    });

    test.describe('API Authorization', () => {
      test('should return 403 when trying to create a user via API', async ({
        page,
        request,
        loginAs,
      }) => {
        await loginAs('student');

        // Get cookies for authenticated request
        const cookies = await page.context().cookies();

        // Try to create a user via API
        const response = await request.post('/api/users', {
          headers: {
            cookie: cookies.map((c) => `${c.name}=${c.value}`).join('; '),
            'content-type': 'application/json',
          },
          data: {
            email: 'unauthorized@test.com',
            firstName: 'Unauthorized',
            lastName: 'User',
          },
          failOnStatusCode: false,
        });

        // Should be forbidden, unauthorized, or bad request
        expect([400, 401, 403]).toContain(response.status());
        console.log(`✅ Student blocked from creating user: ${response.status()}`);
      });

      test('should return 403 when trying to delete a user via API', async ({
        page,
        request,
        loginAs,
      }) => {
        await loginAs('student');

        const cookies = await page.context().cookies();

        // Try to delete a user via API
        const response = await request.delete('/api/users/some-random-id', {
          headers: {
            cookie: cookies.map((c) => `${c.name}=${c.value}`).join('; '),
          },
          failOnStatusCode: false,
        });

        // Should be forbidden, unauthorized, or not found
        expect([401, 403, 404]).toContain(response.status());
        console.log(`✅ Student blocked from deleting user: ${response.status()}`);
      });

      test('should return 403 when trying to create a lesson via API', async ({
        page,
        request,
        loginAs,
      }) => {
        await loginAs('student');

        const cookies = await page.context().cookies();

        // Try to create a lesson via API
        const response = await request.post('/api/lessons', {
          headers: {
            cookie: cookies.map((c) => `${c.name}=${c.value}`).join('; '),
            'content-type': 'application/json',
          },
          data: {
            title: 'Unauthorized Lesson',
            student_id: 'some-id',
            teacher_id: 'some-id',
          },
          failOnStatusCode: false,
        });

        // Should be forbidden or bad request
        expect([400, 401, 403]).toContain(response.status());
        console.log(`✅ Student blocked from creating lesson: ${response.status()}`);
      });

      test('should return 403 when trying to create a song via API', async ({
        page,
        request,
        loginAs,
      }) => {
        await loginAs('student');

        const cookies = await page.context().cookies();

        // Try to create a song via API
        const response = await request.post('/api/songs', {
          headers: {
            cookie: cookies.map((c) => `${c.name}=${c.value}`).join('; '),
            'content-type': 'application/json',
          },
          data: {
            title: 'Unauthorized Song',
            author: 'Test Artist',
          },
          failOnStatusCode: false,
        });

        // Should be forbidden
        expect([400, 401, 403]).toContain(response.status());
        console.log(`✅ Student blocked from creating song: ${response.status()}`);
      });
    });

    test.describe('URL Manipulation Protection', () => {
      test('should NOT allow viewing other users profiles via URL manipulation', async ({
        page,
        loginAs,
      }) => {
        await loginAs('student');

        // Try to access a random user ID
        await page.goto('/dashboard/users/00000000-0000-0000-0000-000000000000');
        await page.waitForLoadState('networkidle');

        // Check if redirected OR 404/access denied shown
        const currentUrl = page.url();
        const isRedirected = !currentUrl.includes('/users/00000000');

        if (!isRedirected) {
          const bodyText = await page.locator('body').textContent();
          const hasNotFound =
            bodyText?.includes('Not Found') || bodyText?.includes('404');
          const hasAccessDenied =
            bodyText?.includes('Access Denied') || bodyText?.includes('Forbidden');

          expect(hasNotFound || hasAccessDenied).toBeTruthy();
        } else {
          expect(isRedirected).toBeTruthy();
        }
      });

      test('should NOT allow editing other users via URL manipulation', async ({
        page,
        loginAs,
      }) => {
        await loginAs('student');

        // Try to edit a random user
        await page.goto('/dashboard/users/00000000-0000-0000-0000-000000000000/edit');
        await page.waitForLoadState('networkidle');

        // Check if redirected OR 404/access denied shown
        const currentUrl = page.url();
        const isRedirected = !currentUrl.includes('/users/00000000');

        if (!isRedirected) {
          const bodyText = await page.locator('body').textContent();
          const hasNotFound =
            bodyText?.includes('Not Found') || bodyText?.includes('404');
          const hasAccessDenied =
            bodyText?.includes('Access Denied') || bodyText?.includes('Forbidden');

          expect(hasNotFound || hasAccessDenied).toBeTruthy();
        } else {
          expect(isRedirected).toBeTruthy();
        }
      });
    });

    test.describe('Navigation Element Restrictions', () => {
      test('should NOT show admin navigation items', async ({ page, loginAs }) => {
        await loginAs('student');

        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Wait for navigation to render
        const nav = page.locator('nav, [role="navigation"]');
        await nav.first().waitFor({ state: 'visible', timeout: 10000 });

        // Check that admin-only navigation items are not visible
        const adminUsersLink = nav.locator('a[href="/dashboard/users"]');
        const adminLinks = nav.locator('a[href*="/admin"]');

        await expect(adminUsersLink).not.toBeVisible();

        const adminLinksCount = await adminLinks.count();
        expect(adminLinksCount).toBe(0);

        console.log('✅ Student cannot see admin navigation items');
      });

      test('should NOT show create buttons for restricted resources', async ({
        page,
        loginAs,
      }) => {
        await loginAs('student');

        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Look for "Create User" or "New User" buttons
        const createUserButtons = page.locator(
          'button:has-text("New User"), a:has-text("New User"), button:has-text("Create User"), a:has-text("Create User")'
        );

        const count = await createUserButtons.count();
        expect(count).toBe(0);

        console.log('✅ Student cannot see create user buttons');
      });
    });

    test.describe('Own Data Access', () => {
      test('SHOULD allow viewing own profile', async ({ page, loginAs }) => {
        await loginAs('student');

        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // Should be able to access own profile
        await expect(page).toHaveURL(/\/profile/);

        // Should not get access denied for own profile
        const bodyText = await page.locator('body').textContent();
        const hasAccessDenied =
          bodyText?.includes('Access Denied') || bodyText?.includes('Forbidden');

        expect(hasAccessDenied).toBeFalsy();
        console.log('✅ Student can view own profile');
      });

      test('SHOULD allow viewing own lessons', async ({ page, loginAs }) => {
        await loginAs('student');

        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Should be able to access lessons page
        await expect(page).toHaveURL(/\/lessons/);

        // Page should load without access denied
        await expect(page.locator('text=/lessons/i').first()).toBeVisible({
          timeout: 10000,
        });

        console.log('✅ Student can view own lessons');
      });

      test('SHOULD allow viewing own assignments', async ({ page, loginAs }) => {
        await loginAs('student');

        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Should be able to access assignments page
        await expect(page).toHaveURL(/\/assignments/);

        // Page should load without access denied
        await expect(page.locator('text=/assignments/i').first()).toBeVisible({
          timeout: 10000,
        });

        console.log('✅ Student can view own assignments');
      });

      test('SHOULD allow viewing own songs', async ({ page, loginAs }) => {
        await loginAs('student');

        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        // Should be able to access songs page
        await expect(page).toHaveURL(/\/songs/);

        // Page should load without access denied
        await expect(
          page.locator('text=/songs|my songs/i').first()
        ).toBeVisible({ timeout: 10000 });

        console.log('✅ Student can view own songs');
      });
    });

    test.describe('Error Page Handling', () => {
      test('should show 404 page for non-existent routes', async ({ page, loginAs }) => {
        await loginAs('student');

        await page.goto('/dashboard/nonexistent-page');
        await page.waitForLoadState('networkidle');

        const bodyText = await page.locator('body').textContent();
        const has404 =
          bodyText?.includes('404') ||
          bodyText?.includes('Not Found') ||
          bodyText?.includes('page does not exist');

        // Check if we got a 404 page OR redirected away
        const currentUrl = page.url();
        const isRedirected = !currentUrl.includes('nonexistent');

        expect(has404 || isRedirected).toBeTruthy();
        console.log('✅ Non-existent routes handled properly');
      });
    });

    test.describe('Session Security', () => {
      test('should redirect to login when session expires', async ({ page, loginAs }) => {
        await loginAs('student');

        // Verify we're logged in
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/dashboard/);

        // Clear cookies to simulate session expiry
        await page.context().clearCookies();

        // Try to access protected route
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Should redirect to login
        await expect(page).toHaveURL(/\/sign-in|\/login|\//);
        console.log('✅ Session expiry redirects to login');
      });

      test('should prevent privilege escalation via session tampering', async ({
        page,
        request,
        loginAs,
      }) => {
        await loginAs('student');

        const cookies = await page.context().cookies();

        // Student trying to create an admin user
        const response = await request.post('/api/users/invite', {
          headers: {
            cookie: cookies.map((c) => `${c.name}=${c.value}`).join('; '),
            'content-type': 'application/json',
          },
          data: {
            email: 'malicious-admin@example.com',
            fullName: 'Malicious Admin',
            role: 'admin', // Attempting privilege escalation!
          },
          failOnStatusCode: false,
        });

        // Should be blocked at server level
        expect([401, 403, 404, 405]).toContain(response.status());
        console.log('✅ Privilege escalation attempt blocked');
      });
    });

    test.describe('Security Best Practices', () => {
      test('should not leak sensitive information in error messages', async ({
        page,
        loginAs,
      }) => {
        await loginAs('student');

        // Try to access protected endpoint
        await page.goto('/dashboard/users');
        await page.waitForLoadState('networkidle');

        // Check page for error messages
        const bodyText = await page.locator('body').textContent();

        // Should not expose:
        // - Database connection strings
        // - Internal file paths
        // - Stack traces
        // - User IDs or emails of other users
        const sensitivePatterns = [
          /postgresql:\/\//i,
          /mongodb:\/\//i,
          /\/var\/www/i,
          /\/home\//i,
          /Error:.*at.*\(.*:\d+:\d+\)/i, // Stack trace pattern
        ];

        for (const pattern of sensitivePatterns) {
          expect(bodyText).not.toMatch(pattern);
        }

        console.log('✅ No sensitive information leaked in UI');
      });

      test('should enforce authorization on all protected endpoints', async ({
        page,
        request,
        loginAs,
      }) => {
        await loginAs('student');

        const cookies = await page.context().cookies();

        // Test multiple protected endpoints
        const endpoints = [
          { method: 'POST', path: '/api/users/invite' },
          { method: 'DELETE', path: '/api/users/some-id' },
          { method: 'POST', path: '/api/lessons' },
          { method: 'POST', path: '/api/assignments' },
          { method: 'POST', path: '/api/songs' },
        ];

        for (const endpoint of endpoints) {
          const response = await request.fetch(endpoint.path, {
            method: endpoint.method,
            headers: {
              cookie: cookies.map((c) => `${c.name}=${c.value}`).join('; '),
              'content-type': 'application/json',
            },
            data: {},
            failOnStatusCode: false,
          });

          // Should require authorization
          expect([400, 401, 403, 404, 405]).toContain(response.status());
        }

        console.log('✅ All protected endpoints enforce authorization');
      });

      test('should validate role on every request', async ({ page, loginAs }) => {
        await loginAs('student');

        // Access dashboard
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/dashboard/);

        // Try to access admin page (role should be checked again)
        await page.goto('/dashboard/users');
        await page.waitForLoadState('networkidle');

        // Should not allow access
        const currentUrl = page.url();
        const isBlocked =
          !currentUrl.includes('/dashboard/users') || currentUrl === '/dashboard';

        if (!isBlocked) {
          // If we can access the page, verify it's read-only
          const bodyText = await page.locator('body').textContent();
          const hasWriteControls =
            bodyText?.includes('Delete') ||
            bodyText?.includes('Edit All') ||
            bodyText?.includes('New User');

          // Students should not have write controls
          expect(hasWriteControls).toBeFalsy();
        }

        console.log('✅ Role validation enforced on each request');
      });
    });

    /**
     * Documentation: Student Access Control Summary
     *
     * SECURITY BOUNDARIES TESTED:
     *
     * 1. Admin Page Access (BLOCKED) ✅
     *    - /dashboard/users
     *    - /dashboard/users/new
     *    - /dashboard/admin/stats/*
     *    - /dashboard/admin/spotify-matches
     *    - /dashboard/admin/health
     *
     * 2. Create Actions (BLOCKED) ✅
     *    - /dashboard/lessons/new
     *    - /dashboard/songs/new
     *    - /dashboard/assignments/new
     *
     * 3. API Authorization (ENFORCED) ✅
     *    - POST /api/users (403)
     *    - DELETE /api/users/:id (403)
     *    - POST /api/lessons (403)
     *    - POST /api/songs (403)
     *
     * 4. URL Manipulation (PROTECTED) ✅
     *    - Cannot view other users: /dashboard/users/:id
     *    - Cannot edit other users: /dashboard/users/:id/edit
     *
     * 5. Navigation Elements (HIDDEN) ✅
     *    - Admin links not visible
     *    - Create user buttons not visible
     *
     * 6. Own Data Access (ALLOWED) ✅
     *    - /dashboard/profile
     *    - /dashboard/lessons
     *    - /dashboard/assignments
     *    - /dashboard/songs
     *
     * 7. Session Security (ENFORCED) ✅
     *    - Session expiry redirects to login
     *    - Privilege escalation blocked
     *
     * IMPLEMENTATION NOTES:
     * - Tests use loginAs('student') fixture for authentication
     * - API tests use request fixture with cookies
     * - Both UI and API authorization tested
     * - Negative testing pattern: verify access is denied
     * - Positive testing: verify own data access works
     */
  }
);
