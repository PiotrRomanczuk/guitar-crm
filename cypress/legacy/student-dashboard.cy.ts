/// <reference types="cypress" />

describe('Student - Dashboard', () => {
  const STUDENT_EMAIL = 'student@example.com';
  const STUDENT_PASSWORD = 'test123_student';

  before(() => {
    // Create Student via API
    cy.request({
      method: 'POST',
      url: '/api/users',
      body: {
        firstName: 'Test',
        lastName: 'Student',
        username: 'student_dashboard_test',
        email: STUDENT_EMAIL,
        isStudent: true,
      },
      failOnStatusCode: false,
    });
  });

  beforeEach(() => {
    // Mock lessons to ensure dashboard loads correctly
    cy.intercept('GET', '/api/lessons*', {
      statusCode: 200,
      body: {
        data: [
          {
            id: 'mock-lesson',
            title: 'Mock Lesson',
            start_time: new Date(Date.now() + 86400000).toISOString(),
            end_time: new Date(Date.now() + 90000000).toISOString(),
          },
        ],
      },
    }).as('getLessons');

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
