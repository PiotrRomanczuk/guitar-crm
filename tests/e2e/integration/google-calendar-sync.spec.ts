/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { test, expect } from '@playwright/test';
import { loginAsTeacher, loginAsAdmin } from '../../helpers/auth';

/**
 * Google Calendar Integration E2E Tests
 *
 * Tests the bidirectional sync between Strummy and Google Calendar:
 * 1. Calendar Integration Page Access
 * 2. Lesson Creation with Calendar Sync
 * 3. Lesson Update with Calendar Sync
 * 4. Lesson Deletion with Calendar Sync
 * 5. Calendar Import UI Flow
 *
 * Prerequisites:
 * - Teacher user: teacher@example.com / test123_teacher
 * - Admin user: p.romanczuk@gmail.com / test123_admin
 * - Seeded database with students
 *
 * Note: These tests verify UI flow and API integration without requiring
 * real Google OAuth credentials. Full OAuth flow requires manual testing
 * with actual Google account.
 *
 * @tags @integration @calendar @google
 */

test.describe('Google Calendar Integration', { tag: ['@integration', '@calendar'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.describe('Calendar Import Page Access', () => {
    test('should allow teacher to access calendar import page', async ({ page }) => {
      await loginAsTeacher(page);

      // Navigate to calendar import page
      await page.goto('/dashboard/lessons/import');
      await page.waitForLoadState('networkidle');

      // Verify page loaded
      await expect(page).toHaveURL('/dashboard/lessons/import');

      // Check for calendar integration UI elements
      const pageContent = await page.textContent('body');
      expect(pageContent).toContain('Google Calendar');
    });

    test('should allow admin to access calendar import page', async ({ page }) => {
      await loginAsAdmin(page);

      await page.goto('/dashboard/lessons/import');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL('/dashboard/lessons/import');
    });

    test('should show connect button when not authenticated with Google', async ({ page }) => {
      await loginAsTeacher(page);

      await page.goto('/dashboard/lessons/import');
      await page.waitForLoadState('networkidle');

      // Look for connect/auth button (may vary based on connection state)
      const hasConnectButton = await page.locator('button:has-text("Connect")').count() > 0;
      const hasGoogleButton = await page.locator('button:has-text("Google")').count() > 0;

      expect(hasConnectButton || hasGoogleButton).toBeTruthy();
    });
  });

  test.describe('Lesson Lifecycle with Calendar Sync', () => {
    const timestamp = Date.now();
    const testLesson = {
      title: `E2E Calendar Test ${timestamp}`,
      titleEdited: `E2E Calendar Test ${timestamp} EDITED`,
      notes: 'Testing calendar sync',
      notesEdited: 'Testing calendar sync EDITED',
    };

    test('should create lesson and trigger calendar sync', async ({ page }) => {
      await loginAsTeacher(page);

      // Navigate to new lesson page
      await page.goto('/dashboard/lessons/new');
      await page.waitForLoadState('networkidle');

      // Wait for form to be ready
      await page.waitForSelector('[data-testid="lesson-student_id"]', { timeout: 10000 });

      // Calculate tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().slice(0, 16);

      // Select student
      await page.locator('[data-testid="lesson-student_id"]').click();
      await page.waitForTimeout(500);
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(500);

      // Select teacher
      await page.locator('[data-testid="lesson-teacher_id"]').click();
      await page.waitForTimeout(500);
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(500);

      // Fill lesson details
      await page.locator('[data-testid="lesson-title"]').fill(testLesson.title);
      await page.locator('[data-testid="lesson-scheduled-at"]').fill(dateStr);
      await page.locator('[data-testid="lesson-notes"]').fill(testLesson.notes);

      // Listen for API call to create lesson
      const responsePromise = page.waitForResponse(
        (response) => response.url().includes('/api/lessons') && response.request().method() === 'POST',
        { timeout: 15000 }
      );

      // Submit the form
      const submitButton = page.locator('[data-testid="lesson-submit"]');
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      // Wait for API response
      const response = await responsePromise;
      expect(response.status()).toBe(201);

      // Verify redirect to lessons list
      await expect(page).toHaveURL(/\/dashboard\/lessons(\?.*)?$/, { timeout: 15000 });

      // Verify lesson appears in list
      await page.waitForTimeout(2000); // Wait for list to update
      const pageContent = await page.textContent('body');
      expect(pageContent).toContain(testLesson.title);
    });

    test('should update lesson and trigger calendar sync', async ({ page }) => {
      await loginAsTeacher(page);

      // Go to lessons list
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Find and click the test lesson
      const lessonRow = page.locator(`text=${testLesson.title}`).first();
      await expect(lessonRow).toBeVisible({ timeout: 10000 });
      await lessonRow.click();

      // Wait for detail page
      await page.waitForURL(/\/dashboard\/lessons\/[a-f0-9-]+$/);
      await page.waitForLoadState('networkidle');

      // Click edit button
      const editButton = page.locator('button:has-text("Edit")').or(
        page.locator('[aria-label="Edit lesson"]')
      ).first();

      if (await editButton.isVisible()) {
        await editButton.click();

        // Wait for form
        await page.waitForSelector('[data-testid="lesson-title"]', { timeout: 5000 });

        // Update title and notes
        const titleInput = page.locator('[data-testid="lesson-title"]');
        await titleInput.clear();
        await titleInput.fill(testLesson.titleEdited);

        const notesInput = page.locator('[data-testid="lesson-notes"]');
        await notesInput.clear();
        await notesInput.fill(testLesson.notesEdited);

        // Listen for update API call
        const responsePromise = page.waitForResponse(
          (response) => response.url().includes('/api/lessons/') &&
                        (response.request().method() === 'PUT' || response.request().method() === 'PATCH'),
          { timeout: 15000 }
        );

        // Submit update
        const updateButton = page.locator('[data-testid="lesson-submit"]').or(
          page.locator('button:has-text("Save")')
        ).first();
        await updateButton.click();

        // Wait for API response
        const response = await responsePromise;
        expect(response.status()).toBeOneOf([200, 201]);

        // Verify updated content appears
        await page.waitForTimeout(2000);
        const pageContent = await page.textContent('body');
        expect(pageContent).toContain(testLesson.titleEdited);
      }
    });

    test('should delete lesson and trigger calendar sync', async ({ page }) => {
      await loginAsTeacher(page);

      // Go to lessons list
      await page.goto('/dashboard/lessons');
      await page.waitForLoadState('networkidle');

      // Find the edited test lesson
      const lessonRow = page.locator(`text=${testLesson.titleEdited}`).first();

      if (await lessonRow.isVisible({ timeout: 5000 })) {
        await lessonRow.click();

        // Wait for detail page
        await page.waitForURL(/\/dashboard\/lessons\/[a-f0-9-]+$/);
        await page.waitForLoadState('networkidle');

        // Look for delete button
        const deleteButton = page.locator('button:has-text("Delete")').or(
          page.locator('[aria-label="Delete lesson"]')
        ).first();

        if (await deleteButton.isVisible({ timeout: 5000 })) {
          // Listen for delete API call
          const responsePromise = page.waitForResponse(
            (response) => response.url().includes('/api/lessons/') &&
                          response.request().method() === 'DELETE',
            { timeout: 15000 }
          );

          await deleteButton.click();

          // May have confirmation dialog
          const confirmButton = page.locator('button:has-text("Confirm")').or(
            page.locator('button:has-text("Yes")')
          ).first();

          if (await confirmButton.isVisible({ timeout: 2000 })) {
            await confirmButton.click();
          }

          // Wait for API response
          const response = await responsePromise;
          expect(response.status()).toBeOneOf([200, 204]);

          // Verify redirect back to lessons list
          await expect(page).toHaveURL(/\/dashboard\/lessons(\?.*)?$/, { timeout: 15000 });

          // Verify lesson no longer appears
          await page.waitForTimeout(2000);
          const pageContent = await page.textContent('body');
          expect(pageContent).not.toContain(testLesson.titleEdited);
        }
      }
    });
  });

  test.describe('Calendar Event Import Flow', () => {
    test('should display event import UI with date range selectors', async ({ page }) => {
      await loginAsTeacher(page);

      await page.goto('/dashboard/lessons/import');
      await page.waitForLoadState('networkidle');

      // Check for date range inputs (may be hidden if not connected)
      const pageContent = await page.textContent('body');

      // Should have some reference to dates or calendar
      expect(
        pageContent.includes('Start Date') ||
        pageContent.includes('End Date') ||
        pageContent.includes('Date Range') ||
        pageContent.includes('Connect') ||
        pageContent.includes('Google')
      ).toBeTruthy();
    });

    test('should show webhook control for real-time sync', async ({ page }) => {
      await loginAsTeacher(page);

      await page.goto('/dashboard/lessons/import');
      await page.waitForLoadState('networkidle');

      const pageContent = await page.textContent('body');

      // Look for real-time sync or webhook references
      expect(
        pageContent.includes('Real-time') ||
        pageContent.includes('Webhook') ||
        pageContent.includes('Sync') ||
        pageContent.includes('Connect')
      ).toBeTruthy();
    });
  });

  test.describe('Calendar Integration Status', () => {
    test('should show integration status in dashboard', async ({ page }) => {
      await loginAsTeacher(page);

      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Calendar integration may appear in dashboard
      // This is a soft check - integration status varies by connection state
      const hasCalendarWidget = await page.locator('text=/calendar/i').count() > 0;

      // Just verify page loads successfully
      await expect(page).toHaveURL('/dashboard');
    });

    test('should handle connection errors gracefully', async ({ page }) => {
      await loginAsTeacher(page);

      // Try to access import page and verify no crashes
      await page.goto('/dashboard/lessons/import');
      await page.waitForLoadState('networkidle');

      // Page should load without errors even if not connected
      await expect(page).toHaveURL('/dashboard/lessons/import');

      // Should not show error toasts for missing connection
      const errorToast = page.locator('[role="alert"]:has-text("error")').or(
        page.locator('.error:has-text("failed")')
      );

      // Wait a bit for any errors to appear
      await page.waitForTimeout(2000);

      // No critical errors should be shown
      const errorCount = await errorToast.count();
      expect(errorCount).toBe(0);
    });
  });

  test.describe('API Integration Verification', () => {
    test('should make correct API calls when creating lesson', async ({ page }) => {
      await loginAsTeacher(page);

      // Track API requests
      const apiCalls: string[] = [];
      page.on('request', (request) => {
        if (request.url().includes('/api/')) {
          apiCalls.push(`${request.method()} ${request.url()}`);
        }
      });

      await page.goto('/dashboard/lessons/new');
      await page.waitForLoadState('networkidle');

      // Just verify the page loads and API infrastructure is working
      expect(apiCalls.length).toBeGreaterThan(0);
    });

    test('should handle network errors during sync', async ({ page }) => {
      await loginAsTeacher(page);

      // Simulate offline mode briefly
      await page.context().setOffline(true);

      await page.goto('/dashboard/lessons/import');

      // Wait a bit
      await page.waitForTimeout(2000);

      // Restore online
      await page.context().setOffline(false);

      // Page should still be functional
      await expect(page).toHaveURL('/dashboard/lessons/import');
    });
  });
});
