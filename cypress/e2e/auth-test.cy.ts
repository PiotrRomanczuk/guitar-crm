/// <reference types="cypress" />

describe('Authentication Flow', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');

  it('should successfully sign in with admin credentials', () => {
    cy.visit('/sign-in');

    // Ensure the form is visible (using data-testid selectors)
    cy.get('[data-testid="email"]').should('be.visible');
    cy.get('[data-testid="password"]').should('be.visible');

    // Fill in credentials
    cy.get('[data-testid="email"]').clear().type(ADMIN_EMAIL);
    cy.get('[data-testid="password"]').clear().type(ADMIN_PASSWORD);

    // Submit form
    cy.get('[data-testid="signin-button"]').click();

    // Verify redirection to dashboard
    cy.location('pathname', { timeout: 15000 }).should('not.include', '/sign-in');
  });

  it('should show error with invalid credentials', () => {
    cy.visit('/sign-in');

    cy.get('[data-testid="email"]').clear().type(ADMIN_EMAIL);
    cy.get('[data-testid="password"]').clear().type('wrong_password');
    cy.get('[data-testid="signin-button"]').click();

    // Verify error message or that we are still on sign-in page
    cy.location('pathname').should('include', '/sign-in');
    // Adjust selector based on your actual error message UI
    cy.contains(/error|invalid|failed/i).should('be.visible');
  });
});
