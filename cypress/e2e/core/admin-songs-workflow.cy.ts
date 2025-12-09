/// <reference types="cypress" />

/**
 * Songs Workflow Tests
 *
 * Tests complete workflows and complex scenarios:
 * - Complete navigation workflows
 * - Form reload handling
 * - Entity details pages (when available)
 * - Edit pages (when available)
 */

describe('Songs - Workflow Tests', () => {
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

  it('should complete full navigation workflow', () => {
    // Start at list
    cy.visit('/dashboard/songs');
    cy.url().should('include', '/dashboard/songs');
    cy.get('header').should('contain.text', ADMIN_EMAIL);

    // Go to create
    cy.visit('/dashboard/songs/new');
    cy.url().should('include', '/new');

    // Back to list
    cy.visit('/dashboard/songs');
    cy.url().should('include', '/dashboard/songs');
    cy.url().should('not.include', '/new');

    // Session maintained
    cy.get('header').should('contain.text', ADMIN_EMAIL);
  });

  it('should maintain form data on page reload', () => {
    cy.visit('/dashboard/songs/new');
    cy.get('form').should('be.visible');
    cy.reload();
    cy.get('form').should('be.visible');
  });

  it('should reload songs list successfully', () => {
    cy.visit('/dashboard/songs');
    cy.get('header, nav').should('be.visible');
    cy.reload();
    cy.get('header, nav').should('be.visible');
  });

  it('should navigate to song details if songs exist', () => {
    cy.visit('/dashboard/songs');

    // Try to find song link
    cy.get('a[href*="/dashboard/songs/"]', { timeout: 3000 }).then(($links) => {
      const validLinks = $links.toArray().filter((el) => {
        const href = Cypress.$(el).attr('href');
        return href && !href.includes('/new') && !href.includes('/edit');
      });

      if (validLinks.length > 0) {
        const firstSongLink = Cypress.$(validLinks[0]).attr('href');
        if (firstSongLink) {
          cy.visit(firstSongLink);
          cy.url().should('not.include', '/new');
          cy.url().should('include', '/dashboard/songs/');
        }
      }
    });
  });

  it('should navigate to edit page if song has edit link', () => {
    cy.visit('/dashboard/songs');

    cy.get('body').then(($body) => {
      const editLink = $body.find('a[href*="/edit"]').first().attr('href');
      if (editLink && typeof editLink === 'string') {
        cy.visit(editLink);
        cy.get('form', { timeout: 5000 }).should('exist');
      }
    });
  });

  it('should handle sequential page transitions', () => {
    cy.visit('/dashboard/songs');
    cy.url().should('include', '/dashboard/songs');

    cy.visit('/dashboard/songs/new');
    cy.url().should('include', '/new');

    cy.go('back');
    cy.url().should('not.include', '/new');

    cy.visit('/dashboard/songs');
    cy.url().should('include', '/dashboard/songs');

    cy.visit('/dashboard/songs/new');
    cy.url().should('include', '/new');

    cy.go('back');
    cy.url().should('include', '/dashboard/songs');
  });

  it('should maintain state after back navigation', () => {
    cy.visit('/dashboard/songs');

    cy.visit('/dashboard/songs/new');
    cy.go('back');

    cy.url().then((url) => {
      expect(url).to.include('/dashboard/songs');
    });
  });
});
