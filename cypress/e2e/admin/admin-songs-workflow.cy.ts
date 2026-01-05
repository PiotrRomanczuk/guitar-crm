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

    // Fill in required song form fields
    cy.get('[data-testid="song-title"]').clear().type(testData.title);
    cy.get('[data-testid="song-author"]').clear().type(testData.author);

    // Select required level field (native select - use .select() with value)
    cy.get('[data-testid="song-level"]').select('beginner');

    // Select required key field (native select - use .select() with value)
    cy.get('[data-testid="song-key"]').select('C');

    // Submit the form
    cy.get('[data-testid="song-save"]').click({ force: true });

    // Should redirect to song detail or list
    cy.url({ timeout: 15000 }).should('not.include', '/new');
  });

  it('2. VERIFY CREATE: should find created song in list', () => {
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-table"], table', { timeout: 10000 }).should('exist');

    // Search for the song using the search filter input
    cy.get('input[placeholder*="Search"], #search-filter', { timeout: 5000 })
      .clear()
      .type(testData.title);

    // Wait for debounce and results
    cy.wait(1000);

    // Verify it appears in the list
    cy.contains(testData.title, { timeout: 10000 }).should('exist');
  });

  it('3. EDIT: should update the song', () => {
    cy.visit('/dashboard/songs');

    // Search for the song
    cy.get('input[placeholder*="Search"], #search-filter').clear().type(testData.title);
    cy.wait(1000);

    // Click on the song to go to detail page (use force if needed)
    cy.contains(testData.title, { timeout: 10000 }).click({ force: true });
    cy.location('pathname', { timeout: 10000 }).should('match', /\/songs\/[^/]+$/);

    // Click edit button/link
    cy.get('a[href*="/edit"], button[data-testid*="edit"]', { timeout: 5000 })
      .first()
      .click({ force: true });
    cy.location('pathname').should('include', '/edit');

    // Update the title
    cy.get('[data-testid="song-title"]').clear().type(testData.titleEdited);

    // Save
    cy.get('[data-testid="song-save"]').click({ force: true });

    // Should redirect back
    cy.url({ timeout: 15000 }).should('not.include', '/edit');
  });

  it('4. VERIFY EDIT: should find edited song in list', () => {
    cy.visit('/dashboard/songs');

    // Search for the edited song
    cy.get('input[placeholder*="Search"], #search-filter').clear().type(testData.titleEdited);
    cy.wait(1000);

    // Verify edited title appears
    cy.contains(testData.titleEdited, { timeout: 10000 }).should('exist');
  });

  it('5. DELETE: should delete the song', () => {
    cy.visit('/dashboard/songs');

    // Search for the song
    cy.get('input[placeholder*="Search"], #search-filter').clear().type(testData.titleEdited);
    cy.wait(1000);

    // Wait for search results
    cy.contains(testData.titleEdited, { timeout: 10000 }).should('exist');

    // Click delete button (with force if needed)
    cy.get('[data-testid="song-delete-button"]').first().click({ force: true });

    // Confirm deletion in dialog
    cy.get('[data-testid="delete-confirm-button"]', { timeout: 10000 })
      .should('exist')
      .click({ force: true });

    // Wait for deletion to complete
    cy.wait(2000);
  });

  it('6. VERIFY DELETE: should not find deleted song in list', () => {
    // Refresh page to get updated list
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-table"], table', { timeout: 10000 }).should('exist');

    // Search for the deleted song
    cy.get('input[placeholder*="Search"], #search-filter').clear().type(testData.titleEdited);
    cy.wait(2000);

    // Verify the song is not in the page body
    cy.get('body').should('not.contain', testData.titleEdited);
  });
});
