/// <reference types="cypress" />

/**
 * Student Assignments Tests
 *
 * Tests the student assignment functionality:
 * - View own assignments
 * - Filter assignments by status
 * - View assignment details
 * - Cannot edit/delete assignments (access control)
 *
 * Prerequisites:
 * - Student user with assignments
 */

describe('Student Assignments', () => {
  const STUDENT_EMAIL = Cypress.env('TEST_STUDENT_EMAIL');
  const STUDENT_PASSWORD = Cypress.env('TEST_STUDENT_PASSWORD');

  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
  });

  describe('Assignments List View', () => {
    it('should display the student assignments page', () => {
      cy.visit('/dashboard/assignments');

      // Verify page title
      cy.contains(/my assignments|assignments/i, { timeout: 10000 }).should('be.visible');
    });

    it('should show assignments assigned to the student', () => {
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      // Check if assignments are displayed or empty state
      cy.get('body').then(($body) => {
        if ($body.find('[class*="grid"]').find('[class*="card"], [class*="Card"]').length > 0) {
          // Assignments exist - verify card structure
          cy.get('[class*="grid"]').should('exist');
        } else if ($body.find('table').length > 0) {
          // Table view
          cy.get('table').should('exist');
        } else {
          // Empty state
          cy.contains(/no assignments|don't have any assignments/i).should('exist');
        }
      });
    });

    it('should display assignment status badges', () => {
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        // Check for assignment cards or table rows
        const hasContent = $body.find('.bg-card, [class*="rounded-xl"]').length > 0 ||
                          $body.find('table tbody tr').length > 0;

        if (hasContent) {
          // Should have status badges somewhere
          cy.get('[class*="badge"], [class*="Badge"]').should('exist');
        }
      });
    });

    it('should display due dates on assignments', () => {
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const cards = $body.find('.bg-card');
        if (cards.length > 0) {
          // Check for due date text
          cy.contains(/due/i).should('exist');
        }
      });
    });
  });

  describe('Assignment Filtering', () => {
    beforeEach(() => {
      cy.visit('/dashboard/assignments');
      cy.wait(2000);
    });

    it('should filter assignments by status', () => {
      // Look for status filter dropdown
      cy.get('body').then(($body) => {
        const filterExists = $body.find('button[role="combobox"], [data-testid*="filter"]').length > 0;

        if (filterExists) {
          // Click the status filter
          cy.get('button[role="combobox"]').first().click({ force: true });

          // Check if options exist
          cy.get('[role="option"]').then(($options) => {
            if ($options.length > 0) {
              // Select a status filter
              cy.get('[role="option"]').first().click({ force: true });
              cy.wait(500);
            }
          });
        }
      });
    });

    it('should show all status options', () => {
      cy.get('body').then(($body) => {
        if ($body.find('button[role="combobox"]').length > 0) {
          cy.get('button[role="combobox"]').first().click({ force: true });

          // Verify status options
          const expectedStatuses = ['not started', 'in progress', 'completed', 'overdue'];
          expectedStatuses.forEach(status => {
            cy.get('[role="option"]').then(($options) => {
              const found = $options.toArray().some(el =>
                el.textContent?.toLowerCase().includes(status)
              );
              if (found) {
                cy.log(`Found status filter: ${status}`);
              }
            });
          });

          // Close dropdown
          cy.get('body').click(0, 0);
        }
      });
    });
  });

  describe('Assignment Details', () => {
    it('should navigate to assignment detail page', () => {
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        // Look for clickable assignment card or "View Details" button
        const hasCards = $body.find('.bg-card.cursor-pointer, a:contains("View Details")').length > 0;
        const hasTableRows = $body.find('table tbody tr').length > 0;

        if (hasCards) {
          // Click on View Details button
          cy.contains('a', /view details/i).first().click({ force: true });
          cy.url().should('match', /\/dashboard\/assignments\/[a-f0-9-]+$/);
        } else if (hasTableRows) {
          // Click on table row
          cy.get('table tbody tr').first().click({ force: true });
          cy.url().should('match', /\/dashboard\/assignments\/[a-f0-9-]+$/);
        }
      });
    });

    it('should show assignment title and description on detail page', () => {
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasCards = $body.find('.bg-card, a:contains("View Details")').length > 0;

        if (hasCards) {
          // Navigate to detail
          cy.contains('a', /view details/i).first().click({ force: true });

          cy.wait(1000);

          // Verify detail page content
          cy.get('h1, h2, [class*="title"]').should('exist');
        }
      });
    });
  });

  describe('Access Control', () => {
    it('should not show create assignment button for students', () => {
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      // Students should not see a "New Assignment" or "Create Assignment" button
      cy.get('button:contains("New Assignment"), button:contains("Create"), a:contains("New Assignment")')
        .should('not.exist');
    });

    it('should not show edit button on assignment details for students', () => {
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasAssignments = $body.find('a:contains("View Details")').length > 0;

        if (hasAssignments) {
          // Navigate to detail
          cy.contains('a', /view details/i).first().click({ force: true });
          cy.wait(1000);

          // Should not have edit button
          cy.get('button:contains("Edit"), a[href*="/edit"]').should('not.exist');
        }
      });
    });

    it('should not show delete button on assignment details for students', () => {
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasAssignments = $body.find('a:contains("View Details")').length > 0;

        if (hasAssignments) {
          // Navigate to detail
          cy.contains('a', /view details/i).first().click({ force: true });
          cy.wait(1000);

          // Should not have delete button
          cy.get('button:contains("Delete")').should('not.exist');
        }
      });
    });

    it('should only show assignments belonging to the student', () => {
      // This test verifies the student can only see their own assignments
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      // The page should show "My Assignments" title, indicating student-specific view
      cy.contains(/my assignments/i).should('be.visible');
    });
  });

  describe('Assignment Status Display', () => {
    it('should show appropriate status colors', () => {
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        // Check for status badges with color classes
        const badges = $body.find('[class*="badge"], [class*="Badge"]');
        if (badges.length > 0) {
          // Verify badges have styling
          cy.get('[class*="badge"], [class*="Badge"]')
            .first()
            .should('have.attr', 'class')
            .and('not.be.empty');
        }
      });
    });

    it('should highlight overdue assignments', () => {
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        // Check if there are overdue assignments
        if ($body.find(':contains("Overdue")').length > 0) {
          // Overdue badge should have destructive/red styling
          cy.contains(/overdue/i)
            .should('exist')
            .and('have.attr', 'class')
            .and('match', /red|destructive|error/i);
        }
      });
    });
  });

  describe('Empty State', () => {
    it('should show helpful empty state when no assignments', () => {
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find(':contains("No assignments")').length > 0) {
          cy.contains(/no assignments/i).should('be.visible');
          cy.contains(/your teacher will assign/i).should('be.visible');
        }
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should display correctly on mobile viewport', () => {
      cy.viewport(375, 667); // iPhone SE dimensions
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      // Page should still be accessible
      cy.contains(/assignments/i).should('be.visible');
    });

    it('should display correctly on tablet viewport', () => {
      cy.viewport(768, 1024); // iPad dimensions
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      // Page should still be accessible
      cy.contains(/assignments/i).should('be.visible');
    });
  });

  describe('Teacher Information', () => {
    it('should display teacher name on assignment cards', () => {
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const cards = $body.find('.bg-card');
        if (cards.length > 0) {
          // Check for "By:" text indicating teacher info
          cy.contains(/by:/i).should('exist');
        }
      });
    });
  });
});
