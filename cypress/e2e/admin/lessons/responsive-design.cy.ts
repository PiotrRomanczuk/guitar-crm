/// <reference types="cypress" />

/**
 * Lessons Responsive Design Tests
 */

describe('Lessons - Responsive Design Tests', () => {
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

  it('should display properly on mobile (iphone-x)', () => {
    cy.visit('/dashboard/lessons');
    cy.viewport('iphone-x');
    cy.get('header, nav').should('be.visible');
    cy.get('[class*="container"]').should('be.visible');
  });

  it('should display properly on tablet (ipad-2)', () => {
    cy.visit('/dashboard/lessons');
    cy.viewport('ipad-2');
    cy.get('header, nav').should('be.visible');
    cy.get('[class*="container"]').should('be.visible');
  });

  it('should display properly on desktop (macbook-15)', () => {
    cy.visit('/dashboard/lessons');
    cy.viewport('macbook-15');
    cy.get('header, nav').should('be.visible');
    cy.get('[class*="container"]').should('be.visible');
  });

  it('should have responsive form on mobile', () => {
    cy.visit('/dashboard/lessons/new');
    cy.viewport('iphone-x');
    cy.get('form').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should have responsive form on tablet', () => {
    cy.visit('/dashboard/lessons/new');
    cy.viewport('ipad-2');
    cy.get('form').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should have responsive form on desktop', () => {
    cy.visit('/dashboard/lessons/new');
    cy.viewport('macbook-15');
    cy.get('form').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should handle viewport resize from mobile to desktop', () => {
    cy.visit('/dashboard/lessons');

    cy.viewport('iphone-x');
    cy.get('header').should('be.visible');

    cy.viewport('macbook-15');
    cy.get('header').should('be.visible');
  });
});
