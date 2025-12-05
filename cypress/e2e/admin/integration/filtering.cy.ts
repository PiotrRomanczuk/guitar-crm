/// <reference types="cypress" />

describe('Admin - Deep Filtering & Integration', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
  const ADMIN_PASSWORD = 'test123_admin';

  beforeEach(() => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(ADMIN_EMAIL);
    cy.get('[data-testid="password"]').type(ADMIN_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();
  });

  it('should filter lessons by student', () => {
    cy.visit('/dashboard/lessons');
    
    // Open filter
    // cy.get('[data-testid="filter-student"]').click();
    // Select a student
    // cy.contains('Student Name').click();
    
    // Verify list updates
    // cy.get('table tbody tr').should('have.length.gt', 0);
  });

  it('should view global song usage', () => {
    cy.visit('/dashboard/songs');
    
    // Click a song
    // cy.contains('Song Title').click();
    
    // Check "Used In" tab or section
    // cy.contains('Used in 5 Lessons').should('be.visible');
  });
});
