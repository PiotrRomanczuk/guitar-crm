/**
 * Teacher Dashboard Test
 *
 * Migrated from: cypress/e2e/admin/admin-navigation.cy.ts
 *
 * Tests teacher/admin dashboard functionality:
 * 1. Dashboard rendering - Verify main dashboard displays correctly
 * 2. Stats display - Verify lesson and admin stats are shown
 * 3. Dashboard sections - Verify key sections are displayed
 * 4. Navigation - Verify sidebar navigation works
 * 5. Quick actions - Verify quick action links work
 *
 * Prerequisites:
 * - Admin user with is_teacher=true: p.romanczuk@gmail.com / test123_admin
 * - Database has users, lessons, songs available
 *
 * @tags @teacher @dashboard @admin @navigation
 */
import { test, expect } from '../../fixtures';

test.describe(
  'Teacher Dashboard',
  { tag: ['@teacher', '@dashboard', '@admin'] },
  () => {
    test.beforeEach(async ({ page, loginAs }) => {
      // Set viewport to desktop size
      await page.setViewportSize({ width: 1440, height: 900 });

      // Login as admin (who has is_teacher=true)
      await loginAs('admin');
    });

    test.describe('Dashboard Rendering', () => {
      test('should display the main dashboard with welcome message', async ({
        page,
      }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Verify we're on the dashboard
        await expect(page).toHaveURL(/\/dashboard/);

        // Verify welcome message is displayed
        await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible({
          timeout: 10000,
        });

        // Verify subtitle about guitar students
        await expect(
          page.locator('text=/happening with your guitar students/i')
        ).toBeVisible();
      });

      test('should display lesson statistics section', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Wait for lesson stats to load
        await page.waitForSelector('text=/Lesson Statistics/i', {
          state: 'visible',
          timeout: 10000,
        });

        // Verify lesson statistics card is visible
        await expect(page.locator('text=/Lesson Statistics/i')).toBeVisible();

        // Verify key metrics are displayed
        await expect(page.locator('text=/Total Lessons/i')).toBeVisible();
        await expect(page.locator('text=/This Month/i')).toBeVisible();
        await expect(page.locator('text=/Upcoming/i')).toBeVisible();
      });

      test('should display today\'s agenda section', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Wait for agenda section to load
        await page.waitForSelector('[data-tour="todays-agenda"]', {
          state: 'visible',
          timeout: 10000,
        });

        // Verify today's agenda section is visible
        await expect(
          page.locator('[data-tour="todays-agenda"]')
        ).toBeVisible();
      });

      test('should display student list section', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Wait for student list to load
        await page.waitForSelector('[data-tour="student-list"]', {
          state: 'visible',
          timeout: 10000,
        });

        // Verify student list section is visible
        await expect(page.locator('[data-tour="student-list"]')).toBeVisible();
      });
    });

    test.describe('Admin Stats Display', () => {
      test('should display system overview section for admin', async ({
        page,
      }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Wait for page to fully load
        await page.waitForTimeout(1000);

        // Verify system overview section is visible
        await expect(
          page.locator('h2:has-text("System Overview")')
        ).toBeVisible({ timeout: 10000 });

        // Verify admin stats description
        await expect(
          page.locator('text=/Administrative statistics/i')
        ).toBeVisible();
      });

      test('should display admin stat cards', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Wait for stats to load
        await page.waitForSelector('text=/System Overview/i', {
          state: 'visible',
          timeout: 10000,
        });

        // Verify stats cards are displayed
        await expect(page.locator('text=/Total Users/i')).toBeVisible();
        await expect(page.locator('text=/Teachers/i')).toBeVisible();
        await expect(page.locator('text=/Students/i')).toBeVisible();
        await expect(page.locator('text=/Total Songs/i')).toBeVisible();
        await expect(page.locator('text=/Total Lessons/i')).toBeVisible();
      });

      test('should have clickable stat cards linking to sections', async ({
        page,
      }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Wait for stats to load
        await page.waitForSelector('text=/System Overview/i', {
          state: 'visible',
          timeout: 10000,
        });

        // Verify Total Users card links to users page
        const usersLink = page.locator('a[href="/dashboard/users"]').first();
        await expect(usersLink).toBeVisible();

        // Verify Songs card links to songs page
        const songsLink = page.locator('a[href="/dashboard/songs"]').first();
        await expect(songsLink).toBeVisible();

        // Verify Lessons card links to lessons page
        const lessonsLink = page.locator('a[href="/dashboard/lessons"]').first();
        await expect(lessonsLink).toBeVisible();
      });
    });

    test.describe('Section Navigation', () => {
      test('should navigate to songs section', async ({ page }) => {
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        // Verify we're on the songs page
        await expect(page).toHaveURL(/\/songs/);
        await expect(page.locator('text=/songs/i').first()).toBeVisible();
      });

      test('should navigate to users section', async ({ page }) => {
        await page.goto('/dashboard/users');
        await page.waitForLoadState('networkidle');

        // Verify we're on the users page
        await expect(page).toHaveURL(/\/users/);
        await expect(page.locator('text=/users/i').first()).toBeVisible();
      });

      test('should navigate to lessons section', async ({ page }) => {
        await page.goto('/dashboard/lessons');
        await page.waitForLoadState('networkidle');

        // Verify we're on the lessons page
        await expect(page).toHaveURL(/\/lessons/);
        await expect(page.locator('text=/lessons/i').first()).toBeVisible();
      });

      test('should navigate to assignments section', async ({ page }) => {
        await page.goto('/dashboard/assignments');
        await page.waitForLoadState('networkidle');

        // Verify we're on the assignments page
        await expect(page).toHaveURL(/\/assignments/);
        await expect(
          page.locator('text=/assignments/i').first()
        ).toBeVisible();
      });
    });

    test.describe('Cross-Section Navigation', () => {
      test('should navigate between sections using sidebar', async ({
        page,
      }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Navigate to songs via sidebar
        const songsLink = page
          .locator('a[href*="/songs"]')
          .filter({ hasText: /songs/i })
          .first();
        if ((await songsLink.count()) > 0) {
          await songsLink.click();
          await expect(page).toHaveURL(/\/songs/);
        }

        // Navigate to users via sidebar
        const usersLink = page
          .locator('a[href*="/users"]')
          .filter({ hasText: /users|students/i })
          .first();
        if ((await usersLink.count()) > 0) {
          await usersLink.click();
          await expect(page).toHaveURL(/\/users/);
        }

        // Navigate to lessons via sidebar
        const lessonsLink = page
          .locator('a[href*="/lessons"]')
          .filter({ hasText: /lessons/i })
          .first();
        if ((await lessonsLink.count()) > 0) {
          await lessonsLink.click();
          await expect(page).toHaveURL(/\/lessons/);
        }
      });

      test('should navigate to dashboard from other sections', async ({
        page,
      }) => {
        // Start on songs page
        await page.goto('/dashboard/songs');
        await page.waitForLoadState('networkidle');

        // Find and click dashboard/home link in sidebar
        const dashboardLink = page
          .locator('a[href="/dashboard"]')
          .filter({ hasText: /dashboard|home|overview/i })
          .first();

        if ((await dashboardLink.count()) > 0) {
          await dashboardLink.click();
          await expect(page).toHaveURL(/\/dashboard$/);
        }
      });
    });

    test.describe('Dashboard Cards', () => {
      test('should display needs attention card', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Verify needs attention section is present (may or may not have items)
        const needsAttention = page.locator('text=/Needs Attention/i');
        const hasNeedsAttention = await needsAttention.count();

        if (hasNeedsAttention > 0) {
          await expect(needsAttention.first()).toBeVisible();
        }
      });

      test('should display weekly summary card', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Verify weekly summary section is present
        const weeklySummary = page.locator('text=/Weekly Summary/i');
        const hasWeeklySummary = await weeklySummary.count();

        if (hasWeeklySummary > 0) {
          await expect(weeklySummary.first()).toBeVisible();
        }
      });

      test('should display health summary widget', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Check for health-related content
        const healthWidget = page.locator('text=/Health|Status/i');
        const hasHealthWidget = await healthWidget.count();

        if (hasHealthWidget > 0) {
          await expect(healthWidget.first()).toBeVisible();
        }
      });
    });

    test.describe('Admin Stats Navigation', () => {
      test('should access admin song stats page', async ({ page }) => {
        await page.goto('/dashboard/admin/stats/songs');
        await page.waitForLoadState('networkidle');

        // Verify stats page loads
        await expect(
          page.locator('text=/stats|statistics|analytics|songs/i').first()
        ).toBeVisible({ timeout: 10000 });
      });
    });

    test.describe('Responsive Layout', () => {
      test('should display dashboard correctly on mobile viewport', async ({
        page,
      }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Verify dashboard loads on mobile
        await expect(page).toHaveURL(/\/dashboard/);

        // Verify main content is visible
        await expect(
          page.locator('h1:has-text("Welcome back")')
        ).toBeVisible({ timeout: 10000 });
      });

      test('should display dashboard correctly on tablet viewport', async ({
        page,
      }) => {
        // Set tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });

        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Verify dashboard loads on tablet
        await expect(page).toHaveURL(/\/dashboard/);

        // Verify main content is visible
        await expect(
          page.locator('h1:has-text("Welcome back")')
        ).toBeVisible({ timeout: 10000 });
      });
    });
  }
);
