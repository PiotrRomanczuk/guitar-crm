/// <reference types="cypress" />

/**
 * Admin Song CRUD Test - Granular Steps
 *
 * Each step is a separate test for easy debugging
 */

describe('Admin Song CRUD', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');

  // Test data with unique identifiers
  const timestamp = Date.now();
  const testSong = {
    title: `E2E Song ${timestamp}`,
    titleEdited: `E2E Song ${timestamp} EDITED`,
    author: 'E2E Test Artist',
  };

  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  // ===========================================
  // LIST PAGE TESTS
  // ===========================================
  describe('Songs List Page', () => {
    it('should display songs list with all required elements', () => {
      cy.visit('/dashboard/songs');
      cy.location('pathname').should('include', '/songs');

      // Verify table is displayed
      cy.get('[data-testid="song-table"], table', { timeout: 10000 }).should('be.visible');

      // Verify search filter is functional
      cy.get('#search-filter', { timeout: 10000 }).should('be.visible').and('be.enabled');

      // Verify create new song button exists and is clickable
      cy.get('[data-testid="song-new-button"]', { timeout: 10000 })
        .should('be.visible')
        .and('be.enabled');
    });
  });

  // ===========================================
  // CREATE FORM TESTS
  // ===========================================
  describe('Song Create Form', () => {
    it('should display and validate all form elements', () => {
      cy.visit('/dashboard/songs/new');
      cy.location('pathname').should('include', '/songs/new');

      // Verify all form elements are present and functional
      cy.get('[data-testid="song-title"]', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(testSong.title)
        .should('have.value', testSong.title);

      cy.get('[data-testid="song-author"]', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(testSong.author)
        .should('have.value', testSong.author);

      cy.get('[data-testid="song-level"]', { timeout: 10000 })
        .should('exist')
        .select('beginner')
        .should('have.value', 'beginner');

      cy.get('[data-testid="song-key"]', { timeout: 10000 })
        .should('exist')
        .select('C')
        .should('have.value', 'C');

      cy.get('[data-testid="song-save"]', { timeout: 10000 })
        .should('be.visible')
        .and('be.enabled');
    });
  });

  // ===========================================
  // CREATE FULL FLOW
  // ===========================================
  describe('Create Song Full Flow', () => {
    it('should create a new song and verify in list', () => {
      // Navigate to create form
      cy.visit('/dashboard/songs/new');

      // Fill all required fields with explicit waits
      cy.get('[data-testid="song-title"]', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(testSong.title);

      cy.get('[data-testid="song-author"]', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(testSong.author);

      cy.get('[data-testid="song-level"]', { timeout: 10000 })
        .should('be.visible')
        .select('beginner');

      cy.get('[data-testid="song-key"]', { timeout: 10000 }).should('be.visible').select('C');

      // Submit form
      cy.get('[data-testid="song-save"]', { timeout: 10000 })
        .should('be.visible')
        .and('be.enabled')
        .click();

      // Verify redirect (should leave /new page)
      cy.url({ timeout: 15000 }).should('not.include', '/new');

      // Verify song appears in list
      cy.visit('/dashboard/songs');
      cy.get('#search-filter', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(testSong.title);

      cy.wait(1000); // Allow search to process
      cy.get('body').should('contain', testSong.title);
    });
  });

  // ===========================================
  // EDIT FLOW
  // ===========================================
  describe('Edit Song Flow', () => {
    it('should edit song through detail page and verify changes', () => {
      // Navigate to songs list and find our test song
      cy.visit('/dashboard/songs');
      cy.get('#search-filter', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(testSong.title);

      cy.wait(1000); // Allow search to process

      // Click on song to go to detail page
      cy.get('body').should('contain', testSong.title);
      cy.contains(testSong.title).click({ force: true });
      cy.location('pathname').should('match', /\/songs\/[^/]+$/);

      // Navigate to edit form
      cy.get('a[href*="/edit"]', { timeout: 10000 }).should('exist').first().click({ force: true });
      cy.location('pathname').should('include', '/edit');

      // Update title and save
      cy.get('[data-testid="song-title"]', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(testSong.titleEdited);

      cy.get('[data-testid="song-save"]', { timeout: 10000 })
        .should('be.visible')
        .and('be.enabled')
        .click();

      // Verify redirect away from edit page
      cy.url({ timeout: 15000 }).should('not.include', '/edit');

      // Verify changes in list
      cy.visit('/dashboard/songs');
      cy.get('#search-filter', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(testSong.titleEdited);

      cy.wait(1000); // Allow search to process
      cy.get('body').should('contain', testSong.titleEdited);
    });
  });

  // ===========================================
  // DELETE FLOW
  // ===========================================
  describe('Delete Song Flow', () => {
    it('should delete song with confirmation and verify removal', () => {
      // Navigate to songs list and find our edited test song
      cy.visit('/dashboard/songs');
      cy.get('#search-filter', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(testSong.titleEdited);

      cy.wait(1000); // Allow search to process

      // Verify song exists
      cy.get('body').should('contain', testSong.titleEdited);

      // Click delete button directly from the list (with force if needed)
      cy.get('[data-testid="song-delete-button"]', { timeout: 10000 })
        .first()
        .click({ force: true });

      // Wait for delete confirmation dialog to appear
      cy.get('[data-testid="delete-confirmation-dialog"]', { timeout: 10000 }).should('be.visible');

      // Handle delete confirmation dialog
      cy.get('[data-testid="delete-confirm-button"]', { timeout: 10000 })
        .should('be.visible')
        .click({ force: true });

      // Wait for deletion to process and dialog to close
      cy.get('[data-testid="delete-confirmation-dialog"]', { timeout: 15000 }).should('not.exist');

      // Additional wait for backend processing
      cy.wait(3000);

      // Verify song is removed from list
      cy.visit('/dashboard/songs');
      cy.get('#search-filter', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(testSong.titleEdited);

      cy.wait(1000); // Allow search to process
      cy.get('body').should('not.contain', testSong.titleEdited);
    });
  });
});
