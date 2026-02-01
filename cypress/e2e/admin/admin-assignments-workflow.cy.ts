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
    cy.wait(2000);

    // Wait for form to load
    cy.get('[data-testid="field-title"]', { timeout: 10000 }).should('be.visible');

    // Fill in title
    cy.get('[data-testid="field-title"]')
      .clear()
      .type(testData.title);

    // Fill in description
    cy.get('[data-testid="field-description"]')
      .clear()
      .type(testData.description);

    // Select student if dropdown exists
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="student-select"]').length > 0) {
        cy.get('[data-testid="student-select"]').click({ force: true });
        cy.wait(500);
        cy.get('[role="option"]').first().click({ force: true });
        cy.wait(500);
      }
    });

    // Set due date (7 days from now)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateStr = futureDate.toISOString().slice(0, 10);

    cy.get('[data-testid="field-due-date"]').type(dateStr);

    // Submit form
    cy.get('[data-testid="submit-button"]')
      .should('be.visible')
      .should('not.be.disabled')
      .click({ force: true });

    // Should redirect to assignment detail or list page
    cy.url({ timeout: 15000 }).should('not.include', '/new');
    cy.url().should('include', '/dashboard/assignments');
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

    // Click edit button - look for multiple possible selectors
    cy.get('a[href*="/edit"], button:contains("Edit"), [data-testid*="edit"]', {
      timeout: 5000,
    })
      .first()
      .click({ force: true });

    cy.location('pathname', { timeout: 10000 }).should('include', '/edit');
    cy.wait(1000);

    // Update title and description
    cy.get('[data-testid="field-title"]')
      .clear()
      .type(testData.titleEdited);

    cy.get('[data-testid="field-description"]')
      .clear()
      .type(testData.descriptionEdited);

    // Save changes
    cy.get('[data-testid="submit-button"]')
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
    cy.get('[data-testid*="delete"], button:contains("Delete")', { timeout: 5000 })
      .first()
      .click({ force: true });

    // Confirm deletion if modal appears
    cy.get('body').then(($body) => {
      if ($body.find('[role="alertdialog"]').length > 0) {
        cy.get('[role="alertdialog"] button:contains("Delete"), [role="alertdialog"] button:contains("Confirm")')
          .click({ force: true });
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
      cy.wait(1000);

      // Try to submit without filling required fields
      cy.get('[data-testid="submit-button"]').click({ force: true });

      // Should show validation errors or stay on page
      cy.url().should('include', '/new');
    });

    it('should allow submission when form is properly filled', () => {
      cy.visit('/dashboard/assignments/new');
      cy.wait(1000);

      // Fill title
      cy.get('[data-testid="field-title"]').type('Validation Test Assignment');

      // Form should be submittable now
      cy.get('[data-testid="submit-button"]').should('not.be.disabled');
    });
  });
});
