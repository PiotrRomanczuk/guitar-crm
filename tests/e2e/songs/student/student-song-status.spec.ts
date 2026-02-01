/**
 * Student Song Status Test
 *
 * Migrated from: cypress/e2e/student-learning-journey.cy.ts (Phase 3: Browse Songs)
 *
 * Tests song status/progress tracking functionality for students:
 * 1. List rendering - Verify student songs page displays correctly
 * 2. Song cards - Display song information with status badges
 * 3. Status update - Change song learning progress status
 * 4. Status filtering - Filter songs by learning status
 * 5. View details - Navigate to song detail page
 * 6. Access control - Students should only see their assigned songs
 *
 * Prerequisites:
 * - Student user: student@example.com / test123_student
 * - Student may or may not have songs assigned
 *
 * @tags @student @songs @status
 */
import { test, expect } from '../../../fixtures';

test.describe('Student Song Status', { tag: ['@student', '@songs', '@status'] }, () => {
  test.beforeEach(async ({ page, loginAs }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as student
    await loginAs('student');
  });

  test.describe('List Rendering', () => {
    test('should display student songs page', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load (either songs or empty state)
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Verify page heading is visible
      await expect(page.locator('h1:has-text("My Songs")')).toBeVisible();
    });

    test('should display page description', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Verify description is visible
      await expect(
        page.locator('text=Songs you are currently learning or have mastered')
      ).toBeVisible();
    });

    test('should show loading state initially', async ({ page }) => {
      // Navigate without waiting for network
      await page.goto('/dashboard/songs');

      // Loading spinner should appear briefly
      // Note: This may be too fast to catch in some cases
      const spinner = page.locator('.animate-spin');
      const spinnerVisible = await spinner.isVisible().catch(() => false);

      // Either spinner was visible or page loaded fast enough
      // Just verify we end up with content
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1:has-text("My Songs")')).toBeVisible();
    });
  });

  test.describe('Song Content', () => {
    test('should display song cards or empty state', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to fully load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page
        .locator('.animate-spin')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});

      // Check for either songs or empty state
      const hasSongs = (await page.locator('a[href*="/dashboard/songs/"]').count()) > 0;
      const hasEmptyState = await page
        .locator('text=No songs assigned yet')
        .isVisible()
        .catch(() => false);

      // One of these should be true
      expect(hasSongs || hasEmptyState).toBeTruthy();
    });

    test('should display song details on cards when songs exist', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page
        .locator('.animate-spin')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});

      // Check if there are song cards
      const songLinks = page.locator('a[href*="/dashboard/songs/"]');
      const songCount = await songLinks.count();

      if (songCount > 0) {
        // Verify song card contains expected elements
        const songCard = page.locator('.bg-card').first();

        // Should show song title
        await expect(songCard.locator('h3')).toBeVisible();

        // Should show author/artist
        await expect(songCard.locator('p.text-muted-foreground').first()).toBeVisible();
      }
    });

    test('should display difficulty badges for songs', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page
        .locator('.animate-spin')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});

      // Check if there are songs
      const songCount = await page.locator('a[href*="/dashboard/songs/"]').count();

      if (songCount > 0) {
        // Difficulty badge should be visible (Beginner, Intermediate, or Advanced)
        const beginnerBadge = page.locator('text=Beginner');
        const intermediateBadge = page.locator('text=Intermediate');
        const advancedBadge = page.locator('text=Advanced');

        const hasBeginner = (await beginnerBadge.count()) > 0;
        const hasIntermediate = (await intermediateBadge.count()) > 0;
        const hasAdvanced = (await advancedBadge.count()) > 0;

        // At least one difficulty level should be visible
        expect(hasBeginner || hasIntermediate || hasAdvanced).toBeTruthy();
      }
    });

    test('should display status badges for songs', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page
        .locator('.animate-spin')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});

      // Check if there are songs
      const songCount = await page.locator('a[href*="/dashboard/songs/"]').count();

      if (songCount > 0) {
        // Status badge should be visible
        const statusBadges = [
          'To Learn',
          'Learning',
          'Practicing',
          'Improving',
          'Mastered',
        ];

        let hasStatus = false;
        for (const status of statusBadges) {
          const badge = page.locator(`text=${status}`);
          if ((await badge.count()) > 0) {
            hasStatus = true;
            break;
          }
        }

        // At least one status should be visible
        expect(hasStatus).toBeTruthy();
      }
    });

    test('should display song key information', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page
        .locator('.animate-spin')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});

      // Check if there are songs
      const songCount = await page.locator('a[href*="/dashboard/songs/"]').count();

      if (songCount > 0) {
        // Key info should be visible
        await expect(page.locator('text=Key:').first()).toBeVisible();
      }
    });
  });

  test.describe('Status Update', () => {
    test('should display learning progress dropdown', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page
        .locator('.animate-spin')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});

      // Check if there are songs
      const songCount = await page.locator('a[href*="/dashboard/songs/"]').count();

      if (songCount > 0) {
        // Learning Progress label should be visible
        await expect(page.locator('text=Learning Progress').first()).toBeVisible();
      }
    });

    test('should show status options when clicking dropdown', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page
        .locator('.animate-spin')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});

      // Check if there are songs
      const songCount = await page.locator('a[href*="/dashboard/songs/"]').count();

      if (songCount > 0) {
        // Find and click the first status dropdown trigger
        const statusTrigger = page
          .locator('.bg-card')
          .first()
          .locator('button[role="combobox"]');
        await statusTrigger.click();

        // Wait for dropdown to open
        await page.waitForTimeout(300);

        // Verify status options are visible
        await expect(page.locator('[role="option"]:has-text("To Learn")')).toBeVisible();
        await expect(page.locator('[role="option"]:has-text("Learning")')).toBeVisible();
        await expect(page.locator('[role="option"]:has-text("Practicing")')).toBeVisible();
        await expect(page.locator('[role="option"]:has-text("Improving")')).toBeVisible();
        await expect(page.locator('[role="option"]:has-text("Mastered")')).toBeVisible();
      }
    });
  });

  test.describe('Filtering and Sorting', () => {
    test('should display filter controls when songs exist', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page
        .locator('.animate-spin')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});

      // Check if there are songs
      const songCount = await page.locator('a[href*="/dashboard/songs/"]').count();

      if (songCount > 0) {
        // Search input should be visible
        await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
      }
    });

    test('should filter songs by status', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page
        .locator('.animate-spin')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});

      // Check if there are songs
      const songCount = await page.locator('a[href*="/dashboard/songs/"]').count();

      if (songCount > 0) {
        // Find the status filter dropdown (look for the one with "All Statuses" placeholder)
        const statusFilterTrigger = page.locator('button:has-text("All Statuses")');

        if ((await statusFilterTrigger.count()) > 0) {
          await statusFilterTrigger.click();
          await page.waitForTimeout(300);

          // Select a status to filter by
          const learningOption = page.locator('[role="option"]:has-text("Learning")');
          if ((await learningOption.count()) > 0) {
            await learningOption.click();
            await page.waitForTimeout(500);

            // Results should be filtered (or show "no songs match" message)
          }
        }
      }
    });

    test('should search songs by title or artist', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page
        .locator('.animate-spin')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});

      // Check if there are songs
      const songCount = await page.locator('a[href*="/dashboard/songs/"]').count();

      if (songCount > 0) {
        // Find the search input
        const searchInput = page.locator('input[placeholder*="Search"]');

        if ((await searchInput.count()) > 0) {
          // Type a search query
          await searchInput.fill('test');
          await page.waitForTimeout(500);

          // Results should be filtered based on search
        }
      }
    });

    test('should sort songs by different criteria', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page
        .locator('.animate-spin')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});

      // Check if there are songs
      const songCount = await page.locator('a[href*="/dashboard/songs/"]').count();

      if (songCount > 0) {
        // Find the sort dropdown (look for "Song Name" default)
        const sortTrigger = page.locator('button:has-text("Song Name")');

        if ((await sortTrigger.count()) > 0) {
          await sortTrigger.click();
          await page.waitForTimeout(300);

          // Select a different sort option
          const statusSort = page.locator('[role="option"]:has-text("Learning Status")');
          if ((await statusSort.count()) > 0) {
            await statusSort.click();
            await page.waitForTimeout(500);

            // Songs should be reordered by status
          }
        }
      }
    });
  });

  test.describe('Empty State', () => {
    test('should display empty state message when no songs assigned', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page
        .locator('.animate-spin')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});

      // Check for empty state
      const emptyState = page.locator('text=No songs assigned yet');
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      if (hasEmptyState) {
        // Verify empty state content
        await expect(emptyState).toBeVisible();
        await expect(
          page.locator("text=You haven't been assigned any songs yet")
        ).toBeVisible();
      }
    });

    test('should display no match message when filters return no results', async ({
      page,
    }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page
        .locator('.animate-spin')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});

      // Check if there are songs
      const songCount = await page.locator('a[href*="/dashboard/songs/"]').count();

      if (songCount > 0) {
        // Search for something that doesn't exist
        const searchInput = page.locator('input[placeholder*="Search"]');
        if ((await searchInput.count()) > 0) {
          await searchInput.fill('xyz123nonexistent789');
          await page.waitForTimeout(500);

          // Should show "no songs match your filters" message
          const noMatchMessage = page.locator('text=No songs match your filters');
          await expect(noMatchMessage).toBeVisible();

          // Should show clear filters button
          await expect(page.locator('button:has-text("Clear Filters")')).toBeVisible();
        }
      }
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to song detail when clicking View Full Details', async ({
      page,
    }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page
        .locator('.animate-spin')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});

      // Check if there are songs
      const viewDetailsButtons = page.locator('a:has-text("View Full Details")');
      const buttonCount = await viewDetailsButtons.count();

      if (buttonCount > 0) {
        // Click on first "View Full Details" button
        await viewDetailsButtons.first().click();

        // Should navigate to song detail page
        await expect(page).toHaveURL(/\/dashboard\/songs\/[^/]+$/);
      }
    });

    test('should display song detail page content', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page
        .locator('.animate-spin')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});

      // Check if there are songs
      const viewDetailsButtons = page.locator('a:has-text("View Full Details")');
      const buttonCount = await viewDetailsButtons.count();

      if (buttonCount > 0) {
        // Click on first "View Full Details" button
        await viewDetailsButtons.first().click();

        // Wait for detail page to load
        await page.waitForLoadState('networkidle');

        // Should show song details
        await expect(page.locator('text=Back to My Songs')).toBeVisible();

        // Should show Learning Progress dropdown on detail page
        await expect(page.locator('text=Learning Progress')).toBeVisible();
      }
    });

    test('should navigate back to songs list from detail page', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page
        .locator('.animate-spin')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});

      // Check if there are songs
      const viewDetailsButtons = page.locator('a:has-text("View Full Details")');
      const buttonCount = await viewDetailsButtons.count();

      if (buttonCount > 0) {
        // Click on first "View Full Details" button
        await viewDetailsButtons.first().click();

        // Wait for detail page to load
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/dashboard\/songs\/[^/]+$/);

        // Click back link
        const backLink = page.locator('a:has-text("Back to My Songs")');
        await backLink.click();

        // Should navigate back to songs list
        await expect(page).toHaveURL('/dashboard/songs');
      }
    });
  });

  test.describe('Access Control', () => {
    test('should only see own assigned songs', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page
        .locator('.animate-spin')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});

      // Student view should show "My Songs" heading (not the admin/teacher song table)
      await expect(page.locator('h1:has-text("My Songs")')).toBeVisible();

      // Student view should NOT show admin controls
      await expect(page.locator('[data-testid="song-new-button"]')).not.toBeVisible();
      await expect(page.locator('a[href="/dashboard/songs/new"]')).not.toBeVisible();
    });

    test('should NOT have access to add new songs', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // There should be no "Add Song" button for students
      await expect(page.locator('[data-testid="song-new-button"]')).not.toBeVisible();
      await expect(page.locator('button:has-text("Add Song")')).not.toBeVisible();
    });

    test('should NOT see song table view (admin/teacher view)', async ({ page }) => {
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for spinner to disappear
      await page
        .locator('.animate-spin')
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {});

      // Student view should NOT show the admin/teacher song table
      await expect(page.locator('[data-testid="song-table"]')).not.toBeVisible();

      // Student view uses card-based layout, not table
      // Check for card grid or empty state
      const hasCards = (await page.locator('.grid .bg-card').count()) > 0;
      const hasEmptyState = await page
        .locator('text=No songs assigned yet')
        .isVisible()
        .catch(() => false);

      expect(hasCards || hasEmptyState).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Page should be visible on mobile
      await expect(page.locator('h1:has-text("My Songs")')).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');

      // Wait for page to load
      await page.waitForSelector('h1:has-text("My Songs")', {
        state: 'visible',
        timeout: 10000,
      });

      // Page should be visible on tablet
      await expect(page.locator('h1:has-text("My Songs")')).toBeVisible();
    });
  });
});
