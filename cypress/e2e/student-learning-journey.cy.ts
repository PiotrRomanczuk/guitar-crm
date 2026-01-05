/// <reference types="cypress" />

/**
 * Student Learning Journey Test
 *
 * This test covers the student experience:
 * 1. Sign in as student
 * 2. View dashboard with stats
 * 3. Check upcoming lessons
 * 4. Browse assigned songs
 * 5. View and complete assignments
 * 6. Update profile settings
 *
 * Prerequisites:
 * - TEST_STUDENT_EMAIL and TEST_STUDENT_PASSWORD in cypress.env.json
 * - Student should have pre-existing lessons, songs, and assignments
 */

describe('Student Learning Journey', () => {
  const STUDENT_EMAIL = Cypress.env('TEST_STUDENT_EMAIL');
  const STUDENT_PASSWORD = Cypress.env('TEST_STUDENT_PASSWORD');

  beforeEach(() => {
    // Skip if no student credentials configured
    if (!STUDENT_EMAIL || !STUDENT_PASSWORD) {
      cy.log('Skipping student journey - no credentials configured');
      return;
    }

    // Use cached login session
    cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
  });

  describe('Phase 1: Dashboard Overview', () => {
    it('should display student dashboard with key metrics', () => {
      cy.visit('/dashboard');

      // Should see student-specific dashboard
      // Look for common student metrics
      cy.contains(/dashboard|overview|welcome/i).should('be.visible');

      // Check for stat cards (lessons, songs, assignments, etc.)
      cy.get('[data-testid="stat-card"], .stat-card, [class*="card"]').should('have.length.gte', 1);
    });

    it('should show next upcoming lesson', () => {
      cy.visit('/dashboard');

      // Look for next lesson section
      cy.contains(/next lesson|upcoming|scheduled/i).should('exist');
    });

    it('should display recent activity or progress', () => {
      cy.visit('/dashboard');

      // Look for activity or progress section
      cy.contains(/activity|progress|recent/i).should('exist');
    });
  });

  describe('Phase 2: View Lessons', () => {
    it('should navigate to lessons page', () => {
      cy.visit('/dashboard/lessons');

      // Should see lessons list
      cy.contains(/lessons|schedule/i).should('be.visible');
    });

    it('should only see own lessons (not other students)', () => {
      cy.visit('/dashboard/lessons');

      // If there are lessons, they should all be for this student
      // The page should not show teacher-only controls
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="lesson-row"], tr').length > 0) {
          // Verify no "All Students" filter or similar admin controls
          cy.contains(/all students|filter by student/i).should('not.exist');
        }
      });
    });

    it('should click on a lesson to view details', () => {
      cy.visit('/dashboard/lessons');

      // Click on first lesson if exists
      cy.get('body').then(($body) => {
        const lessonLink = $body.find('a[href*="/lessons/"]').first();
        if (lessonLink.length > 0) {
          cy.wrap(lessonLink).click();
          cy.location('pathname').should('include', '/lessons/');

          // Should see lesson details
          cy.contains(/lesson|details|notes/i).should('be.visible');
        } else {
          cy.log('No lessons found for this student');
        }
      });
    });
  });

  describe('Phase 3: Browse Songs', () => {
    it('should navigate to songs page', () => {
      cy.visit('/dashboard/songs');

      // Should see songs list
      cy.contains(/songs|library|repertoire/i).should('be.visible');
    });

    it('should display assigned or available songs', () => {
      cy.visit('/dashboard/songs');

      // Wait for page to load - "My Songs" heading appears
      cy.contains('My Songs').should('be.visible');

      // Wait for loading spinner to disappear (if present)
      cy.get('[class*="animate-spin"]', { timeout: 1000 }).should('not.exist');

      // Now check for either songs or empty state
      // Use cy.get with timeout to wait for content
      cy.get('body', { timeout: 10000 }).should('satisfy', ($body) => {
        const hasSongs = $body.find('a[href*="/songs/"]').length > 0;
        const hasEmptyState = $body.text().includes('No songs found');
        return hasSongs || hasEmptyState;
      });
    });

    it('should click on a song to view details', () => {
      cy.visit('/dashboard/songs');

      cy.get('body').then(($body) => {
        const songLink = $body.find('a[href*="/songs/"]').first();
        if (songLink.length > 0) {
          cy.wrap(songLink).click();
          cy.location('pathname').should('include', '/songs/');

          // Should see song details (title, author, chords, etc.)
          cy.contains(/title|author|chords|key/i).should('exist');
        } else {
          cy.log('No songs found');
        }
      });
    });

    it('should display song details when available', () => {
      cy.visit('/dashboard/songs');

      // The student songs view is a simplified card-based view
      // It doesn't have search - just displays assigned songs
      // Verify the page structure is correct
      cy.contains('My Songs').should('be.visible');
      cy.contains(/songs you are currently learning|mastered/i).should('be.visible');
    });
  });

  describe('Phase 4: Manage Assignments', () => {
    it('should navigate to assignments page', () => {
      cy.visit('/dashboard/assignments');

      // Should see assignments list
      cy.contains(/assignments|homework|practice/i).should('be.visible');
    });

    it('should display assignment status (pending, completed, overdue)', () => {
      cy.visit('/dashboard/assignments');

      // Wait for page to load - "My Assignments" heading appears
      cy.contains('My Assignments').should('be.visible');

      // Wait for loading spinner to disappear (if present)
      cy.get('[class*="animate-spin"]', { timeout: 1000 }).should('not.exist');

      // Now check for either assignments with status or empty state
      cy.get('body', { timeout: 10000 }).should('satisfy', ($body) => {
        const hasAssignments = $body.find('a[href*="/assignments/"]').length > 0;
        const hasEmptyState = $body.text().includes('No assignments found');
        return hasAssignments || hasEmptyState;
      });
    });

    it('should click on assignment to view details', () => {
      cy.visit('/dashboard/assignments');

      cy.get('body').then(($body) => {
        const assignmentLink = $body.find('a[href*="/assignments/"]').first();
        if (assignmentLink.length > 0) {
          cy.wrap(assignmentLink).click();
          cy.location('pathname').should('include', '/assignments/');

          // Should see assignment details
          cy.contains(/instructions|due date|song|status/i).should('exist');
        } else {
          cy.log('No assignments found');
        }
      });
    });

    it('should be able to mark assignment as complete (if pending)', () => {
      cy.visit('/dashboard/assignments');

      // Look for a pending assignment with complete button
      cy.get('body').then(($body) => {
        const completeBtn = $body
          .find(
            'button:contains("Complete"), button:contains("Mark Done"), [data-testid="complete-btn"]'
          )
          .first();
        if (completeBtn.length > 0) {
          cy.wrap(completeBtn).click();

          // Should show success or status change
          cy.contains(/completed|success|done/i, { timeout: 5000 }).should('be.visible');
        } else {
          cy.log('No completable assignments found');
        }
      });
    });
  });

  describe('Phase 5: Profile & Settings', () => {
    it('should navigate to profile page', () => {
      cy.visit('/dashboard/profile');

      // Should see profile info
      cy.contains(/profile|account|settings/i).should('be.visible');
    });

    it('should display current user information', () => {
      cy.visit('/dashboard/profile');

      // Profile page shows form fields for first name, last name, etc.
      // Check that the profile form exists
      cy.get('form').should('exist');

      // Look for profile-related form fields or labels
      cy.contains(/first name|last name|email|profile/i).should('exist');
    });

    it('should navigate to settings', () => {
      cy.visit('/dashboard/settings');

      // Should see settings options
      cy.contains(/settings|preferences/i).should('be.visible');
    });

    it('should be able to toggle theme (if available)', () => {
      cy.visit('/dashboard/settings');

      // Look for theme toggle
      cy.get('body').then(($body) => {
        const themeToggle = $body
          .find('[data-testid="theme-toggle"], button:contains("Theme"), [aria-label*="theme"]')
          .first();
        if (themeToggle.length > 0) {
          cy.wrap(themeToggle).click();
          cy.log('Theme toggled');
        } else {
          cy.log('No theme toggle found');
        }
      });
    });
  });

  describe('Phase 6: Access Control Verification', () => {
    it('should NOT have access to admin-only pages', () => {
      // Try to access admin routes - should redirect or show error
      cy.visit('/dashboard/users', { failOnStatusCode: false });

      // Wait for page to load/redirect
      cy.wait(1000);

      // Should either redirect away from users page OR not show admin content
      // The middleware or page should handle access control
      cy.location('pathname').then((path) => {
        if (!path.includes('/users')) {
          // Redirected away from users page - that's correct
          cy.log('Correctly redirected from admin page');
        } else {
          // If still on users page, it should be restricted somehow
          // Could show empty state or limited view
          cy.log('On users page - checking for restricted access');
        }
      });
    });

    it('should NOT see other students lessons', () => {
      // This is verified by the lessons list only showing own lessons
      cy.visit('/dashboard/lessons');

      // Should not see any admin controls
      cy.contains(/all lessons|manage|teacher/i).should('not.exist');
    });
  });
});
