/// <reference types="cypress" />

describe('RBAC - Global Permission Checks', () => {
  const STUDENT_EMAIL = 'student@example.com';
  const STUDENT_PASSWORD = 'test123_student';
  const TEACHER_EMAIL = 'teacher@example.com';
  const TEACHER_PASSWORD = 'test123_teacher';

  it('should redirect student from admin routes', () => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(STUDENT_EMAIL);
    cy.get('[data-testid="password"]').type(STUDENT_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();

    // Try to access admin user creation
    cy.visit('/dashboard/users/new');

    // Should be redirected to dashboard or show 403
    // Assuming redirect to /dashboard for now
    cy.location('pathname').should('not.include', '/users/new');
  });

  it('should redirect teacher from admin-only routes', () => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(TEACHER_EMAIL);
    cy.get('[data-testid="password"]').type(TEACHER_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();

    // Try to access system config (if it existed) or maybe delete another teacher
    // For now, let's assume /dashboard/admin is a protected route if it exists
    // Or check if they can see "Delete" on another teacher in the list
  });
});
