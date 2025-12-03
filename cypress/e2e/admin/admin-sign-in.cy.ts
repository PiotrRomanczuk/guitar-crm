/// <reference types="cypress" />

// Admin Sign-In Tests
// Verifies authentication flow and admin access to protected pages

describe('Admin Sign-In', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'test123_admin';

  it('should sign in successfully and redirect to dashboard', () => {
    cy.visit('/sign-in');

    // Verify form elements are visible
    cy.get('[data-testid="email"]').should('be.visible');
    cy.get('[data-testid="password"]').should('be.visible');
    cy.get('[data-testid="signin-button"]').should('be.visible');

    // Fill and submit form
    cy.get('[data-testid="email"]').type(adminEmail);
    cy.get('[data-testid="password"]').type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();

    // Verify redirect to dashboard
    cy.location('pathname', { timeout: 10000 }).should('eq', '/dashboard');
  });

  it('should grant admin access to songs management', () => {
    // Sign in
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(adminEmail);
    cy.get('[data-testid="password"]').type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 10000 }).should('eq', '/dashboard');

    // Access songs page
    cy.visit('/dashboard/songs');
    cy.location('pathname').should('include', '/dashboard/songs');

    // Verify admin can create songs
    cy.get('[data-testid="song-new-button"]').should('be.visible');
  });
});
