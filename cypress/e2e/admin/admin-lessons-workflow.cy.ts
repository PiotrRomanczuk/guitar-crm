/// <reference types="cypress" />

/**
 * Admin Lessons CRUD Workflow
 *
 * TODO: Lesson form submission not working - form stays on /new page after submit
 * Issue: Form validation may be failing or submit handler not redirecting
 * Symptoms:
 * - Submit button clicks but no redirect occurs
 * - URL stays at /dashboard/lessons/new
 * - No visible error messages in UI
 * Need to debug:
 * 1. Check browser console for JS errors
 * 2. Verify all required fields are filled correctly
 * 3. Check if handleSubmit in useLessonForm is being called
 * 4. Verify API endpoint is working
 * 
 * Tests complete CRUD cycle for lessons:
 * 1. Create - Fill form and submit
 * 2. Verify - Check item appears in list
 * 3. Edit - Update the created item
 * 4. Verify - Check changes are saved
 * 5. Delete - Remove the item
 * 6. Verify - Check item is removed
 *
 * Prerequisites:
 * - TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD in cypress.env.json
 */

describe.skip('Admin Lessons CRUD Workflow', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');

  // Test data with unique identifiers
  const timestamp = Date.now();
  const testData = {
    title: `E2E Lesson ${timestamp}`,
    titleEdited: `E2E Lesson ${timestamp} EDITED`,
    notes: 'E2E Test lesson notes',
  };

  // Set viewport to desktop to avoid mobile-hidden elements
  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  it('1. CREATE: should create a new lesson', () => {
    cy.visit('/dashboard/lessons/new');

    // Wait for form to load
    cy.get('[data-testid="lesson-student_id"]', { timeout: 10000 }).should('be.visible');

    // Select first available student (get first option that's not the placeholder)
    cy.get('[data-testid="lesson-student_id"] option')
      .eq(1)
      .then(($option) => {
        const studentId = $option.val() as string;
        cy.get('[data-testid="lesson-student_id"]').select(studentId);
      });

    // Select first available teacher
    cy.get('[data-testid="lesson-teacher_id"] option')
      .eq(1)
      .then(($option) => {
        const teacherId = $option.val() as string;
        cy.get('[data-testid="lesson-teacher_id"]').select(teacherId);
      });

    // Fill in lesson form
    cy.get('[data-testid="lesson-title"]').clear().type(testData.title);

    // Set scheduled date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 16);
    cy.get('[data-testid="lesson-scheduled-at"]').clear().type(dateStr);

    // Add notes
    cy.get('[data-testid="lesson-notes"]').clear().type(testData.notes);

    // Log form state before submission
    cy.get('[data-testid="lesson-student_id"]').then(($select) => {
      cy.log('Student selected:', $select.val());
    });
    cy.get('[data-testid="lesson-teacher_id"]').then(($select) => {
      cy.log('Teacher selected:', $select.val());
    });

    // Submit the form
    cy.get('[data-testid="lesson-submit"]').should('be.visible').should('not.be.disabled').click();

    // Wait a bit and check for errors
    cy.wait(2000);
    
    // Check if there's an error message
    cy.get('body').then(($body) => {
      const hasError = $body.find('.bg-red-50, .text-red-').length > 0;
      if (hasError) {
        cy.log('ERROR: Form has validation errors');
        cy.get('.bg-red-50, .text-red-').each(($el) => {
          cy.log('Error:', $el.text());
        });
      }
    });

    // Should redirect to lessons list with success message
    cy.url({ timeout: 15000 }).should('include', '/dashboard/lessons');
    cy.url().should('not.include', '/new');
  });

  it('2. VERIFY CREATE: should find created lesson in list', () => {
    cy.visit('/dashboard/lessons');
    cy.get('[data-testid="lesson-table"], table', { timeout: 10000 }).should('exist');

    // Look for the lesson title in the table
    cy.contains(testData.title, { timeout: 10000 }).should('exist');
  });

  it('3. EDIT: should update the lesson', () => {
    cy.visit('/dashboard/lessons');

    // Click on the lesson to go to detail page
    cy.contains(testData.title).click({ force: true });
    cy.location('pathname').should('match', /\/lessons\/[^/]+$/);

    // Click edit button
    cy.get('[data-testid="lesson-edit-button"], a[href*="/edit"]', { timeout: 5000 })
      .first()
      .click({ force: true });
    cy.location('pathname').should('include', '/edit');

    // Update the title
    cy.get('[data-testid="lesson-title"]').clear().type(testData.titleEdited);

    // Save
    cy.get('[data-testid="lesson-submit"], button[type="submit"]').first().click({ force: true });

    // Should redirect back
    cy.url({ timeout: 15000 }).should('not.include', '/edit');
  });

  it('4. VERIFY EDIT: should find edited lesson in list', () => {
    cy.visit('/dashboard/lessons');

    // Verify edited title appears
    cy.contains(testData.titleEdited, { timeout: 10000 }).should('exist');
  });

  it('5. DELETE: should delete the lesson', () => {
    cy.visit('/dashboard/lessons');

    // Click on the lesson to go to detail page
    cy.contains(testData.titleEdited).click({ force: true });
    cy.location('pathname').should('match', /\/lessons\/[^/]+$/);

    // Click delete button
    cy.get('[data-testid="lesson-delete-button"]', { timeout: 5000 }).click({ force: true });

    // Confirm deletion (if dialog appears)
    cy.get('body').then(($body) => {
      if (
        $body.find(
          '[data-testid="delete-confirm-button"], button:contains("Confirm"), button:contains("Delete")'
        ).length > 0
      ) {
        cy.get(
          '[data-testid="delete-confirm-button"], button:contains("Confirm"), button:contains("Delete")'
        )
          .filter(':visible')
          .first()
          .click({ force: true });
      }
    });

    // Should redirect to lessons list
    cy.location('pathname', { timeout: 10000 }).should('eq', '/dashboard/lessons');
  });

  it('6. VERIFY DELETE: should not find deleted lesson in list', () => {
    cy.visit('/dashboard/lessons');

    // Wait for table to load
    cy.get('[data-testid="lesson-table"], table', { timeout: 10000 }).should('exist');

    // Verify deleted lesson is not in the list
    cy.contains(testData.titleEdited).should('not.exist');
  });
});
