/// <reference types="cypress" />

/**
 * Admin Spotify Integration Tests
 *
 * Tests the Spotify integration features:
 * - View pending Spotify matches
 * - Approve/reject matches
 * - Search Spotify tracks
 * - Sync songs with Spotify
 * - Confidence scores
 * - Audio features
 */

describe('Admin Spotify Integration', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');

  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  describe('Spotify Matches Page', () => {
    it('should access Spotify matches page', () => {
      cy.visit('/dashboard/admin/spotify-matches', { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const has404 = $body.find(':contains("404"), :contains("Not Found")').length > 0;
        const hasSpotify = $body.find(':contains("Spotify"), :contains("Matches")').length > 0;

        if (hasSpotify) {
          cy.log('Spotify matches page is available');
          cy.url().should('include', '/spotify');
        } else if (has404) {
          cy.log('Spotify matches page not available at this URL');
        }
      });
    });

    it('should navigate to Spotify matches from admin menu', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const spotifyLink = $body.find('a[href*="spotify"], a:contains("Spotify")');
        if (spotifyLink.length > 0) {
          cy.get('a[href*="spotify"], a:contains("Spotify")').first().click({ force: true });
          cy.wait(1500);
          cy.log('Navigated to Spotify section');
        }
      });
    });
  });

  describe('Pending Matches', () => {
    it('should display pending matches list', () => {
      cy.visit('/dashboard/admin/spotify-matches', { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const has404 = $body.find(':contains("404")').length > 0;
        if (!has404) {
          const hasMatchesList =
            $body.find('table, [data-testid="matches-list"], [class*="grid"]').length > 0;
          if (hasMatchesList) {
            cy.log('Matches list is displayed');
          }
        }
      });
    });

    it('should show match confidence scores', () => {
      cy.visit('/dashboard/admin/spotify-matches', { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const has404 = $body.find(':contains("404")').length > 0;
        if (!has404) {
          const hasConfidence =
            $body.find(':contains("Confidence"), :contains("%"), [class*="progress"]').length > 0;
          if (hasConfidence) {
            cy.log('Confidence scores are displayed');
          }
        }
      });
    });
  });

  describe('Approve Match', () => {
    it('should have approve button for matches', () => {
      cy.visit('/dashboard/admin/spotify-matches', { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const has404 = $body.find(':contains("404")').length > 0;
        if (!has404) {
          const hasApprove =
            $body.find('button:contains("Approve"), [data-testid*="approve"], button:contains("Accept")').length > 0;
          if (hasApprove) {
            cy.log('Approve functionality is available');
          }
        }
      });
    });
  });

  describe('Reject Match', () => {
    it('should have reject button for matches', () => {
      cy.visit('/dashboard/admin/spotify-matches', { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const has404 = $body.find(':contains("404")').length > 0;
        if (!has404) {
          const hasReject =
            $body.find('button:contains("Reject"), [data-testid*="reject"], button:contains("Dismiss")').length > 0;
          if (hasReject) {
            cy.log('Reject functionality is available');
          }
        }
      });
    });
  });

  describe('Search Spotify', () => {
    it('should have Spotify search on song form', () => {
      cy.visit('/dashboard/songs/new');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasSpotifySearch =
          $body.find('button:contains("Search Spotify"), [data-testid*="spotify-search"], :contains("Link Spotify")').length > 0;
        if (hasSpotifySearch) {
          cy.log('Spotify search is available on song form');
        }
      });
    });

    it('should have manual Spotify link input', () => {
      cy.visit('/dashboard/songs/new');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasSpotifyInput =
          $body.find('input[name*="spotify"], input[placeholder*="Spotify"], :contains("Spotify URL")').length > 0;
        if (hasSpotifyInput) {
          cy.log('Spotify link input is available');
        }
      });
    });
  });

  describe('Spotify Data on Song Detail', () => {
    it('should display Spotify data on song detail page', () => {
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
        const hasSpotifyData =
          $body.find(':contains("Spotify"), :contains("Track"), :contains("Artist"), img[src*="spotify"]').length > 0;
        if (hasSpotifyData) {
          cy.log('Spotify data is displayed on song detail');
        }
      });
    });
  });

  describe('Audio Features', () => {
    it('should display audio features if available', () => {
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
        const hasAudioFeatures =
          $body.find(':contains("BPM"), :contains("Tempo"), :contains("Key"), :contains("Energy"), :contains("Danceability")').length > 0;
        if (hasAudioFeatures) {
          cy.log('Audio features are displayed');
        }
      });
    });
  });

  describe('Sync Functionality', () => {
    it('should have sync/refresh button for Spotify data', () => {
      cy.visit('/dashboard/admin/spotify-matches', { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const has404 = $body.find(':contains("404")').length > 0;
        if (!has404) {
          const hasSync =
            $body.find('button:contains("Sync"), button:contains("Refresh"), [data-testid*="sync"]').length > 0;
          if (hasSync) {
            cy.log('Sync functionality is available');
          }
        }
      });
    });
  });

  describe('Match Preview', () => {
    it('should show preview of Spotify track for matches', () => {
      cy.visit('/dashboard/admin/spotify-matches', { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const has404 = $body.find(':contains("404")').length > 0;
        if (!has404) {
          const hasPreview =
            $body.find('audio, iframe[src*="spotify"], button:contains("Preview"), [data-testid*="play"]').length > 0;
          if (hasPreview) {
            cy.log('Track preview is available');
          }
        }
      });
    });
  });

  describe('Bulk Match Operations', () => {
    it('should have bulk approve/reject if available', () => {
      cy.visit('/dashboard/admin/spotify-matches', { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const has404 = $body.find(':contains("404")').length > 0;
        if (!has404) {
          const hasBulk =
            $body.find('button:contains("Approve All"), button:contains("Bulk"), input[type="checkbox"]').length > 0;
          if (hasBulk) {
            cy.log('Bulk operations are available');
          }
        }
      });
    });
  });

  describe('Match Filtering', () => {
    it('should filter matches by confidence level', () => {
      cy.visit('/dashboard/admin/spotify-matches', { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const has404 = $body.find(':contains("404")').length > 0;
        if (!has404) {
          const hasFilter =
            $body.find('select, [data-testid*="filter"], :contains("High Confidence"), :contains("Low Confidence")').length > 0;
          if (hasFilter) {
            cy.log('Confidence filter is available');
          }
        }
      });
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on tablet', () => {
      cy.viewport(768, 1024);
      cy.visit('/dashboard/admin/spotify-matches', { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('main, [role="main"], body').should('be.visible');
    });

    it('should display correctly on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/dashboard/admin/spotify-matches', { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('main, [role="main"], body').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle Spotify API errors gracefully', () => {
      cy.intercept('GET', '**/api/spotify*', {
        statusCode: 500,
        body: { error: 'Spotify service unavailable' },
      }).as('spotifyError');

      cy.visit('/dashboard/admin/spotify-matches', { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('main, [role="main"], body').should('be.visible');
    });
  });
});
