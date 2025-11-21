/// <reference types="cypress" />

// Admin Songs CRUD Tests
// Verifies complete song management workflow: create, read, update, delete

describe('Admin Songs CRUD', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'test123_admin';

  beforeEach(() => {
    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(adminEmail);
    cy.get('[data-testid="password"]').clear().type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 10000 }).should('eq', '/dashboard');
  });

  it('should create a new song successfully', () => {
    const songData = {
      title: `E2E Test Song ${Date.now()}`,
      author: 'Test Author',
      level: 'intermediate',
      key: 'C',
      ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/test-song',
    };

    // Navigate to create song page
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-new-button"]').click();
    cy.location('pathname').should('include', '/dashboard/songs/new');

    // Fill form
    cy.get('[data-testid="song-title"]').type(songData.title);
    cy.get('[data-testid="song-author"]').type(songData.author);
    cy.get('[data-testid="song-level"]').select(songData.level);
    cy.get('[data-testid="song-key"]').select(songData.key);
    cy.get('[data-testid="song-ultimate_guitar_link"]').type(songData.ultimate_guitar_link);

    // Submit
    cy.intercept('POST', '/api/song').as('createSong');
    cy.get('[data-testid="song-save"]').click();
    cy.wait('@createSong').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
    });

    // Verify creation
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-table"]').should('contain', songData.title);
    cy.get('[data-testid="song-table"]').should('contain', songData.author);
  });

  it('should edit an existing song', () => {
    // Get first song
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-row"]').first().find('a').first().click();
    cy.location('pathname').should('match', /\/dashboard\/songs\/[a-f0-9-]+$/);

    // Click edit
    cy.get('[data-testid="song-edit-button"]').should('be.visible').click();
    cy.location('pathname').should('match', /\/songs\/[a-f0-9-]+\/edit$/);

    // Update fields
    const updatedTitle = `Updated Song ${Date.now()}`;
    const updatedAuthor = 'Updated Author';

    cy.get('[data-testid="song-title"]').clear().type(updatedTitle);
    cy.get('[data-testid="song-author"]').clear().type(updatedAuthor);
    cy.get('[data-testid="song-level"]').select('advanced');
    cy.get('[data-testid="song-key"]').select('D');

    // Submit
    cy.intercept('PUT', '/api/song*').as('updateSong');
    cy.get('[data-testid="song-save"]').click();
    cy.wait('@updateSong', { timeout: 10000 }).then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
    });

    // Verify update
    cy.location('pathname', { timeout: 10000 }).should('include', '/dashboard/songs');
    cy.get('[data-testid="song-table"]').should('contain', updatedTitle);
  });

  it('should delete a song', () => {
    // Create a song to delete
    const songToDelete = {
      title: `Delete Me ${Date.now()}`,
      author: 'Delete Author',
      level: 'beginner',
      key: 'E',
      ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/delete-test',
    };

    cy.visit('/dashboard/songs/new');
    cy.get('[data-testid="song-title"]').type(songToDelete.title);
    cy.get('[data-testid="song-author"]').type(songToDelete.author);
    cy.get('[data-testid="song-level"]').select(songToDelete.level);
    cy.get('[data-testid="song-key"]').select(songToDelete.key);
    cy.get('[data-testid="song-ultimate_guitar_link"]').type(songToDelete.ultimate_guitar_link);

    cy.intercept('POST', '/api/song').as('createSong');
    cy.get('[data-testid="song-save"]').click();
    cy.wait('@createSong');

    // Delete the song
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-table"]').should('contain', songToDelete.title);

    cy.contains('[data-testid="song-row"]', songToDelete.title).find('a').first().click();
    cy.location('pathname').should('match', /\/dashboard\/songs\/[a-f0-9-]+$/);

    // Count before delete
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-row"]').then(($rows) => {
      const countBefore = $rows.length;

      // Navigate back to detail and delete
      cy.contains('[data-testid="song-row"]', songToDelete.title).find('a').first().click();

      // Wait for navigation to detail page
      cy.location('pathname').should('match', /\/dashboard\/songs\/[a-f0-9-]+$/);

      cy.on('window:confirm', () => true);
      cy.get('[data-testid="song-delete-button"]').should('be.visible').first().click();

      // Verify deletion
      cy.location('pathname', { timeout: 5000 }).should('include', '/dashboard/songs');
      cy.get('[data-testid="song-table"]').should('not.contain', songToDelete.title);
      cy.get('[data-testid="song-row"]').should('have.length', countBefore - 1);
    });
  });

  it('should validate required fields', () => {
    cy.visit('/dashboard/songs/new');

    // Try to submit with empty fields
    cy.get('[data-testid="song-title"]').clear();
    cy.get('[data-testid="song-author"]').clear();
    cy.get('[data-testid="song-save"]').click();

    // Should show validation errors
    cy.get('body').then(($body) => {
      const bodyText = $body.text().toLowerCase();
      expect(bodyText).to.satisfy(
        (text: string) => text.includes('required') || text.includes('error')
      );
    });

    // Should stay on form page
    cy.location('pathname').should('include', '/dashboard/songs/new');
  });

  it('should display songs list', () => {
    cy.visit('/dashboard/songs');
    cy.location('pathname').should('include', '/dashboard/songs');
    cy.get('[data-testid="song-table"]').should('be.visible');
  });

  it('should cancel edit and discard changes', () => {
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-row"]').first().find('a').first().click();
    cy.get('[data-testid="song-edit-button"]').click();

    // Make changes
    cy.get('[data-testid="song-title"]').clear().type('Should Not Save');

    // Navigate back
    cy.go('back');

    // Verify changes discarded
    cy.contains('Should Not Save').should('not.exist');
  });
});
