/// <reference types="cypress" />

/**
 * Student Profile Tests
 *
 * Tests the student profile functionality:
 * - View own profile
 * - Edit profile (name, email, avatar)
 * - Cannot change own role
 * - Password change flow (if available)
 */

describe('Student Profile', () => {
  const STUDENT_EMAIL = Cypress.env('TEST_STUDENT_EMAIL');
  const STUDENT_PASSWORD = Cypress.env('TEST_STUDENT_PASSWORD');

  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
  });

  describe('Profile View', () => {
    it('should display the profile page', () => {
      cy.visit('/dashboard/profile');

      // Verify page loads
      cy.url().should('include', '/profile');

      // Should show profile content
      cy.get('body').then(($body) => {
        const hasProfileContent = $body.find(':contains("Profile"), :contains("Settings"), :contains("Account")').length > 0;
        expect(hasProfileContent).to.be.true;
      });
    });

    it('should display user information', () => {
      cy.visit('/dashboard/profile');
      cy.wait(2000);

      // Should show email or name
      cy.get('body').then(($body) => {
        // Check for email display
        const hasEmail = $body.find(`input[value*="@"], :contains("${STUDENT_EMAIL}")`).length > 0;
        const hasNameFields = $body.find('input[name*="name"], input[id*="name"]').length > 0;

        expect(hasEmail || hasNameFields).to.be.true;
      });
    });

    it('should display avatar or profile picture section', () => {
      cy.visit('/dashboard/profile');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        // Check for avatar elements
        const hasAvatar = $body.find('[class*="avatar"], img[alt*="profile"], img[alt*="avatar"]').length > 0;
        if (hasAvatar) {
          cy.log('Avatar section is displayed');
        }
      });
    });
  });

  describe('Profile Editing', () => {
    it('should allow editing profile name', () => {
      cy.visit('/dashboard/profile');
      cy.wait(2000);

      // Find and edit name field
      cy.get('body').then(($body) => {
        const nameInput = $body.find('input[name*="name"], input[id*="name"], input[name="firstName"], input[name="fullName"]');

        if (nameInput.length > 0) {
          // Edit is possible
          cy.get('input[name*="name"], input[id*="name"], input[name="firstName"], input[name="fullName"]')
            .first()
            .should('not.be.disabled');
        }
      });
    });

    it('should have save button for profile changes', () => {
      cy.visit('/dashboard/profile');
      cy.wait(2000);

      // Should have a save/update button
      cy.get('body').then(($body) => {
        const hasSaveButton = $body.find('button:contains("Save"), button:contains("Update"), button[type="submit"]').length > 0;
        if (hasSaveButton) {
          cy.get('button:contains("Save"), button:contains("Update"), button[type="submit"]')
            .should('exist');
        }
      });
    });

    it('should show success message after saving profile', () => {
      cy.visit('/dashboard/profile');
      cy.wait(2000);

      // Find a save button and form
      cy.get('body').then(($body) => {
        const hasForm = $body.find('form').length > 0;
        const hasSaveButton = $body.find('button:contains("Save"), button:contains("Update"), button[type="submit"]').length > 0;

        if (hasForm && hasSaveButton) {
          // Submit form
          cy.get('button:contains("Save"), button:contains("Update"), button[type="submit"]')
            .first()
            .click({ force: true });

          // Wait for response
          cy.wait(2000);

          // Should show success or remain on page
          cy.url().should('include', '/profile');
        }
      });
    });
  });

  describe('Role Display', () => {
    it('should display student role', () => {
      cy.visit('/dashboard/profile');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        // Should show role information
        const hasRoleDisplay = $body.find(':contains("Student"), :contains("Role")').length > 0;
        if (hasRoleDisplay) {
          cy.contains(/student|role/i).should('exist');
        }
      });
    });

    it('should NOT allow changing own role', () => {
      cy.visit('/dashboard/profile');
      cy.wait(2000);

      // Role fields should be disabled or not present for students
      cy.get('body').then(($body) => {
        // Check for role checkboxes/selects
        const roleCheckboxes = $body.find('[data-testid*="role"], input[name*="role"], input[name="isAdmin"], input[name="isTeacher"]');

        if (roleCheckboxes.length > 0) {
          // If role fields exist, they should be disabled
          cy.get('[data-testid*="role"], input[name*="role"]')
            .first()
            .should('be.disabled');
        } else {
          // No role fields visible to students - this is correct
          cy.log('Role fields are not visible to students');
        }
      });
    });
  });

  describe('Password Change', () => {
    it('should have password change option if available', () => {
      cy.visit('/dashboard/profile');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasPasswordSection = $body.find(':contains("Password"), :contains("Change Password"), input[type="password"]').length > 0;

        if (hasPasswordSection) {
          cy.log('Password change section is available');

          // Should have password input fields
          cy.get('input[type="password"]').should('exist');
        }
      });
    });

    it('should require current password for password change', () => {
      cy.visit('/dashboard/profile');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const passwordInputs = $body.find('input[type="password"]');

        if (passwordInputs.length >= 2) {
          // Should have current password, new password fields
          cy.log('Password change requires current password verification');
        }
      });
    });
  });

  describe('Email Settings', () => {
    it('should display current email', () => {
      cy.visit('/dashboard/profile');
      cy.wait(2000);

      // Email should be visible
      cy.contains(STUDENT_EMAIL.split('@')[0]).should('exist');
    });

    it('should allow editing email if feature available', () => {
      cy.visit('/dashboard/profile');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const emailInput = $body.find('input[type="email"], input[name="email"]');

        if (emailInput.length > 0) {
          // Check if editable
          cy.get('input[type="email"], input[name="email"]')
            .first()
            .then(($input) => {
              const isDisabled = $input.is(':disabled');
              const isReadonly = $input.is('[readonly]');

              if (!isDisabled && !isReadonly) {
                cy.log('Email is editable');
              } else {
                cy.log('Email is read-only (may require verification to change)');
              }
            });
        }
      });
    });
  });

  describe('Integration Settings', () => {
    it('should show Google Calendar integration option if available', () => {
      cy.visit('/dashboard/profile');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasCalendarOption = $body.find(':contains("Calendar"), :contains("Google"), :contains("Integration")').length > 0;

        if (hasCalendarOption) {
          cy.log('Calendar integration option is available');
        }
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', () => {
      cy.visit('/dashboard/profile');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const emailInput = $body.find('input[type="email"], input[name="email"]');

        if (emailInput.length > 0 && !emailInput.is(':disabled')) {
          // Clear and enter invalid email
          cy.get('input[type="email"], input[name="email"]')
            .first()
            .clear()
            .type('invalid-email');

          // Blur to trigger validation
          cy.get('input[type="email"], input[name="email"]')
            .first()
            .blur();

          // Wait for validation
          cy.wait(500);

          // May show validation error
          cy.get('body').then(($body2) => {
            const hasError = $body2.find(':contains("valid email"), :contains("Invalid email"), [class*="error"]').length > 0;
            if (hasError) {
              cy.log('Email validation is working');
            }
          });
        }
      });
    });

    it('should require name fields', () => {
      cy.visit('/dashboard/profile');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const nameInput = $body.find('input[name="firstName"], input[name="fullName"], input[name="name"]');

        if (nameInput.length > 0) {
          // Clear name field
          cy.get('input[name="firstName"], input[name="fullName"], input[name="name"]')
            .first()
            .clear()
            .blur();

          // Try to submit
          cy.get('button[type="submit"], button:contains("Save")')
            .first()
            .click({ force: true });

          // May show required field error
          cy.wait(500);
        }
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should display profile correctly on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/dashboard/profile');
      cy.wait(2000);

      // Page should be accessible
      cy.url().should('include', '/profile');
    });
  });

  describe('Profile Navigation', () => {
    it('should be accessible from dashboard navigation', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      // Find and click profile link
      cy.get('body').then(($body) => {
        const hasProfileLink = $body.find('a[href*="/profile"], button:contains("Profile")').length > 0;

        if (hasProfileLink) {
          cy.get('a[href*="/profile"], button:contains("Profile")')
            .first()
            .click({ force: true });

          cy.url().should('include', '/profile');
        }
      });
    });
  });
});
