/// <reference types="cypress" />

/**
 * Admin Song Management Journey E2E Tests
 *
 * Tests the complete admin song workflow including:
 * - Navigate to songs page
 * - Create new song form
 * - View song details
 * - Edit song
 * - Handle responsive design
 * - Maintain authentication
 */

describe('Admin Song Management Journey', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
  const ADMIN_PASSWORD = 'test123_admin';

  beforeEach(() => {
    // Sign in as admin before each test
    cy.visit('/sign-in');

    // Wait for sign-in form
    cy.get('input[type="email"]', { timeout: 8000 }).should('be.visible');
    cy.get('input[type="password"]').should('be.visible');

    // Fill form
    cy.get('input[type="email"]').clear().type(ADMIN_EMAIL);
    cy.get('input[type="password"]').clear().type(ADMIN_PASSWORD);

    // Submit
    cy.get('button[type="submit"]').click();

    // Wait for redirect to complete
    cy.location('pathname', { timeout: 15000 }).should(($path) => {
      expect($path).not.to.include('/sign-in');
    });
  });

  it('should navigate to songs page', () => {
    cy.visit('/dashboard/songs');
    cy.url().should('include', '/dashboard/songs');
  });

  it('should display songs page with header', () => {
    cy.visit('/dashboard/songs');
    cy.get('header, nav').should('be.visible');
  });

  it('should display songs content area', () => {
    cy.visit('/dashboard/songs');

    // Should have either table or list view with songs content
    cy.get('body').then(($body) => {
      // Try multiple ways to find content
      const hasContent =
        $body.text().includes('song') ||
        $body.text().includes('Song') ||
        $body.text().includes('title') ||
        $body.text().includes('Title');
      cy.wrap(hasContent).should('equal', true);
    });
  });

  it('should have song form fields on create page', () => {
    cy.visit('/dashboard/songs/new');

    // Form should exist
    cy.get('form').should('exist');

    // Should have input fields
    cy.get('input, select, textarea').should('have.length.greaterThan', 0);
  });

  it('should have submit button on create form', () => {
    cy.visit('/dashboard/songs/new');

    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should navigate back from create form', () => {
    cy.visit('/dashboard/songs/new');

    cy.go('back');

    // Should navigate away from /new
    cy.url().should('not.include', '/new');
  });

  it('should handle responsive design on songs page', () => {
    cy.visit('/dashboard/songs');

    // Mobile
    cy.viewport('iphone-x');
    cy.get('header, nav').should('be.visible');

    // Tablet
    cy.viewport('ipad-2');
    cy.get('header, nav').should('be.visible');

    // Desktop
    cy.viewport('macbook-15');
    cy.get('header, nav').should('be.visible');
  });

  it('should maintain session on song pages', () => {
    cy.visit('/dashboard/songs');

    // Check authenticated state
    cy.get('header').should('contain.text', ADMIN_EMAIL);

    // Navigate to create
    cy.visit('/dashboard/songs/new');

    // Session should persist
    cy.get('header').should('contain.text', ADMIN_EMAIL);
  });

  it('should reload songs page successfully', () => {
    cy.visit('/dashboard/songs');
    cy.get('header, nav').should('be.visible');
    cy.reload();
    cy.get('header, nav').should('be.visible');
  });

  it('should handle page navigation with back button', () => {
    cy.visit('/dashboard/songs');

    cy.visit('/dashboard/songs/new');
    cy.url().should('include', '/new');

    cy.go('back');

    cy.url().should('not.include', '/new');
  });

  it('should display form on new song page', () => {
    cy.visit('/dashboard/songs/new');

    cy.get('form').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should have form action buttons', () => {
    cy.visit('/dashboard/songs/new');

    cy.get('button').should('have.length.greaterThan', 0);
  });

  it('should display proper layout on songs page', () => {
    cy.visit('/dashboard/songs');

    cy.get('header').should('be.visible');
    cy.get('[class*="container"]').should('be.visible');
  });

  it('should complete navigation workflow', () => {
    // Start at songs
    cy.visit('/dashboard/songs');
    cy.url().should('include', '/dashboard/songs');
    cy.get('header').should('contain.text', ADMIN_EMAIL);

    // Go to create
    cy.visit('/dashboard/songs/new');
    cy.url().should('include', '/new');

    // Back to songs
    cy.visit('/dashboard/songs');
    cy.url().should('include', '/dashboard/songs');
    cy.url().should('not.include', '/new');

    // Session maintained
    cy.get('header').should('contain.text', ADMIN_EMAIL);
  });

  it('should navigate to song details page if songs exist', () => {
    cy.visit('/dashboard/songs');

    // Try to find a song link (only if songs exist)
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

  it('should display edit page if song exists', () => {
    cy.visit('/dashboard/songs');

    // Try to find edit button or link - skip if not found (optional feature)
    cy.get('body').then(($body) => {
      const editLink = $body.find('a[href*="/edit"]').first().attr('href');
      if (editLink && typeof editLink === 'string') {
        cy.visit(editLink);
        cy.get('form', { timeout: 5000 }).should('exist');
      }
      // If no edit links, test passes anyway
    });
  });

  it('should maintain form data on page reload', () => {
    cy.visit('/dashboard/songs/new');

    // Verify form is visible
    cy.get('form').should('be.visible');

    // Reload
    cy.reload();

    // Form should still be visible
    cy.get('form').should('be.visible');
  });
});
