describe('Shadow User Management', () => {
  beforeEach(() => {
    // Login as admin before each test
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type('p.romanczuk@gmail.com');
    cy.get('[data-testid="password"]').type('test123_admin');
    cy.get('[data-testid="signin-button"]').click();

    // Wait for dashboard to load
    cy.url().should('include', '/dashboard');
    cy.contains('h1', 'Dashboard').should('be.visible');
  });

  it('should create a shadow user without email', () => {
    const timestamp = new Date().getTime();
    const shadowUsername = `shadow_${timestamp}`;
    const shadowName = `Shadow ${timestamp}`;

    // Navigate to create user page
    cy.visit('/dashboard/users/new');

    // Fill form
    cy.get('[data-testid="firstName-input"]').type('Test');
    cy.get('[data-testid="lastName-input"]').type(shadowName);
    cy.get('[data-testid="username-input"]').type(shadowUsername);

    // Check Shadow User
    cy.get('[data-testid="isShadow-checkbox"]').checkShadcn();

    // Verify email is optional
    cy.get('[data-testid="email-input"]').should('not.have.attr', 'required');
    cy.get('[data-testid="email-input"]').should(
      'have.attr',
      'placeholder',
      'No email required for shadow user'
    );

    // Submit form
    cy.get('[data-testid="submit-button"]').click();

    // Verify redirect and list
    cy.url().should('include', '/dashboard/users');
    cy.contains(shadowName).should('be.visible');
    // Ideally verify that the user is marked as shadow or has no email,
    // but listing presence is a good start.
  });

  it('should create a shadow user with email', () => {
    const timestamp = new Date().getTime();
    const shadowUsername = `shadow_email_${timestamp}`;
    const shadowName = `Shadow Email ${timestamp}`;
    const shadowEmail = `shadow_${timestamp}@test.com`;

    // Navigate to create user page
    cy.visit('/dashboard/users/new');

    // Fill form
    cy.get('[data-testid="firstName-input"]').type('Test');
    cy.get('[data-testid="lastName-input"]').type(shadowName);
    cy.get('[data-testid="username-input"]').type(shadowUsername);
    cy.get('[data-testid="email-input"]').type(shadowEmail);

    // Check Shadow User
    cy.get('[data-testid="isShadow-checkbox"]').checkShadcn();

    // Submit
    cy.get('[data-testid="submit-button"]').click();

    // Verify redirect and list
    cy.url().should('include', '/dashboard/users');
    cy.contains(shadowName).should('be.visible');
    cy.contains(shadowEmail).should('be.visible');
  });
});
