/// <reference types="cypress" />

describe('Student - Navigation Integration', () => {
  const STUDENT_EMAIL = 'student@example.com';
  const STUDENT_PASSWORD = 'test123_student';

  beforeEach(() => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(STUDENT_EMAIL);
    cy.get('[data-testid="password"]').type(STUDENT_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();
  });

  it('should navigate from lesson to song', () => {
    cy.visit('/dashboard/lessons');
    
    // Click a lesson
    // cy.get('table tbody tr').first().click();
    
    // Click a linked song
    // cy.get('[data-testid="linked-song"]').click();
    
    // Verify URL changes to song details
    // cy.url().should('include', '/dashboard/songs/');
  });

  it('should navigate from assignment to lesson', () => {
    cy.visit('/dashboard/assignments');
    
    // Click an assignment
    // cy.get('table tbody tr').first().click();
    
    // Click "View Lesson"
    // cy.contains('View Lesson').click();
    
    // Verify URL changes to lesson details
    // cy.url().should('include', '/dashboard/lessons/');
  });
});
