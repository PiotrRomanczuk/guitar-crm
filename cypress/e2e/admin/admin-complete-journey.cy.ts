/// <reference types="cypress" />

// Comprehensive Admin Journey E2E Test
// Complete flow: Sign in → Dashboard → Create/Edit/Delete Song → Verify all steps
// This test validates the complete admin workflow end-to-end

describe('Complete Admin Journey', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'test123_admin';

  const songData = {
    title: `Admin Journey Song ${Date.now()}`,
    author: 'Journey Test Artist',
    level: 'intermediate',
    key: 'G',
    ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/journey-test',
  };

  it('should complete full admin workflow: login → dashboard → create → edit → delete song', () => {
    // ===== STEP 1: LOGIN =====
    cy.log('STEP 1: Admin Login');
    cy.visit('/sign-in');

    // Verify sign-in page loaded
    cy.get('[data-testid="email"]').should('be.visible');
    cy.get('[data-testid="password"]').should('be.visible');

    // Enter credentials
    cy.get('[data-testid="email"]').clear().type(adminEmail);
    cy.get('[data-testid="password"]').clear().type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();

    // Wait for successful login
    cy.location('pathname', { timeout: 10000 }).should('not.include', '/sign-in');
    cy.log('✅ Login successful');

    // ===== STEP 2: VERIFY DASHBOARD =====
    cy.log('STEP 2: Access Admin Dashboard');
    cy.visit('/dashboard');

    // Verify admin dashboard elements
    cy.contains('Admin Dashboard').should('be.visible');
    cy.contains('Total Users').should('be.visible');
    cy.contains('User Management').should('be.visible');
    cy.log('✅ Dashboard verified');

    // ===== STEP 3: NAVIGATE TO SONGS =====
    cy.log('STEP 3: Navigate to Songs Management');
    cy.visit('/dashboard/songs');
    cy.location('pathname').should('include', '/dashboard/songs');

    // Count initial songs
    cy.get('body').then(($body) => {
      let initialCount = 0;
      if ($body.find('[data-testid="song-table"]').length > 0) {
        cy.get('[data-testid="song-row"]').then(($rows) => {
          initialCount = $rows.length;
          cy.wrap(initialCount).as('initialSongCount');
          cy.log(`Initial song count: ${initialCount}`);
        });
      } else {
        cy.wrap(0).as('initialSongCount');
        cy.log('No songs yet - starting from empty');
      }
    });

    cy.log('✅ Songs page accessed');

    // ===== STEP 4: CREATE NEW SONG =====
    cy.log('STEP 4: Create New Song');
    cy.get('[data-testid="song-new-button"]').should('be.visible').click();
    cy.location('pathname').should('include', '/dashboard/songs/new');

    // Fill form
    cy.get('[data-testid="song-title"]').clear().type(songData.title);
    cy.get('[data-testid="song-author"]').clear().type(songData.author);
    cy.get('[data-testid="song-level"]').select(songData.level);
    cy.get('[data-testid="song-key"]').select(songData.key);
    cy.get('[data-testid="song-ultimate_guitar_link"]').clear().type(songData.ultimate_guitar_link);

    // Submit
    cy.intercept('POST', '/api/song').as('createSong');
    cy.get('[data-testid="song-save"]').click();
    cy.wait('@createSong').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      cy.log('✅ Song created successfully');
    });

    // ===== STEP 5: VERIFY SONG IN LIST =====
    cy.log('STEP 5: Verify Song Appears in List');
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-table"]').should('contain', songData.title);
    cy.get('[data-testid="song-table"]').should('contain', songData.author);

    // Verify count increased
    cy.get('@initialSongCount').then((initialCount) => {
      const expectedCount = Number(initialCount) + 1;
      cy.get('[data-testid="song-row"]').should('have.length', expectedCount);
      cy.log(`✅ Song count increased to ${expectedCount}`);
    });

    // ===== STEP 6: VIEW SONG DETAIL =====
    cy.log('STEP 6: View Song Detail Page');
    cy.contains('[data-testid="song-row"]', songData.title).find('a').first().click();
    cy.location('pathname').should('match', /\/dashboard\/songs\/[a-f0-9-]+$/);

    // Verify details
    cy.contains(songData.title).should('be.visible');
    cy.contains(songData.author).should('be.visible');
    cy.contains(songData.level).should('be.visible');
    cy.contains(songData.key).should('be.visible');
    cy.log('✅ Song details verified');

    // ===== STEP 7: EDIT SONG =====
    cy.log('STEP 7: Edit Song');
    cy.get('[data-testid="song-edit-button"]').should('be.visible').click();
    cy.location('pathname').should('match', /\/songs\/[a-f0-9-]+\/edit$/);

    // Update some fields
    const updatedTitle = `${songData.title} (EDITED)`;
    const updatedLevel = 'advanced';

    cy.get('[data-testid="song-title"]').clear();
    cy.get('[data-testid="song-title"]').type(updatedTitle);
    cy.get('[data-testid="song-level"]').select(updatedLevel);

    cy.intercept('PUT', '/api/song*').as('updateSong');
    cy.get('[data-testid="song-save"]').click();
    cy.wait('@updateSong').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      cy.log('✅ Song updated successfully');
    });

    // ===== STEP 8: VERIFY EDIT IN LIST =====
    cy.log('STEP 8: Verify Edit in Songs List');
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-table"]').should('contain', updatedTitle);
    cy.get('[data-testid="song-table"]').should('contain', updatedLevel);
    cy.log('✅ Edits reflected in list');

    // ===== STEP 9: DELETE SONG =====
    cy.log('STEP 9: Delete Song');

    // Navigate directly to the detail page of the song we want to delete
    cy.contains('[data-testid="song-row"]', updatedTitle).find('a').first().click();

    // Get current count before delete
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-row"]').then(($rows) => {
      const countBeforeDelete = $rows.length;
      cy.wrap(countBeforeDelete).as('countBeforeDelete');
    });

    // Navigate back to detail page and delete - use direct navigation
    cy.contains('[data-testid="song-row"]', updatedTitle)
      .find('a')
      .first()
      .invoke('attr', 'href')
      .then((href) => {
        // Navigate directly to detail page
        cy.visit(href as string);

        // Handle browser confirm dialog for delete
        cy.on('window:confirm', () => true);

        // Wait for page to load and button to be visible
        cy.get('[data-testid="song-delete-button"]', { timeout: 5000 })
          .should('be.visible')
          .click();

        // Wait for redirect back to list
        cy.location('pathname', { timeout: 5000 }).should('include', '/dashboard/songs');
        cy.log('✅ Song deleted successfully and redirected to list');
      });

    // ===== STEP 10: VERIFY DELETION =====
    cy.log('STEP 10: Verify Song Removed from List');
    cy.visit('/dashboard/songs', { timeout: 10000 });

    // Should not contain deleted song
    cy.get('[data-testid="song-table"]').should('not.contain', updatedTitle);

    // Count should be back to original
    cy.get('@countBeforeDelete').then((countBeforeDelete) => {
      const expectedFinalCount = Number(countBeforeDelete) - 1;
      cy.get('[data-testid="song-row"]').should('have.length', expectedFinalCount);
      cy.log(`✅ Final song count: ${expectedFinalCount}`);
    });

    // ===== STEP 11: RETURN TO DASHBOARD =====
    cy.log('STEP 11: Return to Dashboard');
    cy.visit('/dashboard');
    cy.contains('Admin Dashboard').should('be.visible');
    cy.log('✅ Complete admin journey finished successfully');
  });

  it('should handle errors gracefully during admin workflow', () => {
    // Login
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(adminEmail);
    cy.get('[data-testid="password"]').clear().type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 10000 }).should('not.include', '/sign-in');

    // Try to create song with invalid data
    cy.visit('/dashboard/songs/new');

    // Leave required fields empty
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

  it('should maintain session across navigation', () => {
    // Login
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(adminEmail);
    cy.get('[data-testid="password"]').clear().type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 10000 }).should('not.include', '/sign-in');

    // Navigate through multiple pages
    cy.visit('/dashboard');
    cy.contains('Admin Dashboard').should('be.visible');

    cy.visit('/dashboard/songs');
    cy.location('pathname').should('include', '/dashboard/songs');

    cy.visit('/dashboard');
    cy.contains('Admin Dashboard').should('be.visible');

    // Should still be logged in - no redirect to sign-in
    cy.location('pathname').should('not.include', '/sign-in');
  });
});
