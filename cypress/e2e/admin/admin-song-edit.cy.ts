/// <reference types="cypress" />

// Admin journey: Edit an existing song
// Flow: Sign in → View songs list → Select song → Edit → Verify changes
// Routes:
// - Sign-in page: /sign-in
// - Songs list page: /dashboard/songs
// - Song detail page: /dashboard/songs/{id}
// - Edit song page: /songs/{id}/edit

describe('Admin Journey - Edit Song', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'test123_admin';

  beforeEach(() => {
    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(adminEmail);
    cy.get('[data-testid="password"]').clear().type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 10000 }).should('not.include', '/sign-in');
  });

  it('should edit an existing song successfully', () => {
    // Navigate to songs list
    cy.visit('/dashboard/songs');
    cy.location('pathname').should('include', '/dashboard/songs');

    // Ensure table exists (at least one song)
    cy.get('[data-testid="song-table"]').should('exist');
    cy.get('[data-testid="song-row"]').should('have.length.at.least', 1);

    // Click on first song to view details
    cy.get('[data-testid="song-row"]').first().find('a').first().click();
    cy.location('pathname').should('match', /\/dashboard\/songs\/[a-f0-9-]+$/);

    // Wait for song detail page to load
    cy.get('[data-testid="song-edit-button"]').should('be.visible');

    // Store original title for verification
    cy.get('body').then(($body) => {
      const originalTitle = $body
        .text()
        .match(/Title[:\s]+([^\n]+)/)?.[1]
        ?.trim();
      cy.wrap(originalTitle).as('originalTitle');
    });

    // Click edit button
    cy.get('[data-testid="song-edit-button"]').click();
    cy.location('pathname').should('match', /\/songs\/[a-f0-9-]+\/edit$/);

    // Update song details - break up commands to prevent DOM detachment
    const updatedTitle = `Updated Song ${Date.now()}`;
    const updatedAuthor = 'Updated Author';

    // Title
    cy.get('[data-testid="song-title"]').should('be.visible');
    cy.get('[data-testid="song-title"]').clear();
    cy.get('[data-testid="song-title"]').type(updatedTitle);

    // Author
    cy.get('[data-testid="song-author"]').clear();
    cy.get('[data-testid="song-author"]').type(updatedAuthor);

    // Level
    cy.get('[data-testid="song-level"]').select('advanced');

    // Key
    cy.get('[data-testid="song-key"]').select('D');

    // Set up API intercept
    cy.intercept('PUT', '/api/song*').as('updateSong');

    // Submit form
    cy.get('[data-testid="song-save"]').click();

    // Wait for successful API call
    cy.wait('@updateSong', { timeout: 10000 }).then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
    });

    // Should redirect back to songs list (or detail page)
    // Add small delay to allow for redirect
    cy.location('pathname', { timeout: 10000 }).should('include', '/dashboard/songs');

    // Verify updated content appears (in list or on navigating to detail)
    cy.get('[data-testid="song-table"]').should('contain', updatedTitle);
    cy.get('[data-testid="song-table"]').should('contain', updatedAuthor);

    // Navigate back to list and verify changes there too
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-table"]').should('contain', updatedTitle);
    cy.get('[data-testid="song-table"]').should('contain', updatedAuthor);
  });

  it('should show validation errors for invalid edit data', () => {
    // Navigate to songs list
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-row"]').first().find('a').first().click();

    // Click edit button
    cy.get('[data-testid="song-edit-button"]').click();
    cy.location('pathname').should('match', /\/songs\/[a-f0-9-]+\/edit$/);

    // Clear required fields - break up commands
    cy.get('[data-testid="song-title"]').clear();
    cy.wait(100); // Small wait to allow re-render
    cy.get('[data-testid="song-author"]').clear();

    // Try to submit
    cy.get('[data-testid="song-save"]').click();

    // Should show validation errors (either in-line or alert)
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      expect(bodyText.toLowerCase()).to.satisfy(
        (text: string) => text.includes('required') || text.includes('error')
      );
    });

    // Should stay on edit page
    cy.location('pathname').should('match', /\/songs\/[a-f0-9-]+\/edit$/);
  });

  it('should cancel edit and return to detail page', () => {
    // Navigate to songs list
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-row"]').first().find('a').first().click();

    // Get original title
    cy.get('body').then(($body) => {
      const originalTitle = $body
        .text()
        .match(/Title[:\s]+([^\n]+)/)?.[1]
        ?.trim();
      cy.wrap(originalTitle).as('originalTitle');
    });

    // Click edit button
    cy.get('[data-testid="song-edit-button"]').click();

    // Make changes but don't save - break up commands
    cy.get('[data-testid="song-title"]').clear();
    cy.wait(100); // Small wait to allow re-render
    cy.get('[data-testid="song-title"]').type('Should Not Be Saved');

    // Navigate back (could be back button or cancel link)
    cy.go('back');

    // Verify original data unchanged
    cy.get('@originalTitle').then((title) => {
      const originalTitle = String(title);
      if (originalTitle && originalTitle !== 'undefined') {
        cy.contains(originalTitle).should('be.visible');
      }
    });

    cy.contains('Should Not Be Saved').should('not.exist');
  });
});
