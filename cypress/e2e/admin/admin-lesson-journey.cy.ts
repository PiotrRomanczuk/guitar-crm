/// <reference types="cypress" />

/**
 * Admin Lesson Management Journey E2E Tests
 *
 * Tests the complete admin lesson workflow including:
 * - Navigate to lessons page
 * - Create new lesson form
 * - View lesson page sections
 * - Handle responsive design
 * - Maintain authentication
 */

describe('Admin Lesson Management Journey', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';

  beforeEach(() => {
    // Sign in as admin before each test
    cy.visit('/sign-in');

    // Wait for sign-in form
    cy.get('input[type="email"]', { timeout: 8000 }).should('be.visible');
    cy.get('input[type="password"]').should('be.visible');

    // Fill form
    cy.get('input[type="email"]').clear().type(ADMIN_EMAIL);
    cy.get('input[type="password"]').clear().type('test123_admin');

    // Submit
    cy.get('button[type="submit"]').click();

    // Wait for redirect
    cy.location('pathname', { timeout: 15000 }).should(($path) => {
      expect($path).not.to.include('/sign-in');
    });
  });

  it('should navigate to lessons page', () => {
    cy.visit('/dashboard/lessons');
    cy.url().should('include', '/dashboard/lessons');
  });

  it('should display lessons page with header', () => {
    cy.visit('/dashboard/lessons');
    cy.get('header, nav').should('be.visible');
  });

  it('should display lessons content area', () => {
    cy.visit('/dashboard/lessons');

    // Should have either table or list view with lessons content
    cy.get('body').then(($body) => {
      // Try multiple ways to find content
      const hasContent =
        $body.text().includes('lesson') ||
        $body.text().includes('Lesson') ||
        $body.text().includes('title') ||
        $body.text().includes('Title');
      cy.wrap(hasContent).should('equal', true);
    });
  });

  it('should have lesson form fields on create page', () => {
    cy.visit('/dashboard/lessons/new');

    // Form should exist
    cy.get('form').should('exist');

    // Should have input fields
    cy.get('input, select, textarea').should('have.length.greaterThan', 0);
  });

  it('should have submit button on create form', () => {
    cy.visit('/dashboard/lessons/new');

    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should navigate back from create form', () => {
    cy.visit('/dashboard/lessons/new');

    cy.go('back');

    // Should navigate away from /new
    cy.url().should('not.include', '/new');
  });

  it('should handle responsive design on lessons page', () => {
    cy.visit('/dashboard/lessons');

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

  it('should maintain session on lesson pages', () => {
    cy.visit('/dashboard/lessons');

    // Check authenticated state
    cy.get('header').should('contain.text', ADMIN_EMAIL);

    // Navigate to create
    cy.visit('/dashboard/lessons/new');

    // Session should persist
    cy.get('header').should('contain.text', ADMIN_EMAIL);
  });

  it('should reload lessons page successfully', () => {
    cy.visit('/dashboard/lessons');
    cy.get('header, nav').should('be.visible');
    cy.reload();
    cy.get('header, nav').should('be.visible');
  });

  it('should handle page navigation with back button', () => {
    cy.visit('/dashboard/lessons');

    cy.visit('/dashboard/lessons/new');
    cy.url().should('include', '/new');

    cy.go('back');

    cy.url().should('not.include', '/new');
  });

  it('should display form on new lesson page', () => {
    cy.visit('/dashboard/lessons/new');

    cy.get('form').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should have form action buttons', () => {
    cy.visit('/dashboard/lessons/new');

    cy.get('button').should('have.length.greaterThan', 0);
  });

  it('should display proper layout on lessons page', () => {
    cy.visit('/dashboard/lessons');

    cy.get('header').should('be.visible');
    cy.get('[class*="container"]').should('be.visible');
  });

  it('should complete navigation workflow', () => {
    // Start at lessons
    cy.visit('/dashboard/lessons');
    cy.url().should('include', '/dashboard/lessons');
    cy.get('header').should('contain.text', ADMIN_EMAIL);

    // Go to create
    cy.visit('/dashboard/lessons/new');
    cy.url().should('include', '/new');

    // Back to lessons
    cy.visit('/dashboard/lessons');
    cy.url().should('include', '/dashboard/lessons');
    cy.url().should('not.include', '/new');

    // Session maintained
    cy.get('header').should('contain.text', ADMIN_EMAIL);
  });
});
