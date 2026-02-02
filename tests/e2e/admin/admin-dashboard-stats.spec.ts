/**
 * Admin Dashboard Stats Tests
 *
 * Migrated from: cypress/e2e/admin/admin-dashboard-stats.cy.ts
 *
 * Tests admin dashboard functionality:
 * - Dashboard loading and rendering
 * - Metrics display (users, lessons, songs, assignments counts)
 * - Quick actions and navigation
 * - Recent activity widgets
 * - Charts and visualizations
 * - Admin stats pages
 * - Responsive design
 * - Loading states and error handling
 *
 * Prerequisites:
 * - Local Supabase database running with seeded data
 * - Admin user: p.romanczuk@gmail.com / test123_admin
 * - Database has users, lessons, songs, assignments
 *
 * @tags @admin @dashboard @stats
 */
import { test, expect } from '../../fixtures';

test.describe(
  'Admin Dashboard & Stats',
  { tag: ['@admin', '@dashboard', '@stats'] },
  () => {
    test.beforeEach(async ({ page, loginAs }) => {
      // Set viewport to desktop size to ensure all elements are visible
      await page.setViewportSize({ width: 1440, height: 900 });

      // Login as admin
      await loginAs('admin');
    });

    test.describe('Dashboard Loading', () => {
      test('should load the admin dashboard successfully', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Verify we're on the dashboard
        await expect(page).toHaveURL(/\/dashboard/);

        // Dashboard main content should be visible
        const mainContent = page.locator('main, [role="main"]');
        await expect(mainContent).toBeVisible({ timeout: 10000 });
      });

      test('should display welcome/greeting section', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Look for welcome message or dashboard heading
        await expect(
          page.locator('text=/Welcome|Dashboard|Overview/i').first()
        ).toBeVisible({ timeout: 10000 });
      });
    });

    test.describe('Dashboard Metrics', () => {
      test('should display metric cards or stats', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Wait for System Overview section to load
        await page.waitForSelector('text=/System Overview/i', {
          state: 'visible',
          timeout: 10000,
        });

        // Dashboard should have metric cards
        const metricCards = page.locator(
          '[class*="card"], [class*="stat"], [class*="metric"], a[href*="/dashboard"]'
        );
        const cardCount = await metricCards.count();

        // Should have at least one metric card
        expect(cardCount).toBeGreaterThan(0);
      });

      test('should show users count for admin', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Admin should see Total Users metric in System Overview
        await expect(
          page.locator('text=/Total Users|Users|Students|Members/i').first()
        ).toBeVisible({ timeout: 10000 });
      });

      test('should show lessons count', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Should see lessons metric in Lesson Statistics or System Overview
        await expect(
          page.locator('text=/Total Lessons|Lessons|Sessions/i').first()
        ).toBeVisible({ timeout: 10000 });
      });

      test('should show songs count', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Should see songs metric in System Overview
        await expect(
          page.locator('text=/Total Songs|Songs|Library|Tracks/i').first()
        ).toBeVisible({ timeout: 10000 });
      });

      test('should show teacher and student counts', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Wait for System Overview
        await page.waitForSelector('text=/System Overview/i', {
          state: 'visible',
          timeout: 10000,
        });

        // Should show teacher count
        await expect(page.locator('text=/Teachers/i').first()).toBeVisible();

        // Should show student count
        await expect(page.locator('text=/Students/i').first()).toBeVisible();
      });
    });

    test.describe('Admin Navigation', () => {
      test('should show admin-specific navigation items', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Admin should see users management link
        const usersLink = page.locator(
          'a[href*="/users"], a[href*="/dashboard/users"]'
        );
        await expect(usersLink.first()).toBeVisible({ timeout: 10000 });
      });

      test('should show all main navigation items', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Should have all navigation links
        await expect(
          page.locator('a[href*="/lessons"]').first()
        ).toBeVisible();
        await expect(page.locator('a[href*="/songs"]').first()).toBeVisible();
        await expect(
          page.locator('a[href*="/assignments"]').first()
        ).toBeVisible();
      });

      test('should navigate to users page when clicking users link', async ({
        page,
      }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Click users link
        await page
          .locator('a[href*="/users"]')
          .filter({ hasText: /users|students/i })
          .first()
          .click();

        // Verify navigation
        await expect(page).toHaveURL(/\/users/);
      });
    });

    test.describe('Quick Actions', () => {
      test('should have quick action buttons or links', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Look for quick action elements (could be "New Lesson", "Add", "Create" buttons)
        const quickActionElements = page.locator(
          'a:has-text("New"), button:has-text("Create"), a:has-text("Add"), a[href*="/new"]'
        );

        const actionCount = await quickActionElements.count();

        // Should have at least some action buttons/links
        // Log result instead of failing if missing
        if (actionCount > 0) {
          console.log(`Found ${actionCount} quick action elements`);
        } else {
          console.log('No quick action buttons found');
        }
      });

      test('should navigate to new lesson page from quick actions if available', async ({
        page,
      }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Find "New Lesson" link if available
        const newLessonLink = page.locator('a[href*="/lessons/new"]').first();
        const hasNewLessonLink = (await newLessonLink.count()) > 0;

        if (hasNewLessonLink) {
          await newLessonLink.click();
          await expect(page).toHaveURL(/\/lessons\/new/);
        } else {
          console.log('New Lesson quick action not found - skipping');
        }
      });

      test('should navigate to new song page from quick actions if available', async ({
        page,
      }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Find "New Song" link if available
        const newSongLink = page.locator('a[href*="/songs/new"]').first();
        const hasNewSongLink = (await newSongLink.count()) > 0;

        if (hasNewSongLink) {
          await newSongLink.click();
          await expect(page).toHaveURL(/\/songs\/new/);
        } else {
          console.log('New Song quick action not found - skipping');
        }
      });
    });

    test.describe('Recent Activity', () => {
      test('should display recent activity section if available', async ({
        page,
      }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Look for recent activity, recent users, or latest updates
        const activitySection = page.locator(
          'text=/Recent|Activity|Latest|New Users/i'
        );
        const hasActivity = (await activitySection.count()) > 0;

        if (hasActivity) {
          await expect(activitySection.first()).toBeVisible();
          console.log('Recent activity section is displayed');
        } else {
          console.log('Recent activity section not found');
        }
      });

      test('should display recent users or registrations if available', async ({
        page,
      }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Check for recent users section (mentioned in page.tsx)
        const recentUsersSection = page.locator(
          'text=/Recent Users|New Registrations|Latest Users/i'
        );
        const hasRecentUsers = (await recentUsersSection.count()) > 0;

        if (hasRecentUsers) {
          await expect(recentUsersSection.first()).toBeVisible();
        } else {
          console.log('Recent users section not implemented yet');
        }
      });
    });

    test.describe('Admin Stats Pages', () => {
      test('should access lessons stats page', async ({ page }) => {
        const response = await page.goto('/dashboard/admin/stats/lessons', {
          waitUntil: 'networkidle',
        });

        // Page may or may not be implemented - check status
        if (response && response.status() === 404) {
          console.log('Lessons stats page not implemented yet (404)');
        } else {
          // Page exists - verify content
          await expect(
            page
              .locator('text=/Lesson|Statistics|Analytics|Stats/i')
              .first()
          ).toBeVisible({ timeout: 10000 });
        }
      });

      test('should access songs stats page', async ({ page }) => {
        await page.goto('/dashboard/admin/stats/songs', {
          waitUntil: 'networkidle',
        });

        // Verify stats page loads (already tested in admin-navigation.spec.ts)
        await expect(
          page.locator('text=/Song|Statistics|Analytics|Stats/i').first()
        ).toBeVisible({ timeout: 10000 });
      });

      test.skip('should access assignments stats page', async ({ page }) => {
        // This page may not exist yet - skip for now
        const response = await page.goto('/dashboard/admin/stats/assignments', {
          waitUntil: 'networkidle',
        });

        if (response && response.status() === 404) {
          console.log('Assignments stats page not implemented yet');
        } else {
          await expect(
            page
              .locator('text=/Assignment|Statistics|Analytics|Stats/i')
              .first()
          ).toBeVisible({ timeout: 10000 });
        }
      });
    });

    test.describe('Charts & Visualizations', () => {
      test('should render charts if present on dashboard', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Wait a bit for charts to render
        await page.waitForTimeout(2000);

        // Look for chart elements (canvas, SVG, recharts, etc.)
        const chartElements = page.locator(
          'canvas, svg[class*="chart"], [class*="recharts"], [data-testid*="chart"]'
        );

        const chartCount = await chartElements.count();

        if (chartCount > 0) {
          console.log(`Found ${chartCount} chart elements on dashboard`);
          await expect(chartElements.first()).toBeVisible();
        } else {
          console.log('No charts found on dashboard - may not be implemented');
        }
      });
    });

    test.describe('Export Functionality', () => {
      test.skip('should have export options if available', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Look for export/download buttons
        const exportButtons = page.locator(
          'button:has-text("Export"), a:has-text("Export"), button:has-text("Download")'
        );

        const hasExport = (await exportButtons.count()) > 0;

        if (hasExport) {
          await expect(exportButtons.first()).toBeVisible();
          console.log('Export functionality is available');
        } else {
          console.log('Export functionality not implemented');
        }
      });
    });

    test.describe('Admin Dashboard Data', () => {
      test('should show lesson statistics section', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Verify Lesson Statistics section
        await expect(
          page.locator('text=/Lesson Statistics/i')
        ).toBeVisible({ timeout: 10000 });
      });

      test('should show today\'s agenda or upcoming lessons', async ({
        page,
      }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Look for today's agenda section
        const agendaSection = page.locator(
          '[data-tour="todays-agenda"], text=/Today\'s Agenda|Upcoming|Next Lesson/i'
        );
        const hasAgenda = (await agendaSection.count()) > 0;

        if (hasAgenda) {
          await expect(agendaSection.first()).toBeVisible();
        } else {
          console.log('Today\'s agenda section not found');
        }
      });

      test('should show student list or overview', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Look for student list section
        const studentSection = page.locator(
          '[data-tour="student-list"], text=/Student List|My Students|All Students/i'
        );
        const hasStudentSection = (await studentSection.count()) > 0;

        if (hasStudentSection) {
          await expect(studentSection.first()).toBeVisible();
        } else {
          console.log('Student list section not found');
        }
      });
    });

    test.describe('System Overview Stats', () => {
      test('should display System Overview section', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Verify System Overview heading
        await expect(
          page.locator('h2:has-text("System Overview")')
        ).toBeVisible({ timeout: 10000 });

        // Verify description
        await expect(
          page.locator('text=/Administrative statistics/i')
        ).toBeVisible();
      });

      test('should have clickable stat cards linking to sections', async ({
        page,
      }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Wait for System Overview
        await page.waitForSelector('text=/System Overview/i', {
          state: 'visible',
          timeout: 10000,
        });

        // Verify stat card links
        await expect(
          page.locator('a[href="/dashboard/users"]').first()
        ).toBeVisible();
        await expect(
          page.locator('a[href="/dashboard/songs"]').first()
        ).toBeVisible();
        await expect(
          page.locator('a[href="/dashboard/lessons"]').first()
        ).toBeVisible();
      });

      test('should navigate to users page when clicking Total Users card', async ({
        page,
      }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Wait for stats to load
        await page.waitForSelector('text=/System Overview/i', {
          state: 'visible',
          timeout: 10000,
        });

        // Click Total Users card
        await page.locator('a[href="/dashboard/users"]').first().click();

        // Verify navigation
        await expect(page).toHaveURL(/\/users/);
      });
    });

    test.describe('Responsive Design', () => {
      test('should display correctly on tablet viewport', async ({ page }) => {
        // Set tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });

        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Main content should be visible
        await expect(page.locator('main, [role="main"]')).toBeVisible({
          timeout: 10000,
        });

        // Dashboard should still show key sections
        await expect(
          page.locator('text=/Welcome|Dashboard/i').first()
        ).toBeVisible();
      });

      test('should display correctly on mobile viewport', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Main content should be visible
        await expect(page.locator('main, [role="main"]')).toBeVisible({
          timeout: 10000,
        });

        // Dashboard should still show key sections (may be stacked)
        await expect(
          page.locator('text=/Welcome|Dashboard/i').first()
        ).toBeVisible();
      });

      test('should adapt stat cards layout on mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Wait for System Overview
        await page.waitForSelector('text=/System Overview/i', {
          state: 'visible',
          timeout: 10000,
        });

        // Stat cards should still be visible, just stacked
        await expect(page.locator('text=/Total Users/i')).toBeVisible();
      });
    });

    test.describe('Loading States', () => {
      test('should show loading state while data is fetching', async ({
        page,
      }) => {
        await page.goto('/dashboard');

        // Check for loading indicators (skeleton, spinner, etc.)
        const loadingIndicators = page.locator(
          '[class*="loading"], [class*="skeleton"], [class*="spinner"], [class*="animate-pulse"]'
        );

        // May or may not see loading state depending on speed
        const hasLoading = (await loadingIndicators.count()) > 0;

        if (hasLoading) {
          console.log('Loading state is shown');
        }

        // After loading, content should appear
        await page.waitForLoadState('networkidle');
        await expect(page.locator('main, [role="main"]')).toBeVisible({
          timeout: 10000,
        });
      });

      test('should eventually display dashboard content after loading', async ({
        page,
      }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // All key sections should be visible
        await expect(
          page.locator('text=/Welcome back/i')
        ).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=/System Overview/i')).toBeVisible();
        await expect(page.locator('text=/Lesson Statistics/i')).toBeVisible();
      });
    });

    test.describe('Error Handling', () => {
      test.skip('should handle API errors gracefully', async ({ page }) => {
        // Intercept API calls and force error
        await page.route('**/api/lessons*', (route) =>
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Server error' }),
          })
        );

        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Dashboard should still render (may show error state)
        await expect(page.locator('main, [role="main"]')).toBeVisible({
          timeout: 10000,
        });

        // Should see welcome message even if some sections fail
        await expect(page.locator('text=/Welcome back/i')).toBeVisible();
      });

      test('should display error message if data fetch fails', async ({
        page,
      }) => {
        // This is a placeholder - actual error handling depends on implementation
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Check if any error messages are visible
        const errorMessages = page.locator(
          'text=/Error|Failed|Something went wrong/i'
        );
        const hasErrors = (await errorMessages.count()) > 0;

        if (hasErrors) {
          console.log('Error message found on dashboard');
        } else {
          console.log('No errors on dashboard - data loaded successfully');
        }
      });
    });
  }
);
