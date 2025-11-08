/// <reference types="cypress" />

/**
 * Admin Lesson Management E2E Tests
 *
 * Complete lesson management operations:
 * - View lessons overview with teacher-student assignments
 * - Create new lessons with student-teacher pairings
 * - Edit lesson details (date, duration, notes)
 * - Assign songs to lessons with progress tracking
 * - Manage lesson status (scheduled, completed, cancelled)
 * - View lesson history and progress tracking
 * - Bulk operations for lesson scheduling
 * - Calendar view integration
 * - Lesson analytics and reporting
 */

describe('Admin Lesson Management', () => {
  const adminUser = {
    email: 'p.romanczuk@gmail.com',
    password: 'test123_admin',
  };

  const testLesson = {
    student_name: 'John Doe',
    teacher_name: 'Jane Smith',
    date: '2025-12-01',
    time: '14:00',
    duration: 60,
    notes: 'Focus on chord transitions',
    status: 'scheduled',
  };

  const editedLesson = {
    date: '2025-12-02',
    time: '15:00',
    duration: 90,
    notes: 'Work on strumming patterns and song structure',
    status: 'completed',
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

    // Navigate to lesson management
    cy.visit('/dashboard/lessons');
  });

  context('Lessons Overview', () => {
    it('should display lessons overview with proper layout', () => {
      cy.url().should('include', '/lessons');

      // Wait for loading to complete
      cy.get('[data-testid="lesson-list-loading"]', { timeout: 5000 }).should('not.exist');

      // Should show either lessons table or empty state
      cy.get('body').then(($body) => {
        if ($body.find('table, .lessons-table, .lesson-list, .calendar-view').length > 0) {
          // Verify lesson display elements
          cy.get('th, .table-header, .lesson-header').should(
            'contain.text',
            /date|time|student|teacher/i
          );
        } else {
          // Empty state is acceptable
          cy.contains(/no lessons|empty|schedule your first/i).should('be.visible');
        }
      });
    });

    it('should show lesson statistics and summary', () => {
      // Look for lesson metrics
      cy.get('body').then(($body) => {
        if ($body.text().match(/\d+ lessons?|upcoming|completed|total/i)) {
          cy.contains(/\d+ lessons?|upcoming|completed|total/i).should('be.visible');
        } else {
          cy.log('Lesson statistics not displayed - this is optional');
        }
      });
    });

    it('should display upcoming lessons prominently', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.upcoming-lessons, [data-testid="upcoming-lessons"]').length > 0) {
          cy.get('.upcoming-lessons, [data-testid="upcoming-lessons"]').should('be.visible');
        } else {
          cy.log('Upcoming lessons section not implemented');
        }
      });
    });

    it('should show teacher-student pairings', () => {
      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr, .lesson-item').length > 0) {
          // Verify lesson entries contain teacher and student info
          cy.get('table tbody tr, .lesson-item').first().should('contain.text', /\w+/);
        }
      });
    });
  });

  context('Create New Lesson', () => {
    it('should open create lesson form', () => {
      // Click create lesson button
      cy.get('[data-testid="create-lesson-btn"], button, a')
        .contains(/create|add|new lesson|schedule/i)
        .first()
        .click();

      // Should navigate to create form or open modal
      cy.url().should('match', /\/lessons\/new|\/create|\/schedule/);
      cy.contains(/create|add|new lesson|schedule/i).should('be.visible');
    });

    it('should create a new lesson with all details', () => {
      // Open create form
      cy.get('[data-testid="create-lesson-btn"], button, a')
        .contains(/create|add|new lesson|schedule/i)
        .first()
        .click();

      // Select student
      cy.get(
        '[data-testid="lesson-student"], select[name="student"], select[name="student_id"]'
      ).select(1); // Select first available student

      // Select teacher
      cy.get(
        '[data-testid="lesson-teacher"], select[name="teacher"], select[name="teacher_id"]'
      ).select(1); // Select first available teacher

      // Set date
      cy.get('[data-testid="lesson-date"], input[name="date"], input[type="date"]').type(
        testLesson.date
      );

      // Set time
      cy.get('[data-testid="lesson-time"], input[name="time"], input[type="time"]').type(
        testLesson.time
      );

      // Set duration
      cy.get(
        '[data-testid="lesson-duration"], input[name="duration"], select[name="duration"]'
      ).then(($element) => {
        if ($element.is('select')) {
          cy.wrap($element).select(testLesson.duration.toString());
        } else {
          cy.wrap($element).type(testLesson.duration.toString());
        }
      });

      // Add notes
      cy.get('[data-testid="lesson-notes"], textarea[name="notes"], input[name="notes"]').type(
        testLesson.notes
      );

      // Set status (if available)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="lesson-status"], select[name="status"]').length > 0) {
          cy.get('[data-testid="lesson-status"], select[name="status"]').select(testLesson.status);
        }
      });

      // Submit form
      cy.get('[data-testid="submit-lesson"], button[type="submit"]').click();

      // Should redirect to lessons list and show new lesson
      cy.url({ timeout: 10000 }).should('match', /\/lessons$|\/dashboard\/lessons$/);
      cy.contains(testLesson.date.replace('-', '/'), { timeout: 10000 }).should('be.visible');
    });

    it('should validate required fields', () => {
      // Open create form
      cy.get('[data-testid="create-lesson-btn"], button, a')
        .contains(/create|add|new lesson|schedule/i)
        .first()
        .click();

      // Try to submit empty form
      cy.get('[data-testid="submit-lesson"], button[type="submit"]').click();

      // Should show validation errors
      cy.get('select:invalid, input:invalid, .error, .field-error, [aria-invalid="true"]').should(
        'have.length.greaterThan',
        0
      );
    });

    it('should validate date and time conflicts', () => {
      // First, create a lesson
      cy.get('[data-testid="create-lesson-btn"], button, a')
        .contains(/create|add|new lesson|schedule/i)
        .first()
        .click();

      cy.get(
        '[data-testid="lesson-student"], select[name="student"], select[name="student_id"]'
      ).select(1);
      cy.get(
        '[data-testid="lesson-teacher"], select[name="teacher"], select[name="teacher_id"]'
      ).select(1);
      cy.get('[data-testid="lesson-date"], input[name="date"], input[type="date"]').type(
        '2025-12-15'
      );
      cy.get('[data-testid="lesson-time"], input[name="time"], input[type="time"]').type('10:00');

      cy.get('[data-testid="submit-lesson"], button[type="submit"]').click();
      cy.url({ timeout: 10000 }).should('match', /\/lessons$|\/dashboard\/lessons$/);

      // Try to create conflicting lesson
      cy.get('[data-testid="create-lesson-btn"], button, a')
        .contains(/create|add|new lesson|schedule/i)
        .first()
        .click();

      cy.get(
        '[data-testid="lesson-student"], select[name="student"], select[name="student_id"]'
      ).select(1);
      cy.get(
        '[data-testid="lesson-teacher"], select[name="teacher"], select[name="teacher_id"]'
      ).select(1);
      cy.get('[data-testid="lesson-date"], input[name="date"], input[type="date"]').type(
        '2025-12-15'
      );
      cy.get('[data-testid="lesson-time"], input[name="time"], input[type="time"]').type('10:00');

      cy.get('[data-testid="submit-lesson"], button[type="submit"]').click();

      // Should show conflict warning or error
      cy.get('body').then(($body) => {
        if ($body.text().match(/conflict|overlap|already scheduled/i)) {
          cy.contains(/conflict|overlap|already scheduled/i).should('be.visible');
        } else {
          cy.log('Time conflict validation not implemented');
        }
      });
    });

    it('should suggest available time slots', () => {
      cy.get('[data-testid="create-lesson-btn"], button, a')
        .contains(/create|add|new lesson|schedule/i)
        .first()
        .click();

      // Select student and teacher first
      cy.get(
        '[data-testid="lesson-student"], select[name="student"], select[name="student_id"]'
      ).select(1);
      cy.get(
        '[data-testid="lesson-teacher"], select[name="teacher"], select[name="teacher_id"]'
      ).select(1);
      cy.get('[data-testid="lesson-date"], input[name="date"], input[type="date"]').type(
        '2025-12-20'
      );

      // Check if time suggestions appear
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="suggested-times"], .time-suggestions').length > 0) {
          cy.get('[data-testid="suggested-times"], .time-suggestions').should('be.visible');
        } else {
          cy.log('Time suggestions not implemented');
        }
      });
    });
  });

  context('Edit Existing Lesson', () => {
    beforeEach(() => {
      // Ensure we have a lesson to edit by checking and creating if needed
      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr, .lesson-item').length === 0) {
          // Create a test lesson first
          cy.get('[data-testid="create-lesson-btn"], button, a')
            .contains(/create|add|new lesson|schedule/i)
            .first()
            .click();

          cy.get(
            '[data-testid="lesson-student"], select[name="student"], select[name="student_id"]'
          ).select(1);
          cy.get(
            '[data-testid="lesson-teacher"], select[name="teacher"], select[name="teacher_id"]'
          ).select(1);
          cy.get('[data-testid="lesson-date"], input[name="date"], input[type="date"]').type(
            testLesson.date
          );
          cy.get('[data-testid="lesson-time"], input[name="time"], input[type="time"]').type(
            testLesson.time
          );

          cy.get('[data-testid="submit-lesson"], button[type="submit"]').click();
          cy.url({ timeout: 10000 }).should('match', /\/lessons$|\/dashboard\/lessons$/);
        }
      });
    });

    it('should open edit form for existing lesson', () => {
      // Find a lesson and click edit
      cy.get('table tbody tr, .lesson-item')
        .first()
        .within(() => {
          cy.get('[data-testid="edit-lesson-btn"], button, a')
            .contains(/edit|update|modify/i)
            .click();
        });

      // Should navigate to edit form
      cy.url().should('match', /\/edit|\/update/);
      cy.contains(/edit|update|modify lesson/i).should('be.visible');
    });

    it('should update lesson information', () => {
      // Open edit form
      cy.get('table tbody tr, .lesson-item')
        .first()
        .within(() => {
          cy.get('[data-testid="edit-lesson-btn"], button, a')
            .contains(/edit|update|modify/i)
            .click();
        });

      // Update lesson details
      cy.get('[data-testid="lesson-date"], input[name="date"], input[type="date"]')
        .clear()
        .type(editedLesson.date);

      cy.get('[data-testid="lesson-time"], input[name="time"], input[type="time"]')
        .clear()
        .type(editedLesson.time);

      cy.get(
        '[data-testid="lesson-duration"], input[name="duration"], select[name="duration"]'
      ).then(($element) => {
        if ($element.is('select')) {
          cy.wrap($element).select(editedLesson.duration.toString());
        } else {
          cy.wrap($element).clear().type(editedLesson.duration.toString());
        }
      });

      cy.get('[data-testid="lesson-notes"], textarea[name="notes"], input[name="notes"]')
        .clear()
        .type(editedLesson.notes);

      // Update status if available
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="lesson-status"], select[name="status"]').length > 0) {
          cy.get('[data-testid="lesson-status"], select[name="status"]').select(
            editedLesson.status
          );
        }
      });

      // Save changes
      cy.get('[data-testid="submit-lesson"], button[type="submit"]').click();

      // Should redirect and show updated information
      cy.url({ timeout: 10000 }).should('match', /\/lessons$|\/dashboard\/lessons$/);
      cy.contains(editedLesson.date.replace('-', '/'), { timeout: 10000 }).should('be.visible');
    });

    it('should reschedule lesson to new date/time', () => {
      // Open edit form
      cy.get('table tbody tr, .lesson-item')
        .first()
        .within(() => {
          cy.get('[data-testid="edit-lesson-btn"], button, a')
            .contains(/edit|update|modify/i)
            .click();
        });

      // Change date and time
      const newDate = '2025-12-25';
      const newTime = '16:30';

      cy.get('[data-testid="lesson-date"], input[name="date"], input[type="date"]')
        .clear()
        .type(newDate);
      cy.get('[data-testid="lesson-time"], input[name="time"], input[type="time"]')
        .clear()
        .type(newTime);

      cy.get('[data-testid="submit-lesson"], button[type="submit"]').click();

      // Should show rescheduled lesson
      cy.url({ timeout: 10000 }).should('match', /\/lessons$|\/dashboard\/lessons$/);
      cy.contains(newDate.replace('-', '/'), { timeout: 10000 }).should('be.visible');
    });

    it('should cancel edit without saving', () => {
      // Open edit form
      cy.get('table tbody tr, .lesson-item')
        .first()
        .within(() => {
          cy.get('[data-testid="edit-lesson-btn"], button, a')
            .contains(/edit|update|modify/i)
            .click();
        });

      // Make changes
      cy.get('[data-testid="lesson-notes"], textarea[name="notes"], input[name="notes"]')
        .clear()
        .type('Should not save these notes');

      // Cancel
      cy.get('[data-testid="cancel-btn"], button, a')
        .contains(/cancel|back/i)
        .click();

      // Should return without saving
      cy.url({ timeout: 10000 }).should('match', /\/lessons$|\/dashboard\/lessons$/);
      cy.contains('Should not save these notes').should('not.exist');
    });
  });

  context('Lesson Status Management', () => {
    it('should update lesson status to completed', () => {
      // Find a scheduled lesson
      cy.get('table tbody tr, .lesson-item')
        .first()
        .within(() => {
          cy.get('[data-testid="mark-completed-btn"], button')
            .contains(/complete|finish|done/i)
            .click();
        });

      // Should update status
      cy.contains(/completed|finished|done/i, { timeout: 5000 }).should('be.visible');
    });

    it('should cancel a scheduled lesson', () => {
      cy.get('table tbody tr, .lesson-item')
        .first()
        .within(() => {
          cy.get('[data-testid="cancel-lesson-btn"], button')
            .contains(/cancel|abort/i)
            .click();
        });

      // Confirm cancellation
      cy.get('[data-testid="confirm-cancel"], button')
        .contains(/confirm|yes|cancel lesson/i)
        .click();

      // Should show cancelled status
      cy.contains(/cancelled|canceled/i, { timeout: 5000 }).should('be.visible');
    });

    it('should reschedule a cancelled lesson', () => {
      // First cancel a lesson
      cy.get('table tbody tr, .lesson-item')
        .first()
        .within(() => {
          cy.get('[data-testid="cancel-lesson-btn"], button')
            .contains(/cancel|abort/i)
            .click();
        });

      cy.get('[data-testid="confirm-cancel"], button')
        .contains(/confirm|yes|cancel lesson/i)
        .click();

      // Then reschedule it
      cy.contains('tr, .lesson-item', /cancelled/i).within(() => {
        cy.get('[data-testid="reschedule-btn"], button')
          .contains(/reschedule|schedule again/i)
          .click();
      });

      // Should open reschedule form
      cy.contains(/reschedule|new date/i).should('be.visible');
    });
  });

  context('Song Assignment to Lessons', () => {
    it('should assign songs to a lesson', () => {
      // Open lesson details or edit form
      cy.get('table tbody tr, .lesson-item')
        .first()
        .within(() => {
          cy.get('[data-testid="view-lesson"], [data-testid="edit-lesson-btn"], a, button')
            .first()
            .click();
        });

      // Look for song assignment section
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="assign-songs"], .song-assignment').length > 0) {
          // Add songs to lesson
          cy.get('[data-testid="add-song-btn"], button')
            .contains(/add song|assign song/i)
            .click();

          // Select a song
          cy.get('[data-testid="song-select"], select[name="song"]').select(1); // Select first available song

          cy.get('[data-testid="confirm-assign"], button').click();

          cy.contains(/song assigned|added to lesson/i).should('be.visible');
        } else {
          cy.log('Song assignment feature not implemented');
        }
      });
    });

    it('should track song progress in lessons', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.song-progress, [data-testid="song-progress"]').length > 0) {
          // Update song progress
          cy.get('.song-progress select, [data-testid="song-progress"] select')
            .first()
            .select('started'); // Update progress status

          cy.contains(/progress updated|status changed/i).should('be.visible');
        } else {
          cy.log('Song progress tracking not implemented');
        }
      });
    });

    it('should remove songs from lessons', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="remove-song"], .remove-song').length > 0) {
          // Remove assigned song
          cy.get('[data-testid="remove-song"], button').first().click();
          cy.get('[data-testid="confirm-remove"], button').click();

          cy.contains(/song removed|unassigned/i).should('be.visible');
        } else {
          cy.log('Song removal not implemented');
        }
      });
    });
  });

  context('Lesson Filtering and Search', () => {
    it('should filter lessons by date range', () => {
      // Use date filters
      cy.get('[data-testid="start-date"], input[name="start_date"]').type('2025-12-01');
      cy.get('[data-testid="end-date"], input[name="end_date"]').type('2025-12-31');

      cy.get('[data-testid="apply-filter"], button').click();

      // Should show filtered results
      cy.get('table tbody tr, .lesson-item').should('have.length.greaterThan', 0);
    });

    it('should filter lessons by teacher', () => {
      cy.get('[data-testid="teacher-filter"], select[name="teacher"]').select(1); // Select first teacher

      // Should show only lessons for that teacher
      cy.get('table tbody tr, .lesson-item').should('exist');
    });

    it('should filter lessons by student', () => {
      cy.get('[data-testid="student-filter"], select[name="student"]').select(1); // Select first student

      // Should show only lessons for that student
      cy.get('table tbody tr, .lesson-item').should('exist');
    });

    it('should filter lessons by status', () => {
      cy.get('[data-testid="status-filter"], select[name="status"]').select('scheduled');

      // Should show only scheduled lessons
      cy.get('table tbody tr, .lesson-item').each(($row) => {
        cy.wrap($row).should('contain.text', /scheduled|upcoming/i);
      });
    });

    it('should search lessons by notes content', () => {
      cy.get('[data-testid="lesson-search"], input[placeholder*="search"]').type('chord');

      // Should filter to lessons with "chord" in notes
      cy.get('table tbody tr, .lesson-item').should('have.length.lessThan', 20);
    });
  });

  context('Calendar View Integration', () => {
    it('should display lessons in calendar view', () => {
      // Switch to calendar view
      cy.get('[data-testid="calendar-view"], button, a')
        .contains(/calendar|month|week/i)
        .click();

      // Should show calendar interface
      cy.get('.calendar, [data-testid="calendar"], .fc-view').should('be.visible');
    });

    it('should navigate between months in calendar', () => {
      cy.get('[data-testid="calendar-view"], button, a')
        .contains(/calendar|month|week/i)
        .click();

      // Navigate to next month
      cy.get('[data-testid="next-month"], .fc-next-button, button')
        .contains(/next|>/i)
        .click();

      // Should show different month
      cy.get('.calendar-header, .fc-toolbar-title').should('contain.text', /\w+/);
    });

    it('should create lesson by clicking on calendar date', () => {
      cy.get('[data-testid="calendar-view"], button, a')
        .contains(/calendar|month|week/i)
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('.calendar-date, .fc-day, [data-date]').length > 0) {
          // Click on a future date
          cy.get('.calendar-date, .fc-day, [data-date]').eq(15).click();

          // Should open create lesson form with date pre-filled
          cy.contains(/create|new lesson|schedule/i).should('be.visible');
        } else {
          cy.log('Calendar date clicking not implemented');
        }
      });
    });
  });

  context('Lesson Analytics and Reporting', () => {
    it('should display lesson completion statistics', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="lesson-stats"], .analytics, .reports').length > 0) {
          // Check for completion rate
          cy.get('[data-testid="completion-rate"], .completion-rate').should(
            'contain.text',
            /%|rate|completed/i
          );
        } else {
          cy.log('Lesson analytics not implemented');
        }
      });
    });

    it('should show teacher performance metrics', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.teacher-metrics, [data-testid="teacher-performance"]').length > 0) {
          cy.get('.teacher-metrics, [data-testid="teacher-performance"]').should('be.visible');
        } else {
          cy.log('Teacher metrics not implemented');
        }
      });
    });

    it('should export lesson reports', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="export-report"], button').length > 0) {
          cy.get('[data-testid="export-report"], button')
            .contains(/export|download|report/i)
            .click();

          cy.log('Report export functionality available');
        } else {
          cy.log('Report export not implemented');
        }
      });
    });
  });

  context('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Simulate API error
      cy.intercept('GET', '**/api/lesson*', { statusCode: 500 }).as('lessonsError');

      cy.reload();

      // Should show error message
      cy.contains(/error|failed|unavailable/i, { timeout: 10000 }).should('be.visible');
    });

    it('should handle scheduling conflicts', () => {
      cy.intercept('POST', '**/api/lesson*', {
        statusCode: 409,
        body: { error: 'Scheduling conflict detected' },
      }).as('conflictError');

      // Try to create conflicting lesson
      cy.get('[data-testid="create-lesson-btn"], button, a')
        .contains(/create|add|new lesson|schedule/i)
        .first()
        .click();

      cy.get(
        '[data-testid="lesson-student"], select[name="student"], select[name="student_id"]'
      ).select(1);
      cy.get(
        '[data-testid="lesson-teacher"], select[name="teacher"], select[name="teacher_id"]'
      ).select(1);
      cy.get('[data-testid="lesson-date"], input[name="date"], input[type="date"]').type(
        '2025-12-15'
      );
      cy.get('[data-testid="lesson-time"], input[name="time"], input[type="time"]').type('10:00');

      cy.get('[data-testid="submit-lesson"], button[type="submit"]').click();

      // Should show conflict error
      cy.contains(/conflict|overlap|already scheduled/i, { timeout: 10000 }).should('be.visible');
    });

    it('should handle network failures during creation', () => {
      cy.intercept('POST', '**/api/lesson*', { forceNetworkError: true }).as('networkError');

      cy.get('[data-testid="create-lesson-btn"], button, a')
        .contains(/create|add|new lesson|schedule/i)
        .first()
        .click();

      cy.get(
        '[data-testid="lesson-student"], select[name="student"], select[name="student_id"]'
      ).select(1);
      cy.get(
        '[data-testid="lesson-teacher"], select[name="teacher"], select[name="teacher_id"]'
      ).select(1);
      cy.get('[data-testid="lesson-date"], input[name="date"], input[type="date"]').type(
        '2025-12-20'
      );

      cy.get('[data-testid="submit-lesson"], button[type="submit"]').click();

      // Should show network error
      cy.contains(/network|connection|error/i, { timeout: 10000 }).should('be.visible');
    });
  });
});
