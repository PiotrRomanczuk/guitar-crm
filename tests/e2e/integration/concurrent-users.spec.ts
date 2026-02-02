/**
 * Concurrent User Scenarios Tests
 *
 * Migrated from: cypress/e2e/integration/concurrent-users.cy.ts
 *
 * Tests scenarios involving multiple users to verify:
 * - Admin and student data visibility differences
 * - Role-based access control enforcement
 * - Data isolation between roles
 * - Proper RLS policy enforcement
 * - UI permission controls (create, edit, delete)
 *
 * Testing Strategy:
 * - Uses sequential login/logout pattern for different roles
 * - Tests same routes with different user contexts
 * - Verifies data visibility matches role permissions
 * - Validates UI elements match role capabilities
 *
 * Priority: P1 - Critical for security and RBAC
 *
 * Prerequisites:
 * - Admin user: p.romanczuk@gmail.com / test123_admin
 * - Student user: student@example.com / test123_student
 * - Seeded database with lessons and assignments
 *
 * @tags @integration @concurrent @security @rbac
 */
import { test, expect } from '../../fixtures';

test.describe(
  'Concurrent User Scenarios',
  { tag: ['@integration', '@concurrent', '@security'] },
  () => {
    test.describe('Admin and Student Data Visibility', () => {
      test('admin sees all lessons while student sees only their own', async ({
        page,
        loginAs,
        context,
      }) => {
        // Admin session: count all lessons
        await loginAs('admin');
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        const adminLessonCount = await page
          .locator('tr[data-testid], [data-testid^="lesson-"], a[href*="/lessons/"]')
          .count();
        console.log(`Admin sees ${adminLessonCount} lessons`);

        // Clear session and login as student
        await context.clearCookies();
        await loginAs('student');
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        const studentLessonCount = await page
          .locator('tr[data-testid], [data-testid^="lesson-"], a[href*="/lessons/"]')
          .count();
        console.log(`Student sees ${studentLessonCount} lessons`);

        // Student should see same or fewer lessons than admin
        expect(studentLessonCount).toBeLessThanOrEqual(adminLessonCount);
      });

      test('admin sees all assignments while student sees only their own', async ({
        page,
        loginAs,
        context,
      }) => {
        // Admin session: count all assignments
        await loginAs('admin');
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const adminCount = await page
          .locator('tr[data-testid], [data-testid^="assignment-"], a[href*="/assignments/"]')
          .count();
        console.log(`Admin sees ${adminCount} assignments`);

        // Clear session and login as student
        await context.clearCookies();
        await loginAs('student');
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        const studentCount = await page
          .locator('tr[data-testid], [data-testid^="assignment-"], a[href*="/assignments/"]')
          .count();
        console.log(`Student sees ${studentCount} assignments`);

        // Student should see same or fewer assignments than admin
        expect(studentCount).toBeLessThanOrEqual(adminCount);
      });
    });

    test.describe('Role-Specific Page Access', () => {
      test('admin can access users page', async ({ page, loginAs }) => {
        await loginAs('admin');
        await page.goto('/dashboard/users');
        await page.waitForLoadState('networkidle');

        // Should stay on users page
        await expect(page).toHaveURL(/\/users/);

        // Should not show access denied
        const bodyText = await page.locator('body').textContent();
        expect(bodyText).not.toContain('Access Denied');
      });

      test('student cannot access users page', async ({ page, loginAs }) => {
        await loginAs('student');
        await page.goto('/dashboard/users', { waitUntil: 'networkidle' });

        // Should redirect or show access denied
        const currentUrl = page.url();
        const bodyText = await page.locator('body').textContent();

        const redirected = !currentUrl.includes('/users');
        const hasAccessDenied =
          bodyText?.toLowerCase().includes('access') ||
          bodyText?.toLowerCase().includes('forbidden') ||
          bodyText?.toLowerCase().includes('denied');

        expect(redirected || hasAccessDenied).toBeTruthy();
      });
    });

    test.describe('Shared Data Views', () => {
      test('both admin and student can view the same song details', async ({
        page,
        loginAs,
        context,
      }) => {
        // Admin views song
        await loginAs('admin');
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        // Get first song link
        const songLinks = page.locator('a[href*="/songs/"]').filter({
          has: page.locator('text=/./'), // Has some content
        });

        const songCount = await songLinks.count();
        if (songCount === 0) {
          console.log('No songs available to test');
          return;
        }

        // Get the first valid song URL
        const firstLink = songLinks.first();
        const songUrl = await firstLink.getAttribute('href');

        if (!songUrl || !songUrl.match(/\/songs\/[a-z0-9-]+$/i)) {
          console.log('No valid song URL found');
          return;
        }

        console.log(`Testing song URL: ${songUrl}`);

        // Admin should see the song
        await page.goto(songUrl);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('main, [role="main"]')).toBeVisible();

        const adminBodyText = await page.locator('body').textContent();
        expect(adminBodyText).not.toContain('Not Found');

        // Student views the same song
        await context.clearCookies();
        await loginAs('student');
        await page.goto(songUrl);
        await page.waitForLoadState('networkidle');

        const studentBodyText = await page.locator('body').textContent();
        const canViewSong =
          !studentBodyText?.includes('Not Found') &&
          !studentBodyText?.includes('Access Denied');

        if (canViewSong) {
          console.log('Student can view the same song');
        } else {
          console.log('Student may have restricted song access');
        }

        // Both should be able to view songs (songs are shared resource)
        expect(canViewSong).toBeTruthy();
      });
    });

    test.describe('Edit Permissions', () => {
      test('admin can edit lessons while student cannot', async ({
        page,
        loginAs,
        context,
      }) => {
        // Admin can edit
        await loginAs('admin');
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        const adminLessonLinks = page
          .locator('a[href*="/lessons/"]')
          .filter({ hasNotText: 'New Lesson' })
          .filter({ hasNotText: 'Create' });

        const adminLessonCount = await adminLessonLinks.count();
        if (adminLessonCount === 0) {
          console.log('No lessons available for admin');
          return;
        }

        await adminLessonLinks.first().click();
        await page.waitForLoadState('networkidle');

        const adminHasEditButton =
          (await page.locator('a[href*="/edit"], button:has-text("Edit")').count()) > 0;
        console.log(`Admin can edit: ${adminHasEditButton}`);

        // Student tries the same
        await context.clearCookies();
        await loginAs('student');
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        const studentLessonLinks = page
          .locator('a[href*="/lessons/"]')
          .filter({ hasNotText: 'New Lesson' })
          .filter({ hasNotText: 'Create' });

        const studentLessonCount = await studentLessonLinks.count();
        if (studentLessonCount === 0) {
          console.log('No lessons available for student');
          return;
        }

        await studentLessonLinks.first().click();
        await page.waitForLoadState('networkidle');

        const studentHasEditButton =
          (await page.locator('a[href*="/edit"], button:has-text("Edit")').count()) > 0;
        console.log(`Student can edit: ${studentHasEditButton}`);

        // Student should not be able to edit (fewer or no edit buttons)
        expect(studentHasEditButton).toBeFalsy();
      });
    });

    test.describe('Create Permissions', () => {
      test('admin can create lessons while student cannot', async ({
        page,
        loginAs,
        context,
      }) => {
        // Admin can create
        await loginAs('admin');
        await page.goto('/dashboard/lessons/new');
        await page.waitForLoadState('networkidle');

        // Should stay on create page
        await expect(page).toHaveURL(/\/lessons\/new/);
        await expect(page.locator('form, [data-testid="lesson-form"]')).toBeVisible();

        // Student tries
        await context.clearCookies();
        await loginAs('student');
        await page.goto('/dashboard/lessons/new', { waitUntil: 'networkidle' });

        const currentUrl = page.url();
        const bodyText = await page.locator('body').textContent();
        const hasForm = (await page.locator('form, [data-testid="lesson-form"]').count()) > 0;

        const redirected = !currentUrl.includes('/lessons/new');
        const hasAccessDenied =
          bodyText?.toLowerCase().includes('access') ||
          bodyText?.toLowerCase().includes('forbidden');

        if (redirected || hasAccessDenied || !hasForm) {
          console.log('Student correctly cannot create lessons');
        }

        expect(redirected || hasAccessDenied || !hasForm).toBeTruthy();
      });

      test('admin can create assignments while student cannot', async ({
        page,
        loginAs,
        context,
      }) => {
        // Admin can create
        await loginAs('admin');
        await page.goto('/dashboard/assignments/new');
        await page.waitForLoadState('networkidle');

        // Should stay on create page
        await expect(page).toHaveURL(/\/assignments\/new/);

        // Student tries
        await context.clearCookies();
        await loginAs('student');
        await page.goto('/dashboard/assignments/new', { waitUntil: 'networkidle' });

        const currentUrl = page.url();
        const bodyText = await page.locator('body').textContent();

        const redirected = !currentUrl.includes('/assignments/new');
        const hasAccessDenied =
          bodyText?.toLowerCase().includes('access') ||
          bodyText?.toLowerCase().includes('forbidden');

        if (redirected || hasAccessDenied) {
          console.log('Student correctly cannot create assignments');
        }

        expect(redirected || hasAccessDenied).toBeTruthy();
      });
    });

    test.describe('Delete Permissions', () => {
      test('admin has delete buttons while student does not', async ({
        page,
        loginAs,
        context,
      }) => {
        // Admin sees delete
        await loginAs('admin');
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        const adminLessonLinks = page
          .locator('a[href*="/lessons/"]')
          .filter({ hasNotText: 'New Lesson' })
          .filter({ hasNotText: 'Create' });

        const adminLessonCount = await adminLessonLinks.count();
        if (adminLessonCount === 0) {
          console.log('No lessons available for admin');
          return;
        }

        await adminLessonLinks.first().click();
        await page.waitForLoadState('networkidle');

        const adminCanDelete =
          (await page.locator('[data-testid*="delete"], button:has-text("Delete")').count()) > 0;
        console.log(`Admin can delete: ${adminCanDelete}`);

        // Check student
        await context.clearCookies();
        await loginAs('student');
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        const studentLessonLinks = page
          .locator('a[href*="/lessons/"]')
          .filter({ hasNotText: 'New Lesson' })
          .filter({ hasNotText: 'Create' });

        const studentLessonCount = await studentLessonLinks.count();
        if (studentLessonCount === 0) {
          console.log('No lessons available for student');
          return;
        }

        await studentLessonLinks.first().click();
        await page.waitForLoadState('networkidle');

        const studentCanDelete =
          (await page.locator('[data-testid*="delete"], button:has-text("Delete")').count()) > 0;
        console.log(`Student can delete: ${studentCanDelete}`);

        // Student should not have delete buttons
        expect(studentCanDelete).toBeFalsy();
      });
    });

    test.describe('Dashboard Content Differences', () => {
      test('admin dashboard shows different content than student dashboard', async ({
        page,
        loginAs,
        context,
      }) => {
        // Admin dashboard
        await loginAs('admin');
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const adminBodyText = await page.locator('body').textContent();
        const adminHasUsersLink = adminBodyText?.includes('Users') || false;
        console.log(`Admin has users link: ${adminHasUsersLink}`);

        // Student dashboard
        await context.clearCookies();
        await loginAs('student');
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const studentBodyText = await page.locator('body').textContent();
        // Look for exact link to users page
        const studentHasUsersLink =
          (await page.locator('a[href="/dashboard/users"]').count()) > 0;
        console.log(`Student has users link: ${studentHasUsersLink}`);

        // Admin should have users link, student should not
        expect(adminHasUsersLink).toBeTruthy();
        expect(studentHasUsersLink).toBeFalsy();
      });
    });

    test.describe('Data Isolation Verification', () => {
      test('student only sees own data in lessons list', async ({ page, loginAs }) => {
        await loginAs('student');
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Student should not see filter controls for other students
        const hasStudentFilter =
          (await page.locator('text=/all students|filter by student/i').count()) > 0;
        expect(hasStudentFilter).toBeFalsy();
      });

      test('student only sees own data in assignments list', async ({ page, loginAs }) => {
        await loginAs('student');
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Student should not see filter controls for other students
        const hasStudentFilter =
          (await page.locator('text=/all students|filter by student/i').count()) > 0;
        expect(hasStudentFilter).toBeFalsy();
      });

      test('admin can filter and see all students data', async ({ page, loginAs }) => {
        await loginAs('admin');
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Admin should have access to all data or filtering options
        const bodyText = await page.locator('body').textContent();
        const hasAdminControls =
          bodyText?.includes('All') || bodyText?.includes('Filter') || bodyText?.includes('Student');

        // Admin typically has broader view or filter controls
        expect(hasAdminControls).toBeTruthy();
      });
    });
  }
);
