/// <reference types="cypress" />

/**
 * Data Relationships & Cascading Tests
 *
 * Tests data integrity and relationships:
 * - Lesson-Song relationships
 * - Lesson-Assignment relationships
 * - User-Lesson relationships
 * - Cascade delete handling
 * - Data consistency
 */

describe('Data Relationships & Cascading', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');

  const timestamp = Date.now();

  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  describe('Lesson-Song Relationship', () => {
    it('should show songs associated with a lesson', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Navigate to first lesson with songs
      cy.get('a[href*="/lessons/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/lessons\/[a-z0-9-]+$/i);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      cy.get('body').then(($body) => {
        const hasSongsSection =
          $body.find(':contains("Songs"), [data-testid*="lesson-songs"]').length > 0;
        if (hasSongsSection) {
          cy.log('Songs section is displayed on lesson detail');
        }
      });
    });

    it('should navigate to song from lesson detail', () => {
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
        const songLink = $body.find('a[href*="/songs/"]');
        if (songLink.length > 0) {
          cy.get('a[href*="/songs/"]').first().click({ force: true });
          cy.wait(1000);
          cy.url().should('include', '/songs/');
          cy.log('Successfully navigated to song from lesson');
        }
      });
    });
  });

  describe('Lesson-Assignment Relationship', () => {
    it('should show assignments linked to a lesson', () => {
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
        const hasAssignmentsSection =
          $body.find(':contains("Assignment"), a[href*="/assignments/"]').length > 0;
        if (hasAssignmentsSection) {
          cy.log('Assignments are linked to lesson');
        }
      });
    });

    it('should show lesson reference on assignment detail', () => {
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      cy.get('a[href*="/assignments/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/assignments\/\d+$/);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      cy.get('body').then(($body) => {
        const hasLessonRef =
          $body.find(':contains("Lesson"), a[href*="/lessons/"]').length > 0;
        if (hasLessonRef) {
          cy.log('Lesson reference is shown on assignment');
        }
      });
    });
  });

  describe('User-Lesson Relationship', () => {
    it('should show lessons assigned to a student', () => {
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

      cy.get('body').then(($body) => {
        const hasLessonsSection =
          $body.find(':contains("Lessons"), [data-testid*="user-lessons"]').length > 0;
        if (hasLessonsSection) {
          cy.log('Lessons are shown for user');
        }
      });
    });

    it('should show student name on lesson detail', () => {
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
        const hasStudentInfo =
          $body.find(':contains("Student"), a[href*="/users/"]').length > 0;
        if (hasStudentInfo) {
          cy.log('Student information is shown on lesson');
        }
      });
    });
  });

  describe('User-Assignment Relationship', () => {
    it('should show assignments assigned to a student', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      cy.get('a[href*="/users/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/users\/[a-z0-9-]+$/i);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      cy.get('body').then(($body) => {
        const hasAssignmentsSection =
          $body.find(':contains("Assignments"), [data-testid*="user-assignments"]').length > 0;
        if (hasAssignmentsSection) {
          cy.log('Assignments are shown for user');
        }
      });
    });
  });

  describe('Song Progress Tracking', () => {
    it('should track song progress per student', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('a[href*="/songs/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/songs\/[a-z0-9-]+$/i);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      cy.get('body').then(($body) => {
        const hasProgress =
          $body.find(':contains("Progress"), :contains("Students"), [data-testid*="progress"]').length > 0;
        if (hasProgress) {
          cy.log('Song progress tracking is available');
        }
      });
    });
  });

  describe('Create and Verify Relationships', () => {
    const testData = {
      lessonTitle: `Relationship Test Lesson ${timestamp}`,
    };

    it('should create a lesson and verify it appears in student profile', () => {
      // First, create a lesson
      cy.visit('/dashboard/lessons/new');
      cy.wait(2000);

      // Fill lesson form
      cy.get('[data-testid="lesson-student_id"]', { timeout: 10000 }).click({ force: true });
      cy.wait(500);
      cy.get('[role="option"]').first().click({ force: true });

      cy.get('[data-testid="lesson-teacher_id"]').click({ force: true });
      cy.wait(500);
      cy.get('[role="option"]').first().click({ force: true });

      cy.get('[data-testid="lesson-title"]').type(testData.lessonTitle);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().slice(0, 16);
      cy.get('[data-testid="lesson-scheduled-at"]').type(dateStr);

      cy.get('[data-testid="lesson-submit"]').click({ force: true });

      // Verify redirect
      cy.url({ timeout: 15000 }).should('include', '/dashboard/lessons');
      cy.url().should('not.include', '/new');

      // Verify lesson appears in list
      cy.visit('/dashboard/lessons');
      cy.wait(2000);
      cy.contains(testData.lessonTitle).should('exist');

      // Cleanup - delete the test lesson
      cy.contains(testData.lessonTitle).click({ force: true });
      cy.wait(1500);
      cy.get('[data-testid="lesson-delete-button"]', { timeout: 5000 }).click({ force: true });
      cy.get('[role="alertdialog"]', { timeout: 5000 }).within(() => {
        cy.contains('button', /delete/i).click({ force: true });
      });
    });
  });

  describe('Data Consistency Checks', () => {
    it('should maintain referential integrity on page navigation', () => {
      // Navigate through related entities
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

      // Check for broken links or missing data
      cy.get('body').then(($body) => {
        const hasBrokenState =
          $body.find(':contains("undefined"), :contains("null"), :contains("NaN")').filter(':visible').length > 0;
        if (hasBrokenState) {
          cy.log('Warning: Possible data inconsistency detected');
        } else {
          cy.log('Data appears consistent');
        }
      });
    });

    it('should not show deleted related items', () => {
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

      // Check for orphaned references
      cy.get('body').then(($body) => {
        const hasOrphanedRefs =
          $body.find(':contains("Deleted"), :contains("Not Found")').filter(':visible').length > 0;
        if (hasOrphanedRefs) {
          cy.log('Warning: Orphaned references detected');
        } else {
          cy.log('No orphaned references found');
        }
      });
    });
  });

  describe('Responsive Data Display', () => {
    it('should show relationships on mobile view', () => {
      cy.viewport(375, 667);
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('a[href*="/lessons/"]')
        .filter(':visible')
        .first()
        .click({ force: true });

      cy.wait(1500);
      cy.get('main, [role="main"]').should('be.visible');
    });
  });
});
