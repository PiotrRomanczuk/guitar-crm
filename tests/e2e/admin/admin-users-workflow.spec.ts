/**
 * Admin Users CRUD Workflow
 *
 * Migrated from: cypress/e2e/admin/admin-users-workflow.cy.ts
 *
 * TODO: User creation tests are skipped because they require Supabase Auth admin
 * operations which need proper environment setup. The create user API uses
 * supabaseAdmin.auth.admin.createUser() which may fail in test environments.
 *
 * Tests complete CRUD cycle for users:
 * 1. Create - Fill form and submit
 * 2. Verify - Check item appears in list
 * 3. Edit - Update the created item
 * 4. Verify - Check changes are saved
 * 5. Delete - Remove the item
 * 6. Verify - Check item is removed
 *
 * Prerequisites:
 * - Local Supabase database running
 * - Test credentials configured
 * - Proper Supabase Auth admin credentials
 */
import { test, expect } from '../../fixtures';

// Test data with unique identifiers
const timestamp = Date.now();
const testData = {
  firstName: 'E2ETest',
  lastName: `Student${timestamp}`,
  email: `e2e.student.${timestamp}@example.com`,
  firstNameEdited: 'E2EEdited',
};

test.describe.skip('Admin Users CRUD Workflow', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    // Set viewport to desktop size to avoid mobile-hidden elements
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as admin
    await loginAs('admin');
  });

  test('1. CREATE: should create a new user', async ({ page }) => {
    await page.goto('/dashboard/users/new');
    await page.waitForTimeout(2000);

    // Wait for form to load
    await page.waitForSelector('[data-testid="firstName-input"]', {
      state: 'visible',
      timeout: 10000,
    });

    // Fill in user form
    await page.locator('[data-testid="firstName-input"]').clear();
    await page.locator('[data-testid="firstName-input"]').fill(testData.firstName);

    await page.locator('[data-testid="lastName-input"]').clear();
    await page.locator('[data-testid="lastName-input"]').fill(testData.lastName);

    await page.locator('[data-testid="email-input"]').clear();
    await page.locator('[data-testid="email-input"]').fill(testData.email);

    // Check the student checkbox
    await page.locator('[data-testid="isStudent-checkbox"]').click({ force: true });

    // Submit the form
    await page.waitForSelector('[data-testid="submit-button"]', { state: 'visible', timeout: 10000 });
    await page.locator('[data-testid="submit-button"]').click({ force: true });

    // Should redirect to users list
    await expect(page).not.toHaveURL(/\/new/, { timeout: 30000 });
    await expect(page).toHaveURL(/\/dashboard\/users/, { timeout: 15000 });
  });

  test('2. VERIFY CREATE: should find created user in list', async ({ page }) => {
    await page.goto('/dashboard/users');
    await page.waitForTimeout(2000);

    // Wait for search input to load
    await page.waitForSelector('[data-testid="search-input"]', {
      state: 'visible',
      timeout: 10000,
    });

    // Search for the created user
    await page.locator('[data-testid="search-input"]').clear();
    await page.locator('[data-testid="search-input"]').fill(testData.email);
    await page.waitForTimeout(1500);

    // Verify user appears in table
    await expect(page.locator('[data-testid="users-table"]')).toContainText(testData.firstName, {
      timeout: 10000,
    });
  });

  test('3. EDIT: should update the user', async ({ page }) => {
    await page.goto('/dashboard/users');
    await page.waitForTimeout(2000);

    // Search for the user
    await page.waitForSelector('[data-testid="search-input"]', {
      state: 'visible',
      timeout: 10000,
    });
    await page.locator('[data-testid="search-input"]').clear();
    await page.locator('[data-testid="search-input"]').fill(testData.email);
    await page.waitForTimeout(1500);

    // Click edit button
    await page.locator('[data-testid^="edit-user-"]').first().click({ force: true });
    await expect(page).toHaveURL(/\/edit/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Update the first name
    await page.waitForSelector('[data-testid="firstName-input"]', {
      state: 'visible',
      timeout: 10000,
    });
    await page.locator('[data-testid="firstName-input"]').clear();
    await page.locator('[data-testid="firstName-input"]').fill(testData.firstNameEdited);

    // Save changes
    await page.locator('[data-testid="submit-button"]').click({ force: true });

    // Should redirect back to users list
    await expect(page).not.toHaveURL(/\/edit/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard\/users/, { timeout: 15000 });
  });

  test('4. VERIFY EDIT: should find edited user in list', async ({ page }) => {
    await page.goto('/dashboard/users');
    await page.waitForTimeout(2000);

    // Search for the user
    await page.waitForSelector('[data-testid="search-input"]', {
      state: 'visible',
      timeout: 10000,
    });
    await page.locator('[data-testid="search-input"]').clear();
    await page.locator('[data-testid="search-input"]').fill(testData.email);
    await page.waitForTimeout(1500);

    // Verify edited name appears in table
    await expect(page.locator('[data-testid="users-table"]')).toContainText(testData.firstNameEdited, {
      timeout: 10000,
    });
  });

  test('5. DELETE: should delete the user', async ({ page }) => {
    await page.goto('/dashboard/users');
    await page.waitForTimeout(2000);

    // Search for the user
    await page.waitForSelector('[data-testid="search-input"]', {
      state: 'visible',
      timeout: 10000,
    });
    await page.locator('[data-testid="search-input"]').clear();
    await page.locator('[data-testid="search-input"]').fill(testData.email);
    await page.waitForTimeout(1500);

    // Click delete button
    await page.locator('[data-testid^="delete-user-"]').first().click({ force: true });

    // Confirm deletion in dialog
    const confirmDialog = page.locator('[role="alertdialog"]');
    await confirmDialog.waitFor({ state: 'visible', timeout: 5000 });
    await confirmDialog.locator('button', { hasText: /delete|confirm/i }).click({ force: true });

    await page.waitForTimeout(2000);

    // Should stay on users list
    await expect(page).toHaveURL(/\/dashboard\/users/);
  });

  test('6. VERIFY DELETE: should not find deleted user in list', async ({ page }) => {
    await page.goto('/dashboard/users');
    await page.waitForTimeout(2000);

    // Search for the deleted user
    await page.waitForSelector('[data-testid="search-input"]', {
      state: 'visible',
      timeout: 10000,
    });
    await page.locator('[data-testid="search-input"]').clear();
    await page.locator('[data-testid="search-input"]').fill(testData.email);
    await page.waitForTimeout(2000);

    // Verify deleted user is not found
    await expect(page.locator('body')).not.toContainText(testData.firstNameEdited);
  });
});
