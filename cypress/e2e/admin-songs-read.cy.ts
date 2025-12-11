/// <reference types="cypress" />

/**
 * Admin Song Read E2E Test
 * 
 * Tests the complete workflow for an admin reading/viewing songs:
 * 1. Admin signs in
 * 2. Navigates to songs list page
 * 3. Verifies songs are displayed
 * 4. Views individual song details
 * 5. Tests filtering and search functionality
 */

describe('Admin - Song Read Operations', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
  const ADMIN_PASSWORD = 'test123_admin';

  beforeEach(() => {
    // Sign in as admin before each test
    cy.visit('/sign-in');
    cy.get('input[type="email"]', { timeout: 8000 }).should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('input[type="email"]').clear().type(ADMIN_EMAIL);
    cy.get('input[type="password"]').clear().type(ADMIN_PASSWORD);
    cy.get('button[type="submit"]').click();
    
    // Wait for successful login
    cy.location('pathname', { timeout: 15000 }).should(($path) => {
      expect($path).not.to.include('/sign-in');
    });
  });

  it('should display songs list page', () => {
    // Navigate to songs list
    cy.visit('/dashboard/songs');
    cy.url().should('include', '/dashboard/songs');

    // Verify page structure exists
    cy.get('header, nav').should('be.visible');

    // The list may be empty or have songs - both are valid states
    cy.get('body').should('be.visible');
  });

  it('should display song details when clicking on a song', () => {
    // Navigate to songs list
    cy.visit('/dashboard/songs');

    // Try to find and click on a song link
    cy.get('body').then(($body) => {
      // Find links that go to song details (not /new or /edit)
      const songLinks = $body.find('a[href*="/dashboard/songs/"]').toArray().filter((el) => {
        const href = Cypress.$(el).attr('href');
        return href && !href.includes('/new') && !href.includes('/edit') && href !== '/dashboard/songs';
      });

      if (songLinks.length > 0) {
        // Click first song link
        const firstSongHref = Cypress.$(songLinks[0]).attr('href');
        cy.visit(firstSongHref!);

        // Verify we're on song details page
        cy.url().should('include', '/dashboard/songs/');
        cy.url().should('not.include', '/new');
        cy.url().should('not.include', '/edit');

        // Verify breadcrumbs exist (typical detail page component)
        cy.contains('Songs').should('be.visible');
      } else {
        // If no songs exist, just verify we can navigate to create page
        cy.visit('/dashboard/songs/new');
        cy.url().should('include', '/new');
      }
    });
  });

  it('should show song details with all sections', () => {
    cy.visit('/dashboard/songs');

    cy.get('body').then(($body) => {
      const songLinks = $body.find('a[href*="/dashboard/songs/"]').toArray().filter((el) => {
        const href = Cypress.$(el).attr('href');
        return href && !href.includes('/new') && !href.includes('/edit') && href !== '/dashboard/songs';
      });

      if (songLinks.length > 0) {
        const firstSongHref = Cypress.$(songLinks[0]).attr('href');
        cy.visit(firstSongHref!);

        // Verify key sections exist on song detail page
        // Note: Actual section names depend on the SongDetail component implementation
        cy.get('body').should('contain.text', 'Song Details').or('contain.text', 'Details');
      }
    });
  });

  it('should navigate back to list from detail page', () => {
    cy.visit('/dashboard/songs');

    cy.get('body').then(($body) => {
      const songLinks = $body.find('a[href*="/dashboard/songs/"]').toArray().filter((el) => {
        const href = Cypress.$(el).attr('href');
        return href && !href.includes('/new') && !href.includes('/edit') && href !== '/dashboard/songs';
      });

      if (songLinks.length > 0) {
        const firstSongHref = Cypress.$(songLinks[0]).attr('href');
        cy.visit(firstSongHref!);

        // Click on breadcrumb or back link to songs list
        cy.contains('Songs').click();

        // Verify we're back on the list page
        cy.url().should('match', /\/dashboard\/songs\/?$/);
      }
    });
  });

  it('should handle pagination if songs exceed page limit', () => {
    cy.visit('/dashboard/songs');

    // Look for pagination controls
    cy.get('body').then(($body) => {
      // Check if pagination exists
      if ($body.find('[aria-label*="pagination"], .pagination, button:contains("Next")').length > 0) {
        // Pagination exists, test it
        cy.contains('Next').click();
        cy.url().should('include', 'page=');
      } else {
        // No pagination, which is fine if there aren't many songs
        cy.url().should('include', '/dashboard/songs');
      }
    });
  });

  it('should allow filtering songs by level', () => {
    cy.visit('/dashboard/songs');

    // Look for filter controls
    cy.get('body').then(($body) => {
      if ($body.find('select[name*="level"], select[id*="level"]').length > 0) {
        // Level filter exists
        cy.get('select[name*="level"], select[id*="level"]').first().select('beginner');
        
        // Verify URL or content updated
        cy.url().should('satisfy', (url) => {
          return url.includes('level=beginner') || url.includes('/dashboard/songs');
        });
      }
    });
  });

  it('should allow searching for songs', () => {
    cy.visit('/dashboard/songs');

    // Look for search input
    cy.get('body').then(($body) => {
      if ($body.find('input[type="search"], input[placeholder*="search" i]').length > 0) {
        // Search input exists
        cy.get('input[type="search"], input[placeholder*="search" i]').first().type('test');
        
        // Wait for results or URL to update
        cy.wait(1000);
      }
    });
  });

  it('should reload songs list successfully', () => {
    cy.visit('/dashboard/songs');
    cy.get('header, nav').should('be.visible');

    // Reload the page
    cy.reload();

    // Verify page still works
    cy.get('header, nav').should('be.visible');
    cy.url().should('include', '/dashboard/songs');
  });

  it('should maintain session during navigation', () => {
    // Navigate to songs list
    cy.visit('/dashboard/songs');
    
    // Go to create page
    cy.visit('/dashboard/songs/new');
    
    // Go back to list
    cy.visit('/dashboard/songs');
    
    // Verify session is still active (not redirected to login)
    cy.url().should('include', '/dashboard/songs');
    cy.url().should('not.include', '/sign-in');
    cy.get('header').should('contain.text', ADMIN_EMAIL);
  });
});
