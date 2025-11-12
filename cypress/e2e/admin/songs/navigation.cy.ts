/// <reference types="cypress" />

/**
 * Songs Navigation Tests
 *
 * Tests navigation between songs pages:
 * - Navigate to list page
 * - Navigate to create page
 * - Back button navigation
 * - Direct URL access
 */

describe('Songs - Navigation Tests', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
  const ADMIN_PASSWORD = 'test123_admin';

  beforeEach(() => {
    // Sign in as admin before each test
    cy.visit('/sign-in');
    cy.get('input[type="email"]', { timeout: 8000 }).should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('input[type="email"]').clear().type(ADMIN_EMAIL);
    cy.get('input[type="password"]').clear().type(ADMIN_PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.location('pathname', { timeout: 15000 }).should(($path) => {
      expect($path).not.to.include('/sign-in');
    });
  });

  it('should navigate to songs list page', () => {
    cy.visit('/dashboard/songs');
    cy.url().should('include', '/dashboard/songs');
  });

  it('should navigate to create song page', () => {
    cy.visit('/dashboard/songs');
    cy.visit('/dashboard/songs/new');
    cy.url().should('include', '/dashboard/songs/new');
  });

  it('should navigate back from create page', () => {
    cy.visit('/dashboard/songs/new');
    cy.go('back');
    cy.url().should('not.include', '/new');
  });

  it('should handle direct URL access to songs list', () => {
    cy.visit('/dashboard/songs');
    cy.url().should('include', '/dashboard/songs');
    cy.get('header, nav').should('be.visible');
  });

  it('should handle direct URL access to create page', () => {
    cy.visit('/dashboard/songs/new');
    cy.url().should('include', '/new');
    cy.get('form').should('exist');
  });

  it('should navigate between pages without errors', () => {
    cy.visit('/dashboard/songs');
    cy.url().should('include', '/dashboard/songs');

    cy.visit('/dashboard/songs/new');
    cy.url().should('include', '/new');

    cy.go('back');
    cy.url().should('not.include', '/new');

    cy.visit('/dashboard/songs');
    cy.url().should('include', '/dashboard/songs');
  });
});
