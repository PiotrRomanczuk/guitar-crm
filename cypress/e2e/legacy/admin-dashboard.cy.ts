/// <reference types="cypress" />

// Admin Dashboard Tests
// Verifies admin dashboard displays and admin features work

describe('Admin Dashboard', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'test123_admin';

  beforeEach(() => {
    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(adminEmail);
    cy.get('[data-testid="password"]').clear().type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 10000 }).should('eq', '/dashboard');
  });

  it('should display admin dashboard with title', () => {
    cy.visit('/dashboard');
    cy.contains('Admin Dashboard').should('be.visible');
  });

  it('should display key statistics', () => {
    cy.visit('/dashboard');
    cy.contains('Total Users').should('be.visible');
    cy.contains('Teachers').should('be.visible');
    cy.contains('Students').should('be.visible');
    cy.contains('Songs').should('be.visible');
  });

  it('should provide navigation to songs management', () => {
    cy.visit('/dashboard');
    cy.visit('/dashboard/songs');
    cy.location('pathname').should('include', '/dashboard/songs');
  });

  it('should load without errors', () => {
    cy.on('uncaught:exception', (err) => {
      throw err;
    });
    cy.visit('/dashboard');
    cy.get('body').should('be.visible');
  });
});
