/// <reference types="cypress" />

describe('Student - Lessons View', () => {
  const STUDENT_EMAIL = 'student@example.com';
  const STUDENT_PASSWORD = 'test123_student';

  beforeEach(() => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(STUDENT_EMAIL);
    cy.get('[data-testid="password"]').clear().type(STUDENT_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('include', '/dashboard');
  });

  it('should view assigned lessons', () => {
    cy.visit('/dashboard/lessons');

    // Should see a list of lessons
    cy.get('table').should('be.visible');

    // Should NOT see "New Lesson" button
    cy.contains('New Lesson').should('not.exist');
    cy.get('[data-testid="create-lesson-button"]').should('not.exist');
  });

  it('should view lesson details but NOT edit', () => {
    cy.visit('/dashboard/lessons');

    // Click first lesson
    cy.get('table tbody tr').first().click();

    // Verify details page
    cy.url().should('include', '/dashboard/lessons/');

    // Verify NO edit/delete buttons
    cy.get('[data-testid="edit-button"]').should('not.exist');
    cy.get('[data-testid="delete-button"]').should('not.exist');
  });
});
