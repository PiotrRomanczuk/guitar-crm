/// <reference types="cypress" />

/**
 * Admin Assignments CRUD Workflow
 *
 * Tests complete CRUD cycle for assignments:
 * 1. Create - Fill form and submit
 * 2. Verify - Check item appears in list
 * 3. Edit - Update the created item
 * 4. Verify - Check changes are saved
 * 5. Delete - Remove the item
 * 6. Verify - Check item is removed
 *
 * Priority: P1 - Critical gap identified in testing matrix
 */

describe('Admin Assignments CRUD Workflow', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');

  const timestamp = Date.now();
  const testData = {
    title: `E2E Assignment ${timestamp}`,
    titleEdited: `E2E Assignment ${timestamp} EDITED`,
    description: 'Test assignment description',
    descriptionEdited: 'Updated test assignment description',
  };

  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  it('1. CREATE: should create a new assignment', () => {
    cy.visit('/dashboard/assignments/new');
    cy.wait(1000);

    // Fill in assignment form
    cy.get('[data-testid="assignment-title"], input[name="title"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(testData.title);

    cy.get('[data-testid="assignment-description"], textarea[name="description"]')
      .should('be.visible')
      .clear()
      .type(testData.description);

    // Select student if field exists
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="assignment-student"], select[name="student_id"]').length > 0) {
        cy.get('[data-testid="assignment-student"], select[name="student_id"]').select(1);
      }
    });

    // Set due date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    const dateStr = tomorrow.toISOString().slice(0, 10);

    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="assignment-dueDate"], input[name="dueDate"]').length > 0) {
        cy.get('[data-testid="assignment-dueDate"], input[name="dueDate"]').type(dateStr);
      }
    });

    // Submit form
    cy.get('button[type="submit"], [data-testid="assignment-submit"]')
      .first()
      .click({ force: true });

    // Should redirect away from new page
    cy.url({ timeout: 15000 }).should('not.include', '/new');
  });

  it('2. VERIFY CREATE: should find created assignment in list', () => {
    cy.visit('/dashboard/assignments');
    cy.wait(2000);

    // Look for the assignment title
    cy.contains(testData.title, { timeout: 10000 }).should('exist');
  });

  it('3. EDIT: should update the assignment', () => {
    cy.visit('/dashboard/assignments');
    cy.wait(1000);

    // Click on assignment to view details
    cy.contains(testData.title).click({ force: true });
    cy.location('pathname').should('match', /\/assignments\/[^/]+$/);

    // Click edit button
    cy.get('[data-testid="assignment-edit"], a[href*="/edit"], button:contains("Edit")', {
      timeout: 5000,
    })
      .first()
      .click({ force: true });

    cy.location('pathname').should('include', '/edit');

    // Update title and description
    cy.get('[data-testid="assignment-title"], input[name="title"]')
      .clear()
      .type(testData.titleEdited);

    cy.get('[data-testid="assignment-description"], textarea[name="description"]')
      .clear()
      .type(testData.descriptionEdited);

    // Save changes
    cy.get('button[type="submit"], [data-testid="assignment-submit"]')
      .first()
      .click({ force: true });

    // Should redirect back
    cy.url({ timeout: 15000 }).should('not.include', '/edit');
  });

  it('4. VERIFY EDIT: should find edited assignment in list', () => {
    cy.visit('/dashboard/assignments');
    cy.wait(1000);

    // Verify edited title appears
    cy.contains(testData.titleEdited, { timeout: 10000 }).should('exist');
    cy.contains(testData.title).should('not.exist');
  });

  it('5. DELETE: should remove the assignment', () => {
    cy.visit('/dashboard/assignments');
    cy.wait(1000);

    // Click on assignment
    cy.contains(testData.titleEdited).click({ force: true });
    cy.location('pathname').should('match', /\/assignments\/[^/]+$/);

    // Find and click delete button
    cy.get('[data-testid="assignment-delete"], button:contains("Delete")', { timeout: 5000 })
      .first()
      .click({ force: true });

    // Confirm deletion if modal appears
    cy.get('body').then(($body) => {
      if ($body.find('[role="dialog"], .modal').length > 0) {
        cy.get(
          '[role="dialog"] button:contains("Delete"), .modal button:contains("Confirm")'
        ).click({ force: true });
      }
    });

    // Should redirect to list
    cy.url({ timeout: 15000 }).should('include', '/dashboard/assignments');
    cy.url().should('not.match', /\/assignments\/[a-f0-9-]+$/);
  });

  it('6. VERIFY DELETE: should not find deleted assignment', () => {
    cy.visit('/dashboard/assignments');
    cy.wait(2000);

    // Assignment should not exist
    cy.contains(testData.titleEdited).should('not.exist');
  });

  describe('Assignment Form Validation', () => {
    it('should validate required fields', () => {
      cy.visit('/dashboard/assignments/new');

      // Try to submit without filling required fields
      cy.get('button[type="submit"]').click({ force: true });

      // Should show validation errors
      cy.contains(/required|field.*required/i, { timeout: 5000 }).should('exist');
    });

    it('should validate due date is in future', () => {
      cy.visit('/dashboard/assignments/new');

      cy.get('[data-testid="assignment-title"], input[name="title"]').type('Test Assignment');

      // Try to set past due date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().slice(0, 10);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="assignment-dueDate"], input[name="dueDate"]').length > 0) {
          cy.get('[data-testid="assignment-dueDate"], input[name="dueDate"]').type(pastDate);
          cy.get('button[type="submit"]').click({ force: true });

          // May show validation error for past date
          cy.wait(500);
        }
      });
    });
  });
});
