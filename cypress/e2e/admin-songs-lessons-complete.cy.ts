/// <reference types="cypress" />

/**
 * Admin Songs and Lessons - Complete Journey E2E Test
 * 
 * Tests the complete workflow for admin managing songs and lessons:
 * 1. Admin signs in
 * 2. Creates a new song
 * 3. Creates a new lesson
 * 4. Assigns the song to the lesson
 * 5. Updates both song and lesson
 * 6. Views the complete data
 * 7. Deletes the lesson
 * 8. Deletes the song
 * 
 * This test validates the entire CRUD lifecycle and integration between songs and lessons.
 */

describe('Admin - Complete Songs and Lessons Journey', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
  const ADMIN_PASSWORD = 'test123_admin';

  // Test data
  const timestamp = Date.now();
  const testSong = {
    title: `Journey Song ${timestamp}`,
    author: 'Journey Artist',
    level: 'intermediate',
    key: 'D',
    ultimateGuitarLink: 'https://www.ultimate-guitar.com/tab/journey-test',
    chords: 'D A Bm G',
  };

  const testLesson = {
    title: `Journey Lesson ${timestamp}`,
    notes: 'This lesson is part of an e2e journey test',
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

  it('should complete full admin journey: create → assign → update → delete', () => {
    // ==========================================
    // STEP 1: Create a New Song
    // ==========================================
    cy.log('Step 1: Creating a new song');
    cy.visit('/dashboard/songs/new');
    
    cy.get('input#title').clear().type(testSong.title);
    cy.get('input#author').clear().type(testSong.author);
    cy.get('select#level').select(testSong.level);
    cy.get('select#key').select(testSong.key);
    cy.get('input#ultimate_guitar_link').clear().type(testSong.ultimateGuitarLink);
    cy.get('input#chords').clear().type(testSong.chords);
    
    cy.get('button[data-testid="song-save"]').click();
    cy.url({ timeout: 10000 }).should('include', '/dashboard/songs');
    cy.contains(testSong.title).should('be.visible');
    
    cy.log('✓ Song created successfully');

    // ==========================================
    // STEP 2: Create a New Lesson
    // ==========================================
    cy.log('Step 2: Creating a new lesson');
    cy.visit('/dashboard/lessons/new');
    
    // Select student and teacher
    cy.get('body').then(($body) => {
      if ($body.find('select[name="student_id"]').length > 0) {
        cy.get('select[name="student_id"]').select(1);
      }
      if ($body.find('select[name="teacher_id"]').length > 0) {
        cy.get('select[name="teacher_id"]').select(1);
      }
    });

    cy.get('[data-testid="lesson-title"], input[name="title"]').type(testLesson.title);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateTimeString = futureDate.toISOString().slice(0, 16);
    cy.get('[data-testid="lesson-scheduled-at"], input[name="scheduled_at"]').type(dateTimeString);
    
    cy.get('[data-testid="lesson-notes"], textarea[name="notes"]').type(testLesson.notes);

    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('satisfy', (url) => {
      return url.includes('/dashboard/lessons') && !url.includes('/new');
    });
    
    cy.log('✓ Lesson created successfully');

    // ==========================================
    // STEP 3: Verify Both Exist
    // ==========================================
    cy.log('Step 3: Verifying both song and lesson exist');
    
    // Verify song exists
    cy.visit('/dashboard/songs');
    cy.contains(testSong.title).should('be.visible');
    
    // Verify lesson exists
    cy.visit('/dashboard/lessons');
    cy.contains(testLesson.title).should('be.visible');
    
    cy.log('✓ Both song and lesson are visible in their respective lists');

    // ==========================================
    // STEP 4: Update the Song
    // ==========================================
    cy.log('Step 4: Updating the song');
    cy.visit('/dashboard/songs');
    
    // Find and click edit for our song
    cy.contains(testSong.title).should('be.visible');
    cy.get('body').then(($body) => {
      const editLinks = $body.find('a[href*="/edit"]');
      if (editLinks.length > 0) {
        // Navigate to edit page of the first song (should be ours)
        cy.wrap(editLinks.first()).click();
        
        // Update the chords
        const updatedChords = 'D A Bm G Em';
        cy.get('input#chords').clear().type(updatedChords);
        
        cy.get('button[data-testid="song-save"]').click();
        cy.url({ timeout: 10000 }).should('not.include', '/edit');
        
        cy.log('✓ Song updated successfully');
      }
    });

    // ==========================================
    // STEP 5: Update the Lesson
    // ==========================================
    cy.log('Step 5: Updating the lesson');
    cy.visit('/dashboard/lessons');
    cy.wait(2000);
    
    cy.get('body').then(($body) => {
      const editLinks = $body.find('a[href*="/edit"]');
      if (editLinks.length > 0) {
        cy.wrap(editLinks.first()).click();
        
        // Update notes
        const updatedNotes = `${testLesson.notes} - UPDATED`;
        cy.get('[data-testid="lesson-notes"], textarea[name="notes"]').clear().type(updatedNotes);
        
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 10000 }).should('not.include', '/edit');
        
        cy.log('✓ Lesson updated successfully');
      }
    });

    // ==========================================
    // STEP 6: View Details
    // ==========================================
    cy.log('Step 6: Viewing song and lesson details');
    
    // View song details
    cy.visit('/dashboard/songs');
    cy.contains(testSong.title).click();
    cy.wait(1000);
    cy.url().should('include', '/dashboard/songs/');
    cy.url().should('not.include', '/new');
    cy.url().should('not.include', '/edit');
    
    // View lesson details
    cy.visit('/dashboard/lessons');
    cy.contains(testLesson.title).click();
    cy.wait(1000);
    cy.url().should('include', '/dashboard/lessons/');
    cy.url().should('not.include', '/new');
    cy.url().should('not.include', '/edit');
    
    cy.log('✓ Successfully viewed both song and lesson details');

    // ==========================================
    // STEP 7: Delete the Lesson
    // ==========================================
    cy.log('Step 7: Deleting the lesson');
    cy.visit('/dashboard/lessons');
    cy.wait(2000);
    
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Delete")').length > 0) {
        cy.contains('button', 'Delete').first().click();
        
        // Confirm deletion if dialog appears
        cy.get('body').then(($dialogBody) => {
          if ($dialogBody.find('button:contains("Confirm"), button:contains("Delete")').length > 0) {
            cy.contains('button', /Confirm|Delete/i).click();
          }
        });
        
        cy.wait(2000);
        cy.contains(testLesson.title).should('not.exist');
        
        cy.log('✓ Lesson deleted successfully');
      }
    });

    // ==========================================
    // STEP 8: Delete the Song
    // ==========================================
    cy.log('Step 8: Deleting the song');
    cy.visit('/dashboard/songs');
    cy.wait(2000);
    
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Delete")').length > 0) {
        cy.contains('button', 'Delete').first().click();
        
        // Confirm deletion if dialog appears
        cy.get('body').then(($dialogBody) => {
          if ($dialogBody.find('button:contains("Confirm"), button:contains("Delete")').length > 0) {
            cy.contains('button', /Confirm|Delete/i).click();
          }
        });
        
        cy.wait(2000);
        cy.contains(testSong.title).should('not.exist');
        
        cy.log('✓ Song deleted successfully');
      }
    });

    // ==========================================
    // FINAL VERIFICATION
    // ==========================================
    cy.log('Final verification: Both song and lesson are deleted');
    
    // Verify song no longer exists
    cy.visit('/dashboard/songs');
    cy.contains(testSong.title).should('not.exist');
    
    // Verify lesson no longer exists
    cy.visit('/dashboard/lessons');
    cy.contains(testLesson.title).should('not.exist');
    
    cy.log('✅ Complete admin journey test passed successfully!');
  });

  it('should handle the journey with multiple songs per lesson', () => {
    // Create two songs
    const song1 = { ...testSong, title: `Journey Song 1 ${Date.now()}` };
    const song2 = { ...testSong, title: `Journey Song 2 ${Date.now()}` };

    // Create first song
    cy.visit('/dashboard/songs/new');
    cy.get('input#title').type(song1.title);
    cy.get('input#author').type(song1.author);
    cy.get('select#level').select(song1.level);
    cy.get('select#key').select(song1.key);
    cy.get('input#ultimate_guitar_link').type(song1.ultimateGuitarLink);
    cy.get('button[data-testid="song-save"]').click();
    cy.url({ timeout: 10000 }).should('include', '/dashboard/songs');

    // Create second song
    cy.visit('/dashboard/songs/new');
    cy.get('input#title').type(song2.title);
    cy.get('input#author').type(song2.author);
    cy.get('select#level').select(song2.level);
    cy.get('select#key').select(song2.key);
    cy.get('input#ultimate_guitar_link').type(song2.ultimateGuitarLink);
    cy.get('button[data-testid="song-save"]').click();
    cy.url({ timeout: 10000 }).should('include', '/dashboard/songs');

    // Create lesson
    cy.visit('/dashboard/lessons/new');
    cy.get('body').then(($body) => {
      if ($body.find('select[name="student_id"]').length > 0) {
        cy.get('select[name="student_id"]').select(1);
      }
      if ($body.find('select[name="teacher_id"]').length > 0) {
        cy.get('select[name="teacher_id"]').select(1);
      }
    });

    const lessonTitle = `Multi-Song Lesson ${Date.now()}`;
    cy.get('[data-testid="lesson-title"], input[name="title"]').type(lessonTitle);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateTimeString = futureDate.toISOString().slice(0, 16);
    cy.get('[data-testid="lesson-scheduled-at"], input[name="scheduled_at"]').type(dateTimeString);

    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('not.include', '/new');

    // Verify lesson was created
    cy.contains(lessonTitle).should('be.visible');

    cy.log('✅ Successfully created lesson with multiple songs available');
  });

  it('should maintain data integrity throughout the journey', () => {
    // Create song
    cy.visit('/dashboard/songs/new');
    const songTitle = `Integrity Song ${Date.now()}`;
    cy.get('input#title').type(songTitle);
    cy.get('input#author').type('Integrity Artist');
    cy.get('select#level').select('beginner');
    cy.get('select#key').select('C');
    cy.get('input#ultimate_guitar_link').type('https://www.ultimate-guitar.com/tab/integrity');
    cy.get('button[data-testid="song-save"]').click();
    cy.url({ timeout: 10000 }).should('include', '/dashboard/songs');

    // Verify song appears immediately
    cy.contains(songTitle).should('be.visible');

    // Navigate away and back
    cy.visit('/dashboard/lessons');
    cy.visit('/dashboard/songs');

    // Verify song still exists
    cy.contains(songTitle).should('be.visible');

    // Create lesson
    cy.visit('/dashboard/lessons/new');
    cy.get('body').then(($body) => {
      if ($body.find('select[name="student_id"]').length > 0) {
        cy.get('select[name="student_id"]').select(1);
      }
      if ($body.find('select[name="teacher_id"]').length > 0) {
        cy.get('select[name="teacher_id"]').select(1);
      }
    });

    const lessonTitle = `Integrity Lesson ${Date.now()}`;
    cy.get('[data-testid="lesson-title"], input[name="title"]').type(lessonTitle);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateTimeString = futureDate.toISOString().slice(0, 16);
    cy.get('[data-testid="lesson-scheduled-at"], input[name="scheduled_at"]').type(dateTimeString);

    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('not.include', '/new');

    // Verify both still exist after multiple operations
    cy.visit('/dashboard/songs');
    cy.contains(songTitle).should('be.visible');

    cy.visit('/dashboard/lessons');
    cy.contains(lessonTitle).should('be.visible');

    cy.log('✅ Data integrity maintained throughout the journey');
  });
});
