/// <reference types="cypress" />

describe('Teacher - Assignment Management', () => {
  const TEACHER_EMAIL = 'teacher@example.com';
  const TEACHER_PASSWORD = 'test123_teacher';
  const ASSIGNMENT_TITLE = `Practice ${Date.now()}`;

  beforeEach(() => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(TEACHER_EMAIL);
    cy.get('[data-testid="password"]').clear().type(TEACHER_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('include', '/dashboard');
  });

  it('should create an assignment for a student', () => {
    cy.visit('/dashboard/assignments/new');

    cy.get('[data-testid="title-input"]').type(ASSIGNMENT_TITLE);
    cy.get('[data-testid="description-input"]').type('Practice scales for 20 mins');
    
    // Select student
    cy.get('[data-testid="student-select"]').click();
    cy.get('[role="option"]').first().click();

    cy.get('[data-testid="submit-button"]').click();

    cy.location('pathname').should('eq', '/dashboard/assignments');
    cy.contains(ASSIGNMENT_TITLE).should('be.visible');
  });

  it('should track assignment status', () => {
    cy.visit('/dashboard/assignments');
    cy.contains(ASSIGNMENT_TITLE).should('be.visible');
    // Check status badge
    cy.contains(ASSIGNMENT_TITLE).parents('tr').contains('Pending').should('be.visible');
  });
});
