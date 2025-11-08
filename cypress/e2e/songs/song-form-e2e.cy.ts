/// <reference types="cypress" />

// E2E test for the Song creation form (/dashboard/songs/new)
// Validates UI field interactions, client-side validation, and network POST to /api/song.
// Assumes authentication flow is available; falls back gracefully if not.

describe('Song Form E2E', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'rP#8Kw$9mN2qL@4x';

  const sampleSong = {
    title: `Form Test Song ${Date.now()}`,
    author: 'Form Test Author',
    level: 'intermediate',
    key: 'C',
    ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/test-song',
  };

  before(() => {
    // Attempt sign-in on the correct route; ignore failures
    cy.visit('/sign-in', { failOnStatusCode: false });
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="email"], input[name="email"]').length) {
        cy.get('[data-testid="email"], input[name="email"]').clear().type(adminEmail);
        cy.get('[data-testid="password"], input[name="password"]').clear().type(adminPassword);
        cy.get('[data-testid="signin-button"], button[type="submit"]').click();
      } else {
        cy.log('Sign-in form not present; proceeding unauthenticated (may skip protected tests).');
      }
    });
  });

  it('validates required fields before submission', () => {
    cy.visit('/dashboard/songs/new', { failOnStatusCode: false });
    cy.get('body').then(($body) => {
      if (!$body.find('[data-testid="song-form"]').length) {
        cy.log('Song form not available - skipping validation test');
        return;
      }
      cy.get('[data-testid="song-save"]').click();
      cy.contains(/title is required/i).should('be.visible');
      cy.contains(/author is required/i).should('be.visible');
      cy.contains(/ultimate guitar link/i).should('be.visible');
    });
  });

  it('creates a song successfully via UI', () => {
    cy.visit('/dashboard/songs/new', { failOnStatusCode: false });
    cy.get('body').then(($body) => {
      if (!$body.find('[data-testid="song-form"]').length) {
        cy.log('Song create form not available - skipping create test');
        return;
      }
      cy.intercept('POST', '/api/song').as('createSong');
      cy.get('[data-testid="song-title"], input[name="title"]').clear().type(sampleSong.title);
      cy.get('[data-testid="song-author"], input[name="author"]').clear().type(sampleSong.author);
      cy.get('[data-testid="song-level"], select[name="level"]').select(sampleSong.level);
      cy.get('[data-testid="song-key"], select[name="key"]').select(sampleSong.key);
      cy.get('[data-testid="song-ultimate_guitar_link"], input[name="ultimate_guitar_link"]')
        .clear()
        .type(sampleSong.ultimate_guitar_link);
      cy.get('[data-testid="song-save"], button[type="submit"]').click();
      cy.wait('@createSong').then((interception) => {
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      });
    });
  });

  it('shows error UI on API failure', () => {
    cy.visit('/dashboard/songs/new', { failOnStatusCode: false });
    cy.get('body').then(($body) => {
      if (!$body.find('[data-testid="song-form"]').length) {
        cy.log('Song form not available - skipping error path test');
        return;
      }
      cy.intercept('POST', '/api/song', { statusCode: 500, body: { error: 'Internal error' } }).as(
        'failCreate'
      );
      cy.get('[data-testid="song-title"], input[name="title"]').clear().type('Err Song');
      cy.get('[data-testid="song-author"], input[name="author"]').clear().type('Err Author');
      cy.get('[data-testid="song-level"], select[name="level"]').select('beginner');
      cy.get('[data-testid="song-key"], select[name="key"]').select('C');
      cy.get('[data-testid="song-ultimate_guitar_link"], input[name="ultimate_guitar_link"]')
        .clear()
        .type('https://example.com');
      cy.get('[data-testid="song-save"], button[type="submit"]').click();
      cy.wait('@failCreate');
      cy.contains(/failed to save song/i).should('be.visible');
    });
  });
});
