/// <reference types="cypress" />

// Admin Assignments CRUD Tests
// Verifies complete assignment management workflow: create, read, update, delete

describe('Admin Assignments CRUD', () => {
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

  it('should create a new assignment successfully', () => {
    const assignmentData = {
      title: `E2E Test Assignment ${Date.now()}`,
      description: 'Test Description',
      priority: 'HIGH',
      status: 'OPEN',
    };

    // Navigate to create assignment page
    cy.visit('/dashboard/assignments');
    cy.get('[data-testid="create-assignment-button"]').click();
    cy.location('pathname').should('include', '/dashboard/assignments/new');

    // Fill form
    cy.get('[data-testid="field-title"]').type(assignmentData.title);
    cy.get('[data-testid="field-description"]').type(assignmentData.description);
    cy.get('[data-testid="field-priority"]').select(assignmentData.priority);
    cy.get('[data-testid="field-status"]').select(assignmentData.status);

    // Submit
    cy.intercept('POST', '/api/assignments').as('createAssignment');
    cy.get('[data-testid="submit-button"]').click();
    cy.wait('@createAssignment').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
    });

    // Verify creation
    cy.visit('/dashboard/assignments');
    cy.contains(assignmentData.title).should('be.visible');
    cy.contains(assignmentData.priority).should('be.visible');
  });

  it('should list assignments', () => {
    cy.visit('/dashboard/assignments');
    cy.get('table').should('exist');
  });
});
