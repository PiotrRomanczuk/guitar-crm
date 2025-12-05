/// <reference types="cypress" />

describe('Student - Dashboard', () => {
  const STUDENT_EMAIL = 'student@example.com';
  const STUDENT_PASSWORD = 'test123_student';

  beforeEach(() => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(STUDENT_EMAIL);
    cy.get('[data-testid="password"]').clear().type(STUDENT_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('include', '/dashboard');
  });

  it('should display student dashboard overview', () => {
    cy.visit('/dashboard');
    
    // Should see welcome message
    cy.contains('Welcome').should('be.visible');
    
    // Should see quick stats (e.g., "Upcoming Lessons", "Pending Assignments")
    // Adjust selectors based on actual dashboard content
    cy.contains('Upcoming Lessons').should('be.visible');
    cy.contains('Assignments').should('be.visible');
  });

  it('should NOT see admin/teacher controls', () => {
    cy.visit('/dashboard');
    // Ensure "Manage Users" or similar admin links are absent
    cy.contains('Manage Users').should('not.exist');
  });
});
