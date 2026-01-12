/// <reference types="cypress" />

/**
 * Admin Songs CRUD Workflow
 *
 * Tests complete CRUD cycle for songs:
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

describe('Admin Songs CRUD Workflow', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');

  // Test data with unique identifiers
  const timestamp = Date.now();
  const testData = {
    title: `E2E Song ${timestamp}`,
    titleEdited: `E2E Song ${timestamp} EDITED`,
    author: 'E2E Test Artist',
  };

  // Set viewport to desktop to avoid mobile-hidden elements
  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  it('1. CREATE: should create a new song', () => {
    cy.visit('/dashboard/songs/new');

    // Wait for page to fully hydrate
    cy.wait(2000);

    // Wait for form to be fully rendered and interactive
    cy.get('[data-testid="song-title"]', { timeout: 10000 }).should('be.visible');

    // Fill in required song form fields with force to bypass hydration issues
    cy.get('[data-testid="song-title"]').clear({ force: true }).type(testData.title, { force: true });
    cy.get('[data-testid="song-author"]').clear({ force: true }).type(testData.author, { force: true });

    // Select required level field (native select - use .select() with value)
    cy.get('[data-testid="song-level"]').select('beginner', { force: true });

    // Select required key field (native select - use .select() with value)
    cy.get('[data-testid="song-key"]').select('C', { force: true });

    // Submit the form
    cy.get('[data-testid="song-save"]').should('be.visible').click({ force: true });

    // Should redirect to song detail or list
    cy.url({ timeout: 15000 }).should('not.include', '/new');
  });

  it('2. VERIFY CREATE: should find created song in list', () => {
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-table"], table', { timeout: 10000 }).should('exist');

    // Wait for table to be fully loaded
    cy.get('#search-filter', { timeout: 5000 }).should('be.visible');

    // Type search term character by character to avoid detached DOM issues
    cy.get('#search-filter').focus().clear();
    cy.get('#search-filter').type(testData.title, { delay: 50 });

    // Wait for debounce and results
    cy.wait(1500);

    // Verify it appears in the list
    cy.contains(testData.title, { timeout: 10000 }).should('exist');
  });

  it('3. EDIT: should update the song', () => {
    cy.visit('/dashboard/songs');

    // Wait for table to load
    cy.get('#search-filter', { timeout: 5000 }).should('be.visible');

    // Search for the song
    cy.get('#search-filter').focus().clear();
    cy.get('#search-filter').type(testData.title, { delay: 50 });
    cy.wait(1500);

    // Click on the song row in the desktop table to go to detail page
    cy.get('[data-testid="song-table"] [data-testid="song-row"]', { timeout: 10000 })
      .first()
      .should('be.visible')
      .click();
    cy.location('pathname', { timeout: 10000 }).should('match', /\/songs\/[^/]+$/);

    // Click edit button/link
    cy.get('a[href*="/edit"]', { timeout: 5000 }).first().click({ force: true });
    cy.location('pathname').should('include', '/edit');

    // Wait for form to load
    cy.get('[data-testid="song-title"]', { timeout: 10000 })
      .should('be.visible')
      .and('not.be.disabled');

    // Update the title
    cy.get('[data-testid="song-title"]').clear().type(testData.titleEdited);

    // Save
    cy.get('[data-testid="song-save"]').should('be.visible').and('not.be.disabled').click();

    // Should redirect back
    cy.url({ timeout: 15000 }).should('not.include', '/edit');
  });

  it('4. VERIFY EDIT: should find edited song in list', () => {
    cy.visit('/dashboard/songs');

    // Wait for table to load
    cy.get('#search-filter', { timeout: 5000 }).should('be.visible');

    // Search for the edited song
    cy.get('#search-filter').focus().clear();
    cy.get('#search-filter').type(testData.titleEdited, { delay: 50 });
    cy.wait(1500);

    // Verify edited title appears in the desktop table
    cy.get('[data-testid="song-table"]', { timeout: 10000 }).should('contain', testData.titleEdited);
  });

  it('5. DELETE: should delete the song', () => {
    cy.visit('/dashboard/songs');

    // Wait for table to load
    cy.get('#search-filter', { timeout: 5000 }).should('be.visible');

    // Search for the song
    cy.get('#search-filter').focus().clear();
    cy.get('#search-filter').type(testData.titleEdited, { delay: 50 });
    cy.wait(1500);

    // Wait for search results in table
    cy.get('[data-testid="song-table"]', { timeout: 10000 }).should('contain', testData.titleEdited);

    // Click delete button in the table row
    cy.get('[data-testid="song-table"] [data-testid="song-delete-button"]', { timeout: 5000 })
      .first()
      .click({ force: true });

    // Confirm deletion in dialog
    cy.get('[data-testid="delete-confirm-button"]', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // Wait for deletion to complete and dialog to close
    cy.get('[data-testid="delete-confirmation-dialog"]', { timeout: 10000 }).should('not.exist');
  });

  it('6. VERIFY DELETE: should not find deleted song in list', () => {
    // Refresh page to get updated list
    cy.visit('/dashboard/songs');
    
    // Wait for page to load
    cy.wait(2000);
    
    // Wait for either table or "no songs" message
    cy.get('[data-testid="song-table"], body', { timeout: 15000 }).should('exist');

    // Wait for search filter to load
    cy.get('#search-filter', { timeout: 10000 }).should('be.visible');

    // Search for the deleted song
    cy.get('#search-filter').focus().clear({ force: true });
    cy.get('#search-filter').type(testData.titleEdited, { delay: 50, force: true });
    cy.wait(2000);

    // Verify the song is not in the page (may show "No songs found" or empty table)
    cy.get('body').should('not.contain', testData.titleEdited);
  });
});
