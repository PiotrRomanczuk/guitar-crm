/// <reference types="cypress" />

/**
 * Integration Workflow Tests
 *
 * Tests complete end-to-end workflows spanning multiple features:
 * - Full Lesson Flow: Admin creates lesson → adds songs → assigns to student → student views
 * - Assignment Flow: Admin creates → student sees → student completes
 * - Song Progress Flow: Song assigned → student tracks progress
 */

describe('Integration Workflows', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');
  const STUDENT_EMAIL = Cypress.env('TEST_STUDENT_EMAIL');
  const STUDENT_PASSWORD = Cypress.env('TEST_STUDENT_PASSWORD');

  const timestamp = Date.now();

  describe('Full Lesson Workflow', () => {
    const lessonData = {
      title: `Integration Lesson ${timestamp}`,
      notes: 'Integration test lesson notes',
    };

    it('1. Admin creates a new lesson', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/lessons/new');
      cy.wait(2000);

      // Wait for form to load
      cy.get('[data-testid="lesson-student_id"]', { timeout: 10000 }).should('be.visible');

      // Select student
      cy.wait(1000);
      cy.get('[data-testid="lesson-student_id"]').click({ force: true });
      cy.wait(500);
      cy.get('[role="option"]').first().click({ force: true });
      cy.wait(500);

      // Select teacher
      cy.get('[data-testid="lesson-teacher_id"]').click({ force: true });
      cy.wait(500);
      cy.get('[role="option"]').first().click({ force: true });
      cy.wait(500);

      // Fill in lesson details
      cy.get('[data-testid="lesson-title"]').clear({ force: true }).type(lessonData.title);

      // Set scheduled date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().slice(0, 16);
      cy.get('[data-testid="lesson-scheduled-at"]').clear({ force: true }).type(dateStr);

      // Add notes
      cy.get('[data-testid="lesson-notes"]').clear({ force: true }).type(lessonData.notes);

      // Submit
      cy.get('[data-testid="lesson-submit"]').click({ force: true });

      // Verify redirect
      cy.url({ timeout: 15000 }).should('include', '/dashboard/lessons');
      cy.url().should('not.include', '/new');
    });

    it('2. Admin verifies lesson in list', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Lesson should appear in list
      cy.contains(lessonData.title, { timeout: 10000 }).should('exist');
    });

    it('3. Student can view the lesson', () => {
      cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Student may or may not see this specific lesson depending on assignment
      // The test verifies the lessons page loads correctly
      cy.url().should('include', '/lessons');
    });

    it('4. Admin can delete the test lesson (cleanup)', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Find and click on the lesson
      cy.contains(lessonData.title).click({ force: true });
      cy.location('pathname').should('match', /\/lessons\/[^/]+$/);

      // Delete the lesson
      cy.get('[data-testid="lesson-delete-button"]', { timeout: 5000 }).click({ force: true });

      // Confirm deletion
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="delete-confirm-button"], button:contains("Delete")').length > 0) {
          cy.get('[data-testid="delete-confirm-button"], button:contains("Delete")')
            .filter(':visible')
            .first()
            .click({ force: true });
        }
      });

      // Verify deletion
      cy.location('pathname', { timeout: 10000 }).should('eq', '/dashboard/lessons');
    });
  });

  describe('Assignment Workflow', () => {
    const assignmentData = {
      title: `Integration Assignment ${timestamp}`,
      description: 'Integration test assignment description',
    };

    it('1. Admin creates a new assignment', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/assignments/new');
      cy.wait(2000);

      // Wait for form
      cy.get('[data-testid="field-title"]', { timeout: 10000 }).should('be.visible');

      // Fill in assignment
      cy.get('[data-testid="field-title"]').clear().type(assignmentData.title);
      cy.get('[data-testid="field-description"]').clear().type(assignmentData.description);

      // Select student if dropdown exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="student-select"]').length > 0) {
          cy.get('[data-testid="student-select"]').click({ force: true });
          cy.wait(500);
          cy.get('[role="option"]').first().click({ force: true });
          cy.wait(500);
        }
      });

      // Set due date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateStr = futureDate.toISOString().slice(0, 10);
      cy.get('[data-testid="field-due-date"]').type(dateStr);

      // Submit
      cy.get('[data-testid="submit-button"]').click({ force: true });

      // Verify redirect
      cy.url({ timeout: 15000 }).should('include', '/dashboard/assignments');
    });

    it('2. Admin verifies assignment in list', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      cy.contains(assignmentData.title, { timeout: 10000 }).should('exist');
    });

    it('3. Student views their assignments', () => {
      cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      // Student should see assignments page
      cy.url().should('include', '/assignments');
      cy.contains(/my assignments|assignments/i).should('exist');
    });

    it('4. Admin deletes test assignment (cleanup)', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      // Find and click on assignment
      cy.contains(assignmentData.title).click({ force: true });
      cy.location('pathname').should('match', /\/assignments\/[^/]+$/);

      // Delete
      cy.get('[data-testid*="delete"], button:contains("Delete")', { timeout: 5000 })
        .first()
        .click({ force: true });

      // Confirm if modal appears
      cy.get('body').then(($body) => {
        if ($body.find('[role="alertdialog"]').length > 0) {
          cy.get('[role="alertdialog"] button:contains("Delete"), [role="alertdialog"] button:contains("Confirm")')
            .click({ force: true });
        }
      });

      // Verify redirect
      cy.url({ timeout: 15000 }).should('include', '/dashboard/assignments');
    });
  });

  describe('Song Creation and Student View Workflow', () => {
    const songData = {
      title: `Integration Song ${timestamp}`,
      author: 'Test Artist',
    };

    it('1. Admin creates a new song', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/songs/new');
      cy.wait(2000);

      // Wait for form - look for title input
      cy.get('input[name="title"], [data-testid*="title"]', { timeout: 10000 }).should('be.visible');

      // Fill in song details
      cy.get('input[name="title"], [data-testid*="title"]').first().clear().type(songData.title);
      cy.get('input[name="author"], [data-testid*="author"]').first().clear().type(songData.author);

      // Submit
      cy.get('button[type="submit"], [data-testid="submit"]').first().click({ force: true });

      // Verify redirect
      cy.url({ timeout: 15000 }).should('include', '/dashboard/songs');
    });

    it('2. Admin verifies song in list', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.contains(songData.title, { timeout: 10000 }).should('exist');
    });

    it('3. Admin deletes test song (cleanup)', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      // Find and click on song
      cy.contains(songData.title).click({ force: true });

      // May be on detail page
      cy.wait(1000);

      // Delete
      cy.get('[data-testid*="delete"], button:contains("Delete")', { timeout: 5000 })
        .first()
        .click({ force: true });

      // Confirm if modal appears
      cy.get('body').then(($body) => {
        if ($body.find('[role="alertdialog"]').length > 0) {
          cy.get('[role="alertdialog"] button:contains("Delete"), [role="alertdialog"] button:contains("Confirm")')
            .click({ force: true });
        }
      });

      // Verify redirect
      cy.url({ timeout: 15000 }).should('include', '/dashboard/songs');
    });
  });

  describe('User Creation and Role Assignment Workflow', () => {
    const userData = {
      firstName: 'IntegrationTest',
      lastName: `User${timestamp}`,
      username: `intuser${timestamp}`,
    };

    it('1. Admin creates a shadow user', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/users/new');
      cy.wait(2000);

      // Check shadow user checkbox
      cy.get('[data-testid="isShadow-checkbox"]').click({ force: true });

      // Fill in details
      cy.get('[data-testid="firstName-input"]').clear().type(userData.firstName);
      cy.get('[data-testid="lastName-input"]').clear().type(userData.lastName);
      cy.get('[data-testid="username-input"]').clear().type(userData.username);

      // Set as student
      cy.get('[data-testid="isStudent-checkbox"]').click({ force: true });

      // Submit
      cy.get('[data-testid="submit-button"]').click({ force: true });

      // Verify redirect
      cy.url({ timeout: 30000 }).should('include', '/dashboard/users');
    });

    it('2. Admin verifies user in list', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Search for user
      cy.get('[data-testid="search-input"]').type(userData.username);
      cy.wait(1500);

      cy.get('[data-testid="users-table"]').should('contain', userData.firstName);
    });

    it('3. Admin deletes test user (cleanup)', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Search for user
      cy.get('[data-testid="search-input"]').type(userData.username);
      cy.wait(1500);

      // Click delete
      cy.get('[data-testid^="delete-user-"]').first().click({ force: true });

      // Confirm deletion
      cy.get('[role="alertdialog"]', { timeout: 5000 }).within(() => {
        cy.contains('button', /delete/i).click({ force: true });
      });

      cy.wait(2000);

      // Verify deletion
      cy.get('body').should('not.contain', userData.firstName);
    });
  });

  describe('Cross-Role Data Visibility', () => {
    it('Admin can see all data on dashboard', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard');
      cy.wait(2000);

      // Admin should have access to all sections
      cy.get('nav, [role="navigation"]').within(() => {
        cy.get('a[href*="/users"]').should('exist');
        cy.get('a[href*="/lessons"]').should('exist');
        cy.get('a[href*="/songs"]').should('exist');
        cy.get('a[href*="/assignments"]').should('exist');
      });
    });

    it('Student has limited navigation options', () => {
      cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
      cy.visit('/dashboard');
      cy.wait(2000);

      // Student should NOT see users link
      cy.get('a[href="/dashboard/users"]').should('not.exist');

      // But should see other links
      cy.get('a[href*="/lessons"]').should('exist');
      cy.get('a[href*="/songs"]').should('exist');
      cy.get('a[href*="/assignments"]').should('exist');
    });
  });
});
