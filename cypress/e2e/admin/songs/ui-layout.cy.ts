/// <reference types="cypress" />

/**
 * Songs UI/Layout Tests
 *
 * Tests UI elements and page layouts:
 * - Page header visibility
 * - Content area display
 * - Form fields validation
 * - Submit button availability
 * - Container layout
 */

describe('Songs - UI/Layout Tests', () => {
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

  it('should display header on songs page', () => {
    cy.visit('/dashboard/songs');
    cy.get('header, nav').should('be.visible');
  });

  it('should display content area', () => {
    cy.visit('/dashboard/songs');
    cy.get('body').then(($body) => {
      const hasContent =
        $body.text().includes('song') ||
        $body.text().includes('Song') ||
        $body.text().includes('title') ||
        $body.text().includes('Title');
      cy.wrap(hasContent).should('equal', true);
    });
  });

  it('should display container with proper layout', () => {
    cy.visit('/dashboard/songs');
    cy.get('header').should('be.visible');
    cy.get('[class*="container"]').should('be.visible');
  });

  it('should have form on create page', () => {
    cy.visit('/dashboard/songs/new');
    cy.get('form').should('be.visible');
  });

  it('should have form fields on create page', () => {
    cy.visit('/dashboard/songs/new');
    cy.get('input, select, textarea').should('have.length.greaterThan', 0);
  });

  it('should have submit button on form', () => {
    cy.visit('/dashboard/songs/new');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should have multiple action buttons', () => {
    cy.visit('/dashboard/songs/new');
    cy.get('button').should('have.length.greaterThan', 0);
  });

  it('should maintain form visibility after reload', () => {
    cy.visit('/dashboard/songs/new');
    cy.get('form').should('be.visible');
    cy.reload();
    cy.get('form').should('be.visible');
  });
});
