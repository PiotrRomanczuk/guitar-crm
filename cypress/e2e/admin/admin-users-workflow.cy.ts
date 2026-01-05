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
    cy.wait(1000); // Wait for form to load

    // Fill in user form
    cy.get('[data-testid="firstName-input"]').clear().type(testData.firstName);
    cy.get('[data-testid="lastName-input"]').clear().type(testData.lastName);
    cy.get('[data-testid="email-input"]').clear().type(testData.email);

    // Set as student
    cy.get('[data-testid="isStudent-checkbox"]').click({ force: true });

    // Submit the form and wait for redirect
    cy.get('button[type="submit"]').click({ force: true });

    // Wait longer and verify successful redirect
    cy.url({ timeout: 30000 }).should('not.include', '/new');
    cy.url().should('include', '/dashboard/users');
  });

  it('2. VERIFY CREATE: should find created user in list', () => {
    cy.visit('/dashboard/users');
    
    // Wait for page and table to fully load
    cy.get('[data-testid="users-table"], .md\\:hidden', { timeout: 15000 }).should('exist');
    cy.wait(2000);

    // Search for the user using the search input
    cy.get('input[placeholder*="Search"]', { timeout: 10000 }).should('be.visible');
    cy.get('input[placeholder*="Search"]').clear().type(testData.email);
    
    // Wait for search to complete
    cy.wait(3000);

    // Verify user appears in the list - check both table and mobile views
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="users-table"]').is(':visible')) {
        // Desktop view
        cy.get('[data-testid="users-table"]').should('contain', testData.firstName);
      } else {
        // Mobile view
        cy.get('.md\\:hidden').should('contain', testData.firstName);
      }
    });
  });

  it('3. EDIT: should update the user', () => {
    cy.visit('/dashboard/users');

    // Wait for table/list to load
    cy.get('[data-testid="users-table"], .md\\:hidden', { timeout: 15000 }).should('exist');
    cy.wait(2000);

    // Search for the user
    cy.get('input[placeholder*="Search"]').clear().type(testData.email);
    cy.wait(3000);

    // Find and click the edit button - handle both desktop and mobile views
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="users-table"]').is(':visible')) {
        // Desktop view
        cy.get('[data-testid^="edit-user-"]', { timeout: 15000 })
          .should('be.visible')
          .first()
          .click({ force: true });
      } else {
        // Mobile view
        cy.get('[data-testid^="edit-user-"]', { timeout: 15000 })
          .should('be.visible')
          .first()
          .click({ force: true });
      }
    });

    // Should be on edit page
    cy.location('pathname', { timeout: 15000 }).should('include', '/edit');
    cy.wait(1000);

    // Update the first name
    cy.get('[data-testid="firstName-input"]').should('be.visible').clear().type(testData.firstNameEdited);

    // Save
    cy.get('button[type="submit"]').click({ force: true });

    // Wait for navigation back to list
    cy.url({ timeout: 30000 }).should('not.include', '/edit');
    cy.url().should('include', '/dashboard/users');
  });

  it('4. VERIFY EDIT: should find edited user in list', () => {
    cy.visit('/dashboard/users');
    
    // Wait for table/list to load
    cy.get('[data-testid="users-table"], .md\\:hidden', { timeout: 15000 }).should('exist');
    cy.wait(2000);

    // Search for the user by email
    cy.get('input[placeholder*="Search"]').clear().type(testData.email);
    cy.wait(3000);

    // Verify edited first name appears in list - handle both views
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="users-table"]').is(':visible')) {
        // Desktop view
        cy.get('[data-testid="users-table"]').should('contain', testData.firstNameEdited);
      } else {
        // Mobile view
        cy.get('.md\\:hidden').should('contain', testData.firstNameEdited);
      }
    });
  });

  it('5. DELETE: should delete the user', () => {
    cy.visit('/dashboard/users');

    // Wait for table/list to load
    cy.get('[data-testid="users-table"], .md\\:hidden', { timeout: 15000 }).should('exist');
    cy.wait(2000);

    // Search for the user by email
    cy.get('input[placeholder*="Search"]').clear().type(testData.email);
    cy.wait(3000);

    // Wait for search results and find delete button
    cy.get('[data-testid^="delete-user-"]', { timeout: 15000 })
      .should('be.visible')
      .should('have.length.at.least', 1);

    // Click delete button to open confirmation dialog
    cy.get('[data-testid^="delete-user-"]').first().click({ force: true });

    // Wait for confirmation dialog and click Delete button
    cy.get('[role="alertdialog"]', { timeout: 10000 }).should('be.visible');
    cy.get('[role="alertdialog"]').within(() => {
      cy.contains('button', 'Delete', { timeout: 5000 }).click({ force: true });
    });

    // Wait for deletion to complete and dialog to close
    cy.get('[role="alertdialog"]', { timeout: 10000 }).should('not.exist');
    cy.wait(2000);
  });

  it('6. VERIFY DELETE: should not find deleted user in list', () => {
    cy.visit('/dashboard/users');

    // Wait for table/list to load
    cy.get('[data-testid="users-table"], .md\\:hidden', { timeout: 15000 }).should('exist');
    cy.wait(2000);

    // Search for the deleted user by email
    cy.get('input[placeholder*="Search"]').clear().type(testData.email);
    cy.wait(3000);

    // Verify the user is not found - check for both empty results or no matching content
    cy.get('body').then(($body) => {
      const hasTable = $body.find('[data-testid="users-table"]').is(':visible');
      const hasMobileView = $body.find('.md\\:hidden').is(':visible');
      
      if (hasTable || hasMobileView) {
        // If we have results displayed, make sure our test user is not in them
        cy.get('body').should('not.contain', testData.firstNameEdited);
      }
      // If no results are displayed at all, that's also valid (empty search result)
    });
  });
});
