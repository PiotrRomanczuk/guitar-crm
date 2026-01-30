/// <reference types="cypress" />

describe('Profile and User Role Management', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');

  beforeEach(() => {
    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(ADMIN_EMAIL);
    cy.get('[data-testid="password"]').clear().type(ADMIN_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 15000 }).should('not.include', '/sign-in');
  });

  it('should allow admin to edit their own profile', () => {
    // Navigate to profile page
    cy.visit('/dashboard/profile');

    // Wait for profile form to load
    cy.get('form').should('be.visible');

    // Check if form fields are present and editable
    cy.get('input[name="firstname"]').should('be.visible');
    cy.get('input[name="lastname"]').should('be.visible');
    cy.get('input[name="username"]').should('be.visible');
    cy.get('textarea[name="bio"]').should('be.visible');

    // Try to edit profile
    cy.get('input[name="firstname"]').clear().type('Test First Name');
    cy.get('input[name="lastname"]').clear().type('Test Last Name');
    cy.get('input[name="username"]').clear().type('testusername');
    cy.get('textarea[name="bio"]').clear().type('Test bio');

    // Submit form
    cy.get('button[type="submit"]').click();

    // Check for success message
    cy.contains('Profile updated successfully').should('be.visible');
  });

  it('should allow admin to add teacher role to their account', () => {
    // First, get the current user's ID from the profile page
    cy.visit('/dashboard/profile');

    // Extract user ID from the URL or API call
    cy.url().then((url) => {
      // Navigate to users list
      cy.visit('/dashboard/users');

      // Find the admin user in the list (should be the current user)
      cy.get('[data-testid="users-table"]').should('be.visible');

      // Click edit on the first admin user (assuming current user is admin)
      cy.get('[data-testid*="edit-user-"]').first().click();

      // Wait for edit form to load
      cy.get('form').should('be.visible');

      // Check teacher checkbox
      cy.get('[data-testid="isTeacher-checkbox"]').check();

      // Submit form
      cy.get('button[type="submit"]').click();

      // Check for success (should redirect back to users list)
      cy.location('pathname').should('include', '/dashboard/users');

      // Verify teacher role was added
      cy.contains('Teacher').should('be.visible');
    });
  });

  it('should handle profile form validation', () => {
    cy.visit('/dashboard/profile');

    // Clear required fields
    cy.get('input[name="firstname"]').clear();
    cy.get('input[name="lastname"]').clear();

    // Try to submit
    cy.get('button[type="submit"]').click();

    // Should show validation errors
    cy.contains('First name is required').should('be.visible');
    cy.contains('Last name is required').should('be.visible');
  });
});
