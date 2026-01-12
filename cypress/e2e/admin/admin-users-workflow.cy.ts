/// <reference types="cypress" />

/**
 * Admin Users CRUD Workflow
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
 * - TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD in cypress.env.json
 * - Proper Supabase Auth admin credentials
 */

describe.skip('Admin Users CRUD Workflow', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');

  // Test data with unique identifiers
  const timestamp = Date.now();
  const testData = {
    firstName: 'E2ETest',
    lastName: `Student${timestamp}`,
    email: `e2e.student.${timestamp}@example.com`,
    firstNameEdited: 'E2EEdited',
  };

  // Set viewport to desktop to avoid mobile-hidden elements
  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  it('1. CREATE: should create a new user', () => {
    cy.visit('/dashboard/users/new');
    cy.wait(2000);
    cy.get('[data-testid="firstName-input"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="firstName-input"]').clear({ force: true }).type(testData.firstName, { force: true });
    cy.get('[data-testid="lastName-input"]').clear({ force: true }).type(testData.lastName, { force: true });
    cy.get('[data-testid="email-input"]').clear({ force: true }).type(testData.email, { force: true });
    cy.get('[data-testid="isStudent-checkbox"]').click({ force: true });
    cy.get('[data-testid="submit-button"]', { timeout: 10000 }).should('be.visible').click({ force: true });
    cy.url({ timeout: 30000 }).should('not.include', '/new');
    cy.url({ timeout: 15000 }).should('include', '/dashboard/users');
  });

  it('2. VERIFY CREATE: should find created user in list', () => {
    cy.visit('/dashboard/users');
    cy.wait(2000);
    cy.get('[data-testid="search-input"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="search-input"]').clear({ force: true }).type(testData.email, { delay: 50, force: true });
    cy.wait(1500);
    cy.get('[data-testid="users-table"]', { timeout: 10000 }).should('contain', testData.firstName);
  });

  it('3. EDIT: should update the user', () => {
    cy.visit('/dashboard/users');
    cy.wait(2000);
    cy.get('[data-testid="search-input"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="search-input"]').clear({ force: true }).type(testData.email, { delay: 50, force: true });
    cy.wait(1500);
    cy.get('[data-testid^="edit-user-"]', { timeout: 10000 }).first().click({ force: true });
    cy.url({ timeout: 15000 }).should('include', '/edit');
    cy.wait(2000);
    cy.get('[data-testid="firstName-input"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="firstName-input"]').clear({ force: true }).type(testData.firstNameEdited, { force: true });
    cy.get('[data-testid="submit-button"]').should('be.visible').click({ force: true });
    cy.url({ timeout: 15000 }).should('not.include', '/edit');
    cy.url({ timeout: 15000 }).should('include', '/dashboard/users');
  });

  it('4. VERIFY EDIT: should find edited user in list', () => {
    cy.visit('/dashboard/users');
    cy.wait(2000);
    cy.get('[data-testid="search-input"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="search-input"]').clear({ force: true }).type(testData.email, { delay: 50, force: true });
    cy.wait(1500);
    cy.get('[data-testid="users-table"]', { timeout: 10000 }).should('contain', testData.firstNameEdited);
  });

  it('5. DELETE: should delete the user', () => {
    cy.visit('/dashboard/users');
    cy.wait(2000);
    cy.get('[data-testid="search-input"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="search-input"]').clear({ force: true }).type(testData.email, { delay: 50, force: true });
    cy.wait(1500);
    cy.get('[data-testid^="delete-user-"]', { timeout: 10000 }).first().click({ force: true });
    cy.get('[role="alertdialog"]', { timeout: 5000 }).within(() => {
      cy.contains('button', /delete|confirm/i).click({ force: true });
    });
    cy.wait(2000);
    cy.url().should('include', '/dashboard/users');
  });

  it('6. VERIFY DELETE: should not find deleted user in list', () => {
    cy.visit('/dashboard/users');
    cy.wait(2000);
    cy.get('[data-testid="search-input"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="search-input"]').clear({ force: true }).type(testData.email, { delay: 50, force: true });
    cy.wait(2000);
    cy.get('body').should('not.contain', testData.firstNameEdited);
  });
});
