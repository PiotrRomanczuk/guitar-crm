/// <reference types="cypress" />

/**
 * Assignments Navigation Tests
 *
 * Tests navigation between assignments pages
 */

describe('Assignments - Navigation Tests', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
  const ADMIN_PASSWORD = 'test123_admin';

  beforeEach(() => {
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

  it('should navigate to assignments list page', () => {
    cy.visit('/dashboard/assignements');
    cy.url().should('include', '/dashboard/assignements');
  });

  it('should navigate to create assignment page', () => {
    cy.visit('/dashboard/assignements');
    cy.visit('/dashboard/assignements/new');
    cy.url().should('include', '/dashboard/assignements/new');
  });

  it('should navigate back from create page', () => {
    cy.visit('/dashboard/assignements/new');
    cy.go('back');
    cy.url().should('not.include', '/new');
  });

  it('should handle direct URL access to assignments list', () => {
    cy.visit('/dashboard/assignements');
    cy.url().should('include', '/dashboard/assignements');
    cy.get('header, nav').should('be.visible');
  });

  it('should handle direct URL access to create page', () => {
    cy.visit('/dashboard/assignements/new');
    cy.url().should('include', '/new');
    cy.get('form').should('exist');
  });

  it('should navigate between pages without errors', () => {
    cy.visit('/dashboard/assignements');
    cy.url().should('include', '/dashboard/assignements');

    cy.visit('/dashboard/assignements/new');
    cy.url().should('include', '/new');

    cy.go('back');
    cy.url().should('not.include', '/new');

    cy.visit('/dashboard/assignements');
    cy.url().should('include', '/dashboard/assignements');
  });
});
