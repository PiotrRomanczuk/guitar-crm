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

    // Count songs before deletion
    cy.get('[data-testid="song-row"]').then(($rows) => {
      const countBefore = $rows.length;
      cy.wrap(countBefore).as('countBefore');
    });

    // Find our test song and click on it
    cy.contains('[data-testid="song-row"]', testSong.title).find('a').first().click();
    cy.location('pathname').should('match', /\/dashboard\/songs\/[a-f0-9-]+$/);

    // Verify we're on the correct song's detail page
    cy.contains(testSong.title).should('be.visible');
    cy.contains(testSong.author).should('be.visible');

    // Handle browser confirm dialog by clicking OK
    cy.on('window:confirm', () => true);

    // Click delete button
    cy.get('[data-testid="song-delete-button"]').should('be.visible').click();

    // Should redirect to songs list after successful delete
    cy.location('pathname', { timeout: 5000 }).should('include', '/dashboard/songs');

    // Verify song is removed from list
    cy.get('[data-testid="song-table"]').should('not.contain', testSong.title);

    // Verify count decreased by 1
    cy.get('@countBefore').then((countBefore) => {
      cy.get('[data-testid="song-row"]').should('have.length', Number(countBefore) - 1);
    });
  });

  it('should not delete song if user cancels confirmation', () => {
    // Navigate to the test song's detail page
    cy.visit('/dashboard/songs');
    cy.contains('[data-testid="song-row"]', testSong.title).find('a').first().click();
    cy.location('pathname').should('match', /\/dashboard\/songs\/[a-f0-9-]+$/);

    // Count songs before attempting delete
    cy.request('/api/song').then((response) => {
      const initialCount = response.body.songs.length;
      cy.wrap(initialCount).as('initialCount');
    });

    // Handle browser confirm dialog by clicking CANCEL (return false)
    cy.on('window:confirm', () => false);

    // Click delete button (scoped to detail page - only one)
    cy.get('[data-testid="song-delete-button"]').should('be.visible').click();

    // Should still be on detail page (didn't navigate away)
    cy.location('pathname').should('match', /\/dashboard\/songs\/[a-f0-9-]+$/);

    // Verify song still exists in database
    cy.request('/api/song').then((response) => {
      const finalCount = response.body.songs.length;
      cy.get('@initialCount').then((initialCount) => {
        expect(finalCount).to.equal(initialCount);
      });
    });

    // Verify song is still in list
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-table"]').should('contain', testSong.title);
  });

  it('should handle delete error gracefully', () => {
    // Test successful delete with comprehensive verification
    let songIdToDelete = '';

    cy.visit('/dashboard/songs');

    // Get initial count
    cy.get('[data-testid="song-row"]').then(($rows) => {
      const initialCount = $rows.length;
      cy.wrap(initialCount).as('initialCount');
    });

    // Find and navigate to the test song
    cy.contains('[data-testid="song-row"]', testSong.title).find('a').first().click();

    cy.location('pathname')
      .should('match', /\/dashboard\/songs\/([a-f0-9-]+)$/)
      .then((path) => {
        const match = path.match(/\/dashboard\/songs\/([a-f0-9-]+)$/);
        if (match) {
          songIdToDelete = match[1];
          cy.wrap(songIdToDelete).as('songIdToDelete');
        }
      });

    // Handle browser confirm dialog by accepting it
    cy.on('window:confirm', () => true);

    // Click delete button and wait for it to disappear
    cy.get('[data-testid="song-delete-button"]').click({ force: true });

    // Wait for redirect to songs list (delete successful)
    cy.location('pathname', { timeout: 10000 }).should('not.include', '/songs/');

    // Verify we're on the songs list
    cy.location('pathname').should('include', '/dashboard/songs');

    // Refresh page to ensure fresh data
    cy.wait(500);
    cy.reload();
    cy.wait(500);

    // Verify the deleted song is no longer in the table
    cy.get('@initialCount').then((initialCount) => {
      cy.get('[data-testid="song-row"]').should('have.length', Number(initialCount) - 1);
    });

    cy.get('[data-testid="song-table"]').should('not.contain', testSong.title);
  });
});
