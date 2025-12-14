/// <reference types="cypress" />

/**
 * Songs CRUD Workflow Tests
 * Covers: Create, Read (List/Detail), Update, Delete
 */

describe('Songs - CRUD Workflow', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');
  const timestamp = Date.now();
  const SONG_TITLE = `Test Song ${timestamp}`;
  const UPDATED_TITLE = `Updated Song ${timestamp}`;

  beforeEach(() => {
    // Login before each test to ensure clean state
    cy.visit('/sign-in');
    cy.get('input[type="email"]', { timeout: 8000 }).should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('input[type="email"]').clear().type(ADMIN_EMAIL);
    cy.get('input[type="password"]').clear().type(ADMIN_PASSWORD);
    cy.get('button[type="submit"]').click();

    // Wait for dashboard to load
    cy.location('pathname', { timeout: 15000 }).should(($path) => {
      expect($path).not.to.include('/sign-in');
    });
  });

  it('should create a new song', () => {
    cy.log('Starting Create Song...');
    cy.visit('/dashboard/songs');

    // Click create button
    cy.get('[data-testid="song-new-button"]').click();
    cy.location('pathname').should('include', '/dashboard/songs/new');

    // Fill form
    cy.get('[data-testid="song-title"]').type(SONG_TITLE);
    cy.get('[data-testid="song-author"]').type('Test Author');
    cy.get('[data-testid="song-level"]').select('Beginner');
    cy.get('[data-testid="song-key"]').select('C');
    cy.get('[data-testid="song-ultimate_guitar_link"]').type(
      'https://tabs.ultimate-guitar.com/tab/test'
    );
    cy.get('[data-testid="song-chords"]').type('C G Am F');
    cy.get('[data-testid="song-short_title"]').type('Test');

    // Submit
    cy.get('button[type="submit"]').click();

    // Verify redirect to list
    cy.location('pathname', { timeout: 10000 }).should('eq', '/dashboard/songs');

    // Verify item in list
    cy.contains(SONG_TITLE).should('be.visible');
  });

  it('should filter songs', () => {
    cy.log('Starting Filter Songs...');
    cy.visit('/dashboard/songs');

    // 1. Filter by Level
    // Select 'Beginner' - Song should be visible
    cy.get('#level-filter').click();
    cy.contains('Beginner').click();
    cy.contains(SONG_TITLE).should('be.visible');

    // Select 'Advanced' - Song should NOT be visible
    cy.get('#level-filter').click();
    cy.contains('Advanced').click();
    cy.contains(SONG_TITLE).should('not.exist');

    // Reset filters
    cy.contains('Reset Filters').click();
    cy.contains(SONG_TITLE).should('be.visible');

    // 2. Filter by Student
    // Check if student filter exists (it only shows if students exist)
    cy.get('body').then(($body) => {
      if ($body.find('#student-filter').length > 0) {
        cy.log('Student filter found, testing...');

        // Select the first student in the list
        cy.get('#student-filter').click();
        // Select the first item that is NOT "All Students"
        // We assume the dropdown content is open and has items
        cy.get('[role="option"]').not(':contains("All Students")').first().click();

        // Since the song is new and unassigned, it should NOT be visible when filtering by a student
        cy.contains(SONG_TITLE).should('not.exist');

        // Reset filters
        cy.contains('Reset Filters').click();
        cy.contains(SONG_TITLE).should('be.visible');
      } else {
        cy.log('Student filter not found (no students in DB?), skipping student filter test');
      }
    });
  });

  it('should view song details', () => {
    cy.log('Starting Read Song Details...');
    cy.visit('/dashboard/songs');

    // Find and click the song
    cy.contains(SONG_TITLE).click();

    // Verify details page
    cy.url().should('include', '/dashboard/songs/');
    cy.contains(SONG_TITLE).should('be.visible');
    cy.contains('Test Author').should('be.visible');
  });

  it('should update the song', () => {
    cy.log('Starting Update Song...');
    cy.visit('/dashboard/songs');

    // Click the song title to go to details
    cy.contains(SONG_TITLE).click();

    // Click Edit button on details page
    cy.get('a[href*="/edit"]').click();

    cy.url().should('include', '/edit');

    // Update title
    cy.get('[data-testid="song-title"]').clear().type(UPDATED_TITLE);
    cy.get('button[type="submit"]').click();

    // Verify redirect to list
    cy.location('pathname', { timeout: 10000 }).should('eq', '/dashboard/songs');

    // Verify update in list
    cy.contains(UPDATED_TITLE).should('be.visible');
    cy.contains(SONG_TITLE).should('not.exist');
  });

  it('should delete the song', () => {
    cy.log('Starting Delete Song...');
    cy.visit('/dashboard/songs');

    // Find the row containing the updated title
    cy.contains('tr', UPDATED_TITLE).within(() => {
      cy.get('[data-testid="song-delete-button"]').click();
    });

    // Confirm delete in modal
    cy.get('[data-testid="delete-confirmation-dialog"]').should('be.visible');
    cy.get('[data-testid="delete-confirm-button"]').click();

    // Check for error
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="delete-error"]').length > 0) {
        cy.get('[data-testid="delete-error"]').then(($el) => {
          cy.log('DELETE ERROR: ' + $el.text());
          throw new Error('Delete failed: ' + $el.text());
        });
      }
    });

    // Verify deletion
    cy.get('[data-testid="delete-confirmation-dialog"]').should('not.exist');
    cy.contains(UPDATED_TITLE).should('not.exist');
  });
});
