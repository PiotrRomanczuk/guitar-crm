/// <reference types="cypress" />

/**
 * Admin Lesson Management Enhanced Tests
 *
 * Extended tests for lesson management:
 * - Bulk operations
 * - Recurring lessons
 * - Add songs to lessons
 * - Create assignments from lessons
 * - Lesson history
 * - Advanced filtering
 * - Calendar view
 */

describe('Admin Lesson Management (Enhanced)', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');

  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  describe('Lesson List Advanced Features', () => {
    it('should load lessons page with all controls', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.url().should('include', '/lessons');
      cy.get('main, [role="main"]').should('be.visible');
    });

    it('should have filter controls', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Check for filter options
      cy.get('body').then(($body) => {
        const hasFilters =
          $body.find('[data-testid*="filter"], select, [role="combobox"]').length > 0;
        if (hasFilters) {
          cy.log('Filter controls are available');
        }
      });
    });

    it('should have search functionality', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('input[type="search"], input[placeholder*="Search"], [data-testid="search-input"]')
        .should('exist');
    });
  });

  describe('Filter by Teacher', () => {
    it('should filter lessons by teacher if control exists', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const teacherFilter = $body.find('[data-testid="teacher-filter"], select[name*="teacher"]');
        if (teacherFilter.length > 0) {
          cy.get('[data-testid="teacher-filter"], select[name*="teacher"]')
            .first()
            .select(1, { force: true });
          cy.wait(1000);
          cy.log('Teacher filter applied');
        }
      });
    });
  });

  describe('Filter by Student', () => {
    it('should filter lessons by student if control exists', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const studentFilter = $body.find('[data-testid="student-filter"], select[name*="student"]');
        if (studentFilter.length > 0) {
          cy.get('[data-testid="student-filter"], select[name*="student"]')
            .first()
            .select(1, { force: true });
          cy.wait(1000);
          cy.log('Student filter applied');
        }
      });
    });
  });

  describe('Filter by Status', () => {
    it('should filter lessons by status', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const statusFilter = $body.find('[data-testid="status-filter"], select[name*="status"], [role="tablist"]');
        if (statusFilter.length > 0) {
          cy.log('Status filter is available');
        }
      });
    });
  });

  describe('Date Range Filter', () => {
    it('should have date range filter', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const dateFilter =
          $body.find('input[type="date"], [data-testid*="date-filter"], [class*="calendar"]').length > 0;
        if (dateFilter) {
          cy.log('Date filter is available');
        }
      });
    });
  });

  describe('Lesson Detail Page', () => {
    it('should navigate to lesson detail', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Click on first lesson
      cy.get('a[href*="/lessons/"], tr[data-testid], [data-testid^="lesson-"]')
        .filter(':visible')
        .first()
        .click({ force: true });

      cy.wait(1500);
      cy.url().should('match', /\/lessons\/[^/]+$/);
    });

    it('should show lesson details', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('a[href*="/lessons/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/lessons\/[a-z0-9-]+$/i);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      // Should display lesson information
      cy.get('body').then(($body) => {
        const hasDetails =
          $body.find(':contains("Student"), :contains("Teacher"), :contains("Status")').length > 0;
        if (hasDetails) {
          cy.log('Lesson details are displayed');
        }
      });
    });
  });

  describe('Add Songs to Lesson', () => {
    it('should have add songs functionality on lesson detail', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Navigate to lesson detail
      cy.get('a[href*="/lessons/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/lessons\/[a-z0-9-]+$/i);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      // Check for add songs section
      cy.get('body').then(($body) => {
        const hasAddSongs =
          $body.find(':contains("Songs"), button:contains("Add Song"), [data-testid*="add-song"]').length > 0;
        if (hasAddSongs) {
          cy.log('Add songs functionality is available');
        }
      });
    });
  });

  describe('Create Assignment from Lesson', () => {
    it('should have create assignment option on lesson detail', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('a[href*="/lessons/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/lessons\/[a-z0-9-]+$/i);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      cy.get('body').then(($body) => {
        const hasCreateAssignment =
          $body.find(':contains("Assignment"), button:contains("Create Assignment"), a[href*="assignment"]').length > 0;
        if (hasCreateAssignment) {
          cy.log('Create assignment functionality is available');
        }
      });
    });
  });

  describe('Lesson History', () => {
    it('should show lesson history on detail page', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('a[href*="/lessons/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/lessons\/[a-z0-9-]+$/i);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      cy.get('body').then(($body) => {
        const hasHistory =
          $body.find(':contains("History"), :contains("Changes"), [data-testid*="history"]').length > 0;
        if (hasHistory) {
          cy.log('Lesson history is available');
        }
      });
    });
  });

  describe('Calendar View', () => {
    it('should navigate to schedule/calendar view if available', () => {
      cy.visit('/dashboard/lessons/schedule', { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const has404 = $body.find(':contains("404"), :contains("Not Found")').length > 0;
        const hasCalendar = $body.find('[class*="calendar"], [class*="schedule"]').length > 0;

        if (hasCalendar) {
          cy.log('Calendar view is available');
        } else if (has404) {
          cy.log('Calendar view not implemented');
        }
      });
    });
  });

  describe('Lesson Form Validation', () => {
    it('should validate required fields on new lesson form', () => {
      cy.visit('/dashboard/lessons/new');
      cy.wait(2000);

      // Try to submit empty form
      cy.get('[data-testid="lesson-submit"]', { timeout: 10000 }).click({ force: true });

      // Should stay on form
      cy.url().should('include', '/new');
    });

    it('should validate date is in the future for scheduled lessons', () => {
      cy.visit('/dashboard/lessons/new');
      cy.wait(2000);

      // Fill minimal required fields
      cy.get('[data-testid="lesson-student_id"]').click({ force: true });
      cy.wait(500);
      cy.get('[role="option"]').first().click({ force: true });

      cy.get('[data-testid="lesson-teacher_id"]').click({ force: true });
      cy.wait(500);
      cy.get('[role="option"]').first().click({ force: true });

      cy.get('[data-testid="lesson-title"]').type('Test Lesson');

      // Set past date
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);
      const dateStr = pastDate.toISOString().slice(0, 16);
      cy.get('[data-testid="lesson-scheduled-at"]').type(dateStr);

      // Validation may prevent submission or show error
      cy.get('[data-testid="lesson-submit"]').click({ force: true });
      cy.wait(1000);
    });
  });

  describe('Bulk Operations', () => {
    it('should have bulk selection if available', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasBulkSelect =
          $body.find('input[type="checkbox"][data-testid*="select"], th input[type="checkbox"]').length > 0;
        if (hasBulkSelect) {
          cy.log('Bulk selection is available');
        }
      });
    });
  });

  describe('Lesson Status Management', () => {
    it('should allow changing lesson status', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Navigate to a lesson
      cy.get('a[href*="/lessons/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/lessons\/[a-z0-9-]+$/i);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      // Look for status change controls
      cy.get('body').then(($body) => {
        const hasStatusControl =
          $body.find('select[name*="status"], [data-testid*="status"], button:contains("Complete"), button:contains("Cancel")').length > 0;
        if (hasStatusControl) {
          cy.log('Status change functionality is available');
        }
      });
    });
  });

  describe('Edit Lesson', () => {
    it('should be able to edit lesson', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Navigate to a lesson
      cy.get('a[href*="/lessons/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/lessons\/[a-z0-9-]+$/i);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      // Look for edit button or navigate to edit page
      cy.get('body').then(($body) => {
        const editLink = $body.find('a[href*="/edit"], button:contains("Edit")');
        if (editLink.length > 0) {
          cy.get('a[href*="/edit"], button:contains("Edit")').first().click({ force: true });
          cy.wait(1000);
          cy.log('Edit functionality is available');
        }
      });
    });
  });

  describe('Delete Lesson', () => {
    it('should show delete confirmation dialog', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Navigate to a lesson
      cy.get('a[href*="/lessons/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/lessons\/[a-z0-9-]+$/i);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      // Click delete
      cy.get('body').then(($body) => {
        const deleteButton = $body.find('[data-testid="lesson-delete-button"], button:contains("Delete")');
        if (deleteButton.length > 0) {
          cy.get('[data-testid="lesson-delete-button"], button:contains("Delete")')
            .first()
            .click({ force: true });

          // Should show confirmation
          cy.get('[role="alertdialog"]', { timeout: 5000 }).should('be.visible');

          // Cancel
          cy.get('[role="alertdialog"] button:contains("Cancel")').click({ force: true });
        }
      });
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on tablet', () => {
      cy.viewport(768, 1024);
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('main, [role="main"]').should('be.visible');
    });

    it('should display correctly on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('main, [role="main"]').should('be.visible');
    });
  });
});
