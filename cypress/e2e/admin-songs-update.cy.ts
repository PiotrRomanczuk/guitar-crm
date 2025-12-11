/// <reference types="cypress" />

/**
 * Admin Song Update E2E Test
 * 
 * Tests the complete workflow for an admin updating an existing song:
 * 1. Admin signs in
 * 2. Navigates to songs list
 * 3. Selects a song to edit
 * 4. Updates song fields
 * 5. Saves changes
 * 6. Verifies updates are reflected
 */

describe('Admin - Song Update Operations', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
  const ADMIN_PASSWORD = 'test123_admin';

  // Test data for creating a song to update
  const testSong = {
    title: `Update Test Song ${Date.now()}`,
    author: 'Original Artist',
    level: 'beginner',
    key: 'C',
    ultimateGuitarLink: 'https://www.ultimate-guitar.com/tab/original',
    chords: 'C G Am F',
  };

  const updatedSong = {
    title: `Updated Song ${Date.now()}`,
    author: 'Updated Artist',
    level: 'advanced',
    key: 'G',
    chords: 'G D Em C',
  };

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

  it('should navigate to edit page from song list', () => {
    cy.visit('/dashboard/songs');

    // Look for edit links or buttons
    cy.get('body').then(($body) => {
      const editLink = $body.find('a[href*="/edit"]').first().attr('href');
      if (editLink && typeof editLink === 'string') {
        cy.visit(editLink);
        
        // Verify we're on edit page
        cy.url().should('include', '/edit');
        cy.contains('Edit Song').should('be.visible');
        cy.get('form').should('exist');
      } else {
        // If no songs exist to edit, create one first
        cy.visit('/dashboard/songs/new');
        cy.url().should('include', '/new');
      }
    });
  });

  it('should load existing song data in edit form', () => {
    cy.visit('/dashboard/songs');

    cy.get('body').then(($body) => {
      const editLink = $body.find('a[href*="/edit"]').first().attr('href');
      if (editLink && typeof editLink === 'string') {
        cy.visit(editLink);
        
        // Verify form is pre-populated
        cy.get('input#title').should('not.have.value', '');
        cy.get('input#author').should('not.have.value', '');
        cy.get('select#level').should('not.have.value', '');
        cy.get('select#key').should('not.have.value', '');
      }
    });
  });

  it('should update song with new values', () => {
    // First, create a song to update
    cy.visit('/dashboard/songs/new');
    cy.get('input#title').type(testSong.title);
    cy.get('input#author').type(testSong.author);
    cy.get('select#level').select(testSong.level);
    cy.get('select#key').select(testSong.key);
    cy.get('input#ultimate_guitar_link').type(testSong.ultimateGuitarLink);
    cy.get('input#chords').type(testSong.chords);
    cy.get('button[data-testid="song-save"]').click();

    // Wait for redirect to songs list
    cy.url({ timeout: 10000 }).should('include', '/dashboard/songs');
    cy.url().should('not.include', '/new');

    // Find the newly created song and click edit
    cy.contains(testSong.title).should('be.visible');
    
    // Navigate to song details or find edit link
    cy.get('body').then(($body) => {
      // Look for edit button/link near our song
      const links = $body.find(`a:contains("${testSong.title}")`).closest('tr, li, div[class*="song"]').find('a[href*="/edit"]');
      
      if (links.length > 0) {
        const editHref = Cypress.$(links[0]).attr('href');
        if (editHref) {
          cy.visit(editHref);
        }
      } else {
        // Alternative: click on song title to go to details, then find edit button
        cy.contains(testSong.title).click();
        cy.wait(1000);
        cy.get('a[href*="/edit"], button:contains("Edit")').first().click();
      }
    });

    // Wait for edit form to load
    cy.url({ timeout: 5000 }).should('include', '/edit');

    // Update the fields
    cy.get('input#title').clear().type(updatedSong.title);
    cy.get('input#author').clear().type(updatedSong.author);
    cy.get('select#level').select(updatedSong.level);
    cy.get('select#key').select(updatedSong.key);
    cy.get('input#chords').clear().type(updatedSong.chords);

    // Save the changes
    cy.get('button[data-testid="song-save"]').click();

    // Wait for redirect
    cy.url({ timeout: 10000 }).should('not.include', '/edit');

    // Verify updated song appears in list with new values
    cy.contains(updatedSong.title).should('be.visible');
  });

  it('should validate required fields when updating', () => {
    cy.visit('/dashboard/songs');

    cy.get('body').then(($body) => {
      const editLink = $body.find('a[href*="/edit"]').first().attr('href');
      if (editLink && typeof editLink === 'string') {
        cy.visit(editLink);
        
        // Try to clear required field and submit
        cy.get('input#title').clear();
        cy.get('button[data-testid="song-save"]').click();

        // Verify we stay on edit page due to validation error
        cy.url().should('include', '/edit');
      }
    });
  });

  it('should cancel edit and return to previous page', () => {
    cy.visit('/dashboard/songs');

    cy.get('body').then(($body) => {
      const editLink = $body.find('a[href*="/edit"]').first().attr('href');
      if (editLink && typeof editLink === 'string') {
        cy.visit(editLink);
        
        // Look for cancel button or back link
        cy.get('body').then(($editBody) => {
          if ($editBody.find('button:contains("Cancel"), a:contains("Cancel")').length > 0) {
            cy.contains('Cancel').click();
            cy.url().should('not.include', '/edit');
          } else {
            // Use browser back
            cy.go('back');
            cy.url().should('include', '/dashboard/songs');
          }
        });
      }
    });
  });

  it('should preserve unchanged fields when updating', () => {
    cy.visit('/dashboard/songs');

    cy.get('body').then(($body) => {
      const editLink = $body.find('a[href*="/edit"]').first().attr('href');
      if (editLink && typeof editLink === 'string') {
        cy.visit(editLink);
        
        // Get original author value
        cy.get('input#author').invoke('val').then((originalAuthor) => {
          // Update only the title
          cy.get('input#title').clear().type(`Modified ${Date.now()}`);
          
          // Save
          cy.get('button[data-testid="song-save"]').click();
          
          // Go back to edit to verify author is unchanged
          cy.wait(2000);
          cy.visit(editLink);
          
          // Verify author remained the same
          cy.get('input#author').should('have.value', originalAuthor);
        });
      }
    });
  });

  it('should handle edit form reload without losing state', () => {
    cy.visit('/dashboard/songs');

    cy.get('body').then(($body) => {
      const editLink = $body.find('a[href*="/edit"]').first().attr('href');
      if (editLink && typeof editLink === 'string') {
        cy.visit(editLink);
        cy.get('form').should('exist');
        
        // Reload page
        cy.reload();
        
        // Verify form still loads with data
        cy.get('form').should('exist');
        cy.get('input#title').should('not.have.value', '');
      }
    });
  });

  it('should update multiple fields at once', () => {
    cy.visit('/dashboard/songs');

    cy.get('body').then(($body) => {
      const editLink = $body.find('a[href*="/edit"]').first().attr('href');
      if (editLink && typeof editLink === 'string') {
        cy.visit(editLink);
        
        // Update multiple fields
        const timestamp = Date.now();
        cy.get('input#title').clear().type(`Multi Update ${timestamp}`);
        cy.get('input#author').clear().type(`Multi Artist ${timestamp}`);
        cy.get('select#level').select('intermediate');
        
        // Save
        cy.get('button[data-testid="song-save"]').click();
        
        // Verify redirect
        cy.url({ timeout: 10000 }).should('not.include', '/edit');
      }
    });
  });
});
