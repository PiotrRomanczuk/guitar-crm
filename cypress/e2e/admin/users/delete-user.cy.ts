/// <reference types="cypress" />

describe('Admin - Delete User Journey', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
  const ADMIN_PASSWORD = 'test123_admin';

  beforeEach(() => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(ADMIN_EMAIL);
    cy.get('[data-testid="password"]').clear().type(ADMIN_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 10000 }).should('not.include', '/sign-in');
    cy.visit('/dashboard/users');
  });

  it('should delete a user', () => {
    // Create a dummy user to delete first to avoid deleting important data
    const emailToDelete = `delete.me.${Date.now()}@example.com`;
    
    cy.visit('/dashboard/users/new');
    cy.get('[data-testid="firstName-input"]').type('Delete');
    cy.get('[data-testid="lastName-input"]').type('Me');
    cy.get('[data-testid="email-input"]').type(emailToDelete);
    cy.get('[data-testid="username-input"]').type(`del_${Date.now()}`);
    cy.get('[data-testid="isStudent-checkbox"]').check();
    cy.get('button[type="submit"]').click();
    cy.location('pathname').should('eq', '/dashboard/users');
    
    // Now delete it
    // We need to find the row with this email.
    cy.contains('tr', emailToDelete).within(() => {
      cy.get('button').contains('Delete').click();
    });
    
    // Handle confirmation dialog
    cy.on('window:confirm', () => true);
    
    // Verify removal
    cy.contains(emailToDelete).should('not.exist');
  });
});
