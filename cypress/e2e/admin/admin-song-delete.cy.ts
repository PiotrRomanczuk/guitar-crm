/// <reference types="cypress" />

// Admin journey: Delete a song
// Flow: Sign in → View songs list → Select song → Delete → Verify removal
// Routes:
// - Sign-in page: /sign-in
// - Songs list page: /dashboard/songs
// - Song detail page: /dashboard/songs/{id}

describe('Admin Journey - Delete Song', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'test123_admin';

  // Create a test song before each test to ensure we have something to delete
  const testSong = {
    title: `Test Song to Delete ${Date.now()}`,
    author: 'Delete Test Author',
    level: 'beginner',
    key: 'E',
    ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/delete-test',
  };

  beforeEach(() => {
    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(adminEmail);
    cy.get('[data-testid="password"]').clear().type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 10000 }).should('not.include', '/sign-in');

    // Create a test song
    cy.visit('/dashboard/songs/new');
    cy.get('[data-testid="song-title"]').clear().type(testSong.title);
    cy.get('[data-testid="song-author"]').clear().type(testSong.author);
    cy.get('[data-testid="song-level"]').select(testSong.level);
    cy.get('[data-testid="song-key"]').select(testSong.key);
    cy.get('[data-testid="song-ultimate_guitar_link"]').clear().type(testSong.ultimate_guitar_link);

    cy.intercept('POST', '/api/song').as('createSong');
    cy.get('[data-testid="song-save"]').click();

    cy.wait('@createSong').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
    });
  });

  it('should delete a song from detail page and verify removal from list', () => {
    // Navigate to songs list
    cy.visit('/dashboard/songs');

    // Find our test song
    cy.get('[data-testid="song-table"]').should('contain', testSong.title);

    // Count songs before deletion
    cy.get('[data-testid="song-row"]').then(($rows) => {
      const countBefore = $rows.length;
      cy.wrap(countBefore).as('countBefore');

      // Click on our test song
      cy.contains('[data-testid="song-row"]', testSong.title).find('a').first().click();
      cy.location('pathname').should('match', /\/dashboard\/songs\/[a-f0-9-]+$/);

      // Verify we're on the correct song's detail page
      cy.contains(testSong.title).should('be.visible');
      cy.contains(testSong.author).should('be.visible');

      // Set up API intercept for delete
      cy.intercept('DELETE', '/api/song*').as('deleteSong');

      // Click delete button
      cy.get('[data-testid="song-delete-button"]').should('be.visible').click();

      // Handle confirmation dialog if it exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="confirm-delete"]').length > 0) {
          cy.get('[data-testid="confirm-delete"]').click();
        }
      });

      // Wait for successful API call
      cy.wait('@deleteSong').then((interception) => {
        expect(interception.response?.statusCode).to.be.oneOf([200, 204]);
      });

      // Should redirect to songs list
      cy.location('pathname', { timeout: 10000 }).should('include', '/dashboard/songs');

      // Verify song is removed from list
      cy.get('[data-testid="song-table"]').should('not.contain', testSong.title);

      // Verify count decreased by 1
      cy.get('[data-testid="song-row"]').should('have.length', countBefore - 1);
    });
  });

  it('should not delete song if user cancels confirmation', () => {
    // Navigate to the test song's detail page
    cy.visit('/dashboard/songs');
    cy.contains('[data-testid="song-row"]', testSong.title).find('a').first().click();

    // Count songs before attempting delete
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-row"]').then(($rows) => {
      const countBefore = $rows.length;
      cy.wrap(countBefore).as('countBefore');

      // Go back to song detail
      cy.contains('[data-testid="song-row"]', testSong.title).find('a').first().click();

      // Click delete button
      cy.get('[data-testid="song-delete-button"]').click();

      // Cancel if confirmation dialog appears
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="cancel-delete"]').length > 0) {
          cy.get('[data-testid="cancel-delete"]').click();

          // Song should still exist
          cy.visit('/dashboard/songs');
          cy.get('[data-testid="song-table"]').should('contain', testSong.title);
          cy.get('@countBefore').then((countBefore) => {
            cy.get('[data-testid="song-row"]').should('have.length', countBefore);
          });
        }
      });
    });
  });

  it('should handle delete error gracefully', () => {
    // Intercept and force error
    cy.intercept('DELETE', '/api/song*', {
      statusCode: 500,
      body: { error: 'Internal server error' },
    }).as('deleteSongError');

    // Navigate to song detail
    cy.visit('/dashboard/songs');
    cy.contains('[data-testid="song-row"]', testSong.title).find('a').first().click();

    // Click delete
    cy.get('[data-testid="song-delete-button"]').click();

    // Confirm if dialog exists
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="confirm-delete"]').length > 0) {
        cy.get('[data-testid="confirm-delete"]').click();
      }
    });

    // Wait for error response
    cy.wait('@deleteSongError');

    // Should show error message
    cy.get('body').then(($body) => {
      const bodyText = $body.text().toLowerCase();
      expect(bodyText).to.satisfy(
        (text: string) =>
          text.includes('error') || text.includes('failed') || text.includes('could not')
      );
    });

    // Song should still exist in list
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-table"]').should('contain', testSong.title);
  });
});
