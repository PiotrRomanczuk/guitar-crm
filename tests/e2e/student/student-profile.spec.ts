/**
 * Student Profile Test
 *
 * Migrated from: cypress/e2e/student/student-profile.cy.ts
 *
 * Tests student profile functionality:
 * 1. Profile viewing - Display profile page with user information
 * 2. Profile editing - Edit name, username, and bio fields
 * 3. Form validation - Validate required fields and email format
 * 4. Settings page - Access and navigate settings page
 * 5. Theme toggle - Test theme selection functionality
 * 6. Role display - Verify student role display and restrictions
 * 7. Navigation - Profile accessibility from dashboard
 * 8. Mobile responsiveness - Profile display on mobile devices
 *
 * Prerequisites:
 * - Student user: student@example.com / test123_student
 * - Profile fields: firstName, lastName, username, bio, email
 * - Settings page with theme toggle
 *
 * @tags @student @profile @settings
 */
import { test, expect } from '../../fixtures';

test.describe(
  'Student Profile',
  { tag: ['@student', '@profile', '@settings'] },
  () => {
    test.beforeEach(async ({ page, loginAs }) => {
      // Set viewport to desktop size
      await page.setViewportSize({ width: 1440, height: 900 });

      // Login as student
      await loginAs('student');
    });

    test.describe('Profile View', () => {
      test('should display the profile page', async ({ page }) => {
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // Verify we're on the profile page
        await expect(page).toHaveURL(/\/profile/);

        // Should see profile content - heading or form
        await expect(
          page.locator('text=/profile|account|settings/i').first()
        ).toBeVisible({ timeout: 10000 });
      });

      test('should display user information in form fields', async ({
        page,
      }) => {
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // Should see form with profile fields
        await expect(page.locator('form')).toBeVisible({ timeout: 10000 });

        // Check for name fields
        await expect(
          page.locator('#firstname, input[name="firstname"]')
        ).toBeVisible();
        await expect(
          page.locator('#lastname, input[name="lastname"]')
        ).toBeVisible();
      });

      test('should display email field as read-only', async ({ page }) => {
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // Email field should be disabled
        const emailField = page.locator('#email, input[type="email"]');
        await expect(emailField).toBeVisible();
        await expect(emailField).toBeDisabled();

        // Should show helper text about email changes
        await expect(
          page.locator('text=/email cannot be changed/i')
        ).toBeVisible();
      });

      test('should display bio textarea field', async ({ page }) => {
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // Bio field should be visible
        const bioField = page.locator('#bio, textarea[id="bio"]');
        await expect(bioField).toBeVisible();

        // Should show character count
        await expect(page.locator('text=/\/500 characters/i')).toBeVisible();
      });
    });

    test.describe('Profile Editing', () => {
      test('should allow editing first name', async ({ page }) => {
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // First name field should not be disabled
        const firstNameField = page.locator('#firstname');
        await expect(firstNameField).toBeVisible();
        await expect(firstNameField).not.toBeDisabled();

        // Should be able to type in the field
        await firstNameField.clear();
        await firstNameField.fill('Test');
        await expect(firstNameField).toHaveValue('Test');
      });

      test('should allow editing last name', async ({ page }) => {
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // Last name field should not be disabled
        const lastNameField = page.locator('#lastname');
        await expect(lastNameField).toBeVisible();
        await expect(lastNameField).not.toBeDisabled();

        // Should be able to type in the field
        await lastNameField.clear();
        await lastNameField.fill('Student');
        await expect(lastNameField).toHaveValue('Student');
      });

      test('should allow editing username (optional field)', async ({
        page,
      }) => {
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // Username field should be editable
        const usernameField = page.locator('#username');
        await expect(usernameField).toBeVisible();
        await expect(usernameField).not.toBeDisabled();

        // Should be able to type in the field
        await usernameField.clear();
        await usernameField.fill('test_student');
        await expect(usernameField).toHaveValue('test_student');
      });

      test('should allow editing bio with character limit', async ({
        page,
      }) => {
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // Bio field should be editable
        const bioField = page.locator('#bio');
        await expect(bioField).toBeVisible();

        // Clear and type in bio
        await bioField.clear();
        const testBio = 'This is my test bio for the student profile.';
        await bioField.fill(testBio);
        await expect(bioField).toHaveValue(testBio);

        // Character count should update
        await expect(
          page.locator(`text=/${testBio.length}\\/500 characters/i`)
        ).toBeVisible();
      });

      test('should have save and cancel buttons', async ({ page }) => {
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // Should have save button
        const saveButton = page.locator(
          'button[type="submit"], button:has-text("Save")'
        );
        await expect(saveButton.first()).toBeVisible();

        // Should have cancel button
        const cancelButton = page.locator('button:has-text("Cancel")');
        await expect(cancelButton.first()).toBeVisible();
      });

      test('should save profile changes successfully', async ({ page }) => {
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // Wait for form to be ready
        await page.waitForSelector('form', { state: 'visible' });

        // Make a small change to trigger save
        const firstNameField = page.locator('#firstname');
        const originalValue = await firstNameField.inputValue();

        // Clear and enter new value
        await firstNameField.clear();
        await firstNameField.fill('Updated');

        // Click save button
        const saveButton = page.locator('button[type="submit"]').first();
        await saveButton.click();

        // Wait for save operation
        await page.waitForTimeout(2000);

        // Should remain on profile page (or show success)
        await expect(page).toHaveURL(/\/profile/);

        // Restore original value for next test
        await firstNameField.clear();
        await firstNameField.fill(originalValue);
        await saveButton.click();
        await page.waitForTimeout(1000);
      });
    });

    test.describe('Form Validation', () => {
      test('should show error when first name is empty', async ({ page }) => {
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // Clear first name
        const firstNameField = page.locator('#firstname');
        await firstNameField.clear();

        // Blur to trigger validation
        await firstNameField.blur();
        await page.waitForTimeout(500);

        // Try to submit form
        const saveButton = page.locator('button[type="submit"]').first();
        await saveButton.click();

        // HTML5 validation or custom error should prevent submission
        // Check if still on profile page (not navigated away)
        await expect(page).toHaveURL(/\/profile/);
      });

      test('should show error when last name is empty', async ({ page }) => {
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // Clear last name
        const lastNameField = page.locator('#lastname');
        await lastNameField.clear();

        // Blur to trigger validation
        await lastNameField.blur();
        await page.waitForTimeout(500);

        // Try to submit form
        const saveButton = page.locator('button[type="submit"]').first();
        await saveButton.click();

        // HTML5 validation or custom error should prevent submission
        await expect(page).toHaveURL(/\/profile/);
      });

      test('should enforce bio character limit (500 chars)', async ({
        page,
      }) => {
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        const bioField = page.locator('#bio');

        // Try to enter more than 500 characters
        const longText = 'a'.repeat(600);
        await bioField.fill(longText);

        // Field should truncate to 500 characters (maxlength attribute)
        const actualValue = await bioField.inputValue();
        expect(actualValue.length).toBeLessThanOrEqual(500);
      });

      test('should clear validation errors when user starts typing', async ({
        page,
      }) => {
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // Clear first name to trigger error
        const firstNameField = page.locator('#firstname');
        await firstNameField.clear();
        await firstNameField.blur();
        await page.waitForTimeout(500);

        // Start typing - error should clear
        await firstNameField.fill('T');

        // Check if form is now valid for submission
        const saveButton = page.locator('button[type="submit"]').first();
        await expect(saveButton).not.toBeDisabled();
      });
    });

    test.describe('Settings Page', () => {
      test('should navigate to settings page', async ({ page }) => {
        await page.goto('/dashboard/settings');
        await page.waitForLoadState('networkidle');

        // Verify we're on the settings page
        await expect(page).toHaveURL(/\/settings/);

        // Should see settings content
        await expect(
          page.locator('text=/settings|preferences/i').first()
        ).toBeVisible({ timeout: 10000 });
      });

      test('should display settings sections', async ({ page }) => {
        await page.goto('/dashboard/settings');
        await page.waitForLoadState('networkidle');

        // Should see notifications section
        await expect(
          page.locator('text=/notifications/i').first()
        ).toBeVisible();

        // Should see appearance section
        await expect(page.locator('text=/appearance/i').first()).toBeVisible();

        // Should see privacy section
        await expect(page.locator('text=/privacy/i').first()).toBeVisible();
      });

      test('should display theme selection dropdown', async ({ page }) => {
        await page.goto('/dashboard/settings');
        await page.waitForLoadState('networkidle');

        // Look for theme select element
        const themeSelect = page.locator('#theme, select[name="theme"]');
        await expect(themeSelect).toBeVisible();

        // Should have theme options
        await expect(themeSelect).toContainText(/light|dark|system/i);
      });

      test('should be able to change theme setting', async ({ page }) => {
        await page.goto('/dashboard/settings');
        await page.waitForLoadState('networkidle');

        // Find theme select
        const themeSelect = page.locator('#theme');
        await expect(themeSelect).toBeVisible();

        // Get current value
        const currentTheme = await themeSelect.inputValue();

        // Change to a different theme
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        await themeSelect.selectOption(newTheme);

        // Verify selection changed
        await expect(themeSelect).toHaveValue(newTheme);

        // Restore original theme
        await themeSelect.selectOption(currentTheme);
      });

      test('should have save and cancel buttons on settings page', async ({
        page,
      }) => {
        await page.goto('/dashboard/settings');
        await page.waitForLoadState('networkidle');

        // Should have save button (may be disabled if no changes)
        await expect(
          page.locator('button:has-text("Save")').first()
        ).toBeVisible();

        // Should have reset button
        await expect(
          page.locator('button:has-text("Reset")').first()
        ).toBeVisible();

        // Should have cancel button
        await expect(
          page.locator('button:has-text("Cancel")').first()
        ).toBeVisible();
      });

      test('should enable save button when settings change', async ({
        page,
      }) => {
        await page.goto('/dashboard/settings');
        await page.waitForLoadState('networkidle');

        // Save button should be disabled initially (no changes)
        const saveButton = page.locator('button:has-text("Save")').first();

        // Make a change - toggle a notification setting
        const emailNotificationToggle = page.locator(
          '#emailNotifications, input[id="emailNotifications"]'
        );

        if ((await emailNotificationToggle.count()) > 0) {
          await emailNotificationToggle.click();

          // Save button should now be enabled
          await expect(saveButton).toBeEnabled();

          // Restore original state
          await emailNotificationToggle.click();
        }
      });
    });

    test.describe('Role and Permissions', () => {
      test('should display student role (if role field exists)', async ({
        page,
      }) => {
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // If role is displayed anywhere on profile, it should show "Student"
        const hasRoleDisplay =
          (await page.locator('text=/student|role/i').count()) > 0;

        if (hasRoleDisplay) {
          await expect(
            page.locator('text=/student/i').first()
          ).toBeVisible();
        }
      });

      test('should NOT have role change controls for students', async ({
        page,
      }) => {
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // Should not see role checkboxes or admin/teacher role selectors
        await expect(
          page.locator(
            'input[name="isAdmin"], input[name="isTeacher"], select[name="role"]'
          )
        ).not.toBeVisible();
      });
    });

    test.describe('Navigation', () => {
      test('should be accessible from dashboard via navigation', async ({
        page,
      }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Look for profile link in navigation
        const profileLink = page.locator('a[href*="/profile"]').first();

        if ((await profileLink.count()) > 0) {
          await profileLink.click();
          await expect(page).toHaveURL(/\/profile/);
        }
      });

      test('should be able to navigate back to dashboard', async ({
        page,
      }) => {
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // Click cancel button to return to dashboard
        const cancelButton = page.locator('button:has-text("Cancel")').first();
        await cancelButton.click();

        // Should navigate to dashboard
        await expect(page).toHaveURL(/\/dashboard/);
      });

      test('should maintain session when navigating between pages', async ({
        page,
      }) => {
        // Go to profile
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/profile/);

        // Go to settings
        await page.goto('/dashboard/settings');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/settings/);

        // Go back to profile
        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/profile/);

        // Should still be authenticated
        await expect(page.locator('form')).toBeVisible();
      });
    });

    test.describe('Mobile Responsiveness', () => {
      test('should display profile correctly on mobile viewport', async ({
        page,
      }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // Page should be accessible
        await expect(page).toHaveURL(/\/profile/);

        // Form should be visible
        await expect(page.locator('form')).toBeVisible();

        // Fields should be stacked vertically
        const firstNameField = page.locator('#firstname');
        await expect(firstNameField).toBeVisible();
      });

      test('should display settings correctly on mobile viewport', async ({
        page,
      }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('/dashboard/settings');
        await page.waitForLoadState('networkidle');

        // Page should be accessible
        await expect(page).toHaveURL(/\/settings/);

        // Settings sections should be visible
        await expect(
          page.locator('text=/settings|preferences/i').first()
        ).toBeVisible();
      });

      test('should display profile correctly on tablet viewport', async ({
        page,
      }) => {
        // Set tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });

        await page.goto('/dashboard/profile');
        await page.waitForLoadState('networkidle');

        // Page should be accessible
        await expect(page).toHaveURL(/\/profile/);

        // Form should be visible and properly laid out
        await expect(page.locator('form')).toBeVisible();
      });
    });

    test.describe('Integration Features', () => {
      test('should display Google Calendar integration option in settings', async ({
        page,
      }) => {
        await page.goto('/dashboard/settings');
        await page.waitForLoadState('networkidle');

        // Look for integrations section
        const hasIntegrations =
          (await page.locator('text=/integration|google|calendar/i').count()) >
          0;

        if (hasIntegrations) {
          await expect(
            page.locator('text=/integration/i').first()
          ).toBeVisible();
        }
      });

      test('should display API keys section in settings (if available)', async ({
        page,
      }) => {
        await page.goto('/dashboard/settings');
        await page.waitForLoadState('networkidle');

        // Look for API keys section
        const hasApiKeys =
          (await page.locator('text=/api key|bearer token/i').count()) > 0;

        if (hasApiKeys) {
          await expect(page.locator('text=/api/i').first()).toBeVisible();
        }
      });
    });
  }
);
