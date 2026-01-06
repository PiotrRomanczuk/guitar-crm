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
    // TODO: Fix delete test - delete button not found after song search
    // Issue: Either search doesn't return results or table doesn't render delete buttons
    // Need to investigate:
    // 1. Is song being created successfully?
    // 2. Does search filter work correctly?
    // 3. Are delete buttons rendered in the table?
    it.skip('should delete song with confirmation and verify removal', () => {
      // Create a fresh song specifically for deletion test
      const deleteTestSong = {
        title: `E2E Delete Test ${Date.now()}`,
        author: 'Delete Test Artist',
      };

      // Create the song
      cy.visit('/dashboard/songs/new');
      cy.get('[data-testid="song-title"]', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(deleteTestSong.title);

      cy.get('[data-testid="song-author"]', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(deleteTestSong.author);

      cy.get('[data-testid="song-level"]', { timeout: 10000 })
        .should('be.visible')
        .select('beginner');

      cy.get('[data-testid="song-key"]', { timeout: 10000 }).should('be.visible').select('C');

      // Submit form
      cy.get('[data-testid="song-save"]', { timeout: 10000 })
        .should('be.visible')
        .and('be.enabled')
        .click();

      // Wait for redirect
      cy.url({ timeout: 15000 }).should('not.include', '/new');

      // Navigate to songs list and find our test song
      cy.log('🔍 STEP 1: Navigating to songs list');
      cy.visit('/dashboard/songs');
      
      cy.log('🔍 STEP 2: Searching for song to delete:', deleteTestSong.title);
      cy.get('#search-filter', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(deleteTestSong.title);

      cy.wait(1000); // Allow search to process

      // Log what's on the page for debugging
      cy.get('body').then(($body) => {
        const bodyText = $body.text();
        cy.log('📄 Page content before delete:', bodyText.substring(0, 1000));
        cy.log('🎵 Song found in body:', bodyText.includes(deleteTestSong.title));
        
        // Check if table or cards exist
        const hasTable = $body.find('table').length > 0;
        const hasCards = $body.find('[data-testid="song-card"]').length > 0;
        cy.log('📊 Has table:', hasTable);
        cy.log('📱 Has cards:', hasCards);
        
        // Check for "No songs found" message
        const noSongsMsg = bodyText.includes('No songs found') || bodyText.includes('no results');
        cy.log('❌ No songs message:', noSongsMsg);
      });

      // Verify song exists
      cy.log('✅ STEP 3: Verifying song exists before delete');
      cy.get('body').should('contain', deleteTestSong.title);

      // Click delete button directly from the list (with force if needed)
      cy.log('🗑️ STEP 4: Looking for delete button');
      cy.get('body').then(($body) => {
        const deleteButtons = $body.find('[data-testid="song-delete-button"]');
        cy.log('🔢 Delete buttons in DOM:', deleteButtons.length);
        deleteButtons.each((idx, btn) => {
          cy.log(`  Button ${idx}:`, {
            visible: Cypress.$(btn).is(':visible'),
            text: Cypress.$(btn).text(),
            disabled: Cypress.$(btn).is(':disabled')
          });
        });
      });
      
      cy.log('🗑️ STEP 4b: Clicking delete button');
      cy.get('[data-testid="song-delete-button"]', { timeout: 10000 })
        .should('exist')
        .should('be.visible')
        .first()
        .click({ force: true });

      // Wait for delete confirmation dialog to appear
      cy.log('⏳ STEP 5: Waiting for confirmation dialog');
      cy.get('[data-testid="delete-confirmation-dialog"]', { timeout: 10000 })
        .should('be.visible')
        .then(() => {
          cy.log('✅ Confirmation dialog is visible');
        });

      // Handle delete confirmation dialog
      cy.log('👆 STEP 6: Clicking confirm button');
      cy.get('[data-testid="delete-confirm-button"]', { timeout: 10000 })
        .should('be.visible')
        .should('not.be.disabled')
        .then(($confirmBtn) => {
          cy.log('🔘 Confirm button state:', {
            visible: $confirmBtn.is(':visible'),
            disabled: $confirmBtn.is(':disabled'),
            text: $confirmBtn.text()
          });
        })
        .click({ force: true })
        .then(() => {
          cy.log('✅ Confirm button clicked');
        });

      // Wait for deletion to process and dialog to close
      cy.log('⏳ STEP 7: Waiting for dialog to close');
      cy.get('[data-testid="delete-confirmation-dialog"]', { timeout: 15000 })
        .should('not.exist')
        .then(() => {
          cy.log('✅ Dialog closed');
        });

      // Additional wait for backend processing
      cy.log('⏳ STEP 8: Waiting for backend processing (3s)');
      cy.wait(3000);

      // Verify song is removed from list
      cy.log('🔍 STEP 9: Navigating back to songs list to verify deletion');
      cy.visit('/dashboard/songs');
      
      cy.log('🔍 STEP 10: Searching for deleted song:', deleteTestSong.title);
      cy.get('#search-filter', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(deleteTestSong.title);

      cy.wait(1000); // Allow search to process

      // Log what's on the page after deletion for debugging
      cy.get('body').then(($body) => {
        const bodyText = $body.text();
        cy.log('📄 Page content after delete:', bodyText.substring(0, 500));
        cy.log('🎵 Song still in body:', bodyText.includes(deleteTestSong.title));
        
        // Log table content specifically
        const tableContent = $body.find('table, [data-testid="song-table"]').text();
        cy.log('📊 Table content:', tableContent.substring(0, 300));
      });

      cy.log('🎯 STEP 11: Final assertion - song should NOT be in body');
      cy.get('body').should('not.contain', deleteTestSong.title);
    });
  });
});
