/// <reference types="cypress" />

// Admin journey: sign in and create a song
// Flow: Sign in → View songs list → Count existing songs → Create new song → Verify count increased by 1
// Routes:
// - Sign-in page: /sign-in
// - Songs list page: /dashboard/songs
// - Create song page: /dashboard/songs/new

describe('Admin Journey - Create Song', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'test123_admin';

  const song = {
    title: `E2E Admin Song ${Date.now()}`,
    author: 'Admin QA',
    level: 'intermediate',
    key: 'C',
    ug: 'https://tabs.ultimate-guitar.com/tab/test-song',
  };

  it('signs in, views list, creates a song, verifies row increment', () => {
    // Step 1: Sign in
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(adminEmail);
    cy.get('[data-testid="password"]').clear().type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();

    // Wait for redirect after successful sign-in
    cy.location('pathname', { timeout: 10000 }).should('not.include', '/sign-in');

    // Step 2: Navigate to songs list
    cy.visit('/dashboard/songs');
    cy.location('pathname').should('include', '/dashboard/songs');

    // Step 3: Count existing songs (handle empty state)
    cy.get('body').then(($body) => {
      let initialCount = 0;

      // If table exists, count rows; otherwise count is 0
      if ($body.find('[data-testid="song-table"]').length > 0) {
        cy.get('[data-testid="song-row"]').then(($rows) => {
          initialCount = $rows.length;
          cy.wrap(initialCount).as('initialCount');
        });
      } else {
        cy.wrap(0).as('initialCount');
      }
    });

    // Step 4: Navigate to create song page
    cy.get('[data-testid="song-new-button"]').should('exist').click();
    cy.location('pathname').should('include', '/dashboard/songs/new');

    // Step 5: Set up API intercept
    cy.intercept('POST', '/api/song').as('createSong');

    // Step 6: Fill and submit form
    cy.get('[data-testid="song-title"]').clear().type(song.title);
    cy.get('[data-testid="song-author"]').clear().type(song.author);
    cy.get('[data-testid="song-level"]').select(song.level);
    cy.get('[data-testid="song-key"]').select(song.key);
    cy.get('[data-testid="song-ultimate_guitar_link"]').clear().type(song.ug);
    cy.get('[data-testid="song-save"]').click();

    // Step 7: Wait for successful API call
    cy.wait('@createSong').then((interception) => {
      cy.log('API Response Status:', interception.response?.statusCode);
      cy.log('API Response Body:', JSON.stringify(interception.response?.body));
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
    });

    // Step 8: Return to songs list and verify increment
    cy.visit('/dashboard/songs');
    cy.location('pathname').should('include', '/dashboard/songs');

    // Table must exist after creating a song
    cy.get('[data-testid="song-table"]').should('exist');

    // Verify the count increased by 1
    cy.get('@initialCount').then((initialCount) => {
      const expectedCount = Number(initialCount) + 1;
      cy.get('[data-testid="song-row"]').should('have.length', expectedCount);
    });

    // Verify new song appears in the list
    cy.get('[data-testid="song-row"]').contains(song.title).should('exist');
  });
});
