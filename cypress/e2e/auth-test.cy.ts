/// <reference types="cypress" />

describe('Authentication Flow', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');

  it('should successfully sign in with admin credentials', () => {
    cy.visit('/sign-in');

    // Ensure the form is visible
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');

    // Fill in credentials
    cy.get('input[type="email"]').clear().type(ADMIN_EMAIL);
    cy.get('input[type="password"]').clear().type(ADMIN_PASSWORD);

    // Submit form
    cy.get('button[type="submit"]').click();

    // Verify redirection to dashboard
    cy.location('pathname', { timeout: 15000 }).should('not.include', '/sign-in');
    cy.location('pathname').should('include', '/dashboard');
  });

  it('should show error with invalid credentials', () => {
    cy.visit('/sign-in');

    cy.get('input[type="email"]').clear().type(ADMIN_EMAIL);
    cy.get('input[type="password"]').clear().type('wrong_password');
    cy.get('button[type="submit"]').click();

    // Verify error message or that we are still on sign-in page
    cy.location('pathname').should('include', '/sign-in');
    // Adjust selector based on your actual error message UI
    cy.contains(/error|invalid|failed/i).should('be.visible');
  });
});
