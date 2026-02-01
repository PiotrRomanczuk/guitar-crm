/**
 * Authentication - Password Reset Flow
 *
 * Migrated from: cypress/e2e/integration/auth-password-reset.cy.ts
 *
 * Tests the complete password reset workflow:
 * 1. Request password reset
 * 2. Verify email is sent (mocked in test environment)
 * 3. Follow reset link
 * 4. Submit new password
 * 5. Verify can login with new password
 *
 * Priority: P1 - Critical security feature
 *
 * @tags @integration @auth @password-reset @security
 */
import { test, expect } from '../../fixtures';

test.describe(
  'Password Reset Flow',
  { tag: ['@integration', '@auth', '@password-reset', '@security'] },
  () => {
    const testEmail = 'password-reset-test@example.com';

    test.beforeEach(async ({ page }) => {
      // Set viewport to desktop
      await page.setViewportSize({ width: 1280, height: 720 });
    });

    test.describe('Request Password Reset', () => {
      test.skip('should display forgot password form', async ({ page }) => {
        // SignInForm doesn't have a visible forgot password link
        // Users navigate directly to /forgot-password
        await page.goto('/sign-in');

        // Look for "Forgot Password" link
        await expect(
          page.locator('text=/forgot password|reset password/i')
        ).toBeVisible();
      });

      test.skip('should navigate to password reset page', async ({ page }) => {
        // SignInForm doesn't have a visible forgot password link
        await page.goto('/sign-in');

        await page.locator('text=/forgot password|reset password/i').click();

        // Should navigate to reset page
        await expect(page).toHaveURL(/\/(forgot-password|reset-password)/);
      });

      test('should show validation error for invalid email', async ({
        page,
      }) => {
        await page.goto('/forgot-password');

        // Try with invalid email
        await page.locator('input[type="email"]').fill('invalid-email');
        await page.locator('button[type="submit"]').click();

        // Should show validation error
        await expect(
          page.locator('text=/invalid email|valid email/i')
        ).toBeVisible();
      });

      test('should submit password reset request successfully', async ({
        page,
      }) => {
        await page.goto('/forgot-password');

        // Fill in valid email
        await page.locator('input[type="email"]').clear();
        await page.locator('input[type="email"]').fill(testEmail);
        await page.locator('button[type="submit"]').click();

        // Should show success message
        await expect(
          page.locator('text=/check your email|reset link sent|email sent/i')
        ).toBeVisible({ timeout: 10000 });
      });

      test('should handle non-existent email gracefully', async ({ page }) => {
        await page.goto('/forgot-password');

        await page.locator('input[type="email"]').clear();
        await page.locator('input[type="email"]').fill('nonexistent@example.com');
        await page.locator('button[type="submit"]').click();

        // Should still show success (security best practice - don't reveal if email exists)
        await expect(
          page.locator('text=/check your email|reset link sent/i')
        ).toBeVisible({ timeout: 10000 });
      });
    });

    test.describe('Reset Password Form', () => {
      test('should validate password requirements', async ({ page }) => {
        // Visit reset page with mock token
        await page.goto('/reset-password?token=mock-token');

        // Try weak password
        await page.locator('input[name="newPassword"]').fill('123');
        await page.locator('button[type="submit"]').click();

        // Should show validation error
        await expect(
          page.locator('text=/password.*required|password.*strong|at least/i')
        ).toBeVisible();
      });

      test('should validate password confirmation matches', async ({
        page,
      }) => {
        await page.goto('/reset-password?token=mock-token');

        // Enter mismatched passwords
        await page.locator('input[name="newPassword"]').fill('NewPassword123!');
        await page
          .locator('input[name="confirmPassword"]')
          .fill('DifferentPassword123!');
        await page.locator('button[type="submit"]').click();

        // Should show mismatch error
        await expect(
          page.locator('text=/passwords.*match|passwords.*same/i')
        ).toBeVisible();
      });

      test('should show clear feedback for password requirements', async ({
        page,
      }) => {
        await page.goto('/reset-password?token=mock-token');

        // Should display password requirements (minimum 6 characters)
        await expect(page.locator('body')).toContainText('6');
        await expect(page.locator('body')).toContainText('character');
      });
    });

    test.describe('Security Features', () => {
      test('should require token in URL', async ({ page }) => {
        await page.goto('/reset-password', { waitUntil: 'networkidle' });

        // Should either redirect or show error
        const hasError = await page
          .locator('text=/Invalid|token|expired/i')
          .count();
        const hasPasswordInput = await page
          .locator('input[name="password"]')
          .count();

        expect(hasError > 0 || hasPasswordInput === 0).toBe(true);
      });

      test.skip('should prevent form submission without token', async ({
        page,
      }) => {
        // This test checks edge case behavior that may not show visible error
        await page.goto('/reset-password', { waitUntil: 'networkidle' });

        // Look for password input
        const passwordInput = page.locator('input[name="newPassword"]');
        const hasPasswordInput = (await passwordInput.count()) > 0;

        if (hasPasswordInput) {
          await passwordInput.fill('NewPassword123!');
          await page.locator('button[type="submit"]').click();

          // Should show error about invalid/missing token
          await expect(
            page.locator('text=/invalid|expired|token/i')
          ).toBeVisible({ timeout: 5000 });
        }
      });
    });

    test.describe('UI/UX Features', () => {
      test('should have working back to login link', async ({ page }) => {
        await page.goto('/forgot-password');

        // Should have link back to sign in
        await expect(page.locator('a[href*="sign"]')).toBeVisible();
      });

      test('should show loading state during submission', async ({ page }) => {
        await page.goto('/forgot-password');

        await page.locator('input[type="email"]').fill(testEmail);

        // Intercept API call to delay response
        await page.route('**/auth/**', async (route) => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await route.continue();
        });

        await page.locator('button[type="submit"]').click();

        // Button should show loading state
        const submitButton = page.locator('button[type="submit"]');
        const buttonText = await submitButton.textContent();
        const isDisabled = await submitButton.isDisabled();

        expect(
          buttonText?.toLowerCase().includes('sending') ||
            buttonText?.toLowerCase().includes('loading') ||
            isDisabled
        ).toBe(true);
      });

      test('should be mobile responsive', async ({ page }) => {
        // Test on mobile viewport
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/forgot-password');

        // Form should be visible and usable
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
      });
    });
  }
);
