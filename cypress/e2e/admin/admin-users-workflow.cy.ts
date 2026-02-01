/// <reference types="cypress" />

/**
 * Admin Users CRUD Workflow
 *
 * Tests complete CRUD cycle for users:
 * 1. Create - Shadow user creation (no auth required)
 * 2. Verify - Check item appears in list
 * 3. Edit - Update the created item
 * 4. Verify - Check changes are saved
 * 5. Delete - Remove the item
 * 6. Verify - Check item is removed
 *
 * Note: Creating users with full auth requires Supabase Admin privileges.
 * This test creates "shadow" users (no login credentials) to test CRUD functionality.
 */

describe('Admin Users CRUD Workflow', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');

  // Test data with unique identifiers
  const timestamp = Date.now();
  const testData = {
    firstName: 'E2ETest',
    lastName: `User${timestamp}`,
    email: `e2e.user.${timestamp}@example.com`,
    firstNameEdited: 'E2EEdited',
    username: `e2euser${timestamp}`,
  };

  // Set viewport to desktop to avoid mobile-hidden elements
  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  it('1. CREATE: should create a new shadow user', () => {
    cy.visit('/dashboard/users/new');
    cy.wait(2000);

    // Wait for form to load
    cy.get('[data-testid="firstName-input"]', { timeout: 10000 }).should('be.visible');

    // Check the shadow user checkbox to bypass auth
    cy.get('[data-testid="isShadow-checkbox"]').click({ force: true });

    // Fill in user details
    cy.get('[data-testid="firstName-input"]')
      .clear({ force: true })
      .type(testData.firstName, { force: true });

    cy.get('[data-testid="lastName-input"]')
      .clear({ force: true })
      .type(testData.lastName, { force: true });

    cy.get('[data-testid="username-input"]')
      .clear({ force: true })
      .type(testData.username, { force: true });

    // Email is optional for shadow users but we can still add it
    cy.get('[data-testid="email-input"]')
      .clear({ force: true })
      .type(testData.email, { force: true });

    // Select student role
    cy.get('[data-testid="isStudent-checkbox"]').click({ force: true });

    // Submit form
    cy.get('[data-testid="submit-button"]', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // Should redirect to users list
    cy.url({ timeout: 30000 }).should('not.include', '/new');
    cy.url({ timeout: 15000 }).should('include', '/dashboard/users');
  });

  it('2. VERIFY CREATE: should find created user in list', () => {
    cy.visit('/dashboard/users');
    cy.wait(2000);

    // Search for the user
    cy.get('[data-testid="search-input"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="search-input"]')
      .clear({ force: true })
      .type(testData.username, { delay: 50, force: true });

    cy.wait(1500);

    // Verify user appears in table
    cy.get('[data-testid="users-table"]', { timeout: 10000 })
      .should('contain', testData.firstName);
  });

  it('3. EDIT: should update the user', () => {
    cy.visit('/dashboard/users');
    cy.wait(2000);

    // Search for the user
    cy.get('[data-testid="search-input"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="search-input"]')
      .clear({ force: true })
      .type(testData.username, { delay: 50, force: true });

    cy.wait(1500);

    // Click edit button
    cy.get('[data-testid^="edit-user-"]', { timeout: 10000 })
      .first()
      .click({ force: true });

    cy.url({ timeout: 15000 }).should('include', '/edit');
    cy.wait(2000);

    // Update first name
    cy.get('[data-testid="firstName-input"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="firstName-input"]')
      .clear({ force: true })
      .type(testData.firstNameEdited, { force: true });

    // Save changes
    cy.get('[data-testid="submit-button"]')
      .should('be.visible')
      .click({ force: true });

    // Should redirect back
    cy.url({ timeout: 15000 }).should('not.include', '/edit');
    cy.url({ timeout: 15000 }).should('include', '/dashboard/users');
  });

  it('4. VERIFY EDIT: should find edited user in list', () => {
    cy.visit('/dashboard/users');
    cy.wait(2000);

    // Search for the user
    cy.get('[data-testid="search-input"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="search-input"]')
      .clear({ force: true })
      .type(testData.username, { delay: 50, force: true });

    cy.wait(1500);

    // Verify edited name appears
    cy.get('[data-testid="users-table"]', { timeout: 10000 })
      .should('contain', testData.firstNameEdited);
  });

  it('5. DELETE: should delete the user', () => {
    cy.visit('/dashboard/users');
    cy.wait(2000);

    // Search for the user
    cy.get('[data-testid="search-input"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="search-input"]')
      .clear({ force: true })
      .type(testData.username, { delay: 50, force: true });

    cy.wait(1500);

    // Click delete button
    cy.get('[data-testid^="delete-user-"]', { timeout: 10000 })
      .first()
      .click({ force: true });

    // Confirm deletion in the AlertDialog
    cy.get('[role="alertdialog"]', { timeout: 5000 }).within(() => {
      cy.contains('button', /delete/i).click({ force: true });
    });

    cy.wait(2000);
    cy.url().should('include', '/dashboard/users');
  });

  it('6. VERIFY DELETE: should not find deleted user in list', () => {
    cy.visit('/dashboard/users');
    cy.wait(2000);

    // Search for the user
    cy.get('[data-testid="search-input"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="search-input"]')
      .clear({ force: true })
      .type(testData.username, { delay: 50, force: true });

    cy.wait(2000);

    // User should not be found - either no results or not in visible table
    cy.get('body').should('not.contain', testData.firstNameEdited);
  });

  describe('User Form Validation', () => {
    it('should show role checkboxes', () => {
      cy.visit('/dashboard/users/new');
      cy.wait(1000);

      // Verify all role checkboxes are visible
      cy.get('[data-testid="isAdmin-checkbox"]').should('exist');
      cy.get('[data-testid="isTeacher-checkbox"]').should('exist');
      cy.get('[data-testid="isStudent-checkbox"]').should('exist');
      cy.get('[data-testid="isShadow-checkbox"]').should('exist');
    });

    it('should allow multiple roles', () => {
      cy.visit('/dashboard/users/new');
      cy.wait(1000);

      // Check multiple roles
      cy.get('[data-testid="isTeacher-checkbox"]').click({ force: true });
      cy.get('[data-testid="isStudent-checkbox"]').click({ force: true });

      // Verify both are checked
      cy.get('[data-testid="isTeacher-checkbox"]')
        .should('have.attr', 'aria-checked', 'true');
      cy.get('[data-testid="isStudent-checkbox"]')
        .should('have.attr', 'aria-checked', 'true');
    });
  });

  describe('User Search and Filters', () => {
    it('should filter users by role', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Select student role filter
      cy.get('[data-testid="role-filter"]').click({ force: true });
      cy.get('[role="option"]').contains('Student').click({ force: true });

      cy.wait(1000);

      // Verify filter is applied
      cy.get('[data-testid="role-filter"]').should('contain', 'Student');
    });

    it('should filter users by status', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Select active status filter
      cy.get('[data-testid="status-filter"]').click({ force: true });
      cy.get('[role="option"]').contains('Active').click({ force: true });

      cy.wait(1000);

      // Verify filter is applied
      cy.get('[data-testid="status-filter"]').should('contain', 'Active');
    });

    it('should reset all filters', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Apply some filters
      cy.get('[data-testid="search-input"]').type('test');
      cy.get('[data-testid="role-filter"]').click({ force: true });
      cy.get('[role="option"]').contains('Student').click({ force: true });

      cy.wait(500);

      // Click reset
      cy.get('[data-testid="reset-filters"]').click({ force: true });

      cy.wait(500);

      // Verify filters are cleared
      cy.get('[data-testid="search-input"]').should('have.value', '');
    });
  });
});
