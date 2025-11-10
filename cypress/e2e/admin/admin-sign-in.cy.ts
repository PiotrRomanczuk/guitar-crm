/// <reference types="cypress" />

// Verifies that an admin can sign in using known dev credentials
// and sees admin-only UI (create song button, access to new song page)
// Prereqs: run script seeding -> bash scripts/database/seeding/local/seed-all.sh

describe('Admin Sign-In', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'test123_admin';

  it('signs in and sees admin features', () => {
    // Visit sign-in page
    cy.visit('/sign-in');

    // Fill credentials and submit
    cy.get('[data-testid="email"], input[name="email"]').should('exist').clear().type(adminEmail);
    cy.get('[data-testid="password"], input[name="password"]').should('exist').clear().type(adminPassword);
    cy.get('[data-testid="signin-button"], button[type="submit"]').click();

    // Should no longer be on /sign-in
    cy.location('pathname', { timeout: 10000 }).should('not.include', '/sign-in');

    // Navigate to songs list and verify admin create button is present
    cy.visit('/dashboard/songs');
    cy.location('pathname').should('include', '/dashboard/songs');
    cy.get('[data-testid="song-new-button"]').should('exist');

    // Navigate to create form to verify access is allowed for admin
    cy.get('[data-testid="song-new-button"]').click();
    cy.location('pathname').should('include', '/dashboard/songs/new');
    cy.get('[data-testid="song-form-forbidden"]').should('not.exist');

    // Basic form field exists check
    cy.get('[data-testid="song-title"]').should('exist');
  });
});
