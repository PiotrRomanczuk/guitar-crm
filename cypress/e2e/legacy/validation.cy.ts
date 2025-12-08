/// <reference types="cypress" />

describe('Admin - User Form Validation', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
  const ADMIN_PASSWORD = 'test123_admin';

  beforeEach(() => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(ADMIN_EMAIL);
    cy.get('[data-testid="password"]').clear().type(ADMIN_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 10000 }).should('not.include', '/sign-in');
    cy.visit('/dashboard/users/new');
  });

  it('should show error when submitting empty form', () => {
    // HTML5 validation might prevent submission, so we might need to check for :invalid pseudo-class
    // or check if browser validation message appears.
    // Or if we have custom validation.
    
    // Let's try to click submit
    cy.get('button[type="submit"]').click();
    
    // Check for required field error
    cy.get('input[name="email"]:invalid').should('exist');
  });

  it('should show error when email is invalid', () => {
    cy.get('[data-testid="email-input"]').type('invalid-email');
    cy.get('button[type="submit"]').click();
    cy.get('input[name="email"]:invalid').should('exist');
  });

  // Note: Duplicate email check usually happens on server side.
  // We can test it if we know an existing email.
  it('should show error when creating user with existing email', () => {
    cy.get('[data-testid="email-input"]').type(ADMIN_EMAIL);
    cy.get('[data-testid="firstName-input"]').type('Duplicate');
    cy.get('[data-testid="lastName-input"]').type('User');
    cy.get('button[type="submit"]').click();
    
    // Expecting a server error message
    // Based on UserForm.tsx: {error && <div ...>{error}</div>}
    cy.contains('User already exists').should('be.visible'); // Adjust error message as needed
  });
});
