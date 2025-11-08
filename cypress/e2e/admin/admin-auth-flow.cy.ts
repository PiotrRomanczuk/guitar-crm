/// <reference types="cypress" />

/**
 * Admin Authentication Flow E2E Tests
 *
 * Covers complete authentication lifecycle:
 * - Login with valid admin credentials
 * - Session persistence across page reloads
 * - Role verification and access control
 * - Logout functionality
 * - Invalid credentials handling
 * - Protected route access
 */

describe('Admin Authentication Flow', () => {
  const adminUser = {
    email: 'p.romanczuk@gmail.com',
    password: 'test123_admin',
    role: 'Admin',
  };

  const invalidUser = {
    email: 'invalid@test.com',
    password: 'wrongpassword',
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/');
  });

  context('Login Process', () => {
    it('should successfully login with valid admin credentials', () => {
      // Navigate to sign-in page
      cy.visit('/sign-in');
      cy.url().should('include', '/sign-in');

      // Verify login form is visible
      cy.contains(/sign in to your account/i).should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');

      // Enter credentials and submit
      cy.get('input[type="email"]').type(adminUser.email);
      cy.get('input[type="password"]').type(adminUser.password);
      cy.get('button[type="submit"]').click();

      // Verify successful login - should redirect away from sign-in
      cy.url({ timeout: 10000 }).should('not.include', '/sign-in');

      // Should see user email in navigation or header
      cy.contains(adminUser.email, { timeout: 10000 }).should('be.visible');

      // Should be redirected to dashboard
      cy.url().should('match', /\/dashboard/);
    });

    it('should reject invalid credentials', () => {
      cy.visit('/sign-in');

      // Try login with invalid credentials
      cy.get('input[type="email"]').type(invalidUser.email);
      cy.get('input[type="password"]').type(invalidUser.password);
      cy.get('button[type="submit"]').click();

      // Should remain on sign-in page
      cy.url({ timeout: 5000 }).should('include', '/sign-in');

      // Should show error message
      cy.contains(/invalid|error|wrong/i, { timeout: 5000 }).should('be.visible');
    });

    it('should handle empty form submission', () => {
      cy.visit('/sign-in');

      // Try to submit empty form
      cy.get('button[type="submit"]').click();

      // Should remain on sign-in page
      cy.url().should('include', '/sign-in');

      // Form validation should prevent submission or show errors
      cy.get('input[type="email"]:invalid, input[type="password"]:invalid').should(
        'have.length.greaterThan',
        0
      );
    });
  });

  context('Session Management', () => {
    beforeEach(() => {
      // Login as admin for session tests
      cy.visit('/sign-in');
      cy.get('input[type="email"]').type(adminUser.email);
      cy.get('input[type="password"]').type(adminUser.password);
      cy.get('button[type="submit"]').click();
      cy.contains(adminUser.email, { timeout: 10000 }).should('be.visible');
    });

    it('should maintain session after page reload', () => {
      // Navigate to dashboard
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');

      // Reload page
      cy.reload();

      // Should still be logged in
      cy.url({ timeout: 10000 }).should('include', '/dashboard');
      cy.contains(adminUser.email, { timeout: 10000 }).should('be.visible');
    });

    it('should maintain session across navigation', () => {
      // Navigate to different pages
      cy.visit('/dashboard/songs');
      cy.contains(adminUser.email).should('be.visible');

      cy.visit('/dashboard/admin/users');
      cy.contains(adminUser.email).should('be.visible');

      cy.visit('/dashboard/admin/lessons');
      cy.contains(adminUser.email).should('be.visible');
    });

    it('should logout successfully', () => {
      // Find and click logout button/link
      cy.get('[data-testid="logout-btn"], [data-cy="logout"], button')
        .contains(/logout|sign out/i)
        .first()
        .click();

      // Should redirect to home or sign-in page
      cy.url({ timeout: 10000 }).should('match', /\/$|\/sign-in/);

      // Should not see user email anymore
      cy.contains(adminUser.email).should('not.exist');
    });
  });

  context('Role Verification & Access Control', () => {
    beforeEach(() => {
      // Login as admin
      cy.visit('/sign-in');
      cy.get('input[type="email"]').type(adminUser.email);
      cy.get('input[type="password"]').type(adminUser.password);
      cy.get('button[type="submit"]').click();
      cy.contains(adminUser.email, { timeout: 10000 }).should('be.visible');
    });

    it('should have access to admin dashboard', () => {
      cy.visit('/dashboard/admin');
      cy.url().should('include', '/dashboard/admin');

      // Should see admin-specific content
      cy.contains(/admin|management|users|system/i).should('be.visible');
    });

    it('should have access to user management', () => {
      cy.visit('/dashboard/admin/users');
      cy.url().should('include', '/dashboard/admin/users');

      // Should see user management interface
      cy.contains(/users|manage|create user/i).should('be.visible');
    });

    it('should have access to lesson management', () => {
      cy.visit('/dashboard/admin/lessons');
      cy.url().should('include', '/dashboard/admin/lessons');

      // Should see lesson management interface
      cy.contains(/lessons|manage|create lesson/i).should('be.visible');
    });

    it('should see admin navigation elements', () => {
      cy.visit('/dashboard');

      // Should see admin-specific navigation items
      cy.get('nav, [role="navigation"]').within(() => {
        cy.contains(/admin|users|management/i).should('be.visible');
      });
    });
  });

  context('Protected Routes', () => {
    it('should redirect to sign-in when accessing protected routes without auth', () => {
      // Try to access admin dashboard without logging in
      cy.visit('/dashboard/admin');

      // Should be redirected to sign-in
      cy.url({ timeout: 10000 }).should('include', '/sign-in');
    });

    it('should redirect to sign-in when accessing user management without auth', () => {
      cy.visit('/dashboard/admin/users');
      cy.url({ timeout: 10000 }).should('include', '/sign-in');
    });

    it('should redirect to sign-in when accessing lesson management without auth', () => {
      cy.visit('/dashboard/admin/lessons');
      cy.url({ timeout: 10000 }).should('include', '/sign-in');
    });
  });

  context('Error Handling', () => {
    it('should handle network errors gracefully during login', () => {
      // Intercept login request to simulate network error
      cy.intercept('POST', '**/auth/v1/token*', { forceNetworkError: true }).as('loginError');

      cy.visit('/sign-in');
      cy.get('input[type="email"]').type(adminUser.email);
      cy.get('input[type="password"]').type(adminUser.password);
      cy.get('button[type="submit"]').click();

      // Should show network error message
      cy.contains(/network|connection|error/i, { timeout: 10000 }).should('be.visible');
    });

    it('should handle server errors during login', () => {
      // Intercept login request to simulate server error
      cy.intercept('POST', '**/auth/v1/token*', { statusCode: 500 }).as('serverError');

      cy.visit('/sign-in');
      cy.get('input[type="email"]').type(adminUser.email);
      cy.get('input[type="password"]').type(adminUser.password);
      cy.get('button[type="submit"]').click();

      // Should show server error message
      cy.contains(/server|error|try again/i, { timeout: 10000 }).should('be.visible');
    });
  });
});
