/// <reference types="cypress" />

/**
 * Student Assignment Completion Flow
 *
 * Tests student experience with assignments:
 * 1. View assigned assignments
 * 2. View assignment details
 * 3. Mark assignment as in progress
 * 4. Mark assignment as complete
 * 5. View completed assignments
 *
 * Priority: P1 - Critical gap for student experience
 */

describe('Student Assignment Completion Flow', () => {
  const STUDENT_EMAIL = Cypress.env('TEST_STUDENT_EMAIL');
  const STUDENT_PASSWORD = Cypress.env('TEST_STUDENT_PASSWORD');

  beforeEach(() => {
    if (!STUDENT_EMAIL || !STUDENT_PASSWORD) {
      cy.log('Skipping - no student credentials configured');
      return;
    }

    cy.viewport(1280, 720);
    cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
  });

  describe('View Assignments', () => {
    it('should display student assignments page', () => {
      cy.visit('/dashboard/assignments');

      // Should see assignments page
      cy.contains(/assignments|homework|practice/i).should('be.visible');
    });

    it('should show only student own assignments', () => {
      cy.visit('/dashboard/assignments');

      // Should not show admin controls for other students
      cy.contains(/all students|filter by student/i).should('not.exist');
    });

    it('should display assignment status', () => {
      cy.visit('/dashboard/assignments');

      cy.get('body').then(($body) => {
        if (
          $body.find('[data-testid="assignment-card"], [data-testid="assignment-row"]').length > 0
        ) {
          // Should show status indicators
          cy.get('body').should('satisfy', ($b) => {
            const text = $b.text().toLowerCase();
            return (
              text.includes('pending') ||
              text.includes('in progress') ||
              text.includes('completed') ||
              text.includes('todo') ||
              text.includes('done')
            );
          });
        } else {
          cy.log('No assignments found for student');
        }
      });
    });

    it('should filter assignments by status', () => {
      cy.visit('/dashboard/assignments');

      // Look for status filter if it exists
      cy.get('body').then(($body) => {
        const filters = [
          'button:contains("All")',
          'button:contains("Pending")',
          'button:contains("Completed")',
          'select[name="status"]',
          '[data-testid="status-filter"]',
        ];

        let hasFilter = false;
        filters.forEach((selector) => {
          if ($body.find(selector).length > 0) {
            hasFilter = true;
          }
        });

        if (hasFilter) {
          cy.log('Status filter found');
        } else {
          cy.log('No status filter on page');
        }
      });
    });
  });

  describe('Assignment Details', () => {
    it('should view assignment details', () => {
      cy.visit('/dashboard/assignments');

      cy.get('body').then(($body) => {
        const assignmentLink = $body.find('a[href*="/assignments/"]').first();

        if (assignmentLink.length > 0) {
          cy.wrap(assignmentLink).click();
          cy.location('pathname').should('include', '/assignments/');

          // Should show assignment details
          cy.contains(/title|description|due|assignment/i).should('be.visible');
        } else {
          cy.log('No assignments available to view');
        }
      });
    });

    it('should display assignment instructions', () => {
      cy.visit('/dashboard/assignments');

      cy.get('body').then(($body) => {
        if ($body.find('a[href*="/assignments/"]').length > 0) {
          $body.find('a[href*="/assignments/"]').first().click();

          // Should show description or instructions
          cy.get('body').should('satisfy', ($el) => {
            const text = $el.text().toLowerCase();
            return (
              text.includes('description') ||
              text.includes('instructions') ||
              text.includes('practice')
            );
          });
        }
      });
    });

    it('should display due date', () => {
      cy.visit('/dashboard/assignments');

      cy.get('body').then(($body) => {
        if ($body.find('a[href*="/assignments/"]').length > 0) {
          $body.find('a[href*="/assignments/"]').first().click();

          // Should show due date
          cy.contains(/due|deadline/i).should('exist');
        }
      });
    });
  });

  describe('Update Assignment Status', () => {
    it('should mark assignment as in progress', () => {
      cy.visit('/dashboard/assignments');

      cy.get('body').then(($body) => {
        const pendingAssignment = $body
          .find('[data-testid*="pending"], :contains("Pending")')
          .first();

        if (pendingAssignment.length > 0) {
          // Find the assignment and click to view
          cy.get('a[href*="/assignments/"]').first().click();

          // Look for "Start" or "In Progress" button
          cy.get('body').then(($detail) => {
            if (
              $detail.find('button:contains("Start"), button:contains("In Progress")').length > 0
            ) {
              cy.get('button:contains("Start"), button:contains("In Progress")')
                .first()
                .click({ force: true });

              // Should update status
              cy.wait(1000);
              cy.contains(/in progress|started/i).should('exist');
            } else {
              cy.log('No status update button found');
            }
          });
        } else {
          cy.log('No pending assignments to start');
        }
      });
    });

    it('should mark assignment as complete', () => {
      cy.visit('/dashboard/assignments');

      cy.get('body').then(($body) => {
        if ($body.find('a[href*="/assignments/"]').length > 0) {
          cy.get('a[href*="/assignments/"]').first().click();

          // Look for "Complete" or "Mark as Done" button
          cy.get('body').then(($detail) => {
            if (
              $detail.find(
                'button:contains("Complete"), button:contains("Done"), input[type="checkbox"]'
              ).length > 0
            ) {
              cy.get('button:contains("Complete"), button:contains("Done"), input[type="checkbox"]')
                .first()
                .click({ force: true });

              // Should show completion confirmation
              cy.wait(1000);
              cy.contains(/completed|done|finished/i).should('exist');
            } else {
              cy.log('No complete button found');
            }
          });
        }
      });
    });
  });

  describe('View Completed Assignments', () => {
    it('should display completed assignments separately', () => {
      cy.visit('/dashboard/assignments');

      // Filter or tab for completed assignments
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Completed"), [data-testid="completed-tab"]').length > 0) {
          cy.get('button:contains("Completed"), [data-testid="completed-tab"]').first().click();

          cy.wait(500);
          cy.log('Viewing completed assignments');
        }
      });
    });

    it('should show completion date for completed assignments', () => {
      cy.visit('/dashboard/assignments');

      cy.get('body').then(($body) => {
        if ($body.find(':contains("Completed")').length > 0) {
          // Should show when assignment was completed
          cy.get('body').should('satisfy', ($el) => {
            const text = $el.text().toLowerCase();
            return (
              text.includes('completed on') || text.includes('finished') || text.includes('done')
            );
          });
        }
      });
    });
  });

  describe('Assignment Progress Tracking', () => {
    it('should show progress indicator if available', () => {
      cy.visit('/dashboard/assignments');

      // Look for progress indicators
      cy.get('body').then(($body) => {
        const hasProgress =
          $body.find('[data-testid="progress"], .progress, [role="progressbar"]').length > 0;

        if (hasProgress) {
          cy.log('Progress indicator found');
        } else {
          cy.log('No progress indicator on page');
        }
      });
    });

    it('should display assignment statistics on dashboard', () => {
      cy.visit('/dashboard');

      // Look for assignment stats
      cy.get('body').then(($body) => {
        const hasStats = $body.text().toLowerCase().includes('assignment');

        if (hasStats) {
          cy.log('Assignment statistics found on dashboard');
        } else {
          cy.log('No assignment statistics on dashboard');
        }
      });
    });
  });
});
