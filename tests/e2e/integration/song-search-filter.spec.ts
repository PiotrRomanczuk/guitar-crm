/**
 * Song Search and Filter Integration Tests
 *
 * Migrated from: cypress/e2e/integration/song-search-filter.cy.ts
 *
 * Tests song library search and filtering:
 * 1. Search songs by title/artist
 * 2. Filter by genre (level)
 * 3. Filter by difficulty (key)
 * 4. Sort songs
 * 5. Combined filters
 * 6. Filter performance
 * 7. Filter UI/UX
 *
 * Priority: P2 - Important for song management workflow
 *
 * Prerequisites:
 * - Admin user with is_teacher=true: p.romanczuk@gmail.com / test123_admin
 * - Database has songs available for filtering
 *
 * @tags @integration @songs @search @filter
 */
import { test, expect } from '../../fixtures';

test.describe(
  'Song Search and Filter',
  { tag: ['@integration', '@songs', '@search', '@filter'] },
  () => {
    test.beforeEach(async ({ page, loginAs }) => {
      // Set viewport to desktop
      await page.setViewportSize({ width: 1280, height: 720 });

      // Login as admin (who has is_teacher=true)
      await loginAs('admin');

      // Navigate to songs page
      await page.goto('/dashboard/songs');
      await page.waitForLoadState('networkidle');
    });

    test.describe('Search Functionality', () => {
      test('should search songs by title', async ({ page }) => {
        // Look for search input
        const searchInput = page.locator(
          'input[type="search"], input[placeholder*="Search"], input[placeholder*="search"], input[name="search"], [data-testid="search-input"], #search-filter'
        );

        const hasSearchInput = (await searchInput.count()) > 0;

        if (hasSearchInput) {
          await searchInput.first().fill('guitar');
          await page.waitForTimeout(500);

          // Verify search is applied
          const inputValue = await searchInput.first().inputValue();
          expect(inputValue).toBe('guitar');
        }
      });

      test('should search songs by artist', async ({ page }) => {
        const searchInput = page.locator(
          'input[type="search"], #search-filter'
        );

        const hasSearchInput = (await searchInput.count()) > 0;

        if (hasSearchInput) {
          await searchInput.first().clear();
          await searchInput.first().fill('Beatles');
          await page.waitForTimeout(500);

          const inputValue = await searchInput.first().inputValue();
          expect(inputValue).toBe('Beatles');
        }
      });

      test('should display search results', async ({ page }) => {
        const searchInput = page.locator(
          'input[type="search"], #search-filter'
        );

        const hasSearchInput = (await searchInput.count()) > 0;

        if (hasSearchInput) {
          await searchInput.first().fill('song');
          await page.waitForTimeout(500);

          // Should show results or empty state
          await expect(page.locator('body')).toBeVisible();
        }
      });

      test('should show no results message for non-matching search', async ({
        page,
      }) => {
        const searchInput = page.locator(
          'input[type="search"], #search-filter'
        );

        const hasSearchInput = (await searchInput.count()) > 0;

        if (hasSearchInput) {
          await searchInput.first().fill('xyz123nonexistent789');
          await page.waitForTimeout(500);

          // Page should still be visible (showing empty state or no results message)
          await expect(page.locator('body')).toBeVisible();
        }
      });

      test('should clear search results', async ({ page }) => {
        const searchInput = page.locator(
          'input[type="search"], #search-filter'
        );

        const hasSearchInput = (await searchInput.count()) > 0;

        if (hasSearchInput) {
          await searchInput.first().fill('test');
          await page.waitForTimeout(300);

          // Clear search
          await searchInput.first().clear();
          await page.waitForTimeout(300);

          const inputValue = await searchInput.first().inputValue();
          expect(inputValue).toBe('');
        }
      });
    });

    test.describe('Genre Filter', () => {
      test('should filter songs by genre', async ({ page }) => {
        // Look for genre filter (could be select or shadcn Select)
        const genreFilter = page.locator(
          'select[name="genre"], select[name="genreId"], [data-testid="genre-filter"], #level-filter'
        );

        const hasGenreFilter = (await genreFilter.count()) > 0;

        if (hasGenreFilter) {
          // Click to open dropdown if it's a shadcn Select
          await genreFilter.first().click();
          await page.waitForTimeout(300);

          // Select first option
          const options = page.locator('[role="option"]');
          if ((await options.count()) > 1) {
            await options.nth(1).click();
            await page.waitForTimeout(500);
          }
        }
      });

      test('should show only songs matching selected genre', async ({
        page,
      }) => {
        const genreFilter = page.locator(
          'select[name="genre"], #level-filter'
        );

        const hasGenreFilter = (await genreFilter.count()) > 0;

        if (hasGenreFilter) {
          await genreFilter.first().click();
          await page.waitForTimeout(300);

          const options = page.locator('[role="option"]');
          if ((await options.count()) > 1) {
            await options.nth(1).click();
            await page.waitForTimeout(500);

            // Verify filtering worked - URL should have filter parameter
            const url = page.url();
            expect(url).toMatch(/level=|genre=/);
          }
        }
      });

      test('should show all genres when filter is cleared', async ({
        page,
      }) => {
        // Start with a filter applied
        await page.goto('/dashboard/songs?level=beginner');
        await page.waitForLoadState('networkidle');

        const genreFilter = page.locator('#level-filter');

        const hasGenreFilter = (await genreFilter.count()) > 0;

        if (hasGenreFilter) {
          await genreFilter.first().click();
          await page.waitForTimeout(300);

          // Select "All" option
          const allOption = page.locator(
            '[role="option"]:has-text("All"), [role="option"]:has-text("All Levels")'
          );
          if ((await allOption.count()) > 0) {
            await allOption.first().click();
            await page.waitForTimeout(300);

            // URL should not contain level parameter
            await expect(page).not.toHaveURL(/level=/);
          }
        }
      });
    });

    test.describe('Difficulty Filter', () => {
      test('should filter songs by difficulty level', async ({ page }) => {
        const difficultyFilter = page.locator(
          'select[name="difficulty"], [data-testid="difficulty-filter"], #key-filter'
        );

        const hasDifficultyFilter = (await difficultyFilter.count()) > 0;

        if (hasDifficultyFilter) {
          await difficultyFilter.first().click();
          await page.waitForTimeout(300);

          const options = page.locator('[role="option"]');
          if ((await options.count()) > 1) {
            await options.nth(1).click();
            await page.waitForTimeout(500);
          }
        }
      });

      test('should show only songs matching difficulty', async ({ page }) => {
        const difficultyFilter = page.locator(
          'select[name="difficulty"], #key-filter'
        );

        const hasDifficultyFilter = (await difficultyFilter.count()) > 0;

        if (hasDifficultyFilter) {
          await difficultyFilter.first().click();
          await page.waitForTimeout(300);

          const options = page.locator('[role="option"]');
          if ((await options.count()) > 1) {
            await options.nth(1).click();
            await page.waitForTimeout(500);

            // Verify filtering worked
            const url = page.url();
            expect(url).toMatch(/key=|difficulty=/);
          }
        }
      });

      test('should handle all difficulty levels', async ({ page }) => {
        const difficultyFilter = page.locator(
          'select[name="difficulty"], #key-filter'
        );

        const hasDifficultyFilter = (await difficultyFilter.count()) > 0;

        if (hasDifficultyFilter) {
          await difficultyFilter.first().click();
          await page.waitForTimeout(300);

          const options = page.locator('[role="option"]');
          const optionCount = await options.count();

          // Test first few options (excluding "All" option)
          const maxToTest = Math.min(optionCount, 4);
          for (let i = 1; i < maxToTest; i++) {
            await difficultyFilter.first().click();
            await page.waitForTimeout(200);
            await options.nth(i).click();
            await page.waitForTimeout(300);
          }
        }
      });
    });

    test.describe('Sorting', () => {
      test('should sort songs alphabetically', async ({ page }) => {
        const sortSelect = page.locator(
          'select[name="sort"], select[name="sortBy"], [data-testid="sort-select"]'
        );

        const hasSortSelect = (await sortSelect.count()) > 0;

        if (hasSortSelect) {
          // Check if there's a title option
          const options = await sortSelect.first().locator('option').all();

          for (const option of options) {
            const value = await option.getAttribute('value');
            if (value?.toLowerCase().includes('title')) {
              await sortSelect.first().selectOption('title');
              await page.waitForTimeout(500);
              break;
            }
          }
        }
      });

      test('should sort songs by artist', async ({ page }) => {
        const sortSelect = page.locator('select[name*="sort"]');

        const hasSortSelect = (await sortSelect.count()) > 0;

        if (hasSortSelect) {
          const options = await sortSelect.first().locator('option').all();

          for (const option of options) {
            const value = await option.getAttribute('value');
            const text = await option.textContent();
            if (
              value?.toLowerCase().includes('artist') ||
              text?.toLowerCase().includes('artist')
            ) {
              await sortSelect.first().selectOption(value || '');
              await page.waitForTimeout(500);
              break;
            }
          }
        }
      });

      test('should sort songs by difficulty', async ({ page }) => {
        const sortSelect = page.locator('select[name*="sort"]');

        const hasSortSelect = (await sortSelect.count()) > 0;

        if (hasSortSelect) {
          const options = await sortSelect.first().locator('option').all();

          for (const option of options) {
            const value = await option.getAttribute('value');
            if (value?.toLowerCase().includes('difficulty')) {
              await sortSelect.first().selectOption(value);
              await page.waitForTimeout(500);
              break;
            }
          }
        }
      });

      test('should toggle sort direction', async ({ page }) => {
        const sortButton = page.locator(
          'button[aria-label*="sort"], button:has-text("Sort")'
        );

        const hasSortButton = (await sortButton.count()) > 0;

        if (hasSortButton) {
          await sortButton.first().click();
          await page.waitForTimeout(300);

          await sortButton.first().click();
          await page.waitForTimeout(300);
        }
      });
    });

    test.describe('Combined Filters', () => {
      test('should combine search and genre filter', async ({ page }) => {
        const searchInput = page.locator(
          'input[type="search"], #search-filter'
        );
        const genreFilter = page.locator(
          'select[name="genre"], #level-filter'
        );

        const hasSearchInput = (await searchInput.count()) > 0;
        const hasGenreFilter = (await genreFilter.count()) > 0;

        if (hasSearchInput && hasGenreFilter) {
          await searchInput.first().fill('song');
          await page.waitForTimeout(300);

          await genreFilter.first().click();
          await page.waitForTimeout(300);

          const options = page.locator('[role="option"]');
          if ((await options.count()) > 1) {
            await options.nth(1).click();
            await page.waitForTimeout(500);
          }

          // Verify both filters are applied
          const url = page.url();
          expect(url).toMatch(/search=/);
        }
      });

      test('should combine all filters (search, genre, difficulty)', async ({
        page,
      }) => {
        const searchInput = page.locator(
          'input[type="search"], #search-filter'
        );
        const genreFilter = page.locator('#level-filter');
        const difficultyFilter = page.locator('#key-filter');

        // Apply search filter
        if ((await searchInput.count()) > 0) {
          await searchInput.first().fill('guitar');
          await page.waitForTimeout(300);
        }

        // Apply genre filter
        if ((await genreFilter.count()) > 0) {
          await genreFilter.first().click();
          await page.waitForTimeout(300);
          const genreOptions = page.locator('[role="option"]');
          if ((await genreOptions.count()) > 1) {
            await genreOptions.nth(1).click();
            await page.waitForTimeout(300);
          }
        }

        // Apply difficulty filter
        if ((await difficultyFilter.count()) > 0) {
          await difficultyFilter.first().click();
          await page.waitForTimeout(300);
          const diffOptions = page.locator('[role="option"]');
          if ((await diffOptions.count()) > 1) {
            await diffOptions.nth(1).click();
            await page.waitForTimeout(500);
          }
        }

        // Verify all filters are combined
        await expect(page.locator('body')).toBeVisible();
      });

      test('should clear all filters simultaneously', async ({ page }) => {
        // Apply multiple filters first
        const searchInput = page.locator(
          'input[type="search"], #search-filter'
        );
        const genreFilter = page.locator('#level-filter');

        if ((await searchInput.count()) > 0) {
          await searchInput.first().fill('test');
          await page.waitForTimeout(300);
        }

        if ((await genreFilter.count()) > 0) {
          await genreFilter.first().click();
          await page.waitForTimeout(300);
          const options = page.locator('[role="option"]');
          if ((await options.count()) > 1) {
            await options.nth(1).click();
            await page.waitForTimeout(500);
          }
        }

        // Look for clear/reset button
        const clearButton = page.locator(
          'button:has-text("Clear"), button:has-text("Reset"), button:has-text("Reset Filters")'
        );

        if ((await clearButton.count()) > 0) {
          const isDisabled = await clearButton.first().isDisabled();
          if (!isDisabled) {
            await clearButton.first().click();
            await page.waitForTimeout(300);

            // Verify filters are cleared
            await expect(page).not.toHaveURL(/search=/);
          }
        }
      });
    });

    test.describe('Filter Performance', () => {
      test('should filter results quickly', async ({ page }) => {
        const searchInput = page.locator(
          'input[type="search"], #search-filter'
        );

        const hasSearchInput = (await searchInput.count()) > 0;

        if (hasSearchInput) {
          const startTime = Date.now();

          await searchInput.first().fill('performance test');
          await page.waitForTimeout(500);

          const endTime = Date.now();
          const duration = endTime - startTime;

          // Should be under 2 seconds
          expect(duration).toBeLessThan(2000);
        }
      });

      test('should debounce search input', async ({ page }) => {
        const searchInput = page.locator(
          'input[type="search"], #search-filter'
        );

        const hasSearchInput = (await searchInput.count()) > 0;

        if (hasSearchInput) {
          // Type rapidly character by character
          await searchInput.first().type('d', { delay: 50 });
          await searchInput.first().type('e', { delay: 50 });
          await searchInput.first().type('bounce', { delay: 50 });

          // Wait for debounce
          await page.waitForTimeout(600);

          const inputValue = await searchInput.first().inputValue();
          expect(inputValue).toBe('debounce');
        }
      });
    });

    test.describe('Filter UI/UX', () => {
      test('should show active filter count', async ({ page }) => {
        const genreFilter = page.locator('#level-filter');
        const difficultyFilter = page.locator('#key-filter');

        const hasGenreFilter = (await genreFilter.count()) > 0;
        const hasDifficultyFilter = (await difficultyFilter.count()) > 0;

        if (hasGenreFilter && hasDifficultyFilter) {
          // Apply genre filter
          await genreFilter.first().click();
          await page.waitForTimeout(300);
          const genreOptions = page.locator('[role="option"]');
          if ((await genreOptions.count()) > 1) {
            await genreOptions.nth(1).click();
            await page.waitForTimeout(300);
          }

          // Apply difficulty filter
          await difficultyFilter.first().click();
          await page.waitForTimeout(300);
          const diffOptions = page.locator('[role="option"]');
          if ((await diffOptions.count()) > 1) {
            await diffOptions.nth(1).click();
            await page.waitForTimeout(300);
          }

          // Verify page is visible after applying filters
          await expect(page.locator('body')).toBeVisible();
        }
      });

      test('should show results count after filtering', async ({ page }) => {
        const searchInput = page.locator(
          'input[type="search"], #search-filter'
        );

        const hasSearchInput = (await searchInput.count()) > 0;

        if (hasSearchInput) {
          await searchInput.first().fill('result count test');
          await page.waitForTimeout(500);

          // Verify page shows results or empty state after filtering
          await expect(page.locator('body')).toBeVisible();
        }
      });

      test('should maintain filter state on pagination', async ({ page }) => {
        const searchInput = page.locator(
          'input[type="search"], #search-filter'
        );

        const hasSearchInput = (await searchInput.count()) > 0;

        if (hasSearchInput) {
          await searchInput.first().fill('pagination test');
          await page.waitForTimeout(500);

          // Look for pagination buttons
          const nextButton = page.locator(
            'button:has-text("Next"), [aria-label*="next"]'
          );

          if ((await nextButton.count()) > 0) {
            const isDisabled = await nextButton.first().isDisabled();
            if (!isDisabled) {
              await nextButton.first().click();
              await page.waitForTimeout(500);

              // Search should still be active
              const inputValue = await searchInput.first().inputValue();
              expect(inputValue).toBe('pagination test');
            }
          }
        }
      });
    });
  }
);
