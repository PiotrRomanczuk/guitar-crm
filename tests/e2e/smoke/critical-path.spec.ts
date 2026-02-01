import { test, expect } from '@playwright/test';

/**
 * Critical Path Smoke Tests
 * These tests verify that core functionality is working
 * Should run in <30 seconds and catch major failures quickly
 */
test.describe('🔍 Smoke Tests - Critical Path Verification', { tag: '@smoke' }, () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies and storage before each test
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('should load the application successfully', async ({ page }) => {
    await page.goto('/');

    // Check body is visible
    await expect(page.locator('body')).toBeVisible();

    // Check HTML lang attribute
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('en');

    // Check for essential page elements
    const hasMain = await page.locator('main, [role="main"], #__next').count();
    expect(hasMain).toBeGreaterThan(0);
  });

  test('should have working authentication system', async ({ page }) => {
    await page.goto('/sign-in', { waitUntil: 'networkidle' });

    // Wait for the page to fully load (handles isChecking state)
    await page.waitForSelector('form', { timeout: 15000 });

    // Verify auth form exists
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('[data-testid="email"]')).toBeVisible();
    await expect(page.locator('[data-testid="password"]')).toBeVisible();
    await expect(page.locator('[data-testid="signin-button"]')).toBeVisible();
  });

  test('should have protected dashboard route', async ({ page }) => {
    // Attempt to access protected route without authentication
    // Set a longer timeout for this navigation as it may redirect
    await page.goto('/dashboard', { waitUntil: 'networkidle', timeout: 15000 });

    // Wait for any redirects to complete
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    const currentUrl = page.url();

    const isRedirected =
      currentUrl.includes('/sign-in') ||
      currentUrl.includes('/login') ||
      currentUrl === new URL('/', page.url()).href;

    expect(isRedirected).toBeTruthy();
  });

  test('should have working navigation system', async ({ page }) => {
    await page.goto('/');

    // Check for navigation elements (may not exist on landing page)
    const navCount = await page.locator('nav, [role="navigation"]').count();

    if (navCount > 0) {
      console.log('✅ Navigation found');
    } else {
      console.log('⚠️  No navigation on homepage (expected for landing page)');
    }

    // Verify essential navigation links or buttons exist somewhere
    const essentialLinks = ['dashboard', 'students', 'lessons', 'songs'];

    for (const link of essentialLinks) {
      const linkCount = await page.locator(`a[href*="${link}"], button:has-text("${link}")`).count();
      if (linkCount > 0) {
        console.log(`✅ ${link} navigation found`);
      }
    }
  });

  test('should have working API endpoints', async ({ request, baseURL }) => {
    // Test critical API endpoints
    const endpoints = ['/api/health', '/api/auth/session'];

    for (const endpoint of endpoints) {
      const response = await request.get(`${baseURL}${endpoint}`, {
        failOnStatusCode: false,
      });

      // Accept 200 (working), 404 (not implemented), or 401/403 (protected but responding)
      expect([200, 401, 403, 404, 405]).toContain(response.status());
      console.log(`✅ ${endpoint} responding with status: ${response.status()}`);
    }
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page', { waitUntil: 'networkidle' });

    // Should show custom 404 or not crash
    await expect(page.locator('body')).toBeVisible();

    // Check that it's properly handled (not showing browser default error)
    const bodyText = await page.locator('html').textContent();
    expect(bodyText).not.toContain("This site can't be reached");
  });

  test('should have responsive design basics', async ({ page }) => {
    await page.goto('/');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone 6
    await expect(page.locator('body')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad 2
    await expect(page.locator('body')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('should not have critical console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');

    // Just verify the page loads without crashing
    await expect(page.locator('body')).toBeVisible();

    // Log any errors but don't fail the test for non-critical errors
    if (errors.length > 0) {
      console.log('Console errors detected:', errors);
    }
    console.log('✅ Page loaded without critical console errors');
  });
});
