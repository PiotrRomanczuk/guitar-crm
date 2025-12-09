describe('Authentication Credentials Check', () => {
  beforeEach(() => {
    // Clear cookies and local storage before each test to ensure a clean state
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should successfully sign in with Admin credentials', () => {
    const email = Cypress.env('TEST_ADMIN_EMAIL');
    const password = Cypress.env('TEST_ADMIN_PASSWORD');

    cy.visit('/sign-in');

    cy.get('[data-testid="email"]').type(email);
    cy.get('[data-testid="password"]').type(password);
    cy.get('[data-testid="signin-button"]').click();

    // Assert redirection to dashboard or home page
    // Adjust the expected URL based on your application's routing logic
    cy.location('pathname').should('not.eq', '/sign-in');
    cy.location('pathname').should('include', '/dashboard');
  });

  it('should successfully sign in with Teacher credentials', () => {
    const email = Cypress.env('TEST_TEACHER_EMAIL');
    const password = Cypress.env('TEST_TEACHER_PASSWORD');

    cy.visit('/sign-in');

    cy.get('[data-testid="email"]').type(email);
    cy.get('[data-testid="password"]').type(password);
    cy.get('[data-testid="signin-button"]').click();

    cy.location('pathname').should('not.eq', '/sign-in');
    cy.location('pathname').should('include', '/dashboard');
  });

  it('should successfully sign in with Student credentials', () => {
    const email = Cypress.env('TEST_STUDENT_EMAIL');
    const password = Cypress.env('TEST_STUDENT_PASSWORD');

    cy.visit('/sign-in');

    cy.get('[data-testid="email"]').type(email);
    cy.get('[data-testid="password"]').type(password);
    cy.get('[data-testid="signin-button"]').click();

    cy.location('pathname').should('not.eq', '/sign-in');
    cy.location('pathname').should('include', '/dashboard');
  });
});
