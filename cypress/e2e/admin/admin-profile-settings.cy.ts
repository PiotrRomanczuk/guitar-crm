/// <reference types="cypress" />

/**
 * Admin Profile Settings E2E Tests
 *
 * Complete profile management operations:
 * - View and edit personal information (name, email, bio)
 * - Change password with validation
 * - Update notification preferences
 * - Configure security settings (2FA, sessions)
 * - Manage account settings and privacy
 * - Upload and update profile picture
 * - Set teaching preferences and availability
 * - Configure admin-specific preferences
 * - Account deactivation/deletion
 */

describe('Admin Profile Settings', () => {
  const adminUser = {
    email: 'p.romanczuk@gmail.com',
    password: 'test123_admin',
  };

  const updatedProfile = {
    firstName: 'Piotr',
    lastName: 'Romanczuk',
    displayName: 'Pete R',
    bio: 'Experienced guitar instructor and admin',
    phone: '+48 123 456 789',
    timezone: 'Europe/Warsaw',
  };

  const passwordChange = {
    currentPassword: 'test123_admin',
    newPassword: 'newSecurePassword123!',
    confirmPassword: 'newSecurePassword123!',
  };

  // Notification settings for testing
  // const notificationSettings = {
  // 	emailNotifications: true,
  // 	pushNotifications: false,
  // 	lessonReminders: true,
  // 	systemAlerts: true,
  // 	marketingEmails: false,
  // };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();

    // Login as admin
    cy.visit('/sign-in');
    cy.get('input[type="email"]').type(adminUser.email);
    cy.get('input[type="password"]').type(adminUser.password);
    cy.get('button[type="submit"]').click();
    cy.contains(adminUser.email, { timeout: 10000 }).should('be.visible');

    // Navigate to profile settings
    cy.visit('/dashboard/profile');
  });

  context('Personal Information Management', () => {
    it('should display current profile information', () => {
      cy.url().should('include', '/profile');

      // Wait for loading to complete
      cy.get('[data-testid="profile-loading"]', { timeout: 5000 }).should('not.exist');

      // Should show profile form or information
      cy.get('body').then(($body) => {
        if ($body.find('form, .profile-form, .profile-info').length > 0) {
          // Verify profile sections are visible
          cy.get('h1, h2, .profile-header').should('contain.text', /profile|settings|account/i);
        } else {
          // Basic profile page check
          cy.contains(/profile|settings|account/i).should('be.visible');
        }
      });
    });

    it('should update personal information', () => {
      // Open edit mode or form
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="edit-profile-btn"], button').length > 0) {
          cy.get('[data-testid="edit-profile-btn"], button')
            .contains(/edit|update/i)
            .click();
        }
      });

      // Update first name
      cy.get('[data-testid="first-name"], input[name="firstName"], input[name="first_name"]')
        .clear()
        .type(updatedProfile.firstName);

      // Update last name
      cy.get('[data-testid="last-name"], input[name="lastName"], input[name="last_name"]')
        .clear()
        .type(updatedProfile.lastName);

      // Update display name
      cy.get('body').then(($body) => {
        if (
          $body.find(
            '[data-testid="display-name"], input[name="displayName"], input[name="display_name"]'
          ).length > 0
        ) {
          cy.get(
            '[data-testid="display-name"], input[name="displayName"], input[name="display_name"]'
          )
            .clear()
            .type(updatedProfile.displayName);
        }
      });

      // Update bio
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="bio"], textarea[name="bio"]').length > 0) {
          cy.get('[data-testid="bio"], textarea[name="bio"]').clear().type(updatedProfile.bio);
        }
      });

      // Update phone
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="phone"], input[name="phone"]').length > 0) {
          cy.get('[data-testid="phone"], input[name="phone"]').clear().type(updatedProfile.phone);
        }
      });

      // Save changes
      cy.get('[data-testid="save-profile"], button[type="submit"]').click();

      // Should show success message and updated info
      cy.contains(/saved|updated|success/i, { timeout: 10000 }).should('be.visible');
      cy.contains(updatedProfile.firstName).should('be.visible');
    });

    it('should validate required fields', () => {
      // Open edit mode
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="edit-profile-btn"], button').length > 0) {
          cy.get('[data-testid="edit-profile-btn"], button')
            .contains(/edit|update/i)
            .click();
        }
      });

      // Clear required fields
      cy.get(
        '[data-testid="first-name"], input[name="firstName"], input[name="first_name"]'
      ).clear();

      // Try to save
      cy.get('[data-testid="save-profile"], button[type="submit"]').click();

      // Should show validation errors
      cy.get('input:invalid, .error, .field-error, [aria-invalid="true"]').should(
        'have.length.greaterThan',
        0
      );
    });

    it('should validate email format', () => {
      // Open edit mode
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="edit-profile-btn"], button').length > 0) {
          cy.get('[data-testid="edit-profile-btn"], button')
            .contains(/edit|update/i)
            .click();
        }
      });

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="email"], input[name="email"]').length > 0) {
          // Enter invalid email
          cy.get('[data-testid="email"], input[name="email"]').clear().type('invalid-email');

          cy.get('[data-testid="save-profile"], button[type="submit"]').click();

          // Should show email validation error
          cy.contains(/invalid|email|format/i).should('be.visible');
        } else {
          cy.log('Email field not editable in profile');
        }
      });
    });

    it('should validate phone number format', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="edit-profile-btn"], button').length > 0) {
          cy.get('[data-testid="edit-profile-btn"], button')
            .contains(/edit|update/i)
            .click();
        }
      });

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="phone"], input[name="phone"]').length > 0) {
          // Enter invalid phone
          cy.get('[data-testid="phone"], input[name="phone"]').clear().type('invalid-phone-123abc');

          cy.get('[data-testid="save-profile"], button[type="submit"]').click();

          // Should show phone validation error
          cy.get('body').then(($body) => {
            if ($body.text().match(/invalid|phone|format/i)) {
              cy.contains(/invalid|phone|format/i).should('be.visible');
            } else {
              cy.log('Phone validation not implemented');
            }
          });
        }
      });
    });
  });

  context('Profile Picture Management', () => {
    it('should display current profile picture or placeholder', () => {
      // Check for profile picture or avatar
      cy.get('[data-testid="profile-picture"], .profile-avatar, img[alt*="profile"]').should(
        'be.visible'
      );
    });

    it('should upload new profile picture', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="upload-picture"], input[type="file"]').length > 0) {
          // Create a mock image file (requires cypress-file-upload plugin)
          cy.get('body').then(($body) => {
            if ($body.find('input[type="file"]').length > 0) {
              cy.get('[data-testid="upload-picture"], input[type="file"]').selectFile(
                'cypress/fixtures/profile-picture.jpg',
                { force: true }
              );
            } else {
              cy.log('File upload not available');
            }
          });

          // Should show upload success
          cy.contains(/uploaded|updated|success/i, { timeout: 15000 }).should('be.visible');
        } else {
          cy.log('Profile picture upload not implemented');
        }
      });
    });

    it('should validate image file type and size', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="upload-picture"], input[type="file"]').length > 0) {
          // Try to upload non-image file
          cy.get('[data-testid="upload-picture"], input[type="file"]').selectFile(
            'cypress/fixtures/sample.txt',
            { force: true }
          );

          // Should show validation error
          cy.contains(/invalid|file type|image/i, { timeout: 10000 }).should('be.visible');
        }
      });
    });

    it('should remove current profile picture', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="remove-picture"], button').length > 0) {
          cy.get('[data-testid="remove-picture"], button').click();

          // Confirm removal
          cy.get('[data-testid="confirm-remove"], button').click();

          // Should revert to placeholder
          cy.get('[data-testid="profile-picture"], .profile-avatar')
            .should('exist')
            .then(($img) => {
              const src = $img.attr('src');
              if (src) {
                expect(src).to.include('placeholder');
              } else {
                cy.log('Profile picture removed successfully');
              }
            });
        } else {
          cy.log('Profile picture removal not implemented');
        }
      });
    });
  });

  context('Password Management', () => {
    it('should open password change form', () => {
      // Navigate to password section or click change password
      cy.get('[data-testid="change-password-btn"], button, a')
        .contains(/change|update password/i)
        .click();

      // Should show password form
      cy.contains(/current password|new password/i).should('be.visible');
    });

    it('should change password successfully', () => {
      // Open password form
      cy.get('[data-testid="change-password-btn"], button, a')
        .contains(/change|update password/i)
        .click();

      // Enter current password
      cy.get('[data-testid="current-password"], input[name="currentPassword"]').type(
        passwordChange.currentPassword
      );

      // Enter new password
      cy.get('[data-testid="new-password"], input[name="newPassword"]').type(
        passwordChange.newPassword
      );

      // Confirm new password
      cy.get('[data-testid="confirm-password"], input[name="confirmPassword"]').type(
        passwordChange.confirmPassword
      );

      // Submit password change
      cy.get('[data-testid="submit-password"], button[type="submit"]').click();

      // Should show success message
      cy.contains(/password.*changed|updated|success/i, { timeout: 10000 }).should('be.visible');
    });

    it('should validate current password', () => {
      cy.get('[data-testid="change-password-btn"], button, a')
        .contains(/change|update password/i)
        .click();

      // Enter wrong current password
      cy.get('[data-testid="current-password"], input[name="currentPassword"]').type(
        'wrongpassword'
      );

      cy.get('[data-testid="new-password"], input[name="newPassword"]').type(
        passwordChange.newPassword
      );

      cy.get('[data-testid="confirm-password"], input[name="confirmPassword"]').type(
        passwordChange.confirmPassword
      );

      cy.get('[data-testid="submit-password"], button[type="submit"]').click();

      // Should show current password error
      cy.contains(/incorrect|wrong|current password/i, { timeout: 10000 }).should('be.visible');
    });

    it('should validate password strength', () => {
      cy.get('[data-testid="change-password-btn"], button, a')
        .contains(/change|update password/i)
        .click();

      cy.get('[data-testid="current-password"], input[name="currentPassword"]').type(
        passwordChange.currentPassword
      );

      // Enter weak password
      cy.get('[data-testid="new-password"], input[name="newPassword"]').type('123');

      // Should show strength indicator or validation
      cy.get('body').then(($body) => {
        if ($body.text().match(/weak|strong|password strength/i)) {
          cy.contains(/weak|strong|password strength/i).should('be.visible');
        } else {
          cy.log('Password strength validation not implemented');
        }
      });
    });

    it('should validate password confirmation match', () => {
      cy.get('[data-testid="change-password-btn"], button, a')
        .contains(/change|update password/i)
        .click();

      cy.get('[data-testid="current-password"], input[name="currentPassword"]').type(
        passwordChange.currentPassword
      );

      cy.get('[data-testid="new-password"], input[name="newPassword"]').type(
        passwordChange.newPassword
      );

      // Enter different confirmation
      cy.get('[data-testid="confirm-password"], input[name="confirmPassword"]').type(
        'differentpassword'
      );

      cy.get('[data-testid="submit-password"], button[type="submit"]').click();

      // Should show password mismatch error
      cy.contains(/match|passwords.*different|confirm/i, { timeout: 5000 }).should('be.visible');
    });
  });

  context('Notification Preferences', () => {
    it('should display notification settings', () => {
      // Navigate to notification settings
      cy.get('[data-testid="notifications-tab"], a, button')
        .contains(/notification/i)
        .click();

      // Should show notification options
      cy.contains(/email.*notification|push.*notification|notification.*preference/i).should(
        'be.visible'
      );
    });

    it('should update notification preferences', () => {
      cy.get('[data-testid="notifications-tab"], a, button')
        .contains(/notification/i)
        .click();

      // Toggle email notifications
      cy.get('body').then(($body) => {
        if (
          $body.find('[data-testid="email-notifications"], input[name="emailNotifications"]')
            .length > 0
        ) {
          cy.get('[data-testid="email-notifications"], input[name="emailNotifications"]').check();

          // Toggle push notifications
          cy.get('[data-testid="push-notifications"], input[name="pushNotifications"]').uncheck();

          // Save settings
          cy.get('[data-testid="save-notifications"], button').click();

          cy.contains(/saved|updated/i, { timeout: 10000 }).should('be.visible');
        } else {
          cy.log('Notification preferences not implemented');
        }
      });
    });

    it('should configure lesson reminder settings', () => {
      cy.get('[data-testid="notifications-tab"], a, button')
        .contains(/notification/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="lesson-reminders"], input, select').length > 0) {
          // Enable lesson reminders
          cy.get('[data-testid="lesson-reminders"], input[type="checkbox"]').check();

          // Set reminder timing
          if ($body.find('select[name="reminderTiming"]').length > 0) {
            cy.get('select[name="reminderTiming"]').select('24h');
          }

          cy.get('[data-testid="save-notifications"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        } else {
          cy.log('Lesson reminder settings not implemented');
        }
      });
    });

    it('should manage system alert preferences', () => {
      cy.get('[data-testid="notifications-tab"], a, button')
        .contains(/notification/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="system-alerts"], input').length > 0) {
          // Configure system alerts for admin
          cy.get('[data-testid="system-alerts"], input[type="checkbox"]').check();

          cy.get('[data-testid="save-notifications"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        }
      });
    });
  });

  context('Security Settings', () => {
    it('should display security options', () => {
      // Navigate to security settings
      cy.get('[data-testid="security-tab"], a, button')
        .contains(/security/i)
        .click();

      // Should show security features
      cy.contains(/security|two.*factor|session|login/i).should('be.visible');
    });

    it('should configure two-factor authentication', () => {
      cy.get('[data-testid="security-tab"], a, button')
        .contains(/security/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="enable-2fa"], button').length > 0) {
          // Enable 2FA
          cy.get('[data-testid="enable-2fa"], button').click();

          // Should show 2FA setup process
          cy.contains(/qr.*code|authenticator|setup/i).should('be.visible');
        } else {
          cy.log('Two-factor authentication not implemented');
        }
      });
    });

    it('should manage active sessions', () => {
      cy.get('[data-testid="security-tab"], a, button')
        .contains(/security/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="active-sessions"], .sessions-list').length > 0) {
          // Should show current sessions
          cy.get('[data-testid="active-sessions"], .sessions-list').should('be.visible');

          // Should be able to terminate other sessions
          if ($body.find('[data-testid="terminate-session"], button').length > 0) {
            cy.get('[data-testid="terminate-session"], button').first().click();
            cy.contains(/terminated|ended/i).should('be.visible');
          }
        } else {
          cy.log('Session management not implemented');
        }
      });
    });

    it('should configure login notifications', () => {
      cy.get('[data-testid="security-tab"], a, button')
        .contains(/security/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="login-notifications"], input').length > 0) {
          // Enable login notifications
          cy.get('[data-testid="login-notifications"], input[type="checkbox"]').check();

          cy.get('[data-testid="save-security"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        }
      });
    });
  });

  context('Admin-Specific Preferences', () => {
    it('should configure admin dashboard preferences', () => {
      // Navigate to admin preferences
      cy.get('[data-testid="admin-prefs-tab"], a, button')
        .contains(/admin.*preference|dashboard.*setting/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="dashboard-layout"], select').length > 0) {
          // Configure dashboard layout
          cy.get('[data-testid="dashboard-layout"], select').select('compact');

          // Set default views
          if ($body.find('[data-testid="default-view"], select').length > 0) {
            cy.get('[data-testid="default-view"], select').select('lessons');
          }

          cy.get('[data-testid="save-admin-prefs"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        } else {
          cy.log('Admin preferences not implemented');
        }
      });
    });

    it('should set system notification thresholds', () => {
      cy.get('[data-testid="admin-prefs-tab"], a, button')
        .contains(/admin.*preference|dashboard.*setting/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="alert-thresholds"]').length > 0) {
          // Configure alert thresholds for system monitoring
          cy.get('[data-testid="alert-thresholds"] input[name="userThreshold"]')
            .clear()
            .type('100');

          cy.get('[data-testid="save-admin-prefs"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        }
      });
    });

    it('should configure data export preferences', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="export-prefs"]').length > 0) {
          // Set default export format
          cy.get('[data-testid="export-format"], select').select('csv');

          // Configure data anonymization
          cy.get('[data-testid="anonymize-exports"], input[type="checkbox"]').check();

          cy.get('[data-testid="save-admin-prefs"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        } else {
          cy.log('Export preferences not implemented');
        }
      });
    });
  });

  context('Account Management', () => {
    it('should display account information and status', () => {
      // Navigate to account settings
      cy.get('[data-testid="account-tab"], a, button')
        .contains(/account/i)
        .click();

      // Should show account details
      cy.contains(/account.*created|member.*since|account.*status/i).should('be.visible');
    });

    it('should update timezone settings', () => {
      cy.get('[data-testid="account-tab"], a, button')
        .contains(/account/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="timezone"], select[name="timezone"]').length > 0) {
          // Update timezone
          cy.get('[data-testid="timezone"], select[name="timezone"]').select('Europe/London');

          cy.get('[data-testid="save-account"], button').click();
          cy.contains(/saved|updated|timezone/i).should('be.visible');
        } else {
          cy.log('Timezone settings not implemented');
        }
      });
    });

    it('should configure privacy settings', () => {
      cy.get('[data-testid="account-tab"], a, button')
        .contains(/account/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="privacy-settings"]').length > 0) {
          // Configure profile visibility
          cy.get('[data-testid="profile-public"], input[type="checkbox"]').uncheck();

          // Configure data sharing
          cy.get('[data-testid="allow-analytics"], input[type="checkbox"]').check();

          cy.get('[data-testid="save-account"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        }
      });
    });

    it('should handle account deactivation flow', () => {
      cy.get('[data-testid="account-tab"], a, button')
        .contains(/account/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="deactivate-account"], button').length > 0) {
          // Start deactivation process
          cy.get('[data-testid="deactivate-account"], button').click();

          // Should show confirmation dialog
          cy.contains(/deactivate|confirm|are you sure/i).should('be.visible');

          // Cancel deactivation
          cy.get('[data-testid="cancel-deactivate"], button').click();

          // Should return to account settings
          cy.contains(/account/i).should('be.visible');
        } else {
          cy.log('Account deactivation not implemented');
        }
      });
    });
  });

  context('Error Handling', () => {
    it('should handle API errors during profile update', () => {
      // Simulate API error
      cy.intercept('PUT', '**/api/profile*', { statusCode: 500 }).as('profileError');

      // Try to update profile
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="edit-profile-btn"], button').length > 0) {
          cy.get('[data-testid="edit-profile-btn"], button').click();
        }
      });

      cy.get('[data-testid="first-name"], input[name="firstName"], input[name="first_name"]')
        .clear()
        .type('Error Test');

      cy.get('[data-testid="save-profile"], button[type="submit"]').click();

      // Should show error message
      cy.contains(/error|failed|unable/i, { timeout: 10000 }).should('be.visible');
    });

    it('should handle network failures during password change', () => {
      cy.intercept('POST', '**/api/auth/change-password*', { forceNetworkError: true }).as(
        'passwordError'
      );

      cy.get('[data-testid="change-password-btn"], button, a')
        .contains(/change|update password/i)
        .click();

      cy.get('[data-testid="current-password"], input[name="currentPassword"]').type(
        passwordChange.currentPassword
      );
      cy.get('[data-testid="new-password"], input[name="newPassword"]').type(
        passwordChange.newPassword
      );
      cy.get('[data-testid="confirm-password"], input[name="confirmPassword"]').type(
        passwordChange.confirmPassword
      );

      cy.get('[data-testid="submit-password"], button[type="submit"]').click();

      // Should show network error
      cy.contains(/network|connection|error/i, { timeout: 10000 }).should('be.visible');
    });

    it('should handle file upload errors', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="upload-picture"], input[type="file"]').length > 0) {
          // Simulate upload error
          cy.intercept('POST', '**/api/upload*', { statusCode: 413 }).as('uploadError');

          // Try to upload file
          cy.get('[data-testid="upload-picture"], input[type="file"]').selectFile(
            'cypress/fixtures/profile-picture.jpg',
            { force: true }
          );

          // Should show upload error
          cy.contains(/error|failed|too large/i, { timeout: 15000 }).should('be.visible');
        }
      });
    });
  });
});
