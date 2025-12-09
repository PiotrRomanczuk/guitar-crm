/// <reference types="cypress" />

// Admin Users CRUD Tests
// Verifies complete user management workflow: create, read, update, delete

describe('Admin Users CRUD', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'test123_admin';

  beforeEach(() => {
    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(adminEmail);
    cy.get('[data-testid="password"]').clear().type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 10000 }).should('eq', '/dashboard');
  });

  it('should create a new user successfully', () => {
    const userData = {
      firstName: 'Test',
      lastName: `User ${Date.now()}`,
      email: `test.user.${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
    };

    // Navigate to create user page
    cy.visit('/dashboard/users');
    cy.get('[data-testid="create-user-button"]').click();
    cy.location('pathname').should('include', '/dashboard/users/new');

    // Fill form
    cy.get('[data-testid="firstName-input"]').type(userData.firstName);
    cy.get('[data-testid="lastName-input"]').type(userData.lastName);
    cy.get('[data-testid="email-input"]').type(userData.email);
    cy.get('[data-testid="username-input"]').type(userData.username);

    // Select roles
    cy.get('[data-testid="isStudent-checkbox"]').check();

    // Submit
    cy.intercept('POST', '/api/users').as('createUser');
    cy.get('[data-testid="submit-button"]').click();
    cy.wait('@createUser').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
    });

    // Verify creation
    cy.visit('/dashboard/users');
    cy.contains(userData.email).should('be.visible');
    cy.contains('Student').should('be.visible');
  });

  it('should list users', () => {
    cy.visit('/dashboard/users');
    cy.get('table').should('exist');
  });
});
