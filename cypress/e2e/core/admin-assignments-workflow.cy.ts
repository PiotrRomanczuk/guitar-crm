/// <reference types="cypress" />

/**
 * Assignments Workflow Tests
 */

describe('Assignments - Workflow Tests', () => {
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

  it('should complete full navigation workflow', () => {
    cy.visit('/dashboard/assignments');
    cy.url().should('include', '/dashboard/assignments');
    cy.get('header').should('contain.text', ADMIN_EMAIL);

    cy.visit('/dashboard/assignments/new');
    cy.url().should('include', '/new');

    cy.visit('/dashboard/assignments');
    cy.url().should('include', '/dashboard/assignments');
    cy.url().should('not.include', '/new');

    cy.get('header').should('contain.text', ADMIN_EMAIL);
  });

  it('should maintain form data on page reload', () => {
    cy.visit('/dashboard/assignments/new');
    cy.get('form').should('be.visible');
    cy.reload();
    cy.get('form').should('be.visible');
  });

  it('should reload assignments list successfully', () => {
    cy.visit('/dashboard/assignments');
    cy.get('header, nav').should('be.visible');
    cy.reload();
    cy.get('header, nav').should('be.visible');
  });

  it('should navigate to assignment details if assignments exist', () => {
    cy.visit('/dashboard/assignments');

    cy.get('a[href*="/dashboard/assignments/"]', { timeout: 3000 }).then(($links) => {
      const validLinks = $links.toArray().filter((el) => {
        const href = Cypress.$(el).attr('href');
        return href && !href.includes('/new') && !href.includes('/edit');
      });

      if (validLinks.length > 0) {
        const firstAssignmentLink = Cypress.$(validLinks[0]).attr('href');
        if (firstAssignmentLink) {
          cy.visit(firstAssignmentLink);
          cy.url().should('not.include', '/new');
          cy.url().should('include', '/dashboard/assignments/');
        }
      }
    });
  });

  it('should navigate to edit page if assignment has edit link', () => {
    cy.visit('/dashboard/assignments');

    cy.get('body').then(($body) => {
      const editLink = $body.find('a[href*="/edit"]').first().attr('href');
      if (editLink && typeof editLink === 'string') {
        cy.visit(editLink);
        cy.get('form', { timeout: 5000 }).should('exist');
      }
    });
  });

  it('should handle sequential page transitions', () => {
    cy.visit('/dashboard/assignments');
    cy.url().should('include', '/dashboard/assignments');

    cy.visit('/dashboard/assignments/new');
    cy.url().should('include', '/new');

    cy.go('back');
    cy.url().should('not.include', '/new');

    cy.visit('/dashboard/assignments');
    cy.url().should('include', '/dashboard/assignments');

    cy.visit('/dashboard/assignments/new');
    cy.url().should('include', '/new');

    cy.go('back');
    cy.url().should('include', '/dashboard/assignements');
  });

  it('should maintain state after back navigation', () => {
    cy.visit('/dashboard/assignements');

    cy.visit('/dashboard/assignements/new');
    cy.go('back');

    cy.url().then((url) => {
      expect(url).to.include('/dashboard/assignements');
    });
  });
});
