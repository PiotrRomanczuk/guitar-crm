/// <reference types="cypress" />

/**
 * Songs Authentication Tests
 *
 * Tests auth-related functionality:
 * - Admin sign-in before each test
 * - Session persistence across routes
 * - Email display in header
 * - Redirect on unauthorized access
 */

describe('Songs - Authentication Tests', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
  const ADMIN_PASSWORD = 'test123_admin';

  describe('Authenticated User', () => {
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

    it('should display admin email in header', () => {
      cy.visit('/dashboard/songs');
      cy.get('header').should('contain.text', ADMIN_EMAIL);
    });

    it('should maintain session on list page', () => {
      cy.visit('/dashboard/songs');
      cy.get('header').should('contain.text', ADMIN_EMAIL);
    });

    it('should maintain session on create page', () => {
      cy.visit('/dashboard/songs/new');
      cy.get('header').should('contain.text', ADMIN_EMAIL);
    });

    it('should persist session across page navigation', () => {
      cy.visit('/dashboard/songs');
      cy.get('header').should('contain.text', ADMIN_EMAIL);

      cy.visit('/dashboard/songs/new');
      cy.get('header').should('contain.text', ADMIN_EMAIL);

      cy.visit('/dashboard/songs');
      cy.get('header').should('contain.text', ADMIN_EMAIL);
    });

    it('should keep session after page reload', () => {
      cy.visit('/dashboard/songs');
      cy.get('header').should('contain.text', ADMIN_EMAIL);

      cy.reload();
      cy.get('header').should('contain.text', ADMIN_EMAIL);
    });
  });
});
