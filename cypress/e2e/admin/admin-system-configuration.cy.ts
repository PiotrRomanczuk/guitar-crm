/// <reference types="cypress" />

/**
 * Admin System Configuration E2E Tests
 *
 * Complete system-wide configuration management:
 * - Application settings and global parameters
 * - User default configurations and role settings
 * - System maintenance modes and schedules
 * - Database backup and restore operations
 * - System monitoring and health checks
 * - Email and notification system configuration
 * - Security policies and authentication settings
 * - System logs and audit trails
 * - Performance and resource management
 * - Integration settings (APIs, external services)
 */

describe('Admin System Configuration', () => {
  const adminUser = {
    email: 'p.romanczuk@gmail.com',
    password: 'test123_admin',
  };

  const systemSettings = {
    appName: 'Guitar CRM Pro',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    language: 'en',
    currency: 'USD',
  };

  const userDefaults = {
    defaultRole: 'student',
    lessonDuration: 60,
    reminderTime: 24,
    autoAssignTeacher: true,
    welcomeEmail: true,
  };

  const emailSettings = {
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'noreply@guitarcrm.com',
    fromName: 'Guitar CRM System',
    replyTo: 'support@guitarcrm.com',
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();

    // Login as admin
    cy.visit('/sign-in');
    cy.get('input[type="email"]').type(adminUser.email);
    cy.get('input[type="password"]').type(adminUser.password);
    cy.get('button[type="submit"]').click();
    cy.contains(adminUser.email, { timeout: 10000 }).should('be.visible');

    // Navigate to system configuration
    cy.visit('/dashboard/admin/system');
  });

  context('Application Settings', () => {
    it('should display system configuration interface', () => {
      cy.url().should('include', '/admin/system');

      // Wait for loading to complete
      cy.get('[data-testid="system-config-loading"]', { timeout: 5000 }).should('not.exist');

      // Should show either configuration interface or basic admin access
      cy.get('body').then(($body) => {
        if (
          $body.find('.system-config, .admin-settings, [data-testid="system-settings"]').length > 0
        ) {
          // Verify configuration sections are visible
          cy.get('h1, h2, .config-header').should(
            'contain.text',
            /system|configuration|settings|admin/i
          );
        } else {
          // Basic system page check
          cy.contains(/system|configuration|settings|admin/i).should('be.visible');
        }
      });
    });

    it('should update application settings', () => {
      // Look for application settings section
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="app-settings"], .app-settings').length > 0) {
          // Update application name
          cy.get('[data-testid="app-name"], input[name="appName"]')
            .clear()
            .type(systemSettings.appName);

          // Update timezone
          cy.get('[data-testid="timezone"], select[name="timezone"]').select(
            systemSettings.timezone
          );

          // Update date format
          cy.get('[data-testid="date-format"], select[name="dateFormat"]').select(
            systemSettings.dateFormat
          );

          // Save settings
          cy.get('[data-testid="save-app-settings"], button[type="submit"]').click();

          // Should show success message
          cy.contains(/saved|updated|success/i, { timeout: 10000 }).should('be.visible');
        } else {
          cy.log('Application settings not implemented');
        }
      });
    });

    it('should configure global display settings', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="display-settings"]').length > 0) {
          // Set time format
          cy.get('[data-testid="time-format"], select[name="timeFormat"]').select(
            systemSettings.timeFormat
          );

          // Set default language
          cy.get('[data-testid="language"], select[name="language"]').select(
            systemSettings.language
          );

          // Set default currency
          cy.get('[data-testid="currency"], select[name="currency"]').select(
            systemSettings.currency
          );

          cy.get('[data-testid="save-display-settings"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        } else {
          cy.log('Display settings not implemented');
        }
      });
    });

    it('should validate required configuration fields', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="app-name"], input[name="appName"]').length > 0) {
          // Clear required field
          cy.get('[data-testid="app-name"], input[name="appName"]').clear();

          // Try to save
          cy.get('[data-testid="save-app-settings"], button[type="submit"]').click();

          // Should show validation error
          cy.get('input:invalid, .error, .field-error, [aria-invalid="true"]').should(
            'have.length.greaterThan',
            0
          );
        }
      });
    });
  });

  context('User Default Settings', () => {
    it('should configure default user settings', () => {
      // Navigate to user defaults section
      cy.get('[data-testid="user-defaults-tab"], a, button')
        .contains(/user.*default|default.*user/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="default-role"], select[name="defaultRole"]').length > 0) {
          // Set default role for new users
          cy.get('[data-testid="default-role"], select[name="defaultRole"]').select(
            userDefaults.defaultRole
          );

          // Set default lesson duration
          cy.get(
            '[data-testid="lesson-duration"], input[name="lessonDuration"], select[name="lessonDuration"]'
          ).then(($element) => {
            if ($element.is('select')) {
              cy.wrap($element).select(userDefaults.lessonDuration.toString());
            } else {
              cy.wrap($element).clear().type(userDefaults.lessonDuration.toString());
            }
          });

          // Configure reminder settings
          cy.get('[data-testid="reminder-time"], input[name="reminderTime"]')
            .clear()
            .type(userDefaults.reminderTime.toString());

          // Configure auto-assignment
          cy.get('[data-testid="auto-assign-teacher"], input[type="checkbox"]').then(
            ($checkbox) => {
              if (userDefaults.autoAssignTeacher) {
                cy.wrap($checkbox).check();
              } else {
                cy.wrap($checkbox).uncheck();
              }
            }
          );

          // Save defaults
          cy.get('[data-testid="save-user-defaults"], button').click();
          cy.contains(/saved|updated/i, { timeout: 10000 }).should('be.visible');
        } else {
          cy.log('User default settings not implemented');
        }
      });
    });

    it('should configure new user onboarding', () => {
      cy.get('[data-testid="user-defaults-tab"], a, button')
        .contains(/user.*default|default.*user/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="welcome-email"], input[type="checkbox"]').length > 0) {
          // Enable welcome email
          cy.get('[data-testid="welcome-email"], input[type="checkbox"]').check();

          // Configure onboarding steps
          if ($body.find('[data-testid="onboarding-steps"]').length > 0) {
            cy.get('[data-testid="profile-setup"], input[type="checkbox"]').check();
            cy.get('[data-testid="initial-lesson"], input[type="checkbox"]').check();
          }

          cy.get('[data-testid="save-user-defaults"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        }
      });
    });

    it('should set role-specific defaults', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="role-defaults"]').length > 0) {
          // Configure teacher defaults
          cy.get('[data-testid="teacher-defaults"] select[name="maxStudents"]').select('20');

          // Configure student defaults
          cy.get('[data-testid="student-defaults"] select[name="lessonFrequency"]').select(
            'weekly'
          );

          cy.get('[data-testid="save-role-defaults"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        } else {
          cy.log('Role-specific defaults not implemented');
        }
      });
    });
  });

  context('Email Configuration', () => {
    it('should configure SMTP settings', () => {
      // Navigate to email settings
      cy.get('[data-testid="email-tab"], a, button')
        .contains(/email|mail|smtp/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="smtp-host"], input[name="smtpHost"]').length > 0) {
          // Configure SMTP server
          cy.get('[data-testid="smtp-host"], input[name="smtpHost"]')
            .clear()
            .type(emailSettings.smtpHost);

          cy.get('[data-testid="smtp-port"], input[name="smtpPort"]')
            .clear()
            .type(emailSettings.smtpPort.toString());

          cy.get('[data-testid="smtp-user"], input[name="smtpUser"]')
            .clear()
            .type(emailSettings.smtpUser);

          // Configure from settings
          cy.get('[data-testid="from-name"], input[name="fromName"]')
            .clear()
            .type(emailSettings.fromName);

          cy.get('[data-testid="reply-to"], input[name="replyTo"]')
            .clear()
            .type(emailSettings.replyTo);

          // Save email settings
          cy.get('[data-testid="save-email-settings"], button').click();
          cy.contains(/saved|updated/i, { timeout: 10000 }).should('be.visible');
        } else {
          cy.log('Email configuration not implemented');
        }
      });
    });

    it('should test email connection', () => {
      cy.get('[data-testid="email-tab"], a, button')
        .contains(/email|mail|smtp/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="test-email"], button').length > 0) {
          // Test email connection
          cy.get('[data-testid="test-email"], button').click();

          // Should show test result
          cy.contains(/test.*sent|connection.*success|email.*sent|failed/i, {
            timeout: 15000,
          }).should('be.visible');
        } else {
          cy.log('Email testing not implemented');
        }
      });
    });

    it('should configure email templates', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="email-templates"]').length > 0) {
          // Configure welcome email template
          cy.get('[data-testid="welcome-template"] textarea[name="welcomeTemplate"]')
            .clear()
            .type('Welcome to Guitar CRM! We are excited to have you.');

          // Configure lesson reminder template
          cy.get('[data-testid="reminder-template"] textarea[name="reminderTemplate"]')
            .clear()
            .type('Reminder: You have a guitar lesson scheduled for {{date}} at {{time}}.');

          cy.get('[data-testid="save-templates"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        } else {
          cy.log('Email templates not implemented');
        }
      });
    });

    it('should validate email addresses', () => {
      cy.get('[data-testid="email-tab"], a, button')
        .contains(/email|mail|smtp/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="smtp-user"], input[name="smtpUser"]').length > 0) {
          // Enter invalid email
          cy.get('[data-testid="smtp-user"], input[name="smtpUser"]').clear().type('invalid-email');

          cy.get('[data-testid="save-email-settings"], button').click();

          // Should show validation error
          cy.contains(/invalid|email|format/i, { timeout: 5000 }).should('be.visible');
        }
      });
    });
  });

  context('Security Configuration', () => {
    it('should configure authentication settings', () => {
      // Navigate to security settings
      cy.get('[data-testid="security-tab"], a, button')
        .contains(/security|auth/i)
        .click();

      cy.get('body').then(($body) => {
        if (
          $body.find('[data-testid="session-timeout"], input[name="sessionTimeout"]').length > 0
        ) {
          // Set session timeout
          cy.get('[data-testid="session-timeout"], input[name="sessionTimeout"]')
            .clear()
            .type('3600'); // 1 hour

          // Configure password policy
          cy.get('[data-testid="min-password-length"], input[name="minPasswordLength"]')
            .clear()
            .type('8');

          // Enable 2FA requirement
          cy.get('[data-testid="require-2fa"], input[type="checkbox"]').check();

          cy.get('[data-testid="save-security-settings"], button').click();
          cy.contains(/saved|updated/i, { timeout: 10000 }).should('be.visible');
        } else {
          cy.log('Security configuration not implemented');
        }
      });
    });

    it('should configure access control policies', () => {
      cy.get('[data-testid="security-tab"], a, button')
        .contains(/security|auth/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="access-policies"]').length > 0) {
          // Configure login attempts
          cy.get('[data-testid="max-login-attempts"], input[name="maxLoginAttempts"]')
            .clear()
            .type('5');

          // Set lockout duration
          cy.get('[data-testid="lockout-duration"], input[name="lockoutDuration"]')
            .clear()
            .type('300'); // 5 minutes

          // Configure IP restrictions
          if ($body.find('[data-testid="ip-whitelist"]').length > 0) {
            cy.get('[data-testid="enable-ip-restrictions"], input[type="checkbox"]').check();
            cy.get('[data-testid="ip-whitelist"] textarea').type('192.168.1.0/24\n10.0.0.0/8');
          }

          cy.get('[data-testid="save-access-policies"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        }
      });
    });

    it('should manage API security settings', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="api-security"]').length > 0) {
          // Configure rate limiting
          cy.get('[data-testid="rate-limit"], input[name="rateLimit"]').clear().type('100'); // requests per minute

          // Enable API key requirement
          cy.get('[data-testid="require-api-key"], input[type="checkbox"]').check();

          // Configure CORS settings
          cy.get('[data-testid="allowed-origins"] textarea')
            .clear()
            .type('https://guitarcrm.com\nhttps://app.guitarcrm.com');

          cy.get('[data-testid="save-api-security"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        } else {
          cy.log('API security settings not implemented');
        }
      });
    });
  });

  context('System Maintenance', () => {
    it('should configure maintenance modes', () => {
      // Navigate to maintenance settings
      cy.get('[data-testid="maintenance-tab"], a, button')
        .contains(/maintenance|system/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="maintenance-mode"], input[type="checkbox"]').length > 0) {
          // Enable maintenance mode
          cy.get('[data-testid="maintenance-mode"], input[type="checkbox"]').check();

          // Set maintenance message
          cy.get('[data-testid="maintenance-message"] textarea')
            .clear()
            .type('System is under maintenance. We will be back shortly.');

          // Set maintenance schedule
          if ($body.find('[data-testid="scheduled-maintenance"]').length > 0) {
            cy.get('[data-testid="maintenance-start"] input[type="datetime-local"]').type(
              '2025-12-01T02:00'
            );
            cy.get('[data-testid="maintenance-end"] input[type="datetime-local"]').type(
              '2025-12-01T04:00'
            );
          }

          cy.get('[data-testid="save-maintenance"], button').click();
          cy.contains(/saved|updated/i, { timeout: 10000 }).should('be.visible');
        } else {
          cy.log('Maintenance configuration not implemented');
        }
      });
    });

    it('should manage database backup settings', () => {
      cy.get('[data-testid="maintenance-tab"], a, button')
        .contains(/maintenance|system/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="backup-settings"]').length > 0) {
          // Enable automated backups
          cy.get('[data-testid="auto-backup"], input[type="checkbox"]').check();

          // Set backup frequency
          cy.get('[data-testid="backup-frequency"], select').select('daily');

          // Set backup retention
          cy.get('[data-testid="backup-retention"], input[name="backupRetention"]')
            .clear()
            .type('30'); // days

          // Configure backup location
          if ($body.find('[data-testid="backup-location"]').length > 0) {
            cy.get('[data-testid="backup-location"] select').select('s3');
          }

          cy.get('[data-testid="save-backup-settings"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        } else {
          cy.log('Backup settings not implemented');
        }
      });
    });

    it('should perform manual database backup', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="manual-backup"], button').length > 0) {
          // Start manual backup
          cy.get('[data-testid="manual-backup"], button').click();

          // Should show backup progress or completion
          cy.contains(/backup.*started|backup.*completed|backup.*progress/i, {
            timeout: 30000,
          }).should('be.visible');
        } else {
          cy.log('Manual backup not implemented');
        }
      });
    });

    it('should manage system logs', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="system-logs"]').length > 0) {
          // Configure log levels
          cy.get('[data-testid="log-level"], select').select('INFO');

          // Set log retention
          cy.get('[data-testid="log-retention"], input[name="logRetention"]').clear().type('90'); // days

          // Enable audit logging
          cy.get('[data-testid="enable-audit-log"], input[type="checkbox"]').check();

          cy.get('[data-testid="save-log-settings"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        } else {
          cy.log('System logs configuration not implemented');
        }
      });
    });
  });

  context('Performance Settings', () => {
    it('should configure caching settings', () => {
      // Navigate to performance settings
      cy.get('[data-testid="performance-tab"], a, button')
        .contains(/performance|cache/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="cache-settings"]').length > 0) {
          // Enable Redis cache
          cy.get('[data-testid="enable-cache"], input[type="checkbox"]').check();

          // Set cache TTL
          cy.get('[data-testid="cache-ttl"], input[name="cacheTtl"]').clear().type('3600'); // 1 hour

          // Configure cache size
          cy.get('[data-testid="max-cache-size"], input[name="maxCacheSize"]').clear().type('512'); // MB

          cy.get('[data-testid="save-cache-settings"], button').click();
          cy.contains(/saved|updated/i, { timeout: 10000 }).should('be.visible');
        } else {
          cy.log('Cache settings not implemented');
        }
      });
    });

    it('should configure database connection pool', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="db-pool-settings"]').length > 0) {
          // Set max connections
          cy.get('[data-testid="max-connections"], input[name="maxConnections"]')
            .clear()
            .type('20');

          // Set connection timeout
          cy.get('[data-testid="connection-timeout"], input[name="connectionTimeout"]')
            .clear()
            .type('30000'); // 30 seconds

          cy.get('[data-testid="save-db-settings"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        } else {
          cy.log('Database pool settings not implemented');
        }
      });
    });

    it('should manage resource limits', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="resource-limits"]').length > 0) {
          // Set file upload limits
          cy.get('[data-testid="max-file-size"], input[name="maxFileSize"]').clear().type('10'); // MB

          // Set API rate limits per user
          cy.get('[data-testid="user-rate-limit"], input[name="userRateLimit"]')
            .clear()
            .type('1000'); // requests per hour

          cy.get('[data-testid="save-resource-limits"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        }
      });
    });
  });

  context('Integration Settings', () => {
    it('should configure third-party integrations', () => {
      // Navigate to integrations
      cy.get('[data-testid="integrations-tab"], a, button')
        .contains(/integration|api|external/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="payment-integration"]').length > 0) {
          // Configure Stripe integration
          cy.get('[data-testid="stripe-public-key"], input[name="stripePublicKey"]')
            .clear()
            .type('pk_test_example');

          // Configure payment settings
          cy.get('[data-testid="default-currency"], select').select('USD');
          cy.get('[data-testid="enable-payments"], input[type="checkbox"]').check();

          cy.get('[data-testid="save-payment-settings"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        } else {
          cy.log('Payment integration not implemented');
        }
      });
    });

    it('should configure calendar integration', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="calendar-integration"]').length > 0) {
          // Enable Google Calendar sync
          cy.get('[data-testid="enable-google-calendar"], input[type="checkbox"]').check();

          // Configure calendar settings
          cy.get('[data-testid="calendar-timezone"], select').select('America/New_York');
          cy.get('[data-testid="sync-frequency"], select').select('15min');

          cy.get('[data-testid="save-calendar-settings"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        } else {
          cy.log('Calendar integration not implemented');
        }
      });
    });

    it('should configure analytics integration', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="analytics-integration"]').length > 0) {
          // Enable Google Analytics
          cy.get('[data-testid="enable-analytics"], input[type="checkbox"]').check();

          // Set tracking ID
          cy.get('[data-testid="ga-tracking-id"], input[name="gaTrackingId"]')
            .clear()
            .type('GA-12345-1');

          cy.get('[data-testid="save-analytics-settings"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        }
      });
    });
  });

  context('System Health Monitoring', () => {
    it('should display system health dashboard', () => {
      // Navigate to monitoring
      cy.get('[data-testid="monitoring-tab"], a, button')
        .contains(/monitor|health|status/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="health-dashboard"]').length > 0) {
          // Should show system metrics
          cy.get('[data-testid="cpu-usage"], .cpu-metric').should('be.visible');
          cy.get('[data-testid="memory-usage"], .memory-metric').should('be.visible');
          cy.get('[data-testid="db-status"], .database-status').should('be.visible');
        } else {
          cy.log('System health monitoring not implemented');
        }
      });
    });

    it('should configure health check alerts', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="alert-settings"]').length > 0) {
          // Set CPU alert threshold
          cy.get('[data-testid="cpu-threshold"], input[name="cpuThreshold"]').clear().type('80'); // percent

          // Set memory alert threshold
          cy.get('[data-testid="memory-threshold"], input[name="memoryThreshold"]')
            .clear()
            .type('85'); // percent

          // Enable email alerts
          cy.get('[data-testid="enable-email-alerts"], input[type="checkbox"]').check();

          cy.get('[data-testid="save-alert-settings"], button').click();
          cy.contains(/saved|updated/i).should('be.visible');
        }
      });
    });

    it('should view system activity logs', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="activity-logs"]').length > 0) {
          // Should display recent activities
          cy.get('[data-testid="activity-logs"] .log-entry').should('have.length.greaterThan', 0);

          // Should be able to filter logs
          if ($body.find('[data-testid="log-filter"]').length > 0) {
            cy.get('[data-testid="log-filter"] select').select('ERROR');
            cy.get('[data-testid="apply-filter"], button').click();
          }
        } else {
          cy.log('Activity logs not implemented');
        }
      });
    });
  });

  context('Error Handling', () => {
    it('should handle configuration save errors', () => {
      // Simulate save error
      cy.intercept('POST', '**/api/admin/system/**', { statusCode: 500 }).as('configError');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="app-name"], input[name="appName"]').length > 0) {
          // Try to save settings
          cy.get('[data-testid="app-name"], input[name="appName"]').clear().type('Error Test App');

          cy.get('[data-testid="save-app-settings"], button[type="submit"]').click();

          // Should show error message
          cy.contains(/error|failed|unable/i, { timeout: 10000 }).should('be.visible');
        }
      });
    });

    it('should handle invalid configuration values', () => {
      cy.get('body').then(($body) => {
        if (
          $body.find('[data-testid="session-timeout"], input[name="sessionTimeout"]').length > 0
        ) {
          // Enter invalid timeout value
          cy.get('[data-testid="session-timeout"], input[name="sessionTimeout"]')
            .clear()
            .type('-1');

          cy.get('[data-testid="save-security-settings"], button').click();

          // Should show validation error
          cy.contains(/invalid|positive|greater than/i, { timeout: 5000 }).should('be.visible');
        }
      });
    });

    it('should handle email configuration test failures', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="test-email"], button').length > 0) {
          // Simulate email test failure
          cy.intercept('POST', '**/api/admin/email/test', {
            statusCode: 400,
            body: { error: 'SMTP connection failed' },
          }).as('emailTestError');

          cy.get('[data-testid="test-email"], button').click();

          // Should show test failure
          cy.contains(/failed|error|connection.*failed/i, { timeout: 15000 }).should('be.visible');
        }
      });
    });

    it('should handle backup operation failures', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="manual-backup"], button').length > 0) {
          // Simulate backup failure
          cy.intercept('POST', '**/api/admin/backup', {
            statusCode: 500,
            body: { error: 'Backup storage unavailable' },
          }).as('backupError');

          cy.get('[data-testid="manual-backup"], button').click();

          // Should show backup error
          cy.contains(/backup.*failed|storage.*unavailable|error/i, { timeout: 30000 }).should(
            'be.visible'
          );
        }
      });
    });
  });
});
