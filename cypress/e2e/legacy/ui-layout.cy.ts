/// <reference types="cypress" />

/**
 * Assignments UI/Layout Tests
 */

describe('Assignments - UI/Layout Tests', () => {
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

  it('should display header on assignments page', () => {
    cy.visit('/dashboard/assignements');
    cy.get('header, nav').should('be.visible');
  });

  it('should display content area', () => {
    cy.visit('/dashboard/assignements');
    cy.get('body').then(($body) => {
      const hasContent =
        $body.text().includes('assignment') ||
        $body.text().includes('Assignment') ||
        $body.text().includes('title') ||
        $body.text().includes('Title');
      cy.wrap(hasContent).should('equal', true);
    });
  });

  it('should display container with proper layout', () => {
    cy.visit('/dashboard/assignements');
    cy.get('header').should('be.visible');
    cy.get('[class*="container"]').should('be.visible');
  });

  it('should have form on create page', () => {
    cy.visit('/dashboard/assignements/new');
    cy.get('form').should('be.visible');
  });

  it('should have form fields on create page', () => {
    cy.visit('/dashboard/assignements/new');
    cy.get('input, select, textarea').should('have.length.greaterThan', 0);
  });

  it('should have submit button on form', () => {
    cy.visit('/dashboard/assignements/new');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should have multiple action buttons', () => {
    cy.visit('/dashboard/assignements/new');
    cy.get('button').should('have.length.greaterThan', 0);
  });

  it('should maintain form visibility after reload', () => {
    cy.visit('/dashboard/assignements/new');
    cy.get('form').should('be.visible');
    cy.reload();
    cy.get('form').should('be.visible');
  });
});
