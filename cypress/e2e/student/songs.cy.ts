/// <reference types="cypress" />

describe('Student - Songs View', () => {
  const STUDENT_EMAIL = 'student@example.com';
  const STUDENT_PASSWORD = 'test123_student';

  beforeEach(() => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(STUDENT_EMAIL);
    cy.get('[data-testid="password"]').clear().type(STUDENT_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('include', '/dashboard');
  });

  it('should view assigned songs', () => {
    cy.visit('/dashboard/songs');
    
    // Should see a list of songs
    cy.get('table').should('be.visible');
    
    // Should NOT see "New Song" button
    cy.contains('New Song').should('not.exist');
  });

  it('should view song details but NOT edit', () => {
    cy.visit('/dashboard/songs');
    
    // Click first song
    cy.get('table tbody tr').first().click();
    
    // Verify details page
    cy.url().should('include', '/dashboard/songs/');
    
    // Verify NO edit/delete buttons
    cy.get('[data-testid="edit-button"]').should('not.exist');
    cy.get('[data-testid="delete-button"]').should('not.exist');
  });
});
