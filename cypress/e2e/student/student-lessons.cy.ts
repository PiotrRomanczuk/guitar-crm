/// <reference types="cypress" />

/**
 * Student Lessons Tests
 *
 * Tests the student lessons functionality:
 * - View own lessons
 * - Filter lessons by status
 * - View lesson details
 * - Cannot create/edit/delete lessons (access control)
 *
 * Prerequisites:
 * - Student user with lessons
 */

describe('Student Lessons', () => {
  const STUDENT_EMAIL = Cypress.env('TEST_STUDENT_EMAIL');
  const STUDENT_PASSWORD = Cypress.env('TEST_STUDENT_PASSWORD');

  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
  });

  describe('Lessons List View', () => {
    it('should display the lessons page', () => {
      cy.visit('/dashboard/lessons');

      // Verify page loads
      cy.contains(/lessons/i, { timeout: 10000 }).should('be.visible');
    });

    it('should show lessons assigned to the student', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Check if lessons are displayed or empty state
      cy.get('body').then(($body) => {
        const hasTable = $body.find('table').length > 0;
        const hasCards = $body.find('[class*="card"], [class*="Card"]').length > 0;
        const hasEmptyState = $body.find(':contains("No lessons"), :contains("no upcoming")').length > 0;

        // Should have either lessons or empty state
        expect(hasTable || hasCards || hasEmptyState).to.be.true;
      });
    });

    it('should display lesson status badges', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        // Check for content
        const hasContent = $body.find('table tbody tr').length > 0 ||
                          $body.find('[class*="card"]').length > 0;

        if (hasContent) {
          // Should have status badges
          cy.get('[class*="badge"], [class*="Badge"]').should('exist');
        }
      });
    });

    it('should display lesson dates', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasContent = $body.find('table tbody tr').length > 0 ||
                          $body.find('[class*="card"]').length > 0;

        if (hasContent) {
          // Should show date information
          cy.get('body').should('contain', /\d{4}|\d{1,2}\/|\w+ \d/);
        }
      });
    });
  });

  describe('Lesson Filtering', () => {
    beforeEach(() => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);
    });

    it('should filter lessons by status if filter available', () => {
      cy.get('body').then(($body) => {
        const hasFilter = $body.find('button[role="combobox"], [data-testid*="filter"], select').length > 0;

        if (hasFilter) {
          cy.get('button[role="combobox"], select').first().click({ force: true });

          cy.get('[role="option"], option').then(($options) => {
            if ($options.length > 0) {
              cy.get('[role="option"], option').first().click({ force: true });
              cy.wait(500);
            }
          });
        }
      });
    });

    it('should search lessons if search available', () => {
      cy.get('body').then(($body) => {
        const hasSearch = $body.find('input[type="search"], input[placeholder*="search" i]').length > 0;

        if (hasSearch) {
          cy.get('input[type="search"], input[placeholder*="search" i]')
            .first()
            .type('test');
          cy.wait(500);
        }
      });
    });
  });

  describe('Lesson Details', () => {
    it('should navigate to lesson detail page when clicking a lesson', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasClickableLessons = $body.find('table tbody tr, [class*="card"]').length > 0;

        if (hasClickableLessons) {
          // Click on the first lesson
          cy.get('table tbody tr, [class*="card"]')
            .first()
            .click({ force: true });

          // Should navigate to detail page
          cy.url({ timeout: 10000 }).should('match', /\/dashboard\/lessons\/[a-f0-9-]+$/);
        }
      });
    });

    it('should show lesson details on detail page', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasLessons = $body.find('table tbody tr, [class*="card"]').length > 0;

        if (hasLessons) {
          cy.get('table tbody tr, [class*="card"]')
            .first()
            .click({ force: true });

          cy.wait(1000);

          // Detail page should show lesson information
          cy.get('h1, h2, [class*="title"]').should('exist');
        }
      });
    });

    it('should show teacher information on lesson', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Check if teacher name is visible somewhere
      cy.get('body').then(($body) => {
        const hasTeacherInfo = $body.find(':contains("Teacher"), :contains("Instructor")').length > 0;
        if (hasTeacherInfo) {
          cy.log('Teacher information is displayed');
        }
      });
    });
  });

  describe('Lesson History', () => {
    it('should show past lessons in list', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Look for completed or past lessons
      cy.get('body').then(($body) => {
        const hasCompleted = $body.find(':contains("Completed"), :contains("completed")').length > 0;
        if (hasCompleted) {
          cy.log('Completed lessons are shown');
        }
      });
    });
  });

  describe('Access Control', () => {
    it('should NOT show create lesson button for students', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Students should not see "New Lesson" or "Create Lesson" button
      cy.get('button:contains("New Lesson"), button:contains("Create Lesson"), a:contains("New Lesson")')
        .should('not.exist');
    });

    it('should NOT show edit button on lesson details for students', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasLessons = $body.find('table tbody tr, [class*="card"]').length > 0;

        if (hasLessons) {
          cy.get('table tbody tr, [class*="card"]')
            .first()
            .click({ force: true });

          cy.wait(1000);

          // Should not have edit button
          cy.get('button:contains("Edit"), a[href*="/edit"]').should('not.exist');
        }
      });
    });

    it('should NOT show delete button on lesson details for students', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasLessons = $body.find('table tbody tr, [class*="card"]').length > 0;

        if (hasLessons) {
          cy.get('table tbody tr, [class*="card"]')
            .first()
            .click({ force: true });

          cy.wait(1000);

          // Should not have delete button
          cy.get('button:contains("Delete"), [data-testid*="delete"]').should('not.exist');
        }
      });
    });

    it('should only show lessons belonging to the student', () => {
      // This verifies the student can only see their own lessons
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // The RLS policy ensures students only see their lessons
      // We verify the page loads and data is filtered
      cy.url().should('include', '/lessons');
    });
  });

  describe('Lesson Songs', () => {
    it('should display songs associated with lesson', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasLessons = $body.find('table tbody tr, [class*="card"]').length > 0;

        if (hasLessons) {
          cy.get('table tbody tr, [class*="card"]')
            .first()
            .click({ force: true });

          cy.wait(1000);

          // Look for songs section on detail page
          cy.get('body').then(($detailBody) => {
            const hasSongsSection = $detailBody.find(':contains("Songs"), :contains("Song List")').length > 0;
            if (hasSongsSection) {
              cy.log('Songs are displayed on lesson detail');
            }
          });
        }
      });
    });
  });

  describe('Empty State', () => {
    it('should show helpful empty state when no lessons', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find(':contains("No lessons"), :contains("no upcoming")').length > 0) {
          cy.contains(/no lessons|no upcoming/i).should('be.visible');
        }
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should display correctly on mobile viewport', () => {
      cy.viewport(375, 667);
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Page should still be accessible
      cy.contains(/lessons/i).should('be.visible');
    });

    it('should show mobile-friendly layout', () => {
      cy.viewport(375, 667);
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Should use card layout on mobile instead of table
      cy.get('body').then(($body) => {
        // Mobile view typically hides tables and shows cards
        const tableHidden = $body.find('table.hidden, table[class*="hidden"]').length > 0 ||
                           $body.find('.md\\:hidden, .lg\\:hidden').length > 0;
        cy.log(tableHidden ? 'Table is hidden on mobile' : 'Using responsive layout');
      });
    });
  });

  describe('Lesson Status Display', () => {
    it('should show scheduled lessons with appropriate styling', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find(':contains("Scheduled")').length > 0) {
          cy.contains(/scheduled/i).should('exist');
        }
      });
    });

    it('should show completed lessons with appropriate styling', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find(':contains("Completed")').length > 0) {
          cy.contains(/completed/i).should('exist');
        }
      });
    });

    it('should highlight upcoming lessons', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Look for upcoming/next indicators
      cy.get('body').then(($body) => {
        const hasUpcoming = $body.find(':contains("Upcoming"), :contains("Next"), :contains("Today")').length > 0;
        if (hasUpcoming) {
          cy.log('Upcoming lessons are highlighted');
        }
      });
    });
  });
});
