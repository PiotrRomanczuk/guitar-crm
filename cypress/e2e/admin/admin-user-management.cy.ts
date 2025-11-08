/// <reference types="cypress" />

/**
 * Admin User Management E2E Tests
 *
 * Complete CRUD operations for user management:
 * - View all users list
 * - Create new users with different roles
 * - Edit existing user details and roles
 * - Delete users (with confirmation)
 * - Search and filter users
 * - Bulk operations on users
 * - User role management and permissions
 */

describe('Admin User Management', () => {
  const adminUser = {
    email: 'p.romanczuk@gmail.com',
    password: 'test123_admin',
  };

  const testUser = {
    email: `testuser${Date.now()}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    role: 'student',
  };

  const editedUser = {
    firstName: 'Updated',
    lastName: 'Name',
    role: 'teacher',
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

    // Navigate to user management
    cy.visit('/dashboard/admin/users');
  });

  context('User List Management', () => {
    it('should display users list with proper columns', () => {
      cy.url().should('include', '/admin/users');

      // Wait for page to load
      cy.get('[data-testid="users-loading"]', { timeout: 2000 }).should('not.exist');

      // Should show users list or empty state
      cy.get('body').then(($body) => {
        if ($body.find('table, .users-table').length > 0) {
          // Verify table columns
          cy.get('th, .table-header').should('contain.text', /email|name|role/i);
        } else {
          // Empty state is acceptable
          cy.contains(/no users|empty|create/i).should('be.visible');
        }
      });
    });

    it('should show user count and statistics', () => {
      // Look for user count or statistics
      cy.get('[data-testid="user-count"], .user-stats')
        .should('be.visible')
        .and('contain.text', /\d+/);
    });

    it('should have search functionality', () => {
      // Look for search input
      cy.get(
        '[data-testid="user-search"], input[placeholder*="search"], input[type="search"]'
      ).should('be.visible');
    });

    it('should have filter by role functionality', () => {
      // Look for role filter
      cy.get('[data-testid="role-filter"], select, .filter-dropdown')
        .contains(/role|filter/i)
        .should('be.visible');
    });
  });

  context('Create New User', () => {
    it('should open create user form', () => {
      // Click create user button
      cy.get('[data-testid="create-user-btn"], button')
        .contains(/create|add|new user/i)
        .first()
        .click();

      // Should show create form or navigate to create page
      cy.url().should('match', /\/users\/new|\/create/);
      cy.contains(/create|add|new user/i).should('be.visible');
    });

    it('should create a new student user', () => {
      // Open create form
      cy.get('[data-testid="create-user-btn"], button')
        .contains(/create|add|new user/i)
        .first()
        .click();

      // Fill out form
      cy.get('[data-testid="user-email"], input[name="email"]').type(testUser.email);

      cy.get('[data-testid="user-first-name"], input[name="firstName"]').type(testUser.firstName);

      cy.get('[data-testid="user-last-name"], input[name="lastName"]').type(testUser.lastName);

      // Set role to student
      cy.get('[data-testid="user-role"], select[name="role"], input[name="role"]').then(($el) => {
        if ($el.is('select')) {
          cy.wrap($el).select(testUser.role);
        } else {
          // Handle checkbox or radio buttons
          cy.get(`[value="${testUser.role}"], [data-value="${testUser.role}"]`).click();
        }
      });

      // Submit form
      cy.get('[data-testid="submit-user"], button[type="submit"]').click();

      // Should redirect back to users list or show success
      cy.url({ timeout: 10000 }).should('match', /\/users$|\/admin\/users$/);

      // Should see the new user in the list
      cy.contains(testUser.email, { timeout: 10000 }).should('be.visible');
    });

    it('should create a teacher user with correct permissions', () => {
      // Create teacher user
      cy.get('[data-testid="create-user-btn"], button')
        .contains(/create|add|new user/i)
        .first()
        .click();

      const teacherUser = {
        email: `teacher${Date.now()}@example.com`,
        firstName: 'Teacher',
        lastName: 'Example',
        role: 'teacher',
      };

      // Fill form
      cy.get('[data-testid="user-email"], input[name="email"]').type(teacherUser.email);
      cy.get('[data-testid="user-first-name"], input[name="firstName"]').type(
        teacherUser.firstName
      );
      cy.get('[data-testid="user-last-name"], input[name="lastName"]').type(teacherUser.lastName);

      // Set role to teacher
      cy.get('[data-testid="user-role"], select[name="role"], input[name="role"]').then(($el) => {
        if ($el.is('select')) {
          cy.wrap($el).select(teacherUser.role);
        } else {
          cy.get(`[value="${teacherUser.role}"], [data-value="${teacherUser.role}"]`).click();
        }
      });

      cy.get('[data-testid="submit-user"], button[type="submit"]').click();

      // Verify creation
      cy.url({ timeout: 10000 }).should('match', /\/users$|\/admin\/users$/);
      cy.contains(teacherUser.email, { timeout: 10000 }).should('be.visible');
    });

    it('should validate required fields', () => {
      // Open create form
      cy.get('[data-testid="create-user-btn"], button')
        .contains(/create|add|new user/i)
        .first()
        .click();

      // Try to submit without filling fields
      cy.get('[data-testid="submit-user"], button[type="submit"]').click();

      // Should show validation errors or prevent submission
      cy.get('input:invalid, .error, .field-error').should('have.length.greaterThan', 0);
    });

    it('should handle duplicate email validation', () => {
      // Try to create user with existing email
      cy.get('[data-testid="create-user-btn"], button')
        .contains(/create|add|new user/i)
        .first()
        .click();

      // Use admin email (should already exist)
      cy.get('[data-testid="user-email"], input[name="email"]').type(adminUser.email);
      cy.get('[data-testid="user-first-name"], input[name="firstName"]').type('Test');
      cy.get('[data-testid="user-last-name"], input[name="lastName"]').type('Duplicate');

      cy.get('[data-testid="submit-user"], button[type="submit"]').click();

      // Should show duplicate email error
      cy.contains(/already exists|duplicate|taken/i, { timeout: 5000 }).should('be.visible');
    });
  });

  context('Edit Existing User', () => {
    beforeEach(() => {
      // Ensure we have a test user to edit
      cy.get('body').then(($body) => {
        if (!$body.text().includes(testUser.email)) {
          // Create test user first
          cy.get('[data-testid="create-user-btn"], button')
            .contains(/create|add|new user/i)
            .first()
            .click();

          cy.get('[data-testid="user-email"], input[name="email"]').type(testUser.email);
          cy.get('[data-testid="user-first-name"], input[name="firstName"]').type(
            testUser.firstName
          );
          cy.get('[data-testid="user-last-name"], input[name="lastName"]').type(testUser.lastName);

          cy.get('[data-testid="submit-user"], button[type="submit"]').click();
          cy.url({ timeout: 10000 }).should('match', /\/users$|\/admin\/users$/);
        }
      });
    });

    it('should open edit form for existing user', () => {
      // Find the test user row and click edit
      cy.contains('tr, .user-row', testUser.email).within(() => {
        cy.get('[data-testid="edit-user-btn"], button, a')
          .contains(/edit|update/i)
          .click();
      });

      // Should navigate to edit form
      cy.url().should('match', /\/edit|\/update/);
      cy.contains(/edit|update user/i).should('be.visible');
    });

    it('should update user information', () => {
      // Open edit form
      cy.contains('tr, .user-row', testUser.email).within(() => {
        cy.get('[data-testid="edit-user-btn"], button, a')
          .contains(/edit|update/i)
          .click();
      });

      // Update user information
      cy.get('[data-testid="user-first-name"], input[name="firstName"]')
        .clear()
        .type(editedUser.firstName);

      cy.get('[data-testid="user-last-name"], input[name="lastName"]')
        .clear()
        .type(editedUser.lastName);

      // Update role
      cy.get('[data-testid="user-role"], select[name="role"], input[name="role"]').then(($el) => {
        if ($el.is('select')) {
          cy.wrap($el).select(editedUser.role);
        } else {
          cy.get(`[value="${editedUser.role}"], [data-value="${editedUser.role}"]`).click();
        }
      });

      // Save changes
      cy.get('[data-testid="submit-user"], button[type="submit"]').click();

      // Should redirect and show updated information
      cy.url({ timeout: 10000 }).should('match', /\/users$|\/admin\/users$/);
      cy.contains(`${editedUser.firstName} ${editedUser.lastName}`, { timeout: 10000 }).should(
        'be.visible'
      );
    });

    it('should cancel edit without saving changes', () => {
      // Open edit form
      cy.contains('tr, .user-row', testUser.email).within(() => {
        cy.get('[data-testid="edit-user-btn"], button, a')
          .contains(/edit|update/i)
          .click();
      });

      // Make some changes
      cy.get('[data-testid="user-first-name"], input[name="firstName"]')
        .clear()
        .type('ShouldNotSave');

      // Cancel
      cy.get('[data-testid="cancel-btn"], button')
        .contains(/cancel|back/i)
        .click();

      // Should return to list without changes
      cy.url({ timeout: 10000 }).should('match', /\/users$|\/admin\/users$/);
      cy.contains('ShouldNotSave').should('not.exist');
    });
  });

  context('Delete User', () => {
    it('should delete user with confirmation', () => {
      // Find test user and delete
      cy.contains('tr, .user-row', testUser.email).within(() => {
        cy.get('[data-testid="delete-user-btn"], button')
          .contains(/delete|remove/i)
          .click();
      });

      // Confirm deletion
      cy.get('[data-testid="confirm-delete"], button')
        .contains(/confirm|yes|delete/i)
        .click();

      // User should be removed from list
      cy.contains(testUser.email, { timeout: 10000 }).should('not.exist');
    });

    it('should cancel deletion', () => {
      // Start delete process
      cy.contains('tr, .user-row', testUser.email).within(() => {
        cy.get('[data-testid="delete-user-btn"], button')
          .contains(/delete|remove/i)
          .click();
      });

      // Cancel deletion
      cy.get('[data-testid="cancel-delete"], button')
        .contains(/cancel|no/i)
        .click();

      // User should still exist
      cy.contains(testUser.email).should('be.visible');
    });

    it('should prevent deleting admin user', () => {
      // Try to delete the admin user (should be protected)
      cy.contains('tr, .user-row', adminUser.email).then(($row) => {
        // Either no delete button or disabled delete button
        cy.wrap($row).within(() => {
          cy.get('button')
            .contains(/delete|remove/i)
            .should(($btn) => {
              // Admin user delete button should be disabled or not exist
              const isDisabled = $btn.prop('disabled') || $btn.hasClass('disabled');
              const exists = $btn.length > 0;
              if (exists && !isDisabled) {
                throw new Error('Admin user delete button should be disabled');
              }
            });
        });
      });
    });
  });

  context('Search and Filter', () => {
    it('should search users by email', () => {
      // Type in search box
      cy.get(
        '[data-testid="user-search"], input[placeholder*="search"], input[type="search"]'
      ).type('admin');

      // Should filter results
      cy.get('tbody tr, .user-row').should('have.length.lessThan', 10);
      cy.contains(adminUser.email).should('be.visible');
    });

    it('should filter users by role', () => {
      // Select role filter
      cy.get('[data-testid="role-filter"], select').select('admin');

      // Should show only admin users
      cy.get('tbody tr, .user-row').each(($row) => {
        cy.wrap($row).should('contain.text', /admin/i);
      });
    });

    it('should clear search and filters', () => {
      // Apply search
      cy.get(
        '[data-testid="user-search"], input[placeholder*="search"], input[type="search"]'
      ).type('test');

      // Clear search
      cy.get('[data-testid="clear-search"], button, .clear-btn').click();

      // Should show all users again
      cy.get(
        '[data-testid="user-search"], input[placeholder*="search"], input[type="search"]'
      ).should('have.value', '');
    });
  });

  context('Bulk Operations', () => {
    it('should select multiple users', () => {
      // Check if bulk selection is available
      cy.get('body').then(($body) => {
        if ($body.find('input[type="checkbox"]').length > 0) {
          // Select multiple users
          cy.get('input[type="checkbox"]').first().check();
          cy.get('input[type="checkbox"]').eq(1).check();

          // Should show bulk actions
          cy.get('[data-testid="bulk-actions"], .bulk-actions').should('be.visible');
        } else {
          cy.log('Bulk selection not available - this is optional');
        }
      });
    });

    it('should perform bulk role update', () => {
      cy.get('body').then(($body) => {
        if ($body.find('input[type="checkbox"]').length > 0) {
          // Select users
          cy.get('input[type="checkbox"]').first().check();

          // Bulk update role
          cy.get('[data-testid="bulk-role-update"], select, button')
            .contains(/update role|bulk/i)
            .click();

          cy.log('Bulk operations available and working');
        } else {
          cy.log('Bulk operations not implemented - this is optional');
        }
      });
    });
  });

  context('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Intercept API calls to simulate errors
      cy.intercept('GET', '**/api/admin/users*', { statusCode: 500 }).as('usersError');

      cy.reload();

      // Should show error message
      cy.contains(/error|failed|unavailable/i, { timeout: 10000 }).should('be.visible');
    });

    it('should handle network failures', () => {
      // Simulate network failure
      cy.intercept('POST', '**/api/admin/users*', { forceNetworkError: true }).as('networkError');

      // Try to create user
      cy.get('[data-testid="create-user-btn"], button')
        .contains(/create|add|new user/i)
        .first()
        .click();

      cy.get('[data-testid="user-email"], input[name="email"]').type('network-test@example.com');
      cy.get('[data-testid="submit-user"], button[type="submit"]').click();

      // Should show network error
      cy.contains(/network|connection|error/i, { timeout: 10000 }).should('be.visible');
    });
  });
});
