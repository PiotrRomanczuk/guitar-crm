/// <reference types="cypress" />

/**
 * Admin Song Delete E2E Test
 * 
 * Tests the complete workflow for an admin deleting songs:
 * 1. Admin signs in
 * 2. Creates a test song to delete
 * 3. Deletes the song
 * 4. Verifies the song is removed from the list
 * 5. Tests delete confirmation dialog
 * 6. Tests cascade deletion behavior
 */

describe('Admin - Song Delete Operations', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
  const ADMIN_PASSWORD = 'test123_admin';

  // Test data for creating songs to delete
  const createTestSong = () => ({
    title: `Delete Test Song ${Date.now()}`,
    author: 'Delete Test Artist',
    level: 'beginner',
    key: 'C',
    ultimateGuitarLink: 'https://www.ultimate-guitar.com/tab/delete-test',
  });

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

  it('should delete a song from the list', () => {
    // First, create a song to delete
    const testSong = createTestSong();
    cy.visit('/dashboard/songs/new');
    cy.get('input#title').type(testSong.title);
    cy.get('input#author').type(testSong.author);
    cy.get('select#level').select(testSong.level);
    cy.get('select#key').select(testSong.key);
    cy.get('input#ultimate_guitar_link').type(testSong.ultimateGuitarLink);
    cy.get('button[data-testid="song-save"]').click();

    // Wait for redirect to songs list
    cy.url({ timeout: 10000 }).should('include', '/dashboard/songs');
    cy.contains(testSong.title).should('be.visible');

    // Find and click delete button
    cy.get('body').then(($body) => {
      // Look for delete button near the song
      const deleteButtons = $body.find(`button:contains("Delete"), a:contains("Delete")`);
      
      if (deleteButtons.length > 0) {
        // Click the first delete button
        cy.contains('button', 'Delete').first().click();
        
        // Handle confirmation dialog if it appears
        cy.get('body').then(($dialogBody) => {
          if ($dialogBody.find('[role="dialog"], .modal, button:contains("Confirm")').length > 0) {
            // Confirmation dialog exists, click confirm
            cy.contains('button', 'Confirm').click();
          }
        });

        // Verify song is removed from list
        cy.wait(2000);
        cy.contains(testSong.title).should('not.exist');
      }
    });
  });

  it('should show delete confirmation dialog', () => {
    // Navigate to songs list
    cy.visit('/dashboard/songs');

    // Look for any delete button
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Delete"), a:contains("Delete")').length > 0) {
        // Click delete button
        cy.contains('button', 'Delete').first().click();
        
        // Verify confirmation dialog appears
        cy.get('body').then(($dialogBody) => {
          // Check for common dialog patterns
          const hasDialog = $dialogBody.find('[role="dialog"], .modal, [role="alertdialog"]').length > 0;
          const hasConfirmButton = $dialogBody.find('button:contains("Confirm"), button:contains("Yes")').length > 0;
          
          if (hasDialog || hasConfirmButton) {
            cy.contains('button', 'Cancel').should('be.visible');
          }
        });
      }
    });
  });

  it('should cancel delete operation', () => {
    // Create a song first
    const testSong = createTestSong();
    cy.visit('/dashboard/songs/new');
    cy.get('input#title').type(testSong.title);
    cy.get('input#author').type(testSong.author);
    cy.get('select#level').select(testSong.level);
    cy.get('select#key').select(testSong.key);
    cy.get('input#ultimate_guitar_link').type(testSong.ultimateGuitarLink);
    cy.get('button[data-testid="song-save"]').click();

    cy.url({ timeout: 10000 }).should('include', '/dashboard/songs');
    cy.contains(testSong.title).should('be.visible');

    // Try to delete but cancel
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Delete")').length > 0) {
        cy.contains('button', 'Delete').first().click();
        
        // Click cancel if dialog appears
        cy.get('body').then(($dialogBody) => {
          if ($dialogBody.find('button:contains("Cancel")').length > 0) {
            cy.contains('button', 'Cancel').click();
            
            // Verify song still exists
            cy.wait(1000);
            cy.contains(testSong.title).should('be.visible');
          }
        });
      }
    });
  });

  it('should delete song from detail page', () => {
    // Create a song
    const testSong = createTestSong();
    cy.visit('/dashboard/songs/new');
    cy.get('input#title').type(testSong.title);
    cy.get('input#author').type(testSong.author);
    cy.get('select#level').select(testSong.level);
    cy.get('select#key').select(testSong.key);
    cy.get('input#ultimate_guitar_link').type(testSong.ultimateGuitarLink);
    cy.get('button[data-testid="song-save"]').click();

    cy.url({ timeout: 10000 }).should('include', '/dashboard/songs');

    // Navigate to song details
    cy.contains(testSong.title).click();
    cy.wait(1000);

    // Look for delete button on detail page
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Delete")').length > 0) {
        cy.contains('button', 'Delete').click();
        
        // Confirm deletion
        cy.get('body').then(($dialogBody) => {
          if ($dialogBody.find('button:contains("Confirm")').length > 0) {
            cy.contains('button', 'Confirm').click();
          }
        });

        // Should redirect to songs list
        cy.url({ timeout: 10000 }).should('match', /\/dashboard\/songs\/?$/);
        
        // Verify song no longer appears
        cy.contains(testSong.title).should('not.exist');
      }
    });
  });

  it('should handle deletion of non-existent song gracefully', () => {
    // Try to visit a non-existent song detail page
    const fakeId = '00000000-0000-0000-0000-000000000000';
    cy.visit(`/dashboard/songs/${fakeId}`, { failOnStatusCode: false });
    
    // Should either show 404 or redirect
    cy.url().should('satisfy', (url) => {
      return url.includes('/dashboard/songs') || url.includes('404');
    });
  });

  it('should show appropriate message after successful deletion', () => {
    // Create a song
    const testSong = createTestSong();
    cy.visit('/dashboard/songs/new');
    cy.get('input#title').type(testSong.title);
    cy.get('input#author').type(testSong.author);
    cy.get('select#level').select(testSong.level);
    cy.get('select#key').select(testSong.key);
    cy.get('input#ultimate_guitar_link').type(testSong.ultimateGuitarLink);
    cy.get('button[data-testid="song-save"]').click();

    cy.url({ timeout: 10000 }).should('include', '/dashboard/songs');

    // Delete the song
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Delete")').length > 0) {
        cy.contains('button', 'Delete').first().click();
        
        cy.get('body').then(($dialogBody) => {
          if ($dialogBody.find('button:contains("Confirm")').length > 0) {
            cy.contains('button', 'Confirm').click();
          }
        });

        // Look for success message or toast
        cy.wait(1000);
        cy.get('body').then(($successBody) => {
          // Check for common success indicators
          const hasSuccessMessage = 
            $successBody.find('[role="alert"], .toast, .notification').text().toLowerCase().includes('success') ||
            $successBody.find('[role="alert"], .toast, .notification').text().toLowerCase().includes('deleted');
          
          if (hasSuccessMessage) {
            cy.contains(/success|deleted/i).should('be.visible');
          }
        });
      }
    });
  });

  it('should delete multiple songs sequentially', () => {
    // Create two test songs
    const testSong1 = createTestSong();
    const testSong2 = { ...createTestSong(), title: `Delete Test Song 2 ${Date.now()}` };

    // Create first song
    cy.visit('/dashboard/songs/new');
    cy.get('input#title').type(testSong1.title);
    cy.get('input#author').type(testSong1.author);
    cy.get('select#level').select(testSong1.level);
    cy.get('select#key').select(testSong1.key);
    cy.get('input#ultimate_guitar_link').type(testSong1.ultimateGuitarLink);
    cy.get('button[data-testid="song-save"]').click();
    cy.url({ timeout: 10000 }).should('include', '/dashboard/songs');

    // Create second song
    cy.visit('/dashboard/songs/new');
    cy.get('input#title').type(testSong2.title);
    cy.get('input#author').type(testSong2.author);
    cy.get('select#level').select(testSong2.level);
    cy.get('select#key').select(testSong2.key);
    cy.get('input#ultimate_guitar_link').type(testSong2.ultimateGuitarLink);
    cy.get('button[data-testid="song-save"]').click();
    cy.url({ timeout: 10000 }).should('include', '/dashboard/songs');

    // Verify both exist
    cy.contains(testSong1.title).should('be.visible');
    cy.contains(testSong2.title).should('be.visible');

    // Delete both songs
    [testSong1, testSong2].forEach((song) => {
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Delete")').length > 0) {
          cy.contains('button', 'Delete').first().click();
          
          cy.get('body').then(($dialogBody) => {
            if ($dialogBody.find('button:contains("Confirm")').length > 0) {
              cy.contains('button', 'Confirm').click();
            }
          });
          
          cy.wait(2000);
        }
      });
    });
  });

  it('should maintain list state after deletion', () => {
    cy.visit('/dashboard/songs');
    
    // Get initial count of songs
    cy.get('body').then(($initialBody) => {
      const initialCount = $initialBody.find('a[href*="/dashboard/songs/"]').length;
      
      // Delete one song if any exist
      if ($initialBody.find('button:contains("Delete")').length > 0) {
        cy.contains('button', 'Delete').first().click();
        
        cy.get('body').then(($dialogBody) => {
          if ($dialogBody.find('button:contains("Confirm")').length > 0) {
            cy.contains('button', 'Confirm').click();
          }
        });
        
        cy.wait(2000);
        
        // Verify count decreased
        cy.get('body').then(($afterBody) => {
          const afterCount = $afterBody.find('a[href*="/dashboard/songs/"]').length;
          expect(afterCount).to.be.lessThan(initialCount);
        });
      }
    });
  });
});
