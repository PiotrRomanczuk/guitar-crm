/**
 * Password Reset Rate Limiting E2E Tests
 *
 * Tests the rate limiting behavior of password reset endpoint
 * to prevent brute force attacks and abuse
 *
 * Priority: P1 - Critical security feature
 * Linear Issue: BMS-29
 *
 * @tags @security @rate-limit @password-reset @e2e
 */
import { test, expect } from '../../fixtures';

test.describe(
  'Password Reset Rate Limiting',
  { tag: ['@security', '@rate-limit', '@password-reset', '@e2e'] },
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/forgot-password');
      await page.setViewportSize({ width: 1280, height: 720 });
    });

    test('should allow first password reset request', async ({ page }) => {
      const uniqueEmail = `rate-limit-test-${Date.now()}@example.com`;

      await page.locator('input[type="email"]').fill(uniqueEmail);
      await page.locator('button[type="submit"]').click();

      // Should show success message
      await expect(
        page.locator('text=/check your email|reset link sent|email sent/i')
      ).toBeVisible({ timeout: 10000 });
    });

    test('should allow up to 5 password reset attempts', async ({ page }) => {
      const uniqueEmail = `rate-limit-multi-${Date.now()}@example.com`;

      // Make 5 attempts
      for (let i = 0; i < 5; i++) {
        await page.goto('/forgot-password');
        await page.locator('input[type="email"]').clear();
        await page.locator('input[type="email"]').fill(uniqueEmail);
        await page.locator('button[type="submit"]').click();

        // Each should succeed
        await expect(
          page.locator('text=/check your email|reset link sent|email sent/i')
        ).toBeVisible({ timeout: 10000 });
      }
    });

    test('should block 6th password reset attempt and show rate limit error', async ({
      page,
    }) => {
      const uniqueEmail = `rate-limit-block-${Date.now()}@example.com`;

      // Make 5 successful attempts
      for (let i = 0; i < 5; i++) {
        await page.goto('/forgot-password');
        await page.locator('input[type="email"]').clear();
        await page.locator('input[type="email"]').fill(uniqueEmail);
        await page.locator('button[type="submit"]').click();

        await expect(
          page.locator('text=/check your email|reset link sent|email sent/i')
        ).toBeVisible({ timeout: 10000 });
      }

      // 6th attempt should be blocked
      await page.goto('/forgot-password');
      await page.locator('input[type="email"]').clear();
      await page.locator('input[type="email"]').fill(uniqueEmail);
      await page.locator('button[type="submit"]').click();

      // Should show rate limit error
      await expect(
        page.locator(
          'text=/too many.*attempts|rate limit|try again in.*minute/i'
        )
      ).toBeVisible({ timeout: 10000 });
    });

    test('should show time until next attempt is allowed', async ({ page }) => {
      const uniqueEmail = `rate-limit-time-${Date.now()}@example.com`;

      // Exhaust the limit
      for (let i = 0; i < 5; i++) {
        await page.goto('/forgot-password');
        await page.locator('input[type="email"]').clear();
        await page.locator('input[type="email"]').fill(uniqueEmail);
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(500);
      }

      // Try again and check for time message
      await page.goto('/forgot-password');
      await page.locator('input[type="email"]').clear();
      await page.locator('input[type="email"]').fill(uniqueEmail);
      await page.locator('button[type="submit"]').click();

      // Should mention minutes
      const errorText = await page
        .locator('text=/too many.*attempts|rate limit/i')
        .first()
        .textContent();

      expect(errorText?.toLowerCase()).toContain('minute');
    });

    test('should track rate limits per email address independently', async ({
      page,
    }) => {
      const email1 = `rate-limit-independent-1-${Date.now()}@example.com`;
      const email2 = `rate-limit-independent-2-${Date.now()}@example.com`;

      // Exhaust limit for email1
      for (let i = 0; i < 5; i++) {
        await page.goto('/forgot-password');
        await page.locator('input[type="email"]').clear();
        await page.locator('input[type="email"]').fill(email1);
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(300);
      }

      // email1 should be blocked
      await page.goto('/forgot-password');
      await page.locator('input[type="email"]').clear();
      await page.locator('input[type="email"]').fill(email1);
      await page.locator('button[type="submit"]').click();

      await expect(
        page.locator('text=/too many.*attempts|rate limit/i')
      ).toBeVisible({ timeout: 10000 });

      // email2 should still work
      await page.goto('/forgot-password');
      await page.locator('input[type="email"]').clear();
      await page.locator('input[type="email"]').fill(email2);
      await page.locator('button[type="submit"]').click();

      await expect(
        page.locator('text=/check your email|reset link sent|email sent/i')
      ).toBeVisible({ timeout: 10000 });
    });

    test('should disable submit button during request', async ({ page }) => {
      const uniqueEmail = `rate-limit-disabled-${Date.now()}@example.com`;

      await page.locator('input[type="email"]').fill(uniqueEmail);

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Button should be disabled immediately
      await expect(submitButton).toBeDisabled();
    });

    test('should show loading state when submitting', async ({ page }) => {
      const uniqueEmail = `rate-limit-loading-${Date.now()}@example.com`;

      await page.locator('input[type="email"]').fill(uniqueEmail);
      await page.locator('button[type="submit"]').click();

      // Should show loading text
      await expect(page.locator('text=/sending/i')).toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept and fail the request
      await page.route('**/auth/**', (route) => {
        route.abort('failed');
      });

      const uniqueEmail = `rate-limit-error-${Date.now()}@example.com`;

      await page.locator('input[type="email"]').fill(uniqueEmail);
      await page.locator('button[type="submit"]').click();

      // Should show some error (either network error or timeout)
      // The exact error message may vary, so we just check that the form is interactive again
      await expect(page.locator('button[type="submit"]')).toBeEnabled({
        timeout: 10000,
      });
    });

    test.describe('Security Considerations', () => {
      test('should not reveal if email exists in database', async ({ page }) => {
        // Try with a clearly non-existent email
        const fakeEmail = `nonexistent-${Date.now()}-definitely-not-real@example.com`;

        await page.locator('input[type="email"]').fill(fakeEmail);
        await page.locator('button[type="submit"]').click();

        // Should still show success message (security best practice)
        await expect(
          page.locator('text=/check your email|reset link sent|email sent/i')
        ).toBeVisible({ timeout: 10000 });

        // Should NOT show "email not found" or similar
        await expect(
          page.locator('text=/email.*not.*found|user.*not.*exist/i')
        ).not.toBeVisible();
      });

      test('should count attempts even for non-existent emails', async ({
        page,
      }) => {
        const fakeEmail = `fake-rate-limit-${Date.now()}@example.com`;

        // Make 5 attempts with fake email
        for (let i = 0; i < 5; i++) {
          await page.goto('/forgot-password');
          await page.locator('input[type="email"]').clear();
          await page.locator('input[type="email"]').fill(fakeEmail);
          await page.locator('button[type="submit"]').click();
          await page.waitForTimeout(300);
        }

        // 6th attempt should be rate limited
        await page.goto('/forgot-password');
        await page.locator('input[type="email"]').clear();
        await page.locator('input[type="email"]').fill(fakeEmail);
        await page.locator('button[type="submit"]').click();

        await expect(
          page.locator('text=/too many.*attempts|rate limit/i')
        ).toBeVisible({ timeout: 10000 });
      });
    });

    test.describe('User Experience', () => {
      test('should maintain form state when rate limited', async ({ page }) => {
        const uniqueEmail = `rate-limit-form-state-${Date.now()}@example.com`;

        // Exhaust the limit
        for (let i = 0; i < 5; i++) {
          await page.goto('/forgot-password');
          await page.locator('input[type="email"]').clear();
          await page.locator('input[type="email"]').fill(uniqueEmail);
          await page.locator('button[type="submit"]').click();
          await page.waitForTimeout(300);
        }

        // Try again
        await page.goto('/forgot-password');
        await page.locator('input[type="email"]').clear();
        await page.locator('input[type="email"]').fill(uniqueEmail);
        await page.locator('button[type="submit"]').click();

        // Email should still be in the input
        await expect(page.locator('input[type="email"]')).toHaveValue(
          uniqueEmail
        );

        // Error should be visible
        await expect(
          page.locator('text=/too many.*attempts/i')
        ).toBeVisible();
      });

      test('should be mobile responsive during rate limit error', async ({
        page,
      }) => {
        await page.setViewportSize({ width: 375, height: 812 });

        const uniqueEmail = `rate-limit-mobile-${Date.now()}@example.com`;

        // Exhaust the limit
        for (let i = 0; i < 5; i++) {
          await page.goto('/forgot-password');
          await page.locator('input[type="email"]').clear();
          await page.locator('input[type="email"]').fill(uniqueEmail);
          await page.locator('button[type="submit"]').click();
          await page.waitForTimeout(300);
        }

        // Try again
        await page.goto('/forgot-password');
        await page.locator('input[type="email"]').clear();
        await page.locator('input[type="email"]').fill(uniqueEmail);
        await page.locator('button[type="submit"]').click();

        // Error message should be visible on mobile
        await expect(
          page.locator('text=/too many.*attempts/i')
        ).toBeVisible();

        // Form should still be accessible
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
      });
    });
  }
);
