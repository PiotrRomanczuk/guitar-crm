/// <reference types="cypress" />

describe('Teacher - Lesson Management', () => {
  const TEACHER_EMAIL = 'teacher@example.com';
  const TEACHER_PASSWORD = 'test123_teacher';
  const LESSON_TITLE = `Lesson ${Date.now()}`;

  beforeEach(() => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(TEACHER_EMAIL);
    cy.get('[data-testid="password"]').clear().type(TEACHER_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('include', '/dashboard');
  });

  it('should create a new lesson for a student', () => {
    cy.visit('/dashboard/lessons/new');

    cy.get('[data-testid="title-input"]').type(LESSON_TITLE);
    
    // Select a student (assuming dropdown exists)
    // We might need to seed a student first or rely on existing ones
    cy.get('[data-testid="student-select"]').click();
    cy.get('[role="option"]').first().click();

    // Set date/time
    cy.get('[data-testid="date-input"]').type('2025-12-25T10:00');
    
    cy.get('[data-testid="submit-button"]').click();

    // Verify redirect
    cy.location('pathname').should('eq', '/dashboard/lessons');
    cy.contains(LESSON_TITLE).should('be.visible');
  });

  it('should edit an existing lesson', () => {
    cy.visit('/dashboard/lessons');
    cy.contains(LESSON_TITLE).click(); // Or click edit button
    
    // Assuming we are on detail page, click edit
    cy.get('[data-testid="edit-button"]').click();

    cy.get('[data-testid="title-input"]').clear().type(`${LESSON_TITLE} Updated`);
    cy.get('[data-testid="submit-button"]').click();

    cy.contains(`${LESSON_TITLE} Updated`).should('be.visible');
  });

  it('should delete a lesson', () => {
    cy.visit('/dashboard/lessons');
    cy.contains(`${LESSON_TITLE} Updated`).parents('tr').within(() => {
      cy.get('[data-testid="delete-button"]').click();
    });
    
    // Confirm deletion if modal exists
    cy.get('[data-testid="confirm-delete"]').click();

    cy.contains(`${LESSON_TITLE} Updated`).should('not.exist');
  });
});
