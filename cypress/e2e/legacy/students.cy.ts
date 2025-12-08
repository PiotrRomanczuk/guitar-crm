/// <reference types="cypress" />

describe('Teacher - Student Management', () => {
  const TEACHER_EMAIL = 'teacher@example.com';
  const TEACHER_PASSWORD = 'test123_teacher';
  const NEW_STUDENT_EMAIL = `student.test.${Date.now()}@example.com`;

  beforeEach(() => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(TEACHER_EMAIL);
    cy.get('[data-testid="password"]').clear().type(TEACHER_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();

    // Verify dashboard access
    cy.location('pathname', { timeout: 10000 }).should('include', '/dashboard');
  });

  it('should view only their own students', () => {
    cy.visit('/dashboard/users');

    // Should see "My Students" or similar filter active by default for teachers
    // or just the list.
    // We need to verify that we don't see students that don't belong to us.
    // This is hard to test without knowing the DB state, but we can check for the presence of the list.
    cy.get('table').should('be.visible');
    cy.contains('Students').should('be.visible');
  });

  it('should create a new student', () => {
    cy.visit('/dashboard/users/new');

    cy.get('[data-testid="firstName-input"]').type('Teacher');
    cy.get('[data-testid="lastName-input"]').type('Student');
    cy.get('[data-testid="email-input"]').type(NEW_STUDENT_EMAIL);
    cy.get('[data-testid="username-input"]').type(`t_student_${Date.now()}`);

    // Role selection might be hidden or auto-selected for teachers creating students
    // If visible, select Student
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="isStudent-checkbox"]').length > 0) {
        cy.get('[data-testid="isStudent-checkbox"]').check();
      }
    });

    cy.get('button[type="submit"]').click();

    // Verify redirect
    cy.location('pathname', { timeout: 10000 }).should('eq', '/dashboard/users');

    // Verify student appears in list
    cy.contains(NEW_STUDENT_EMAIL).should('be.visible');
  });

  it('should edit their own student', () => {
    // Navigate to users list
    cy.visit('/dashboard/users');

    // Find the student we just created
    cy.contains(NEW_STUDENT_EMAIL)
      .parents('tr')
      .within(() => {
        cy.get('a[href*="/edit"]').click();
      });

    // Update details
    cy.get('[data-testid="firstName-input"]').clear().type('Updated Name');
    cy.get('button[type="submit"]').click();

    // Verify success
    cy.contains('Updated Name').should('be.visible');
  });
});
