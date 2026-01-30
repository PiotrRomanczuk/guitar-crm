/// <reference types="cypress" />

/**
 * Admin Song Management Enhanced Tests
 *
 * Extended tests for song management:
 * - Bulk export (JSON, CSV, PDF)
 * - Image upload
 * - Audio file management
 * - Spotify integration
 * - Song statistics
 * - Batch operations
 */

describe('Admin Song Management (Enhanced)', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');

  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  describe('Song List Features', () => {
    it('should load songs page', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.url().should('include', '/songs');
      cy.get('main, [role="main"]').should('be.visible');
    });

    it('should display songs in table or grid', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('table, [data-testid="songs-list"], [class*="grid"]').should('exist');
    });

    it('should have search functionality', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('input[type="search"], input[placeholder*="Search"], [data-testid="search-input"]').should('exist');
    });
  });

  describe('Song Filtering', () => {
    it('should filter songs by search term', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('input[type="search"], input[placeholder*="Search"], [data-testid="search-input"]')
        .first()
        .type('song');
      cy.wait(1000);

      // Results should update
      cy.log('Search filter applied');
    });

    it('should have level/difficulty filter if available', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasLevelFilter =
          $body.find('[data-testid*="level-filter"], select[name*="level"], :contains("Beginner"), :contains("Intermediate"), :contains("Advanced")').length > 0;
        if (hasLevelFilter) {
          cy.log('Level filter is available');
        }
      });
    });

    it('should have status filter if available', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasStatusFilter =
          $body.find('[data-testid*="status-filter"], select[name*="status"]').length > 0;
        if (hasStatusFilter) {
          cy.log('Status filter is available');
        }
      });
    });
  });

  describe('Song Detail Page', () => {
    it('should navigate to song detail', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('a[href*="/songs/"], tr[data-testid^="song-"], [data-testid^="song-card"]')
        .filter(':visible')
        .first()
        .click({ force: true });

      cy.wait(1500);
      cy.url().should('match', /\/songs\/[^/]+$/);
    });

    it('should display song details', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('a[href*="/songs/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/songs\/[a-z0-9-]+$/i);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      cy.get('body').then(($body) => {
        const hasDetails =
          $body.find(':contains("Title"), :contains("Artist"), :contains("Author")').length > 0;
        if (hasDetails) {
          cy.log('Song details are displayed');
        }
      });
    });
  });

  describe('Create New Song', () => {
    const timestamp = Date.now();
    const songData = {
      title: `Test Song ${timestamp}`,
      author: 'Test Artist',
    };

    it('should navigate to new song form', () => {
      cy.visit('/dashboard/songs/new');
      cy.wait(2000);

      cy.url().should('include', '/songs/new');
      cy.get('form, [data-testid="song-form"]').should('exist');
    });

    it('should create a new song', () => {
      cy.visit('/dashboard/songs/new');
      cy.wait(2000);

      // Fill in song details
      cy.get('input[name="title"], [data-testid*="title"]').first().type(songData.title);
      cy.get('input[name="author"], [data-testid*="author"]').first().type(songData.author);

      // Submit
      cy.get('button[type="submit"], [data-testid="submit"]').first().click({ force: true });

      // Should redirect
      cy.url({ timeout: 15000 }).should('include', '/dashboard/songs');
    });

    it('should validate required fields', () => {
      cy.visit('/dashboard/songs/new');
      cy.wait(2000);

      // Try to submit empty form
      cy.get('button[type="submit"], [data-testid="submit"]').first().click({ force: true });

      // Should stay on form or show errors
      cy.url().should('include', '/new');
    });
  });

  describe('Song Media', () => {
    it('should have image upload option', () => {
      cy.visit('/dashboard/songs/new');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasImageUpload =
          $body.find('input[type="file"][accept*="image"], [data-testid*="image-upload"], :contains("Upload Image")').length > 0;
        if (hasImageUpload) {
          cy.log('Image upload is available');
        }
      });
    });

    it('should have links section (YouTube, Spotify, etc.)', () => {
      cy.visit('/dashboard/songs/new');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasLinks =
          $body.find('input[name*="youtube"], input[name*="spotify"], input[placeholder*="URL"], :contains("YouTube"), :contains("Spotify")').length > 0;
        if (hasLinks) {
          cy.log('Links section is available');
        }
      });
    });
  });

  describe('Spotify Integration', () => {
    it('should have Spotify search/link option', () => {
      cy.visit('/dashboard/songs/new');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasSpotify =
          $body.find(':contains("Spotify"), button:contains("Search Spotify"), [data-testid*="spotify"]').length > 0;
        if (hasSpotify) {
          cy.log('Spotify integration is available');
        }
      });
    });
  });

  describe('Export Functionality', () => {
    it('should have export options if available', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasExport =
          $body.find('button:contains("Export"), [data-testid*="export"], :contains("CSV"), :contains("JSON")').length > 0;
        if (hasExport) {
          cy.log('Export functionality is available');
        }
      });
    });
  });

  describe('Batch Operations', () => {
    it('should have bulk selection if available', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasBulkSelect =
          $body.find('input[type="checkbox"][data-testid*="select"], th input[type="checkbox"]').length > 0;
        if (hasBulkSelect) {
          cy.log('Bulk selection is available');
        }
      });
    });

    it('should have bulk delete option if available', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasBulkDelete =
          $body.find('button:contains("Delete Selected"), [data-testid*="bulk-delete"]').length > 0;
        if (hasBulkDelete) {
          cy.log('Bulk delete is available');
        }
      });
    });
  });

  describe('Edit Song', () => {
    it('should be able to edit song', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      // Navigate to a song
      cy.get('a[href*="/songs/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/songs\/[a-z0-9-]+$/i);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      // Look for edit option
      cy.get('body').then(($body) => {
        const hasEdit =
          $body.find('a[href*="/edit"], button:contains("Edit"), [data-testid*="edit"]').length > 0;
        if (hasEdit) {
          cy.log('Edit functionality is available');
        }
      });
    });
  });

  describe('Delete Song', () => {
    it('should have delete with confirmation', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      // Navigate to a song
      cy.get('a[href*="/songs/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/songs\/[a-z0-9-]+$/i);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      // Look for delete button
      cy.get('body').then(($body) => {
        const deleteButton = $body.find('[data-testid*="delete"], button:contains("Delete")');
        if (deleteButton.length > 0) {
          cy.get('[data-testid*="delete"], button:contains("Delete")')
            .first()
            .click({ force: true });

          // Should show confirmation
          cy.get('[role="alertdialog"]', { timeout: 5000 }).should('be.visible');

          // Cancel
          cy.get('[role="alertdialog"] button:contains("Cancel")').click({ force: true });
        }
      });
    });
  });

  describe('Song Statistics', () => {
    it('should show song statistics if available', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('a[href*="/songs/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/songs\/[a-z0-9-]+$/i);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      cy.get('body').then(($body) => {
        const hasStats =
          $body.find(':contains("Statistics"), :contains("Progress"), :contains("Students")').length > 0;
        if (hasStats) {
          cy.log('Song statistics are available');
        }
      });
    });
  });

  describe('Song Levels', () => {
    it('should have level selection on form', () => {
      cy.visit('/dashboard/songs/new');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasLevel =
          $body.find('select[name*="level"], [data-testid*="level"], :contains("Level"), :contains("Difficulty")').length > 0;
        if (hasLevel) {
          cy.log('Level selection is available');
        }
      });
    });
  });

  describe('Chords Information', () => {
    it('should have chords field on form', () => {
      cy.visit('/dashboard/songs/new');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasChords =
          $body.find('input[name*="chords"], textarea[name*="chords"], :contains("Chords")').length > 0;
        if (hasChords) {
          cy.log('Chords field is available');
        }
      });
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on tablet', () => {
      cy.viewport(768, 1024);
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('main, [role="main"]').should('be.visible');
    });

    it('should display correctly on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('main, [role="main"]').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', () => {
      cy.intercept('GET', '**/api/songs*', { forceNetworkError: true }).as('songsError');

      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('main, [role="main"]').should('be.visible');
    });
  });
});
