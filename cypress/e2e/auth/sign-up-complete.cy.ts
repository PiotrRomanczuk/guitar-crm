/// <reference types="cypress" />

/**
 * Authentication - Complete Sign-Up Flow
 *
 * Tests the complete user registration workflow:
 * 1. Form validation (client-side)
 * 2. Successful sign-up with email verification
 * 3. Email verification confirmation screen
 * 4. Duplicate email handling
 * 5. Edge cases and error handling
 *
 * Priority: P1 - Critical authentication feature
 *
 * IMPORTANT NOTES:
 * - Email confirmation is DISABLED in local Supabase config (enable_confirmations = false)
 * - Users can sign in immediately after sign-up without verifying email
 * - Verification email is still sent but not required
 * - In production, email verification may be required
 */

describe('Sign-Up Flow', () => {
  // Use timestamp to create unique test emails
  const timestamp = Date.now();
  const testEmail = `signup-test-${timestamp}@example.com`;
  const testPassword = 'TestPassword123!';
  const testFirstName = 'Jimi';
  const testLastName = 'Hendrix';

  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/sign-up');
  });

  describe('Page Load and UI Elements', () => {
    it('should display sign-up form with all required fields', () => {
      // Header
      cy.contains('Join Strummy').should('be.visible');
      cy.contains('Manage your students and lessons with AI-powered tools').should('be.visible');

      // Form fields
      cy.get('input[name="firstName"]').should('be.visible');
      cy.get('input[name="lastName"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[id="password"]').should('be.visible');
      cy.get('input[id="confirmPassword"]').should('be.visible');

      // Submit button
      cy.contains('button', 'Create Account').should('be.visible').and('not.be.disabled');

      // Links
      cy.contains('Already have an account?').should('be.visible');
      cy.get('a[href="/sign-in"]').should('exist');
    });

    it('should have back navigation to sign-in page', () => {
      cy.get('button[aria-label="Go back"]').should('be.visible').click();
      cy.url().should('include', '/sign-in');
    });

    it('should display Google OAuth button', () => {
      cy.contains('button', /google/i).should('be.visible');
    });

    it('should be mobile responsive', () => {
      cy.viewport('iphone-x');
      cy.visit('/sign-up');

      // All form elements should be visible on mobile
      cy.get('input[name="firstName"]').should('be.visible');
      cy.get('input[name="lastName"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.contains('button', 'Create Account').should('be.visible');
    });
  });

  describe('Form Validation - First Name', () => {
    it('should show error when first name is empty on blur', () => {
      // Click into field and then blur without typing
      cy.get('input[name="firstName"]').click().blur();
      // Wait a moment for validation to trigger
      cy.wait(100);
      cy.contains('First name is required').should('be.visible');
    });

    it('should clear error when user starts typing', () => {
      cy.get('input[name="firstName"]').click().blur();
      cy.wait(100);
      cy.contains('First name is required').should('be.visible');

      cy.get('input[name="firstName"]').type('J');
      cy.contains('First name is required').should('not.exist');
    });

    it('should reject first name that is too long', () => {
      // Type first 100 characters, then add one more to exceed limit
      const longName = 'a'.repeat(101); // Max is 100 characters
      cy.get('input[name="firstName"]').type(longName, { delay: 0 }).blur();
      cy.wait(100);
      cy.contains('First name too long').should('be.visible');
    });
  });

  describe('Form Validation - Last Name', () => {
    it('should show error when last name is empty on blur', () => {
      cy.get('input[name="lastName"]').click().blur();
      cy.wait(100);
      cy.contains('Last name is required').should('be.visible');
    });

    it('should clear error when user starts typing', () => {
      cy.get('input[name="lastName"]').click().blur();
      cy.wait(100);
      cy.contains('Last name is required').should('be.visible');

      cy.get('input[name="lastName"]').type('H');
      cy.contains('Last name is required').should('not.exist');
    });

    it('should reject last name that is too long', () => {
      const longName = 'a'.repeat(101); // Max is 100 characters
      cy.get('input[name="lastName"]').type(longName, { delay: 0 }).blur();
      cy.wait(100);
      cy.contains('Last name too long').should('be.visible');
    });
  });

  describe('Form Validation - Email', () => {
    it('should show error for invalid email format on blur', () => {
      cy.get('input[name="email"]').type('invalid-email').blur();
      cy.wait(100);
      cy.contains('Valid email required').should('be.visible');
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
      ];

      validEmails.forEach((email) => {
        cy.get('input[name="email"]').clear().type(email).blur();
        cy.wait(100);
        cy.contains('Valid email required').should('not.exist');
      });
    });

    it('should clear error when user corrects email', () => {
      cy.get('input[name="email"]').type('invalid').blur();
      cy.wait(100);
      cy.contains('Valid email required').should('be.visible');

      cy.get('input[name="email"]').clear().type('valid@example.com');
      cy.contains('Valid email required').should('not.exist');
    });
  });

  describe('Form Validation - Password', () => {
    it('should show error when password is too short on blur', () => {
      cy.get('input[id="password"]').type('12345').blur();
      cy.wait(100);
      cy.contains('Password must be at least 6 characters').should('be.visible');
    });

    it('should accept password with minimum 6 characters', () => {
      cy.get('input[id="password"]').type('123456').blur();
      cy.wait(100);
      cy.contains('Password must be at least 6 characters').should('not.exist');
    });

    it('should display password strength indicator', () => {
      cy.get('input[id="password"]').type('weak');
      // The PasswordInput component shows strength meter when value exists
      cy.contains(/weak|fair|good|strong/i).should('be.visible');

      cy.get('input[id="password"]').clear().type('StrongPassword123!');
      // Stronger password should show better strength
      cy.contains(/strong|good strength/i).should('be.visible');
    });

    it('should allow toggling password visibility', () => {
      cy.get('input[id="password"]').type('secretpass');
      cy.get('input[id="password"]').should('have.attr', 'type', 'password');

      // Click eye icon to show password
      cy.get('button[aria-label="Show password"]').click();
      cy.get('input[id="password"]').should('have.attr', 'type', 'text');

      // Click again to hide
      cy.get('button[aria-label="Hide password"]').click();
      cy.get('input[id="password"]').should('have.attr', 'type', 'password');
    });
  });

  describe('Form Validation - Confirm Password', () => {
    it('should show error when passwords do not match', () => {
      cy.get('input[id="password"]').type('Password123!');
      cy.get('input[id="confirmPassword"]').type('DifferentPassword123!').blur();
      cy.wait(100);

      cy.contains("Passwords don't match").should('be.visible');
    });

    it('should show success indicator when passwords match', () => {
      cy.get('input[id="password"]').type('Password123!');
      cy.get('input[id="confirmPassword"]').type('Password123!');
      cy.wait(100);

      cy.contains('Passwords match').should('be.visible');
    });

    it('should show mismatch warning dynamically', () => {
      cy.get('input[id="password"]').type('Password123!');
      cy.get('input[id="confirmPassword"]').type('Password123');
      cy.wait(100);

      // Should show "do not match" message
      cy.contains('Passwords do not match').should('be.visible');

      // Complete the password - should show match
      cy.get('input[id="confirmPassword"]').type('!');
      cy.wait(100);
      cy.contains('Passwords match').should('be.visible');
    });
  });

  describe('Form Validation - Submit All Fields', () => {
    it('should validate all fields on submit when form is empty', () => {
      cy.contains('button', 'Create Account').click();

      // All field errors should be visible
      cy.contains('First name is required').should('be.visible');
      cy.contains('Last name is required').should('be.visible');
      cy.contains('Valid email required').should('be.visible');
      cy.contains('Password must be at least 6 characters').should('be.visible');
    });

    it('should not submit form with validation errors', () => {
      cy.get('input[name="firstName"]').type('John');
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[id="password"]').type('123');

      cy.contains('button', 'Create Account').click();

      // Should stay on sign-up page
      cy.url().should('include', '/sign-up');
      cy.contains('Valid email required').should('be.visible');
    });
  });

  describe('Successful Sign-Up Flow', () => {
    it('should successfully create a new account', () => {
      // Fill in all fields with valid data
      cy.get('input[name="firstName"]').type(testFirstName);
      cy.get('input[name="lastName"]').type(testLastName);
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[id="password"]').type(testPassword);
      cy.get('input[id="confirmPassword"]').type(testPassword);

      // Submit form
      cy.contains('button', 'Create Account').click();

      // Should show success screen with confirmation message
      cy.contains('Check Your Email', { timeout: 10000 }).should('be.visible');
      cy.contains(testEmail).should('be.visible');
    });

    it('should display email verification instructions', () => {
      cy.get('input[name="firstName"]').type(testFirstName);
      cy.get('input[name="lastName"]').type(testLastName);
      cy.get('input[name="email"]').type(`verify-${timestamp}@example.com`);
      cy.get('input[id="password"]').type(testPassword);
      cy.get('input[id="confirmPassword"]').type(testPassword);

      cy.contains('button', 'Create Account').click();

      // Should show instructions
      cy.contains('Check Your Email', { timeout: 10000 }).should('be.visible');
      cy.contains('What to do next:').should('be.visible');
      cy.contains('Check your inbox (and spam folder)').should('be.visible');
      cy.contains('Click the verification link').should('be.visible');
    });

    it('should show resend email option after delay', () => {
      cy.get('input[name="firstName"]').type(testFirstName);
      cy.get('input[name="lastName"]').type(testLastName);
      cy.get('input[name="email"]').type(`resend-${timestamp}@example.com`);
      cy.get('input[id="password"]').type(testPassword);
      cy.get('input[id="confirmPassword"]').type(testPassword);

      cy.contains('button', 'Create Account').click();

      cy.contains('Check Your Email', { timeout: 10000 }).should('be.visible');

      // Wait for resend button to appear (5 seconds according to useSignUpLogic)
      cy.contains(/resend|didn't receive/i, { timeout: 6000 }).should('be.visible');
    });

    it('should have continue to sign in button', () => {
      cy.get('input[name="firstName"]').type(testFirstName);
      cy.get('input[name="lastName"]').type(testLastName);
      cy.get('input[name="email"]').type(`signin-${timestamp}@example.com`);
      cy.get('input[id="password"]').type(testPassword);
      cy.get('input[id="confirmPassword"]').type(testPassword);

      cy.contains('button', 'Create Account').click();

      cy.contains('Check Your Email', { timeout: 10000 }).should('be.visible');
      cy.contains('button', 'Continue to Sign In').should('be.visible').click();

      cy.url().should('include', '/sign-in');
    });

    it('should show loading state during submission', () => {
      cy.get('input[name="firstName"]').type(testFirstName);
      cy.get('input[name="lastName"]').type(testLastName);
      cy.get('input[name="email"]').type(`loading-${timestamp}@example.com`);
      cy.get('input[id="password"]').type(testPassword);
      cy.get('input[id="confirmPassword"]').type(testPassword);

      // Intercept the sign-up request to add delay
      cy.intercept('POST', '**/auth/v1/signup*', (req) => {
        req.reply((res) => {
          res.delay = 500;
          return res;
        });
      }).as('signUpRequest');

      cy.contains('button', 'Create Account').click();

      // Button should show loading state
      cy.contains('button', 'Creating Account...').should('be.visible');
      cy.contains('button', 'Create Account').should('be.disabled');

      cy.wait('@signUpRequest');
    });
  });

  describe('Duplicate Email Handling', () => {
    it('should show error when email is already registered', () => {
      // Use known existing email from seed data
      const existingEmail = Cypress.env('TEST_ADMIN_EMAIL');

      cy.get('input[name="firstName"]').type(testFirstName);
      cy.get('input[name="lastName"]').type(testLastName);
      cy.get('input[name="email"]').type(existingEmail);
      cy.get('input[id="password"]').type(testPassword);
      cy.get('input[id="confirmPassword"]').type(testPassword);

      cy.contains('button', 'Create Account').click();

      // Should show helpful error message
      cy.contains(/already registered|already been registered/i, { timeout: 10000 }).should(
        'be.visible'
      );
      cy.contains(/sign in|forgot password/i).should('be.visible');
    });

    it('should remain on sign-up page after duplicate email error', () => {
      const existingEmail = Cypress.env('TEST_ADMIN_EMAIL');

      cy.get('input[name="firstName"]').type(testFirstName);
      cy.get('input[name="lastName"]').type(testLastName);
      cy.get('input[name="email"]').type(existingEmail);
      cy.get('input[id="password"]').type(testPassword);
      cy.get('input[id="confirmPassword"]').type(testPassword);

      cy.contains('button', 'Create Account').click();

      cy.url({ timeout: 10000 }).should('include', '/sign-up');
      cy.get('input[name="email"]').should('be.visible').and('have.value', existingEmail);
    });
  });

  describe('Email Verification Flow', () => {
    /**
     * NOTE: Email verification is DISABLED in local Supabase (enable_confirmations = false).
     * These tests verify the UI flow, but users can sign in immediately without verification.
     * In production with email verification enabled, these scenarios would be enforced.
     */

    it.skip('should not allow login before email verification', () => {
      // SKIPPED: Email verification is disabled in local dev
      // This test would be relevant in production where enable_confirmations = true

      const unverifiedEmail = `unverified-${timestamp}@example.com`;

      // Create account
      cy.get('input[name="firstName"]').type(testFirstName);
      cy.get('input[name="lastName"]').type(testLastName);
      cy.get('input[name="email"]').type(unverifiedEmail);
      cy.get('input[id="password"]').type(testPassword);
      cy.get('input[id="confirmPassword"]').type(testPassword);
      cy.contains('button', 'Create Account').click();

      cy.contains('Check Your Email', { timeout: 10000 }).should('be.visible');

      // Try to sign in without verifying
      cy.visit('/sign-in');
      cy.get('input[name="email"]').type(unverifiedEmail);
      cy.get('input[name="password"]').type(testPassword);
      cy.get('button[type="submit"]').click();

      // Should show error about email verification
      cy.contains(/verify|confirmation|email not confirmed/i, { timeout: 10000 }).should(
        'be.visible'
      );
    });

    it('should display verification success page', () => {
      // Directly visit the verification success page
      cy.visit('/auth/verify-email-success');

      cy.contains('Email Verified Successfully!').should('be.visible');
      cy.contains('Your email has been confirmed').should('be.visible');
      cy.contains('Continue to Sign In').should('be.visible');
    });

    it('should auto-redirect to sign-in from verification success page', () => {
      cy.visit('/auth/verify-email-success');

      cy.contains('Email Verified Successfully!').should('be.visible');

      // Should show countdown
      cy.contains(/redirecting.*\d+ second/i).should('be.visible');

      // Should redirect to sign-in (5 second countdown)
      cy.url({ timeout: 6000 }).should('include', '/sign-in');
    });

    it('should allow canceling auto-redirect on verification page', () => {
      cy.visit('/auth/verify-email-success');

      cy.contains('Cancel auto-redirect').click();

      // Should stop showing countdown
      cy.contains(/redirecting.*second/i).should('not.exist');

      // Should stay on verification page
      cy.wait(3000);
      cy.url().should('include', '/auth/verify-email-success');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('POST', '**/auth/v1/signup*', {
        statusCode: 500,
        body: { error: { message: 'Internal server error' } },
      }).as('signUpError');

      cy.get('input[name="firstName"]').type(testFirstName);
      cy.get('input[name="lastName"]').type(testLastName);
      cy.get('input[name="email"]').type(`error-${timestamp}@example.com`);
      cy.get('input[id="password"]').type(testPassword);
      cy.get('input[id="confirmPassword"]').type(testPassword);

      cy.contains('button', 'Create Account').click();

      // Should show error message
      cy.contains(/error|failed|try again/i, { timeout: 10000 }).should('be.visible');

      // Should remain on sign-up page
      cy.url().should('include', '/sign-up');
    });

    it('should handle special characters in names', () => {
      const specialNames = {
        firstName: "O'Brien",
        lastName: 'José-María',
      };

      cy.get('input[name="firstName"]').type(specialNames.firstName);
      cy.get('input[name="lastName"]').type(specialNames.lastName);
      cy.get('input[name="email"]').type(`special-${timestamp}@example.com`);
      cy.get('input[id="password"]').type(testPassword);
      cy.get('input[id="confirmPassword"]').type(testPassword);

      cy.contains('button', 'Create Account').click();

      // Should accept special characters
      cy.contains('Check Your Email', { timeout: 10000 }).should('be.visible');
    });

    it('should handle very long but valid email addresses', () => {
      // RFC 5321 allows up to 64 characters before @ and 255 total
      const longEmail = `very.long.email.address.for.testing.purposes.${timestamp}@example.com`;

      cy.get('input[name="firstName"]').type(testFirstName);
      cy.get('input[name="lastName"]').type(testLastName);
      cy.get('input[name="email"]').type(longEmail);
      cy.get('input[id="password"]').type(testPassword);
      cy.get('input[id="confirmPassword"]').type(testPassword);

      cy.contains('button', 'Create Account').click();

      cy.contains('Check Your Email', { timeout: 10000 }).should('be.visible');
    });

    it('should trim whitespace from email', () => {
      const emailWithSpaces = `  trimtest-${timestamp}@example.com  `;

      cy.get('input[name="firstName"]').type(testFirstName);
      cy.get('input[name="lastName"]').type(testLastName);
      cy.get('input[name="email"]').type(emailWithSpaces);
      cy.get('input[id="password"]').type(testPassword);
      cy.get('input[id="confirmPassword"]').type(testPassword);

      cy.contains('button', 'Create Account').click();

      // Should accept email with trimmed spaces
      cy.contains('Check Your Email', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Google OAuth Sign-Up', () => {
    it('should have Google sign-up button', () => {
      cy.contains('button', /google/i).should('be.visible').and('not.be.disabled');
    });

    it('should be separated from email sign-up with divider', () => {
      cy.contains('Or continue with').should('be.visible');
    });

    it.skip('should initiate Google OAuth flow on click', () => {
      // SKIPPED: OAuth flow requires actual Google authentication
      // This would redirect to Google's login page in real scenario

      cy.intercept('POST', '**/auth/v1/authorize*').as('googleAuth');

      cy.contains('button', /google/i).click();

      // Should initiate OAuth (would redirect in real scenario)
      cy.wait('@googleAuth');
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form inputs', () => {
      cy.get('label[for="firstName"]').should('exist');
      cy.get('label[for="lastName"]').should('exist');
      cy.get('label[for="email"]').should('exist');
      cy.get('label[for="password"]').should('exist');
      cy.get('label[for="confirmPassword"]').should('exist');
    });

    it('should have proper aria attributes for errors', () => {
      cy.get('input[name="email"]').type('invalid').blur();

      cy.get('input[name="email"]').should('have.attr', 'aria-invalid', 'true');
    });

    it('should be keyboard navigable', () => {
      // Verify all form inputs can be focused with keyboard
      cy.get('input[name="firstName"]').should('be.visible').focus();
      cy.focused().should('have.attr', 'name', 'firstName');

      cy.get('input[name="lastName"]').focus();
      cy.focused().should('have.attr', 'name', 'lastName');

      cy.get('input[name="email"]').focus();
      cy.focused().should('have.attr', 'name', 'email');

      cy.get('input[id="password"]').focus();
      cy.focused().should('have.attr', 'id', 'password');
    });

    it('should support screen readers with proper text alternatives', () => {
      // Check that icons have proper aria-labels or are aria-hidden
      cy.get('svg').each(($svg) => {
        const hasAriaLabel = $svg.attr('aria-label');
        const isAriaHidden = $svg.attr('aria-hidden');
        expect(hasAriaLabel || isAriaHidden).to.exist;
      });
    });
  });

  describe('Security Features', () => {
    it('should mask password by default', () => {
      cy.get('input[id="password"]').should('have.attr', 'type', 'password');
      cy.get('input[id="confirmPassword"]').should('have.attr', 'type', 'password');
    });

    it('should have autocomplete attributes for password managers', () => {
      cy.get('input[id="password"]').should('have.attr', 'autocomplete', 'new-password');
      cy.get('input[id="confirmPassword"]').should('have.attr', 'autocomplete', 'new-password');
    });

    it('should not expose sensitive data in URL or localStorage on error', () => {
      const existingEmail = Cypress.env('TEST_ADMIN_EMAIL');

      cy.get('input[name="firstName"]').type(testFirstName);
      cy.get('input[name="lastName"]').type(testLastName);
      cy.get('input[name="email"]').type(existingEmail);
      cy.get('input[id="password"]').type(testPassword);
      cy.get('input[id="confirmPassword"]').type(testPassword);

      cy.contains('button', 'Create Account').click();

      // URL should not contain password
      cy.url().should('not.contain', testPassword);

      // Check localStorage doesn't leak password
      cy.window().then((win) => {
        const storage = JSON.stringify(win.localStorage);
        expect(storage).to.not.contain(testPassword);
      });
    });
  });
});
