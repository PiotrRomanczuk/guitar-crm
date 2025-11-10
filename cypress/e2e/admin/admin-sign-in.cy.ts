/// <reference types="cypress" />

// Verifies that an admin can sign in using known dev credentials
// and sees admin-only UI (create song button, access to new song page)
// Prereqs: run script seeding -> bash scripts/database/seeding/local/seed-all.sh

describe('Admin Sign-In', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'test123_admin';

  it('loads landing page and navigates to sign-in', () => {
    // Clear any existing session for this test
    cy.clearCookies();
    cy.clearLocalStorage();

    // Step 1: Visit the base URL (home page/landing page)
    cy.visit('/');

    // Step 2: Verify we're on the landing page
    cy.location('pathname').should('eq', '/');

    // Step 3: Verify page title contains Guitar CRM
    cy.get('h1').should('contain', '🎸 Guitar CRM');

    // Step 4: Verify Sign In button is visible
    cy.get('a[href="/sign-in"]').should('be.visible');

    // Step 5: Verify Sign In button text
    cy.get('a[href="/sign-in"]').should('contain', 'Sign In');

    // Step 6: Click the Sign In button to navigate to sign-in page
    cy.get('a[href="/sign-in"]').click();

    // Step 7: Verify we're on the sign-in page
    cy.location('pathname').should('eq', '/sign-in');
  });

  it('displays sign-in form correctly', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/sign-in');

    // Step 8: Verify sign-in page title
    cy.get('h1').should('contain', '🎸 Guitar CRM');

    // Step 9: Verify sign-in page subtitle
    cy.get('p').should('contain', 'Sign in to your account');

    // Step 10: Verify email input field exists
    cy.get('[data-testid="email"]').should('be.visible');

    // Step 11: Verify email field is empty initially
    cy.get('[data-testid="email"]').should('have.value', '');

    // Step 12: Verify password input field exists
    cy.get('[data-testid="password"]').should('be.visible');

    // Step 13: Verify password field is empty initially
    cy.get('[data-testid="password"]').should('have.value', '');

    // Step 14: Verify sign-in button exists
    cy.get('[data-testid="signin-button"]').should('be.visible');

    // Step 15: Verify sign-in button text
    cy.get('[data-testid="signin-button"]').should('contain', 'Sign In');
  });

  it('fills credentials and submits form', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/sign-in');

    // Step 16: Fill in the email field
    cy.get('[data-testid="email"]').clear().type(adminEmail);

    // Step 17: Verify email field has correct value
    cy.get('[data-testid="email"]').should('have.value', adminEmail);

    // Step 18: Fill in the password field
    cy.get('[data-testid="password"]').clear().type(adminPassword);

    // Step 19: Verify password field has correct value (masked)
    cy.get('[data-testid="password"]').should('have.value', adminPassword);

    // Step 20: Click the sign-in button
    cy.get('[data-testid="signin-button"]').click();
  });

  it('authenticates successfully and redirects to dashboard', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(adminEmail);
    cy.get('[data-testid="password"]').type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();

    // Step 21: Wait for successful sign-in (navigation away from /sign-in)
    cy.location('pathname', { timeout: 10000 }).should('not.include', '/sign-in');

    // Step 22: Verify we're redirected to dashboard
    cy.location('pathname').should('eq', '/dashboard');
  });

  it('accesses songs page as admin', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(adminEmail);
    cy.get('[data-testid="password"]').type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('eq', '/dashboard');

    cy.visit('/dashboard/songs');

    // Step 24: Verify we're on the songs page
    cy.location('pathname').should('include', '/dashboard/songs');

    // Step 25: Verify admin create button is present
    cy.get('[data-testid="song-new-button"]').should('be.visible');

    // Step 26: Verify create button text - adjust based on actual UI
    // cy.get('[data-testid="song-new-button"]').should('contain', 'New Song');
  });

  it('creates new song as admin', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(adminEmail);
    cy.get('[data-testid="password"]').type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('eq', '/dashboard');

    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-new-button"]').click();

    // Step 27: Verify access is allowed for admin (no forbidden message)
    cy.location('pathname').should('include', '/dashboard/songs/new');
    cy.get('[data-testid="song-form-forbidden"]').should('not.exist');

    // Step 28: Verify song title field exists
    cy.get('[data-testid="song-title"]').should('be.visible');

    // Step 29: Verify song author field exists
    cy.get('[data-testid="song-author"]').should('be.visible');

    // Step 30: Verify song level field exists
    cy.get('[data-testid="song-level"]').should('be.visible');

    // Step 31: Verify form submit button exists - adjust selector if needed
    // cy.get('[data-testid="song-submit"]').should('be.visible');
  });
});
