/**
 * Authentication E2E Tests
 *
 * Migrated from: cypress/e2e/auth-test.cy.ts
 * Tests login/logout functionality and session management
 *
 * CRITICAL: All other tests depend on authentication working correctly
 */
import { test, expect } from '../fixtures';

test.describe('Authentication Flow', () => {
  test('should successfully sign in with admin credentials', async ({ page, loginAs }) => {
    // Perform login using the auth fixture
    await loginAs('admin');

    // Verify we're on the dashboard (not on sign-in page)
    await expect(page).not.toHaveURL(/sign-in/);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto('/sign-in');

    // Wait for form to be visible
    await page.waitForSelector('[data-testid="email"]', { state: 'visible' });
    await page.waitForSelector('[data-testid="password"]', { state: 'visible' });

    // Fill in invalid credentials
    await page.fill('[data-testid="email"]', 'p.romanczuk@gmail.com');
    await page.fill('[data-testid="password"]', 'wrong_password');

    // Submit form
    await page.click('[data-testid="signin-button"]');

    // Verify we're still on sign-in page
    await expect(page).toHaveURL(/sign-in/);

    // Verify error message is displayed
    // The error text should match what's in SignInForm.tsx
    await expect(page.locator('text=/error|invalid|failed/i')).toBeVisible();
  });

  test('should maintain session after page reload', async ({ page, loginAs }) => {
    // Login as admin
    await loginAs('admin');

    // Ensure we're on the dashboard (loginAs might already navigate there)
    await expect(page).toHaveURL(/dashboard/);

    // Reload the page
    await page.reload();

    // Verify we're still logged in (not redirected to sign-in)
    await expect(page).not.toHaveURL(/sign-in/);
    await expect(page).toHaveURL(/dashboard/);
  });
});
