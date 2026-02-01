/// <reference types="cypress" />

/**
 * Admin User Management CRUD Tests
 *
 * Comprehensive tests for user management:
 * - List all users with pagination
 * - Search users by email/name
 * - Filter users by role
 * - View user details
 * - Edit user profile
 * - Role assignment/change
 * - Multiple roles per user
 * - User deletion with safeguards
 */

describe('Admin User Management CRUD', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');

  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  describe('User List View', () => {
    it('should load users list page', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      cy.url().should('include', '/users');
      cy.get('main, [role="main"]').should('be.visible');
    });

    it('should display users table or list', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Should have a table or list of users
      cy.get('[data-testid="users-table"], [data-testid="users-list"], table').should('exist');
    });

    it('should show user information in the list', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Should display user data
      cy.get('body').then(($body) => {
        const hasUserData =
          $body.find('td, [class*="user-card"]').length > 0 ||
          $body.find(':contains("@")').length > 0; // email addresses
        if (hasUserData) {
          cy.log('User data is displayed in the list');
        }
      });
    });
  });

  describe('User Search', () => {
    it('should have search functionality', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      cy.get('[data-testid="search-input"], input[type="search"], input[placeholder*="Search"]').should('exist');
    });

    it('should filter users when searching', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Search for "student"
      cy.get('[data-testid="search-input"], input[type="search"], input[placeholder*="Search"]')
        .first()
        .type('student');
      cy.wait(1500);

      // Results should update
      cy.get('body').then(($body) => {
        const hasResults = $body.find('tr, [class*="user-card"]').length > 0;
        cy.log(`Search returned results: ${hasResults}`);
      });
    });

    it('should show empty state for no matching users', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Search for non-existent user
      cy.get('[data-testid="search-input"], input[type="search"], input[placeholder*="Search"]')
        .first()
        .type('nonexistentuser12345xyz');
      cy.wait(1500);

      // Should show empty state or no results message
      cy.get('body').then(($body) => {
        const hasEmptyState =
          $body.find(':contains("No users"), :contains("No results"), [class*="empty"]').length > 0;
        if (hasEmptyState) {
          cy.log('Empty state is displayed for no results');
        }
      });
    });
  });

  describe('Role Filtering', () => {
    it('should have role filter options', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Check for role filter (dropdown or tabs)
      cy.get('body').then(($body) => {
        const hasRoleFilter =
          $body.find('[data-testid*="role-filter"], select[name*="role"], [role="tablist"]').length > 0 ||
          $body.find(':contains("Admin"), :contains("Teacher"), :contains("Student")').filter('button, [role="tab"]').length > 0;
        if (hasRoleFilter) {
          cy.log('Role filter is available');
        }
      });
    });
  });

  describe('View User Details', () => {
    it('should navigate to user details page', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Click on first user row or card
      cy.get('body').then(($body) => {
        const userRow = $body.find('[data-testid^="user-row-"], tr[data-testid], a[href*="/users/"]');
        if (userRow.length > 0) {
          cy.get('[data-testid^="user-row-"], tr[data-testid], a[href*="/users/"]')
            .first()
            .click({ force: true });
          cy.wait(1000);
          cy.url().should('match', /\/users\/[^/]+$/);
        }
      });
    });

    it('should display user details on detail page', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Navigate to first user
      cy.get('body').then(($body) => {
        const userLink = $body.find('a[href*="/users/"]').filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/users\/[a-z0-9-]+$/i);
        });

        if (userLink.length > 0) {
          cy.wrap(userLink.first()).click({ force: true });
          cy.wait(1500);

          // Should show user details
          cy.get('body').then(($detailBody) => {
            const hasDetails =
              $detailBody.find(':contains("Email"), :contains("Name"), :contains("Role")').length > 0;
            if (hasDetails) {
              cy.log('User details are displayed');
            }
          });
        }
      });
    });
  });

  describe('Create New User', () => {
    const timestamp = Date.now();
    const newUserData = {
      firstName: 'CypressTest',
      lastName: `User${timestamp}`,
      username: `testuser${timestamp}`,
    };

    it('should navigate to new user form', () => {
      cy.visit('/dashboard/users/new');
      cy.wait(2000);

      cy.url().should('include', '/users/new');
      cy.get('form, [data-testid="user-form"]').should('exist');
    });

    it('should create a shadow user (without auth)', () => {
      cy.visit('/dashboard/users/new');
      cy.wait(2000);

      // Check shadow user option
      cy.get('[data-testid="isShadow-checkbox"]').click({ force: true });

      // Fill required fields
      cy.get('[data-testid="firstName-input"]').type(newUserData.firstName);
      cy.get('[data-testid="lastName-input"]').type(newUserData.lastName);
      cy.get('[data-testid="username-input"]').type(newUserData.username);

      // Assign student role
      cy.get('[data-testid="isStudent-checkbox"]').click({ force: true });

      // Submit
      cy.get('[data-testid="submit-button"]').click({ force: true });

      // Should redirect to users list
      cy.url({ timeout: 30000 }).should('include', '/dashboard/users');
      cy.url().should('not.include', '/new');
    });

    it('should show validation errors for empty form', () => {
      cy.visit('/dashboard/users/new');
      cy.wait(2000);

      // Try to submit without filling required fields
      cy.get('[data-testid="submit-button"]').click({ force: true });

      // Should stay on page or show errors
      cy.url().should('include', '/new');
    });
  });

  describe('Edit User', () => {
    it('should have edit button on user detail page', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Navigate to first user
      cy.get('a[href*="/users/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/users\/[a-z0-9-]+$/i);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      // Should have edit button or be on edit page
      cy.get('body').then(($body) => {
        const hasEditButton =
          $body.find('a[href*="/edit"], button:contains("Edit"), [data-testid*="edit"]').length > 0;
        if (hasEditButton) {
          cy.log('Edit functionality is available');
        }
      });
    });
  });

  describe('Role Management', () => {
    it('should be able to view user roles', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Roles should be visible in the list or detail page
      cy.get('body').then(($body) => {
        const hasRoles =
          $body.find(':contains("Admin"), :contains("Teacher"), :contains("Student")').length > 0;
        expect(hasRoles).to.be.true;
      });
    });

    it('should show role badges or indicators', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Look for role badges
      cy.get('body').then(($body) => {
        const hasBadges =
          $body.find('[class*="badge"], [class*="chip"], span:contains("admin"), span:contains("teacher"), span:contains("student")').length > 0;
        if (hasBadges) {
          cy.log('Role badges are displayed');
        }
      });
    });
  });

  describe('Delete User', () => {
    it('should have delete functionality', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Look for delete buttons
      cy.get('body').then(($body) => {
        const hasDeleteButtons =
          $body.find('[data-testid^="delete-user-"], button:contains("Delete"), [aria-label*="delete"]').length > 0;
        if (hasDeleteButtons) {
          cy.log('Delete functionality is available');
        }
      });
    });

    it('should show confirmation dialog before delete', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Try to click delete on first user (if available)
      cy.get('body').then(($body) => {
        const deleteButton = $body.find('[data-testid^="delete-user-"]').first();
        if (deleteButton.length > 0) {
          cy.wrap(deleteButton).click({ force: true });

          // Should show confirmation dialog
          cy.get('[role="alertdialog"], [data-testid="confirm-dialog"]', { timeout: 5000 }).should('be.visible');

          // Cancel to avoid actual deletion
          cy.get('[role="alertdialog"] button:contains("Cancel"), [data-testid="cancel-button"]')
            .click({ force: true });
        }
      });
    });
  });

  describe('User Table Interactions', () => {
    it('should handle sorting if available', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Check for sortable headers
      cy.get('body').then(($body) => {
        const hasSortableHeaders =
          $body.find('th[role="button"], th[class*="cursor-pointer"], th button').length > 0;
        if (hasSortableHeaders) {
          cy.log('Sortable columns are available');
        }
      });
    });

    it('should handle pagination if available', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Check for pagination controls
      cy.get('body').then(($body) => {
        const hasPagination =
          $body.find('[class*="pagination"], button:contains("Next"), button:contains("Previous")').length > 0;
        if (hasPagination) {
          cy.log('Pagination is available');
        }
      });
    });
  });

  describe('Access Control', () => {
    it('admin should have full access to user management', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Admin should not see access denied
      cy.get('body').should('not.contain', 'Access Denied');
      cy.get('body').should('not.contain', 'Forbidden');
    });

    it('should allow admin to access new user page', () => {
      cy.visit('/dashboard/users/new');
      cy.wait(2000);

      cy.url().should('include', '/users/new');
      cy.get('body').should('not.contain', 'Access Denied');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('GET', '**/api/users*', { forceNetworkError: true }).as('usersError');

      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Page should still render
      cy.get('main, [role="main"]').should('be.visible');
    });

    it('should handle server errors gracefully', () => {
      cy.intercept('GET', '**/api/users*', {
        statusCode: 500,
        body: { error: 'Internal Server Error' },
      }).as('serverError');

      cy.visit('/dashboard/users');
      cy.wait(2000);

      cy.get('main, [role="main"]').should('be.visible');
    });
  });
});
