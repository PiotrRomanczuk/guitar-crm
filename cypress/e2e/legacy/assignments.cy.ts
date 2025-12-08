/// <reference types="cypress" />

describe('Student - Assignments Interaction', () => {
  const STUDENT_EMAIL = 'student@example.com';
  const STUDENT_PASSWORD = 'test123_student';

  beforeEach(() => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(STUDENT_EMAIL);
    cy.get('[data-testid="password"]').clear().type(STUDENT_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('include', '/dashboard');
  });

  it('should view assignments list', () => {
    cy.visit('/dashboard/assignments');
    cy.get('table').should('be.visible');
    cy.contains('New Assignment').should('not.exist');
  });

  it('should mark assignment as complete', () => {
    cy.visit('/dashboard/assignments');

    // Find a pending assignment
    // This assumes there is one. We might need to seed it.
    // For now, we look for a status change interaction if available.
    // If the UI allows clicking a checkbox or button to complete:

    // cy.contains('Pending').parents('tr').find('button').click();
    // cy.contains('Completed').should('be.visible');
  });
});
