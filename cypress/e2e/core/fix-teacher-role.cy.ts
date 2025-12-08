/// <reference types="cypress" />

describe('Fix Teacher Role and Verify', () => {
  const TEACHER_EMAIL = 'teacher@example.com';
  const TEACHER_PASSWORD = 'test123_teacher';
  const STUDENT_EMAIL = `student_${Date.now()}@example.com`;

  it('should fix teacher role and see student', () => {
    // Login as Admin
    cy.visit('/sign-in');
    cy.get('input[type="email"]', { timeout: 8000 }).should('be.visible');
    cy.get('input[type="email"]').clear().type('p.romanczuk@gmail.com');
    cy.get('input[type="password"]').clear().type('test123_admin');
    cy.get('button[type="submit"]').click();
    cy.location('pathname', { timeout: 15000 }).should('not.include', '/sign-in');

    // Fix Teacher Role
    cy.visit('/dashboard/users');
    cy.get('[data-testid="search-input"]').type(TEACHER_EMAIL);
    cy.contains('tbody tr', TEACHER_EMAIL).should('be.visible');

    cy.contains('tbody tr', TEACHER_EMAIL).find('[data-testid^="edit-user-"]').click();

    // Toggle Teacher role
    cy.get('[data-testid="isTeacher-checkbox"]').then(($btn) => {
      if ($btn.attr('aria-checked') === 'true') {
        cy.wrap($btn).click(); // Uncheck
      }
      cy.wrap($btn).click(); // Check
      cy.wrap($btn).should('have.attr', 'aria-checked', 'true');
    });
    cy.get('[data-testid="submit-button"]').click();
    cy.location('pathname').should('include', '/dashboard/users');

    // Create Student
    cy.visit('/dashboard/users/new');
    cy.get('[data-testid="firstName-input"]').type('Test');
    cy.get('[data-testid="lastName-input"]').type('Student');
    cy.get('[data-testid="username-input"]').type(`student_${Date.now()}`);
    cy.get('[data-testid="email-input"]').type(STUDENT_EMAIL);
    cy.get('[data-testid="isStudent-checkbox"]').checkShadcn();
    cy.get('[data-testid="submit-button"]').click();
    cy.location('pathname').should('include', '/dashboard/users');

    // Logout
    cy.contains('button', 'Sign Out').click();

    // Login as Teacher
    cy.visit('/sign-in');
    cy.get('input[type="email"]').clear().type(TEACHER_EMAIL);
    cy.get('input[type="password"]').clear().type(TEACHER_PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.location('pathname', { timeout: 15000 }).should('not.include', '/sign-in');

    // Verify Student Visible in Assignment Form
    cy.visit('/dashboard/assignments/new');
    cy.get('[data-testid="student-select"]').should('exist').click();
    cy.get('[role="option"]').should('have.length.at.least', 1);
  });
});
