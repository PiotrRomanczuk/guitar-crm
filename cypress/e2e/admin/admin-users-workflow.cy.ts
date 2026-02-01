/// <reference types="cypress" />

/**
 * Admin Users CRUD Workflow
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
 */

describe('Admin Users CRUD Workflow', () => {
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

    // Fill in user form
    cy.get('[data-testid="firstName-input"]').clear().type(testData.firstName);
    cy.get('[data-testid="lastName-input"]').clear().type(testData.lastName);
    cy.get('[data-testid="email-input"]').clear().type(testData.email);

    // Set as student
    cy.get('[data-testid="isStudent-checkbox"]').click({ force: true });

    // Submit the form
    cy.get('button[type="submit"]').click({ force: true });

    // Should redirect to user list or detail
    cy.url({ timeout: 15000 }).should('not.include', '/new');
  });

  it('2. VERIFY CREATE: should find created user in list', () => {
    cy.visit('/dashboard/users');
    cy.get('table', { timeout: 10000 }).should('exist');

    // Search for the user using the search input
    cy.get('input[placeholder*="Search"]', { timeout: 5000 }).clear().type(testData.email);
    cy.wait(1000);

    // Verify user appears in the list
    cy.contains(testData.firstName, { timeout: 10000 }).should('exist');
  });

  it('3. EDIT: should update the user', () => {
    cy.visit('/dashboard/users');

    // Wait for table to load
    cy.get('table', { timeout: 10000 }).should('exist');

    // Search for the user
    cy.get('input[placeholder*="Search"]').clear().type(testData.email);
    cy.wait(2000);

    // Find the user and click the edit button directly from the list
    // The edit button has data-testid like "edit-user-{id}"
    cy.get('[data-testid^="edit-user-"]', { timeout: 10000 })
      .filter(':visible')
      .first()
      .click({ force: true });

    // Should be on edit page
    cy.location('pathname', { timeout: 10000 }).should('include', '/edit');
    cy.wait(500);

    // Update the first name
    cy.get('[data-testid="firstName-input"]').clear().type(testData.firstNameEdited);

    // Save
    cy.get('button[type="submit"]').click({ force: true });

    // Wait for navigation back to list or detail
    cy.url({ timeout: 15000 }).should('not.include', '/edit');
  });

  it('4. VERIFY EDIT: should find edited user in list', () => {
    cy.visit('/dashboard/users');
    
    // Wait for table to load
    cy.get('table', { timeout: 10000 }).should('exist');

    // Search for the user by email
    cy.get('input[placeholder*="Search"]').clear().type(testData.email);
    cy.wait(2000);

    // Verify edited first name appears in list
    cy.contains(testData.firstNameEdited, { timeout: 15000 }).should('exist');
  });

  it('5. DELETE: should delete the user', () => {
    cy.visit('/dashboard/users');

    // Wait for table to load
    cy.get('table', { timeout: 10000 }).should('exist');

    // Search for the user by email
    cy.get('input[placeholder*="Search"]').clear().type(testData.email);
    cy.wait(2000);

    // Wait for search results - look for delete button
    cy.get('[data-testid^="delete-user-"]', { timeout: 10000 })
      .filter(':visible')
      .should('have.length.at.least', 1);

    // Click delete button to open confirmation dialog
    cy.get('[data-testid^="delete-user-"]').filter(':visible').first().click({ force: true });

    // Wait for dialog to appear and click Delete button in the dialog
    cy.get('[role="alertdialog"]', { timeout: 5000 }).should('be.visible');
    cy.get('[role="alertdialog"]').contains('button', 'Delete').click({ force: true });

    // Wait for deletion to complete and dialog to close
    cy.get('[role="alertdialog"]').should('not.exist');
    cy.wait(1000);
  });

  it('6. VERIFY DELETE: should not find deleted user in list', () => {
    cy.visit('/dashboard/users');

    // Wait for table to load
    cy.get('table', { timeout: 10000 }).should('exist');

    // Search for the deleted user by email
    cy.get('input[placeholder*="Search"]').clear().type(testData.email);

    // Wait for search to complete
    cy.wait(2000);

    // Verify the user is not found - no delete buttons should be visible for our test user
    cy.get('body').should('not.contain', testData.firstNameEdited);
  });
});
