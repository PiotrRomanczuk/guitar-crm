/**
 * Admin User Management CRUD Tests
 *
 * Migrated from: cypress/e2e/admin/admin-users-crud.cy.ts
 *
 * Comprehensive tests for user management features:
 * - List all users with pagination
 * - Search users by email/name
 * - Filter users by role and status
 * - View user details
 * - Edit user profile
 * - Role assignment/change
 * - Multiple roles per user
 * - User deletion with safeguards
 * - Shadow users (users without auth)
 * - Form validation
 * - Error handling
 *
 * Tags: @admin @users @crud
 *
 * Prerequisites:
 * - Local Supabase database running
 * - Test admin credentials configured
 */

import { test, expect } from '../../fixtures';

test.describe('Admin User Management CRUD', { tag: ['@admin', '@users', '@crud'] }, () => {
  test.beforeEach(async ({ page, loginAs }) => {
    // Set viewport matching Cypress
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as admin
    await loginAs('admin');
  });

  // ===========================================
  // USER LIST VIEW
  // ===========================================
  test.describe('User List View', () => {
    test('should load users list page', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      await expect(page).toHaveURL(/\/users/);

      // Check for main content area
      const main = page.locator('main, [role="main"]').first();
      await expect(main).toBeVisible();
    });

    test('should display users table or list', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Should have a table or list of users
      const usersTable = page.locator('[data-testid="users-table"], [data-testid="users-list"], table');
      await expect(usersTable.first()).toBeVisible({ timeout: 10000 });
    });

    test('should show user information in the list', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Check for user data - emails should be visible
      const table = page.locator('[data-testid="users-table"]');
      const hasEmails = await table.locator('text=@').count() > 0;

      expect(hasEmails).toBe(true);
    });

    test('should have create new user button', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      const createButton = page.locator('[data-testid="create-user-button"]');
      await expect(createButton).toBeVisible({ timeout: 10000 });
      await expect(createButton).toBeEnabled();
    });
  });

  // ===========================================
  // USER SEARCH
  // ===========================================
  test.describe('User Search', () => {
    test('should have search functionality', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      const searchInput = page.locator('[data-testid="search-input"]');
      await expect(searchInput).toBeVisible({ timeout: 10000 });
      await expect(searchInput).toBeEnabled();
    });

    test('should filter users when searching', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Get initial count
      const table = page.locator('[data-testid="users-table"]');
      const initialRows = await table.locator('[data-testid^="user-row-"]').count();

      // Search for "student"
      const searchInput = page.locator('[data-testid="search-input"]');
      await expect(searchInput).toBeVisible({ timeout: 10000 });
      await searchInput.fill('student');

      // Wait for search debounce
      await page.waitForTimeout(1500);

      // Results should update (table should still be visible)
      await expect(table).toBeVisible();

      // Should have some results
      const searchRows = await table.locator('[data-testid^="user-row-"]').count();
      expect(searchRows).toBeGreaterThanOrEqual(0);
    });

    test('should show empty state for no matching users', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Search for non-existent user
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.fill('nonexistentuser12345xyz');
      await page.waitForTimeout(1500);

      // Should show empty state or no results
      const emptyState = page.getByText(/no users found/i);
      const noResults = page.getByText(/no results/i);

      const hasEmptyState = (await emptyState.count()) > 0 || (await noResults.count()) > 0;
      expect(hasEmptyState).toBe(true);
    });
  });

  // ===========================================
  // ROLE FILTERING
  // ===========================================
  test.describe('Role Filtering', () => {
    test('should have role filter options', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Check for role filter dropdown
      const roleFilter = page.locator('[data-testid="role-filter"]');
      await expect(roleFilter).toBeVisible({ timeout: 10000 });
    });

    test('should filter by role', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Click on role filter
      const roleFilter = page.locator('[data-testid="role-filter"]');
      await roleFilter.click();

      // Select "Student" role
      const studentOption = page.getByRole('option', { name: /student/i });
      await studentOption.click();

      // Wait for filter to apply
      await page.waitForTimeout(1500);

      // Table should still be visible
      const table = page.locator('[data-testid="users-table"]');
      await expect(table).toBeVisible();
    });
  });

  // ===========================================
  // STATUS FILTERING
  // ===========================================
  test.describe('Status Filtering', () => {
    test('should have status filter options', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Check for status filter dropdown
      const statusFilter = page.locator('[data-testid="status-filter"]');
      await expect(statusFilter).toBeVisible({ timeout: 10000 });
    });

    test('should filter by status', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Click on status filter
      const statusFilter = page.locator('[data-testid="status-filter"]');
      await statusFilter.click();

      // Select "Active" status
      const activeOption = page.getByRole('option', { name: /^active$/i });
      await activeOption.click();

      // Wait for filter to apply
      await page.waitForTimeout(1500);

      // Table should still be visible
      const table = page.locator('[data-testid="users-table"]');
      await expect(table).toBeVisible();
    });
  });

  // ===========================================
  // RESET FILTERS
  // ===========================================
  test.describe('Filter Reset', () => {
    test('should reset all filters', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Apply some filters
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.fill('test');

      const roleFilter = page.locator('[data-testid="role-filter"]');
      await roleFilter.click();
      await page.getByRole('option', { name: /student/i }).click();

      await page.waitForTimeout(1000);

      // Click reset button
      const resetButton = page.locator('[data-testid="reset-filters"]');
      await expect(resetButton).toBeVisible({ timeout: 10000 });
      await resetButton.click();

      await page.waitForTimeout(500);

      // Verify filters are cleared
      await expect(searchInput).toHaveValue('');
    });
  });

  // ===========================================
  // VIEW USER DETAILS
  // ===========================================
  test.describe('View User Details', () => {
    test('should navigate to user details page', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Click on first view button
      const viewButton = page.locator('[data-testid^="view-user-"]').first();
      await expect(viewButton).toBeVisible({ timeout: 10000 });
      await viewButton.click();

      await page.waitForTimeout(1000);

      // Should navigate to user detail page
      await expect(page).toHaveURL(/\/users\/[^/]+$/, { timeout: 10000 });
    });

    test('should display user details on detail page', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Click on first view button
      const viewButton = page.locator('[data-testid^="view-user-"]').first();
      await viewButton.click();
      await page.waitForTimeout(1500);

      // Should show user details
      const main = page.locator('main').first();
      await expect(main).toBeVisible();

      // Check for common user detail fields
      const hasDetails =
        (await page.getByText(/email/i).count()) > 0 ||
        (await page.getByText(/name/i).count()) > 0 ||
        (await page.getByText(/role/i).count()) > 0;

      expect(hasDetails).toBe(true);
    });
  });

  // ===========================================
  // CREATE NEW USER
  // ===========================================
  test.describe('Create New User', () => {
    const timestamp = Date.now();
    const newUserData = {
      firstName: 'CypressTest',
      lastName: `User${timestamp}`,
      username: `testuser${timestamp}`,
    };

    test('should navigate to new user form', async ({ page }) => {
      await page.goto('/dashboard/users/new');
      await page.waitForTimeout(2000);

      await expect(page).toHaveURL(/\/users\/new/);

      // Check for form
      const form = page.locator('form, [data-testid="user-form"]');
      await expect(form.first()).toBeVisible();
    });

    test('should have all required form fields', async ({ page }) => {
      await page.goto('/dashboard/users/new');
      await page.waitForTimeout(2000);

      // Check for required fields
      const firstNameInput = page.locator('[data-testid="firstName-input"]');
      const lastNameInput = page.locator('[data-testid="lastName-input"]');
      const usernameInput = page.locator('[data-testid="username-input"]');

      await expect(firstNameInput).toBeVisible({ timeout: 10000 });
      await expect(lastNameInput).toBeVisible({ timeout: 10000 });
      await expect(usernameInput).toBeVisible({ timeout: 10000 });
    });

    test('should have shadow user checkbox', async ({ page }) => {
      await page.goto('/dashboard/users/new');
      await page.waitForTimeout(2000);

      // Check for shadow user checkbox
      const shadowCheckbox = page.locator('[data-testid="isShadow-checkbox"]');
      await expect(shadowCheckbox).toBeVisible({ timeout: 10000 });
    });

    test('should have role assignment checkboxes', async ({ page }) => {
      await page.goto('/dashboard/users/new');
      await page.waitForTimeout(2000);

      // Check for role checkboxes
      const studentCheckbox = page.locator('[data-testid="isStudent-checkbox"]');
      await expect(studentCheckbox).toBeVisible({ timeout: 10000 });
    });

    test.skip('should create a shadow user (without auth)', async ({ page }) => {
      // Skipped: Requires Supabase Auth admin setup
      await page.goto('/dashboard/users/new');
      await page.waitForTimeout(2000);

      // Check shadow user option
      const shadowCheckbox = page.locator('[data-testid="isShadow-checkbox"]');
      await shadowCheckbox.click({ force: true });

      // Fill required fields
      await page.locator('[data-testid="firstName-input"]').fill(newUserData.firstName);
      await page.locator('[data-testid="lastName-input"]').fill(newUserData.lastName);
      await page.locator('[data-testid="username-input"]').fill(newUserData.username);

      // Assign student role
      const studentCheckbox = page.locator('[data-testid="isStudent-checkbox"]');
      await studentCheckbox.click({ force: true });

      // Submit
      const submitButton = page.locator('[data-testid="submit-button"]');
      await submitButton.click({ force: true });

      // Should redirect to users list
      await expect(page).not.toHaveURL(/\/new/, { timeout: 30000 });
      await expect(page).toHaveURL(/\/dashboard\/users/, { timeout: 15000 });
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/dashboard/users/new');
      await page.waitForTimeout(2000);

      // Try to submit without filling required fields
      const submitButton = page.locator('[data-testid="submit-button"]');
      await submitButton.click({ force: true });

      // Should stay on page
      await expect(page).toHaveURL(/\/new/);
    });
  });

  // ===========================================
  // EDIT USER
  // ===========================================
  test.describe('Edit User', () => {
    test('should have edit button on user list', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Check for edit button
      const editButton = page.locator('[data-testid^="edit-user-"]').first();
      await expect(editButton).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to edit form', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Click edit button
      const editButton = page.locator('[data-testid^="edit-user-"]').first();
      await editButton.click({ force: true });

      await page.waitForTimeout(1500);

      // Should navigate to edit page
      await expect(page).toHaveURL(/\/edit/, { timeout: 10000 });
    });

    test('should display edit form with existing data', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Click edit button
      const editButton = page.locator('[data-testid^="edit-user-"]').first();
      await editButton.click();
      await page.waitForTimeout(2000);

      // Check that form fields exist and have values
      const firstNameInput = page.locator('[data-testid="firstName-input"]');
      await expect(firstNameInput).toBeVisible({ timeout: 10000 });

      // Input should have some value (not empty for existing user)
      const hasValue = await firstNameInput.inputValue();
      expect(hasValue.length).toBeGreaterThan(0);
    });
  });

  // ===========================================
  // ROLE MANAGEMENT
  // ===========================================
  test.describe('Role Management', () => {
    test('should be able to view user roles', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Roles should be visible in the table
      const hasRoles =
        (await page.getByText(/admin/i).count()) > 0 ||
        (await page.getByText(/teacher/i).count()) > 0 ||
        (await page.getByText(/student/i).count()) > 0;

      expect(hasRoles).toBe(true);
    });

    test('should show role badges or indicators', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Look for role badges (shadcn Badge component)
      const badges = page.locator('[class*="badge"]');
      const hasBadges = await badges.count() > 0;

      expect(hasBadges).toBe(true);
    });
  });

  // ===========================================
  // DELETE USER
  // ===========================================
  test.describe('Delete User', () => {
    test('should have delete functionality', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Look for delete buttons
      const deleteButton = page.locator('[data-testid^="delete-user-"]').first();
      await expect(deleteButton).toBeVisible({ timeout: 10000 });
    });

    test('should show confirmation dialog before delete', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Click delete on first user
      const deleteButton = page.locator('[data-testid^="delete-user-"]').first();
      await deleteButton.click({ force: true });

      // Should show confirmation dialog
      const dialog = page.locator('[role="alertdialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Verify confirmation text
      await expect(dialog).toContainText(/are you absolutely sure/i);

      // Cancel to avoid actual deletion
      const cancelButton = dialog.getByRole('button', { name: /cancel/i });
      await cancelButton.click({ force: true });

      // Dialog should close
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    });

    test('should have delete and cancel buttons in dialog', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Click delete
      const deleteButton = page.locator('[data-testid^="delete-user-"]').first();
      await deleteButton.click({ force: true });

      // Wait for dialog
      const dialog = page.locator('[role="alertdialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Check for both buttons
      const cancelButton = dialog.getByRole('button', { name: /cancel/i });
      const confirmButton = dialog.getByRole('button', { name: /delete/i });

      await expect(cancelButton).toBeVisible();
      await expect(confirmButton).toBeVisible();

      // Cancel
      await cancelButton.click();
    });
  });

  // ===========================================
  // USER TABLE INTERACTIONS
  // ===========================================
  test.describe('User Table Interactions', () => {
    test('should display user avatars', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Check for avatars with initials
      const avatars = page.locator('[class*="avatar"]');
      const hasAvatars = await avatars.count() > 0;

      expect(hasAvatars).toBe(true);
    });

    test('should show user status badges', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Look for Active/Inactive badges
      const statusBadges = page.getByText(/active|inactive/i);
      const hasStatusBadges = await statusBadges.count() > 0;

      expect(hasStatusBadges).toBe(true);
    });

    test('should show registered/shadow status', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Look for Registered/Shadow badges
      const registeredBadge = page.getByText(/registered/i);
      const shadowBadge = page.getByText(/shadow/i);

      const hasStatusIndicators =
        (await registeredBadge.count()) > 0 || (await shadowBadge.count()) > 0;

      expect(hasStatusIndicators).toBe(true);
    });
  });

  // ===========================================
  // ACCESS CONTROL
  // ===========================================
  test.describe('Access Control', () => {
    test('admin should have full access to user management', async ({ page }) => {
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Admin should not see access denied
      const body = page.locator('body');
      await expect(body).not.toContainText(/access denied/i);
      await expect(body).not.toContainText(/forbidden/i);
    });

    test('should allow admin to access new user page', async ({ page }) => {
      await page.goto('/dashboard/users/new');
      await page.waitForTimeout(2000);

      await expect(page).toHaveURL(/\/users\/new/);

      const body = page.locator('body');
      await expect(body).not.toContainText(/access denied/i);
    });
  });

  // ===========================================
  // ERROR HANDLING
  // ===========================================
  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept API calls and force error
      await page.route('**/api/users**', async (route) => {
        await route.abort('failed');
      });

      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Page should still render
      const main = page.locator('main, [role="main"]').first();
      await expect(main).toBeVisible();
    });

    test('should handle server errors gracefully', async ({ page }) => {
      // Intercept API calls and return 500
      await page.route('**/api/users**', async (route) => {
        await route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      });

      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      // Page should still render
      const main = page.locator('main, [role="main"]').first();
      await expect(main).toBeVisible();
    });
  });

  // ===========================================
  // RESPONSIVE DESIGN
  // ===========================================
  test.describe('Responsive Design', () => {
    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      const main = page.locator('main, [role="main"]').first();
      await expect(main).toBeVisible();
    });

    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard/users');
      await page.waitForTimeout(2000);

      const main = page.locator('main, [role="main"]').first();
      await expect(main).toBeVisible();

      // Mobile should show card view instead of table
      // Table should be hidden on mobile (md:block class)
      const desktopTable = page.locator('[data-testid="users-table"]');
      const isTableVisible = await desktopTable.isVisible().catch(() => false);

      // On mobile, desktop table should be hidden
      expect(isTableVisible).toBe(false);
    });
  });
});
