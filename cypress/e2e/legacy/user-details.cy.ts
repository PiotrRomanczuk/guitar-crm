/// <reference types="cypress" />

describe('User Detail View', () => {
  const TEACHER_EMAIL = 'teacher@example.com';
  const TEACHER_PASSWORD = 'test123_teacher';
  const USER_EMAIL = `testuser${Date.now()}@example.com`;
  const USER_FIRST_NAME = 'Test';
  const USER_LAST_NAME = `User${Date.now()}`;

  beforeEach(() => {
    // Login
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(TEACHER_EMAIL);
    cy.get('[data-testid="password"]').clear().type(TEACHER_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('include', '/dashboard');
  });

  it('should display user details and related sections', () => {
    // 1. Create a new user
    cy.visit('/dashboard/users/new');
    cy.get('[data-testid="firstName-input"]').type(USER_FIRST_NAME);
    cy.get('[data-testid="lastName-input"]').type(USER_LAST_NAME);
    cy.get('[data-testid="email-input"]').type(USER_EMAIL);
    // Select Student role
    cy.get('[data-testid="isStudent-checkbox"]').click();
    cy.get('[data-testid="submit-button"]').click();

    // 2. Verify list and click
    cy.location('pathname').should('eq', '/dashboard/users');
    cy.contains(`${USER_FIRST_NAME} ${USER_LAST_NAME}`).should('be.visible');

    // Find the row containing the user and click the View button
    cy.contains('tr', `${USER_FIRST_NAME} ${USER_LAST_NAME}`)
      .find('[data-testid^="view-user-"]')
      .click();

    // 3. Verify Detail Page
    cy.location('pathname').should('match', /\/dashboard\/users\/[a-f0-9-]+/);
    cy.get('h1').should('contain', `${USER_FIRST_NAME} ${USER_LAST_NAME}`);
    cy.contains(USER_EMAIL).should('be.visible');

    // 4. Verify Sections
    // These sections should be present even if empty
    cy.contains('Lessons').should('be.visible');
    cy.contains('Assignments').should('be.visible');
    cy.contains('Songs').should('be.visible');

    // 5. Verify SearchParams handling
    cy.location('href').then((url) => {
      cy.visit(`${url}?filter=active`);
      cy.get('h1').should('contain', `${USER_FIRST_NAME} ${USER_LAST_NAME}`);
    });
  });
});
