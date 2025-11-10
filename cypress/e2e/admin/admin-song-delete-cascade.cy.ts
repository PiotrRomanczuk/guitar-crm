/// <reference types="cypress" />

// Admin song delete cascade tests - TDD approach
// Tests for soft delete with cascade handling of related lesson assignments
// Prerequisites: Database seeded with test songs (run scripts/database/seeding/local/seed-all.sh)
// Flow: Sign in → Navigate to songs page → Test delete confirmation → Test cascade behavior
// Routes:
// - Sign-in page: /sign-in
// - Songs list page: /dashboard/songs

describe('Admin Song Delete Cascade - TDD', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'test123_admin';

  beforeEach(() => {
    // Clear any existing session
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should load sign-in page', () => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').should('be.visible');
    cy.get('[data-testid="password"]').should('be.visible');
    cy.get('[data-testid="signin-button"]').should('be.visible');
  });

  it('should sign in as admin successfully', () => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(adminEmail);
    cy.get('[data-testid="password"]').clear().type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();

    // Wait for redirect to dashboard (could be /dashboard or /dashboard/songs)
    cy.location('pathname', { timeout: 15000 }).should('include', '/dashboard');
  });

  it('should show delete button for admin users', () => {
    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(adminEmail);
    cy.get('[data-testid="password"]').type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 15000 }).should('include', '/dashboard');

    // Navigate to songs page (in case we're not already there)
    cy.visit('/dashboard/songs');
    cy.location('pathname').should('include', '/dashboard/songs');

    // Find a song row and verify delete button exists
    cy.get('[data-testid="song-row"]')
      .first()
      .within(() => {
        cy.get('[data-testid="song-delete-button"]').should('exist');
      });
  });

  it('should show confirmation dialog when attempting to delete song', () => {
    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(adminEmail);
    cy.get('[data-testid="password"]').type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 15000 }).should('include', '/dashboard');

    // Navigate to songs page
    cy.visit('/dashboard/songs');
    cy.location('pathname').should('include', '/dashboard/songs');

    // Find the first song row and click delete button
    cy.get('[data-testid="song-row"]')
      .first()
      .within(() => {
        cy.get('[data-testid="song-delete-button"]').click();
      });

    // Verify confirmation dialog appears
    cy.get('[data-testid="delete-confirmation-dialog"]').should('be.visible');
    cy.get('[data-testid="delete-confirmation-title"]').should('contain', 'Delete Song');

    // Verify confirmation options
    cy.get('[data-testid="delete-confirm-button"]').should('be.visible');
    cy.get('[data-testid="delete-cancel-button"]').should('be.visible');
  });

  it('should perform soft delete when confirmed', () => {
    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(adminEmail);
    cy.get('[data-testid="password"]').type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 15000 }).should('include', '/dashboard');

    // Navigate to songs page
    cy.visit('/dashboard/songs');
    cy.location('pathname').should('include', '/dashboard/songs');

    // Count songs before deletion
    cy.get('[data-testid="song-row"]').then(($rows) => {
      const songsBeforeDelete = $rows.length;
      cy.wrap(songsBeforeDelete).as('songsBeforeDelete');
    });

    // Navigate to first song's detail page
    cy.get('[data-testid="song-row"]')
      .first()
      .within(() => {
        cy.get('a').first().click();
      });

    // Verify on detail page
    cy.location('pathname').should('match', /\/dashboard\/songs\/[a-f0-9-]+$/);

    // Handle browser confirm dialog by clicking OK
    cy.on('window:confirm', () => true);

    // Click delete button (scoped to detail page)
    cy.get('[data-testid="song-delete-button"]').should('be.visible').click();

    // Should redirect to songs list
    cy.location('pathname', { timeout: 5000 }).should('include', '/dashboard/songs');

    // Verify correct number of songs remain
    cy.get('@songsBeforeDelete').then((songsBeforeDelete) => {
      const expectedCount = Number(songsBeforeDelete) - 1;
      cy.get('[data-testid="song-row"]').should('have.length', expectedCount);
    });
  });

  it('should handle cascade deletion properly via API', () => {
    // Test the API directly to verify cascade behavior
    // This test can run without UI interaction since it tests the backend logic

    // First, we need to authenticate to get cookies for API calls
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(adminEmail);
    cy.get('[data-testid="password"]').type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 15000 }).should('include', '/dashboard');

    // Navigate to songs to ensure we're authenticated
    cy.visit('/dashboard/songs');
    cy.location('pathname').should('include', '/dashboard/songs');

    // Get a song ID from the API to test deletion
    cy.request('/api/song').then((getResponse) => {
      expect(getResponse.status).to.eq(200);
      expect(getResponse.body.songs).to.be.an('array');
      expect(getResponse.body.songs.length).to.be.greaterThan(0);

      const songId = getResponse.body.songs[0].id;

      // Now test the delete API
      cy.request({
        method: 'DELETE',
        url: `/api/song?id=${songId}`,
      }).then((deleteResponse) => {
        expect(deleteResponse.status).to.eq(200);
        expect(deleteResponse.body).to.have.property('success', true);
        expect(deleteResponse.body).to.have.property('cascadeInfo');

        // Verify cascade info structure
        const cascadeInfo: {
          lessonSongsDeleted: number;
          userFavoritesDeleted: number;
        } = deleteResponse.body.cascadeInfo;
        expect(cascadeInfo.lessonSongsDeleted).to.be.greaterThan(-1);
        expect(cascadeInfo.userFavoritesDeleted).to.be.greaterThan(-1);

        // Verify song is soft deleted by checking it doesn't appear in active list
        cy.request('/api/song').then((verifyResponse) => {
          expect(verifyResponse.status).to.equal(200);
          const remainingSongs = verifyResponse.body.songs;
          interface SongRow {
            id: string;
          }
          const deletedSong = (remainingSongs as SongRow[]).find((song) => song.id === songId);
          // Assert song no longer present (soft deleted)
          const isSoftDeleted = !deletedSong;
          expect(isSoftDeleted).to.equal(true);
        });
      });
    });
  });
});
