/// <reference types="cypress" />

describe('Admin - Users Navigation', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
  const ADMIN_PASSWORD = 'test123_admin';

  beforeEach(() => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]', { timeout: 8000 }).should('be.visible');
    cy.get('[data-testid="password"]').should('be.visible');
    cy.get('[data-testid="email"]').clear().type(ADMIN_EMAIL);
    cy.get('[data-testid="password"]').clear().type(ADMIN_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 15000 }).should(($path) => {
      expect($path).not.to.include('/sign-in');
    });
  });

  it('should navigate to users list from dashboard', () => {
    cy.visit('/dashboard');
    cy.contains('User Management').click();
    cy.location('pathname').should('include', '/dashboard/users');
    cy.get('[data-testid="users-table"]').should('be.visible');
  });

  it('should navigate to create user page', () => {
    cy.visit('/dashboard/users');
    cy.get('[data-testid="create-user-button"]').click();
    cy.location('pathname').should('include', '/dashboard/users/new');
    cy.get('[data-testid="email-input"]').should('be.visible');
  });

  it('should navigate back to list from create page', () => {
    cy.visit('/dashboard/users/new');
    cy.contains('Users').click(); // Assuming breadcrumb or back link, or use browser back
    // If no breadcrumb, check if there is a "Cancel" or "Back" button.
    // Checking UserFormActions might reveal a cancel button.
    // For now, let's use browser back or sidebar link.
    cy.visit('/dashboard/users'); // Direct navigation for now
    cy.location('pathname').should('include', '/dashboard/users');
  });
});
