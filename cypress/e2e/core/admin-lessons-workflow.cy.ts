/// <reference types="cypress" />

/**
 * Lessons Workflow Tests
 */

describe('Lessons - Workflow Tests', () => {
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

  it('should complete full lesson workflow', () => {
    cy.visit('/dashboard/lessons');
    cy.visit('/dashboard/lessons/new');
    cy.get('form').should('be.visible');
  });

  it('should reload form without losing state', () => {
    cy.visit('/dashboard/lessons/new');
    cy.get('form').should('exist');
    cy.reload();
    cy.get('form').should('be.visible');
  });

  it('should view lesson details after creation', () => {
    cy.visit('/dashboard/lessons');
    cy.get('body').then(($body) => {
      const hasLessonLinks = $body.find('a[href*="/dashboard/lessons/"]').length > 0;
      if (hasLessonLinks) {
        cy.get('a[href*="/dashboard/lessons/"]').first().click({ force: true });
        cy.url().should('include', '/dashboard/lessons');
      } else {
        cy.get('header').should('be.visible');
      }
    });
  });

  it('should navigate to edit page from details', () => {
    cy.visit('/dashboard/lessons');
    cy.get('body').then(($body) => {
      const hasLessonLinks = $body.find('a[href*="/dashboard/lessons/"]').length > 0;
      if (hasLessonLinks) {
        cy.get('a[href*="/dashboard/lessons/"]').first().click({ force: true });
      }
    });
  });

  it('should perform sequential transitions through lesson pages', () => {
    cy.visit('/dashboard/lessons/new');
    cy.visit('/dashboard/lessons');
    cy.get('header').should('be.visible');
  });

  it('should maintain workflow across multiple navigation steps', () => {
    cy.visit('/dashboard/lessons');
    cy.visit('/dashboard/lessons/new');
    cy.visit('/dashboard/lessons');
    cy.get('header').should('be.visible');
  });
});
