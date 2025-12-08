/// <reference types="cypress" />

describe('Teacher - Insights & Integration', () => {
  const TEACHER_EMAIL = 'teacher@example.com';
  const TEACHER_PASSWORD = 'test123_teacher';

  beforeEach(() => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(TEACHER_EMAIL);
    cy.get('[data-testid="password"]').type(TEACHER_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();
  });

  it('should drill down into student history', () => {
    cy.visit('/dashboard/users');

    // Click a student
    // cy.contains('Student Name').click();

    // Verify tabs for Lessons, Assignments, Songs
    // cy.contains('Lessons').click();
    // cy.get('[data-testid="student-lessons-list"]').should('be.visible');
  });

  it('should see local song usage', () => {
    cy.visit('/dashboard/songs');

    // Click a song
    // cy.contains('My Song').click();

    // Verify "Students Learning This" section
    // cy.contains('Students Learning').should('be.visible');
  });
});
