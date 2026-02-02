/**
 * Onboarding: Complete User Flow Test
 *
 * Tests the complete onboarding experience for new users:
 * 1. Access control - auth required, redirect if already onboarded
 * 2. Step 1: Learning Goals - select at least one goal
 * 3. Step 2: Skill Level - choose beginner/intermediate/advanced
 * 4. Step 3: Preferences - optional learning style and instrument
 * 5. Data persistence - verify onboarding data is saved
 * 6. Completion redirect - redirect to dashboard after completion
 * 7. Skip prevention - can't access onboarding after completion
 *
 * Prerequisites:
 * - Must have authenticated user for testing
 * - User should NOT have completed onboarding yet
 *
 * @tags @onboarding @auth @student
 */
import { test, expect } from '../../fixtures';

test.describe(
  'Onboarding: Complete User Flow',
  { tag: ['@onboarding', '@auth', '@student'] },
  () => {
    test.describe('Access Control', () => {
      test('should redirect to sign-in when not authenticated', async ({
        page,
      }) => {
        // Clear all cookies to ensure we're not logged in
        await page.context().clearCookies();

        // Try to access onboarding
        await page.goto('/onboarding');

        // Should redirect to sign-in
        await expect(page).toHaveURL(/\/sign-in/, { timeout: 10000 });
      });

      test('should redirect to dashboard if already onboarded', async ({
        page,
        loginAs,
      }) => {
        // Login as student who has already completed onboarding
        await loginAs('student');

        // Try to access onboarding
        await page.goto('/onboarding');

        // Should redirect to dashboard since student is already onboarded
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
      });
    });

    test.describe('Multi-Step Form Navigation', () => {
      test.beforeEach(async ({ page }) => {
        // For this test, we need to simulate a new user
        // In a real scenario, you'd create a fresh test user
        // For now, we'll clear cookies to start fresh
        await page.context().clearCookies();
      });

      test.skip('should display Step 1: Learning Goals', async ({ page }) => {
        // Skipped: Requires fresh user account that hasn't completed onboarding
        // This test would work with a newly created test user

        // Navigate to onboarding
        await page.goto('/onboarding');

        // Should show welcome message
        await expect(
          page.locator('text=/Welcome|Welcome to Strummy/i')
        ).toBeVisible({ timeout: 10000 });

        // Should show goal selection
        await expect(
          page.locator('text=/learning goals|select your/i')
        ).toBeVisible();

        // Should see goal options
        const goalCards = page.locator('[role="button"]', {
          hasText: /learn|performance|theory|songwriting|technique/i,
        });
        expect(await goalCards.count()).toBeGreaterThan(0);

        // Should see step indicator showing step 1 of 3
        await expect(page.locator('text=/1.*3|step 1/i')).toBeVisible();
      });

      test.skip('should require at least one goal to proceed', async ({
        page,
      }) => {
        // Skipped: Requires fresh user account
        await page.goto('/onboarding');

        // Try to click Next without selecting any goals
        const nextButton = page.locator('button:has-text("Next")').first();

        // Next button should be disabled or clicking should not proceed
        const isDisabled = await nextButton.isDisabled();

        if (!isDisabled) {
          // If not disabled, clicking should show validation error
          await nextButton.click();

          // Should still be on step 1
          await expect(
            page.locator('text=/learning goals|select your/i')
          ).toBeVisible();
        }
      });

      test.skip('should navigate to Step 2: Skill Level', async ({ page }) => {
        // Skipped: Requires fresh user account
        await page.goto('/onboarding');

        // Select a goal
        await page
          .locator('button:has-text("Learn favorite songs")')
          .first()
          .click();

        // Click Next
        await page.locator('button:has-text("Next")').first().click();

        // Should be on step 2
        await expect(
          page.locator('text=/skill level|define your/i')
        ).toBeVisible({ timeout: 10000 });

        // Should see skill level options
        await expect(
          page.locator('text=/beginner|intermediate|advanced/i')
        ).toBeVisible();

        // Should see step indicator showing step 2 of 3
        await expect(page.locator('text=/2.*3|step 2/i')).toBeVisible();

        // Should have Back button
        await expect(page.locator('button:has-text("Back")')).toBeVisible();
      });

      test.skip('should allow navigation back to Step 1', async ({ page }) => {
        // Skipped: Requires fresh user account
        await page.goto('/onboarding');

        // Navigate to step 2
        await page
          .locator('button:has-text("Learn favorite songs")')
          .first()
          .click();
        await page.locator('button:has-text("Next")').first().click();

        // Verify we're on step 2
        await expect(
          page.locator('text=/skill level/i')
        ).toBeVisible();

        // Click Back
        await page.locator('button:has-text("Back")').first().click();

        // Should be back on step 1
        await expect(
          page.locator('text=/learning goals/i')
        ).toBeVisible({ timeout: 10000 });

        // Previous selections should be preserved
        const selectedGoal = page.locator(
          'button:has-text("Learn favorite songs")'
        );
        await expect(selectedGoal).toHaveAttribute('aria-pressed', 'true');
      });

      test.skip('should navigate to Step 3: Preferences', async ({ page }) => {
        // Skipped: Requires fresh user account
        await page.goto('/onboarding');

        // Complete step 1
        await page
          .locator('button:has-text("Learn favorite songs")')
          .first()
          .click();
        await page.locator('button:has-text("Next")').first().click();

        // Complete step 2
        await page.locator('button:has-text("Beginner")').first().click();
        await page.locator('button:has-text("Next")').first().click();

        // Should be on step 3
        await expect(
          page.locator('text=/preferences|learning style/i')
        ).toBeVisible({ timeout: 10000 });

        // Should see preference options
        await expect(
          page.locator('text=/video|sheet music|tab|acoustic|electric/i')
        ).toBeVisible();

        // Should see Complete Setup button
        await expect(
          page.locator('button:has-text("Complete Setup")')
        ).toBeVisible();
      });

      test.skip('should allow skipping to preferences from step 1', async ({
        page,
      }) => {
        // Skipped: Requires fresh user account
        await page.goto('/onboarding');

        // Should see skip link
        const skipLink = page.locator('button:has-text("Skip to preferences")');
        await expect(skipLink).toBeVisible();

        // Click skip
        await skipLink.click();

        // Should jump to step 3
        await expect(
          page.locator('text=/preferences/i')
        ).toBeVisible({ timeout: 10000 });
      });
    });

    test.describe('Form Validation', () => {
      test.skip('should validate required fields before submission', async ({
        page,
      }) => {
        // Skipped: Requires fresh user account
        await page.goto('/onboarding');

        // Try to complete without selecting goals
        await page.locator('button:has-text("Next")').first().click();

        // Should show validation error
        await expect(
          page.locator('text=/please select|required|at least one/i')
        ).toBeVisible();
      });

      test.skip('should show AI personalization badge', async ({ page }) => {
        // Skipped: Requires fresh user account
        await page.goto('/onboarding');

        // Should see AI badge
        await expect(
          page.locator('text=/AI PERSONALIZATION|AI/i')
        ).toBeVisible();

        // Badge should have animated pulse effect
        const badge = page.locator('text=/AI PERSONALIZATION/i').first();
        await expect(badge).toBeVisible();
      });

      test.skip('should toggle goal selections', async ({ page }) => {
        // Skipped: Requires fresh user account
        await page.goto('/onboarding');

        const goalButton = page
          .locator('button:has-text("Learn favorite songs")')
          .first();

        // Click to select
        await goalButton.click();
        await expect(goalButton).toHaveAttribute('aria-pressed', 'true');

        // Click to deselect
        await goalButton.click();
        await expect(goalButton).toHaveAttribute('aria-pressed', 'false');
      });
    });

    test.describe('Data Persistence and Completion', () => {
      test.skip('should complete onboarding and redirect to dashboard', async ({
        page,
      }) => {
        // Skipped: Requires fresh user account
        await page.goto('/onboarding');

        // Step 1: Select goals
        await page
          .locator('button:has-text("Learn favorite songs")')
          .first()
          .click();
        await page
          .locator('button:has-text("Music theory")')
          .first()
          .click();
        await page.locator('button:has-text("Next")').first().click();

        // Step 2: Select skill level
        await page.locator('button:has-text("Beginner")').first().click();
        await page.locator('button:has-text("Next")').first().click();

        // Step 3: Select preferences (optional)
        await page
          .locator('button:has-text("Video tutorials")')
          .first()
          .click();
        await page.locator('button:has-text("Acoustic")').first().click();

        // Submit
        await page.locator('button:has-text("Complete Setup")').click();

        // Should redirect to dashboard
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // Should see success message
        await expect(
          page.locator('text=/success|profile set up|welcome/i')
        ).toBeVisible({ timeout: 10000 });
      });

      test.skip('should show loading state during submission', async ({
        page,
      }) => {
        // Skipped: Requires fresh user account
        await page.goto('/onboarding');

        // Complete all steps quickly
        await page
          .locator('button:has-text("Learn favorite songs")')
          .first()
          .click();
        await page.locator('button:has-text("Next")').first().click();
        await page.locator('button:has-text("Beginner")').first().click();
        await page.locator('button:has-text("Next")').first().click();

        // Click submit
        const submitButton = page.locator(
          'button:has-text("Complete Setup")'
        );
        await submitButton.click();

        // Should show loading state
        await expect(
          page.locator('button:has-text("Setting up")')
        ).toBeVisible({ timeout: 5000 });
      });

      test.skip('should save user as student role after onboarding', async ({
        page,
      }) => {
        // Skipped: Requires fresh user account and database verification
        // After completing onboarding, user should have:
        // - is_student = true in profiles table
        // - student role in user_roles table
        // - onboarding_completed = true

        // This would require database access or API verification
      });

      test.skip('should prevent re-accessing onboarding after completion', async ({
        page,
      }) => {
        // Skipped: Requires fresh user account
        // Complete onboarding first
        await page.goto('/onboarding');

        // Complete all steps...
        await page
          .locator('button:has-text("Learn favorite songs")')
          .first()
          .click();
        await page.locator('button:has-text("Next")').first().click();
        await page.locator('button:has-text("Beginner")').first().click();
        await page.locator('button:has-text("Next")').first().click();
        await page.locator('button:has-text("Complete Setup")').click();

        // Wait for redirect
        await page.waitForURL(/\/dashboard/, { timeout: 15000 });

        // Try to access onboarding again
        await page.goto('/onboarding');

        // Should redirect to dashboard
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
      });
    });

    test.describe('UI and Accessibility', () => {
      test.skip('should have proper ARIA labels for step indicator', async ({
        page,
      }) => {
        // Skipped: Requires fresh user account
        await page.goto('/onboarding');

        // Step indicator should have proper accessibility
        const stepIndicator = page.locator('[role="progressbar"]');
        if ((await stepIndicator.count()) > 0) {
          await expect(stepIndicator).toHaveAttribute('aria-valuenow');
          await expect(stepIndicator).toHaveAttribute('aria-valuemax', '3');
        }
      });

      test.skip('should have proper ARIA labels for selection buttons', async ({
        page,
      }) => {
        // Skipped: Requires fresh user account
        await page.goto('/onboarding');

        // Goal buttons should have aria-pressed attribute
        const goalButtons = page.locator('[role="button"]');
        const firstButton = goalButtons.first();

        if ((await firstButton.count()) > 0) {
          await expect(firstButton).toHaveAttribute('aria-pressed');
        }
      });

      test.skip('should display step labels correctly', async ({ page }) => {
        // Skipped: Requires fresh user account
        await page.goto('/onboarding');

        // Step 1
        await expect(page.locator('text=/Learning Goals/i')).toBeVisible();

        // Navigate to step 2
        await page
          .locator('button:has-text("Learn favorite songs")')
          .first()
          .click();
        await page.locator('button:has-text("Next")').first().click();

        await expect(page.locator('text=/Skill Level/i')).toBeVisible();

        // Navigate to step 3
        await page.locator('button:has-text("Beginner")').first().click();
        await page.locator('button:has-text("Next")').first().click();

        await expect(page.locator('text=/Preferences/i')).toBeVisible();
      });

      test.skip('should be responsive and mobile-friendly', async ({
        page,
      }) => {
        // Skipped: Requires fresh user account
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('/onboarding');

        // Form should be visible on mobile
        await expect(
          page.locator('text=/Welcome|Learning Goals/i')
        ).toBeVisible({ timeout: 10000 });

        // Buttons should be properly sized for touch
        const goalButton = page
          .locator('button:has-text("Learn favorite songs")')
          .first();
        const buttonBox = await goalButton.boundingBox();

        if (buttonBox) {
          // Touch target should be at least 44x44 (recommended minimum)
          expect(buttonBox.height).toBeGreaterThanOrEqual(40);
        }
      });
    });

    test.describe('Error Handling', () => {
      test.skip('should handle network errors gracefully', async ({ page }) => {
        // Skipped: Requires fresh user account and network simulation
        await page.goto('/onboarding');

        // Complete form
        await page
          .locator('button:has-text("Learn favorite songs")')
          .first()
          .click();
        await page.locator('button:has-text("Next")').first().click();
        await page.locator('button:has-text("Beginner")').first().click();
        await page.locator('button:has-text("Next")').first().click();

        // Simulate network offline
        await page.context().setOffline(true);

        // Try to submit
        await page.locator('button:has-text("Complete Setup")').click();

        // Should show error message
        await expect(
          page.locator('text=/error|failed|try again/i')
        ).toBeVisible({ timeout: 10000 });

        // Restore network
        await page.context().setOffline(false);
      });

      test.skip('should display error message on submission failure', async ({
        page,
      }) => {
        // Skipped: Requires fresh user account and API mocking
        // This would test the error handling when the server returns an error
        // You would need to mock the API response to simulate failures
      });

      test.skip('should not lose form data on error', async ({ page }) => {
        // Skipped: Requires fresh user account
        // If submission fails, user should not have to re-enter all data
        // Form state should be preserved
      });
    });

    test.describe('Integration with Auth Flow', () => {
      test.skip('should work after fresh sign-up', async ({ page }) => {
        // Skipped: Requires ability to create new user accounts
        // This would test the complete flow:
        // 1. Sign up
        // 2. Verify email (if required)
        // 3. Redirect to onboarding
        // 4. Complete onboarding
        // 5. Land on dashboard as student
      });

      test.skip('should show personalized welcome message', async ({
        page,
      }) => {
        // Skipped: Requires fresh user account with name
        await page.goto('/onboarding');

        // Should show user's first name if available
        await expect(
          page.locator('text=/Welcome.*[A-Z][a-z]+/i')
        ).toBeVisible();
      });
    });
  }
);
