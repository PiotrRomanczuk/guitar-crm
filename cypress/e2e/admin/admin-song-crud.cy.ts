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

      // Wait for page to fully hydrate
      cy.wait(2000);

      // Fill all required fields with force to bypass hydration issues
      cy.get('[data-testid="song-title"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-testid="song-title"]').clear({ force: true }).type(testSong.title, { force: true });

      cy.get('[data-testid="song-author"]').clear({ force: true }).type(testSong.author, { force: true });

      cy.get('[data-testid="song-level"]').select('beginner', { force: true });

      cy.get('[data-testid="song-key"]').select('C', { force: true });

      // Submit form
      cy.get('[data-testid="song-save"]').should('be.visible').click({ force: true });

      // Verify redirect (should leave /new page)
      cy.url({ timeout: 15000 }).should('not.include', '/new');

      // Verify song appears in list
      cy.visit('/dashboard/songs');
      cy.wait(2000);
      cy.get('#search-filter', { timeout: 10000 }).should('be.visible');
      cy.get('#search-filter').focus().clear({ force: true });
      cy.get('#search-filter').type(testSong.title, { delay: 50, force: true });

      cy.wait(1500); // Allow search to process
      cy.get('[data-testid="song-table"]', { timeout: 10000 }).should('contain', testSong.title);
    });
  });

  // ===========================================
  // EDIT FLOW
  // ===========================================
  describe('Edit Song Flow', () => {
    it('should edit song through detail page and verify changes', () => {
      // Navigate to songs list and find our test song
      cy.visit('/dashboard/songs');
      cy.wait(2000);
      
      cy.get('#search-filter', { timeout: 10000 }).should('be.visible');
      cy.get('#search-filter').focus().clear({ force: true });
      cy.get('#search-filter').type(testSong.title, { delay: 50, force: true });

      cy.wait(1500); // Allow search to process

      // Click on song row in the table to go to detail page
      cy.get('[data-testid="song-table"] [data-testid="song-row"]', { timeout: 10000 })
        .first()
        .should('be.visible')
        .click();
      cy.location('pathname', { timeout: 10000 }).should('match', /\/songs\/[^/]+$/);

      // Navigate to edit form
      cy.get('a[href*="/edit"]', { timeout: 10000 }).should('exist').first().click({ force: true });
      cy.location('pathname').should('include', '/edit');

      // Wait for form to hydrate
      cy.wait(2000);

      // Update title and save
      cy.get('[data-testid="song-title"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-testid="song-title"]').clear({ force: true }).type(testSong.titleEdited, { force: true });

      cy.get('[data-testid="song-save"]').should('be.visible').click({ force: true });

      // Verify redirect away from edit page
      cy.url({ timeout: 15000 }).should('not.include', '/edit');

      // Verify changes in list
      cy.visit('/dashboard/songs');
      cy.wait(2000);
      cy.get('#search-filter', { timeout: 10000 }).should('be.visible');
      cy.get('#search-filter').focus().clear({ force: true });
      cy.get('#search-filter').type(testSong.titleEdited, { delay: 50, force: true });

      cy.wait(1500); // Allow search to process
      cy.get('[data-testid="song-table"]', { timeout: 10000 }).should('contain', testSong.titleEdited);
    });
  });

  // ===========================================
  // DELETE FLOW
  // ===========================================
  describe('Delete Song Flow', () => {
    // Note: Full delete + verify flow is tested in admin-songs-workflow.cy.ts
    // This test verifies the delete confirmation dialog appears and can be cancelled
    it('should show delete confirmation dialog when delete button is clicked', () => {
      // Navigate to songs list
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      // Wait for table to load with songs
      cy.get('[data-testid="song-table"]', { timeout: 10000 }).should('be.visible');

      // Click delete button on first song in the table
      cy.get('[data-testid="song-table"] [data-testid="song-delete-button"]', { timeout: 5000 })
        .first()
        .click({ force: true });

      // Verify confirmation dialog appears
      cy.get('[data-testid="delete-confirmation-dialog"]', { timeout: 10000 }).should('be.visible');

      // Verify confirm and cancel buttons exist
      cy.get('[data-testid="delete-confirm-button"]').should('be.visible');
      cy.get('[data-testid="delete-cancel-button"]').should('be.visible');

      // Cancel the dialog by clicking the cancel button
      cy.get('[data-testid="delete-cancel-button"]').click({ force: true });

      // Verify dialog is closed
      cy.get('[data-testid="delete-confirmation-dialog"]', { timeout: 5000 }).should('not.exist');
    });
  });
});
