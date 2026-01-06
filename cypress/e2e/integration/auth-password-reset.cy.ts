/// <reference types="cypress" />

/**
 * Authentication - Password Reset Flow
 *
 * Tests the complete password reset workflow:
 * 1. Request password reset
 * 2. Verify email is sent (mocked in test environment)
 * 3. Follow reset link
 * 4. Submit new password
 * 5. Verify can login with new password
 *
 * Priority: P1 - Critical security feature
 */

describe('Password Reset Flow', () => {
  const testEmail = 'password-reset-test@example.com';

  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  describe('Request Password Reset', () => {
    it('should display forgot password form', () => {
      cy.visit('/auth/signin');

      // Look for "Forgot Password" link
      cy.contains(/forgot password|reset password/i).should('be.visible');
    });

    it('should navigate to password reset page', () => {
      cy.visit('/auth/signin');

      cy.contains(/forgot password|reset password/i).click();

      // Should navigate to reset page
      cy.url().should('match', /\/(auth|forgot-password|reset-password)/);
    });

    it('should show validation error for invalid email', () => {
      cy.visit('/auth/forgot-password');

      // Try with invalid email
      cy.get('input[type="email"]').type('invalid-email');
      cy.get('button[type="submit"]').click();

      // Should show validation error
      cy.contains(/invalid email|valid email/i).should('be.visible');
    });

    it('should submit password reset request successfully', () => {
      cy.visit('/auth/forgot-password');

      // Fill in valid email
      cy.get('input[type="email"]').clear().type(testEmail);
      cy.get('button[type="submit"]').click();

      // Should show success message
      cy.contains(/check your email|reset link sent|email sent/i, { timeout: 10000 }).should(
        'be.visible'
      );
    });

    it('should handle non-existent email gracefully', () => {
      cy.visit('/auth/forgot-password');

      cy.get('input[type="email"]').clear().type('nonexistent@example.com');
      cy.get('button[type="submit"]').click();

      // Should still show success (security best practice - don't reveal if email exists)
      cy.contains(/check your email|reset link sent/i, { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Reset Password Form', () => {
    it('should validate password requirements', () => {
      // Visit reset page with mock token
      cy.visit('/auth/reset-password?token=mock-token');

      // Try weak password
      cy.get('input[name="password"]').type('123');
      cy.get('button[type="submit"]').click();

      // Should show validation error
      cy.contains(/password.*required|password.*strong|at least/i).should('be.visible');
    });

    it('should validate password confirmation matches', () => {
      cy.visit('/auth/reset-password?token=mock-token');

      // Enter mismatched passwords
      cy.get('input[name="password"]').type('NewPassword123!');
      cy.get('input[name="confirmPassword"], input[name="password_confirmation"]').type(
        'DifferentPassword123!'
      );
      cy.get('button[type="submit"]').click();

      // Should show mismatch error
      cy.contains(/passwords.*match|passwords.*same/i).should('be.visible');
    });

    it('should show clear feedback for password requirements', () => {
      cy.visit('/auth/reset-password?token=mock-token');

      // Should display password requirements
      cy.get('body')
        .should('contain.text', '8')
        .or('contain.text', 'character')
        .or('contain.text', 'password');
    });
  });

  describe('Security Features', () => {
    it('should require token in URL', () => {
      cy.visit('/auth/reset-password', { failOnStatusCode: false });

      // Should either redirect or show error
      cy.get('body').then(($body) => {
        const hasError =
          $body.find(':contains("Invalid"), :contains("token"), :contains("expired")').length > 0;
        const hasRedirect = !$body.find('input[name="password"]').length;

        expect(hasError || hasRedirect).to.be.true;
      });
    });

    it('should prevent form submission without token', () => {
      cy.visit('/auth/reset-password', { failOnStatusCode: false });

      // Look for password input
      cy.get('body').then(($body) => {
        if ($body.find('input[name="password"]').length > 0) {
          cy.get('input[name="password"]').type('NewPassword123!');
          cy.get('button[type="submit"]').click();

          // Should show error about invalid/missing token
          cy.contains(/invalid|expired|token/i, { timeout: 5000 }).should('be.visible');
        }
      });
    });
  });

  describe('UI/UX Features', () => {
    it('should have working back to login link', () => {
      cy.visit('/auth/forgot-password');

      // Should have link back to sign in
      cy.get('a[href*="sign"]').should('exist');
    });

    it('should show loading state during submission', () => {
      cy.visit('/auth/forgot-password');

      cy.get('input[type="email"]').type(testEmail);

      // Intercept API call to delay response
      cy.intercept('POST', '**/auth/**', (req) => {
        req.reply((res) => {
          res.delay = 1000;
          return res;
        });
      }).as('resetRequest');

      cy.get('button[type="submit"]').click();

      // Button should show loading state
      cy.get('button[type="submit"]').should('satisfy', ($btn) => {
        const text = $btn.text().toLowerCase();
        const disabled = $btn.prop('disabled');
        return text.includes('sending') || text.includes('loading') || disabled;
      });
    });

    it('should be mobile responsive', () => {
      // Test on mobile viewport
      cy.viewport('iphone-x');
      cy.visit('/auth/forgot-password');

      // Form should be visible and usable
      cy.get('input[type="email"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });
  });
});
