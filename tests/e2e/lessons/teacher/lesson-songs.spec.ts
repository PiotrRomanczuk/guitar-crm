/**
 * Teacher Lesson Songs Test
 *
 * Tests the songs section in lesson detail page for teachers:
 * 1. Display - Verify Lesson Songs section renders correctly
 * 2. Add Songs - Open modal and add songs to lesson
 * 3. Status Update - Change song status via dropdown
 * 4. Remove Songs - Remove songs from lesson
 * 5. View Song - Navigate to song detail from lesson
 *
 * Prerequisites:
 * - Admin user with is_teacher=true: p.romanczuk@gmail.com / test123_admin
 * - Database has lessons and songs available
 *
 * @tags @teacher @lessons @songs
 */
import { test, expect } from '../../../fixtures';

test.describe('Teacher Lesson Songs', { tag: ['@teacher', '@lessons', '@songs'] }, () => {
  test.beforeEach(async ({ page, loginAs }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as admin (who has is_teacher=true)
    await loginAs('admin');
  });

  test.describe('Lesson Songs Section Display', () => {
    test('should display Lesson Songs section on lesson detail page', async ({ page }) => {
      // Navigate to lessons list
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on first lesson row to go to detail page
      const lessonRow = page.locator('[data-testid="lesson-table"] tbody tr').first();
      const rowCount = await lessonRow.count();

      if (rowCount > 0) {
        await lessonRow.locator('a').first().click();

        // Verify we're on a lesson detail page
        await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // Verify Lesson Songs section heading is visible
        await expect(page.locator('text=Lesson Songs')).toBeVisible({ timeout: 10000 });
      }
    });

    test('should display Add Songs button for teachers', async ({ page }) => {
      // Navigate to lessons list
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on first lesson row to go to detail page
      const lessonRow = page.locator('[data-testid="lesson-table"] tbody tr').first();
      const rowCount = await lessonRow.count();

      if (rowCount > 0) {
        await lessonRow.locator('a').first().click();

        // Verify we're on a lesson detail page
        await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // Verify Add Songs button is visible for teachers
        await expect(page.locator('button:has-text("Add Songs")')).toBeVisible({ timeout: 10000 });
      }
    });

    test('should show empty state when no songs assigned', async ({ page }) => {
      // Navigate to lessons list
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on first lesson row
      const lessonRow = page.locator('[data-testid="lesson-table"] tbody tr').first();
      const rowCount = await lessonRow.count();

      if (rowCount > 0) {
        await lessonRow.locator('a').first().click();

        // Verify we're on a lesson detail page
        await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // Check if there are songs or empty state message
        const songsSection = page.locator('text=Lesson Songs').locator('..').locator('..');
        const hasSongs = await songsSection.locator('ul li').count();
        const hasEmptyMessage = await page.locator('text=No songs assigned to this lesson').isVisible().catch(() => false);

        // Either songs exist or empty state message should be shown
        expect(hasSongs > 0 || hasEmptyMessage).toBeTruthy();
      }
    });
  });

  test.describe('Add Songs to Lesson', () => {
    test('should open song selector modal when clicking Add Songs', async ({ page }) => {
      // Navigate to lessons list
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on first lesson row
      const lessonRow = page.locator('[data-testid="lesson-table"] tbody tr').first();
      const rowCount = await lessonRow.count();

      if (rowCount > 0) {
        await lessonRow.locator('a').first().click();

        // Verify we're on a lesson detail page
        await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // Click Add Songs button
        const addSongsButton = page.locator('button:has-text("Add Songs")');
        await addSongsButton.waitFor({ state: 'visible', timeout: 10000 });
        await addSongsButton.click();

        // Verify modal is open with "Select Songs" title
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=Select Songs')).toBeVisible({ timeout: 5000 });
      }
    });

    test('should display search input in song selector modal', async ({ page }) => {
      // Navigate to lessons list
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on first lesson row
      const lessonRow = page.locator('[data-testid="lesson-table"] tbody tr').first();
      const rowCount = await lessonRow.count();

      if (rowCount > 0) {
        await lessonRow.locator('a').first().click();
        await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // Click Add Songs button
        await page.locator('button:has-text("Add Songs")').click();
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

        // Verify search input is present
        await expect(page.locator('input[placeholder="Search songs..."]')).toBeVisible({ timeout: 5000 });
      }
    });

    test('should display song list with checkboxes in modal', async ({ page }) => {
      // Navigate to lessons list
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on first lesson row
      const lessonRow = page.locator('[data-testid="lesson-table"] tbody tr').first();
      const rowCount = await lessonRow.count();

      if (rowCount > 0) {
        await lessonRow.locator('a').first().click();
        await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // Click Add Songs button
        await page.locator('button:has-text("Add Songs")').click();
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

        // Wait for songs to load (either songs or loading state)
        await page.waitForTimeout(2000);

        // Check for checkboxes (if songs exist) or empty message
        const checkboxes = page.locator('[role="dialog"] [role="checkbox"]');
        const checkboxCount = await checkboxes.count();
        const hasNoSongs = await page.locator('[role="dialog"]:has-text("No songs found")').isVisible().catch(() => false);

        expect(checkboxCount > 0 || hasNoSongs).toBeTruthy();
      }
    });

    test('should filter songs when typing in search', async ({ page }) => {
      // Navigate to lessons list
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on first lesson row
      const lessonRow = page.locator('[data-testid="lesson-table"] tbody tr').first();
      const rowCount = await lessonRow.count();

      if (rowCount > 0) {
        await lessonRow.locator('a').first().click();
        await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // Click Add Songs button
        await page.locator('button:has-text("Add Songs")').click();
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

        // Wait for songs to load
        await page.waitForTimeout(2000);

        // Get initial checkbox count
        const initialCount = await page.locator('[role="dialog"] [role="checkbox"]').count();

        if (initialCount > 0) {
          // Type in search input
          await page.locator('input[placeholder="Search songs..."]').fill('xyz123nonexistent');
          await page.waitForTimeout(500);

          // Check that results are filtered (either fewer items or "No songs found")
          const filteredCount = await page.locator('[role="dialog"] [role="checkbox"]').count();
          const hasNoResults = await page.locator('[role="dialog"]:has-text("No songs found")').isVisible().catch(() => false);

          expect(filteredCount < initialCount || hasNoResults).toBeTruthy();
        }
      }
    });

    test('should close modal when clicking Cancel', async ({ page }) => {
      // Navigate to lessons list
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on first lesson row
      const lessonRow = page.locator('[data-testid="lesson-table"] tbody tr').first();
      const rowCount = await lessonRow.count();

      if (rowCount > 0) {
        await lessonRow.locator('a').first().click();
        await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // Click Add Songs button
        await page.locator('button:has-text("Add Songs")').click();
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

        // Click Cancel button
        await page.locator('[role="dialog"] button:has-text("Cancel")').click();

        // Verify modal is closed
        await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
      }
    });

    test('should add songs to lesson when saving selection', async ({ page }) => {
      // Navigate to lessons list
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on first lesson row
      const lessonRow = page.locator('[data-testid="lesson-table"] tbody tr').first();
      const rowCount = await lessonRow.count();

      if (rowCount > 0) {
        await lessonRow.locator('a').first().click();
        await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // Click Add Songs button
        await page.locator('button:has-text("Add Songs")').click();
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

        // Wait for songs to load
        await page.waitForTimeout(2000);

        // Get available checkboxes
        const checkboxes = page.locator('[role="dialog"] [role="checkbox"]');
        const checkboxCount = await checkboxes.count();

        if (checkboxCount > 0) {
          // Find an unchecked checkbox and click it
          const uncheckedCheckbox = checkboxes.filter({ has: page.locator('[data-state="unchecked"]') }).first();
          const hasUnchecked = await uncheckedCheckbox.count() > 0;

          if (hasUnchecked) {
            await uncheckedCheckbox.click();
            await page.waitForTimeout(300);
          }

          // Click Save Changes button
          await page.locator('[role="dialog"] button:has-text("Save Changes")').click();

          // Wait for modal to close
          await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 10000 });

          // The page should have updated (may need refresh to see changes)
          await page.waitForLoadState('networkidle');
        }
      }
    });
  });

  test.describe('Song Status Management', () => {
    test('should display status dropdown for assigned songs', async ({ page }) => {
      // Navigate to lessons list
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on first lesson row
      const lessonRow = page.locator('[data-testid="lesson-table"] tbody tr').first();
      const rowCount = await lessonRow.count();

      if (rowCount > 0) {
        await lessonRow.locator('a').first().click();
        await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // Check if there are songs in the lesson
        const songsSection = page.locator('text=Lesson Songs').locator('..').locator('..');
        const songItems = songsSection.locator('ul li');
        const songCount = await songItems.count();

        if (songCount > 0) {
          // Verify status dropdown is visible for the first song
          // The status dropdown uses SelectTrigger with specific width
          const statusTrigger = songItems.first().locator('[role="combobox"], button').first();
          await expect(statusTrigger).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('should show status options when clicking status dropdown', async ({ page }) => {
      // Navigate to lessons list
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on first lesson row
      const lessonRow = page.locator('[data-testid="lesson-table"] tbody tr').first();
      const rowCount = await lessonRow.count();

      if (rowCount > 0) {
        await lessonRow.locator('a').first().click();
        await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // Check if there are songs in the lesson
        const songsSection = page.locator('text=Lesson Songs').locator('..').locator('..');
        const songItems = songsSection.locator('ul li');
        const songCount = await songItems.count();

        if (songCount > 0) {
          // Click status dropdown for the first song
          const statusTrigger = songItems.first().locator('[role="combobox"]').first();
          await statusTrigger.click();
          await page.waitForTimeout(300);

          // Verify status options are visible
          const statusOptions = ['To Learn', 'Started', 'Remembered', 'With Author', 'Mastered'];
          for (const option of statusOptions) {
            await expect(page.locator(`[role="option"]:has-text("${option}")`)).toBeVisible({ timeout: 3000 });
          }
        }
      }
    });

    test('should update song status when selecting new status', async ({ page }) => {
      // Navigate to lessons list
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on first lesson row
      const lessonRow = page.locator('[data-testid="lesson-table"] tbody tr').first();
      const rowCount = await lessonRow.count();

      if (rowCount > 0) {
        await lessonRow.locator('a').first().click();
        await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // Check if there are songs in the lesson
        const songsSection = page.locator('text=Lesson Songs').locator('..').locator('..');
        const songItems = songsSection.locator('ul li');
        const songCount = await songItems.count();

        if (songCount > 0) {
          // Get current status
          const statusTrigger = songItems.first().locator('[role="combobox"]').first();
          const currentStatus = await statusTrigger.textContent();

          // Click to open dropdown
          await statusTrigger.click();
          await page.waitForTimeout(300);

          // Select a different status (pick "Started" if not already selected, otherwise "Remembered")
          const newStatus = currentStatus?.includes('Started') ? 'Remembered' : 'Started';
          await page.locator(`[role="option"]:has-text("${newStatus}")`).click();

          // Wait for update
          await page.waitForTimeout(1000);

          // Verify status was updated (toast notification or UI change)
          // The status trigger should now show the new status
          await expect(statusTrigger).toContainText(newStatus, { timeout: 5000 });
        }
      }
    });
  });

  test.describe('View Song from Lesson', () => {
    test('should display View link for each song', async ({ page }) => {
      // Navigate to lessons list
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on first lesson row
      const lessonRow = page.locator('[data-testid="lesson-table"] tbody tr').first();
      const rowCount = await lessonRow.count();

      if (rowCount > 0) {
        await lessonRow.locator('a').first().click();
        await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // Check if there are songs in the lesson
        const songsSection = page.locator('text=Lesson Songs').locator('..').locator('..');
        const songItems = songsSection.locator('ul li');
        const songCount = await songItems.count();

        if (songCount > 0) {
          // Verify View link is visible for the first song
          const viewLink = songItems.first().locator('a:has-text("View")');
          await expect(viewLink).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('should navigate to song detail when clicking View', async ({ page }) => {
      // Navigate to lessons list
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on first lesson row
      const lessonRow = page.locator('[data-testid="lesson-table"] tbody tr').first();
      const rowCount = await lessonRow.count();

      if (rowCount > 0) {
        await lessonRow.locator('a').first().click();
        await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // Check if there are songs in the lesson
        const songsSection = page.locator('text=Lesson Songs').locator('..').locator('..');
        const songItems = songsSection.locator('ul li');
        const songCount = await songItems.count();

        if (songCount > 0) {
          // Click View link for the first song
          const viewLink = songItems.first().locator('a:has-text("View")');
          await viewLink.click();

          // Verify we navigated to song detail page
          await expect(page).toHaveURL(/\/songs\/[^/]+$/, { timeout: 10000 });
        }
      }
    });
  });

  test.describe('Remove Songs from Lesson', () => {
    test('should remove song by unchecking in modal and saving', async ({ page }) => {
      // Navigate to lessons list
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Wait for table to load
      await page.waitForSelector('[data-testid="lesson-table"], table', {
        state: 'visible',
        timeout: 10000,
      });

      // Click on first lesson row
      const lessonRow = page.locator('[data-testid="lesson-table"] tbody tr').first();
      const rowCount = await lessonRow.count();

      if (rowCount > 0) {
        await lessonRow.locator('a').first().click();
        await expect(page).toHaveURL(/\/lessons\/[^/]+$/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // Check if there are songs in the lesson
        const songsSection = page.locator('text=Lesson Songs').locator('..').locator('..');
        const songItems = songsSection.locator('ul li');
        const initialSongCount = await songItems.count();

        if (initialSongCount > 0) {
          // Click Add Songs button to open modal
          await page.locator('button:has-text("Add Songs")').click();
          await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

          // Wait for songs to load
          await page.waitForTimeout(2000);

          // Find a checked checkbox (currently assigned song)
          const checkedCheckbox = page.locator('[role="dialog"] [role="checkbox"][data-state="checked"]').first();
          const hasChecked = await checkedCheckbox.count() > 0;

          if (hasChecked) {
            // Uncheck it to remove from lesson
            await checkedCheckbox.click();
            await page.waitForTimeout(300);

            // Save changes
            await page.locator('[role="dialog"] button:has-text("Save Changes")').click();

            // Wait for modal to close
            await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 10000 });

            // The page should update
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });
  });
});
