/// <reference types="cypress" />

// Admin song delete cascade tests - TDD approach
// Tests for soft delete with cascade handling of related lesson assignments
// Flow: Sign in → Create song → Create lesson with song assignment → Attempt delete → Verify cascade behavior
// Routes:
// - Sign-in page: /sign-in
// - Songs list page: /dashboard/songs
// - Create song page: /dashboard/songs/new
// - Lessons list page: /dashboard/lessons
// - Create lesson page: /dashboard/lessons/new

describe('Admin Song Delete Cascade - TDD', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'test123_admin';

  const testSong = {
    title: `E2E Cascade Test Song ${Date.now()}`,
    author: 'Cascade QA',
    level: 'intermediate',
    key: 'C',
    ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/cascade-test-song',
  };

  const testStudent = {
    email: `student.cascade${Date.now()}@test.com`,
    firstName: 'Cascade',
    lastName: 'Student',
    isStudent: true,
    isTeacher: false,
    isAdmin: false,
  };

  let createdSongId: string;
  let createdStudentId: string;
  let createdLessonId: string;

  beforeEach(() => {
    // Clear any existing session
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should sign in as admin successfully', () => {
    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(adminEmail);
    cy.get('[data-testid="password"]').clear().type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();

    // Wait for redirect to dashboard
    cy.location('pathname', { timeout: 10000 }).should('not.include', '/sign-in');
    cy.location('pathname').should('eq', '/dashboard');
  });

  it('should create a test song for cascade testing', () => {
    // Sign in first
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(adminEmail);
    cy.get('[data-testid="password"]').type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('eq', '/dashboard');

    // Navigate to songs page
    cy.visit('/dashboard/songs');
    cy.location('pathname').should('include', '/dashboard/songs');

    // Count songs before creation
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="song-table"]').length > 0) {
        cy.get('[data-testid="song-row"]').then(($rows) => {
          cy.wrap($rows.length).as('initialSongCount');
        });
      } else {
        cy.wrap(0).as('initialSongCount');
      }
    });

    // Navigate to create song page
    cy.get('[data-testid="song-new-button"]').should('exist').click();
    cy.location('pathname').should('include', '/dashboard/songs/new');

    // Intercept the create API call
    cy.intercept('POST', '/api/song').as('createSong');

    // Fill and submit form
    cy.get('[data-testid="song-title"]').clear().type(testSong.title);
    cy.get('[data-testid="song-author"]').clear().type(testSong.author);
    cy.get('[data-testid="song-level"]').select(testSong.level);
    cy.get('[data-testid="song-key"]').select(testSong.key);
    cy.get('[data-testid="song-ultimate_guitar_link"]').clear().type(testSong.ultimate_guitar_link);
    cy.get('[data-testid="song-save"]').click();

    // Wait for successful API call and capture song ID
    cy.wait('@createSong').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      createdSongId = interception.response?.body.id;
      cy.wrap(createdSongId).as('createdSongId');
    });

    // Verify song appears in list
    cy.visit('/dashboard/songs');
    cy.get('[data-testid="song-row"]').contains(testSong.title).should('exist');
  });

  it('should create a test student for lesson assignment', () => {
    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(adminEmail);
    cy.get('[data-testid="password"]').type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('eq', '/dashboard');

    // Navigate to admin users page (assuming it exists)
    cy.visit('/admin/users');
    cy.location('pathname').should('include', '/admin/users');

    // Intercept user creation API call
    cy.intercept('POST', '/api/admin/users').as('createUser');

    // Fill user creation form
    cy.get('[data-testid="user-email"]').clear().type(testStudent.email);
    cy.get('[data-testid="user-firstName"]').clear().type(testStudent.firstName);
    cy.get('[data-testid="user-lastName"]').clear().type(testStudent.lastName);
    cy.get('[data-testid="user-isStudent"]').check();
    cy.get('[data-testid="user-create"]').click();

    // Wait for successful API call and capture user ID
    cy.wait('@createUser').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      createdStudentId = interception.response?.body.id;
      cy.wrap(createdStudentId).as('createdStudentId');
    });
  });

  it('should create a lesson with the test song assigned', () => {
    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(adminEmail);
    cy.get('[data-testid="password"]').type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('eq', '/dashboard');

    // Navigate to lessons page
    cy.visit('/dashboard/lessons');
    cy.location('pathname').should('include', '/dashboard/lessons');

    // Navigate to create lesson page
    cy.get('[data-testid="lesson-new-button"]').should('exist').click();
    cy.location('pathname').should('include', '/dashboard/lessons/new');

    // Intercept lesson creation API call
    cy.intercept('POST', '/api/lesson').as('createLesson');

    // Fill lesson form
    cy.get('[data-testid="lesson-title"]').clear().type(`Cascade Test Lesson ${Date.now()}`);
    cy.get('[data-testid="lesson-student"]').select(createdStudentId);
    cy.get('[data-testid="lesson-date"]').type('2025-12-01');
    cy.get('[data-testid="lesson-time"]').type('14:00');

    // Add song to lesson
    cy.get('[data-testid="lesson-add-song"]').click();
    cy.get('[data-testid="song-select"]').select(testSong.title);
    cy.get('[data-testid="song-status"]').select('to_learn');

    // Submit lesson
    cy.get('[data-testid="lesson-save"]').click();

    // Wait for successful API call and capture lesson ID
    cy.wait('@createLesson').then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      createdLessonId = interception.response?.body.id;
      cy.wrap(createdLessonId).as('createdLessonId');
    });
  });

  it('should show confirmation dialog when attempting to delete song with lesson assignments', () => {
    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(adminEmail);
    cy.get('[data-testid="password"]').type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('eq', '/dashboard');

    // Navigate to songs page
    cy.visit('/dashboard/songs');
    cy.location('pathname').should('include', '/dashboard/songs');

    // Find the test song row and click delete button
    cy.get('[data-testid="song-row"]').contains(testSong.title).parents('[data-testid="song-row"]').within(() => {
      cy.get('[data-testid="song-delete-button"]').click();
    });

    // Verify confirmation dialog appears
    cy.get('[data-testid="delete-confirmation-dialog"]').should('be.visible');
    cy.get('[data-testid="delete-confirmation-message"]').should('contain', 'This song is assigned to lessons');
    cy.get('[data-testid="delete-confirmation-message"]').should('contain', 'Deleting it will remove all related lesson assignments');

    // Verify confirmation options
    cy.get('[data-testid="delete-confirm-button"]').should('be.visible');
    cy.get('[data-testid="delete-cancel-button"]').should('be.visible');
  });

  it('should perform soft delete with cascade handling when confirmed', () => {
    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(adminEmail);
    cy.get('[data-testid="password"]').type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('eq', '/dashboard');

    // Navigate to songs page
    cy.visit('/dashboard/songs');
    cy.location('pathname').should('include', '/dashboard/songs');

    // Count songs before deletion
    cy.get('[data-testid="song-row"]').then(($rows) => {
      cy.wrap($rows.length).as('songsBeforeDelete');
    });

    // Find the test song row and click delete button
    cy.get('[data-testid="song-row"]').contains(testSong.title).parents('[data-testid="song-row"]').within(() => {
      cy.get('[data-testid="song-delete-button"]').click();
    });

    // Confirm deletion in dialog
    cy.get('[data-testid="delete-confirm-button"]').click();

    // Intercept delete API call
    cy.intercept('DELETE', `/api/song?id=${createdSongId}`).as('deleteSong');

    // Wait for delete API call
    cy.wait('@deleteSong').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });

    // Verify song is removed from the list (soft delete - should not appear in active list)
    cy.get('[data-testid="song-row"]').should('not.contain', testSong.title);

    // Verify song count decreased by 1
    cy.get('@songsBeforeDelete').then((countBefore) => {
      cy.get('[data-testid="song-row"]').should('have.length', Number(countBefore) - 1);
    });
  });

  it('should handle lesson_songs cascade deletion properly', () => {
    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(adminEmail);
    cy.get('[data-testid="password"]').type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('eq', '/dashboard');

    // Navigate to the lesson we created
    cy.visit(`/dashboard/lessons/${createdLessonId}`);
    cy.location('pathname').should('include', `/dashboard/lessons/${createdLessonId}`);

    // Verify the song assignment is no longer present (should be cascade deleted)
    cy.get('[data-testid="lesson-song-assignment"]').should('not.exist');

    // Or verify empty state message
    cy.get('[data-testid="lesson-no-songs"]').should('be.visible');
    cy.get('[data-testid="lesson-no-songs"]').should('contain', 'No songs assigned to this lesson');
  });

  it('should handle user_favorites cascade deletion properly', () => {
    // This test assumes we have a way to check favorites
    // If the student had favorited the song, it should be removed

    // Sign in as the test student
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(testStudent.email);
    cy.get('[data-testid="password"]').clear().type('defaultpassword'); // Assuming default password
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('eq', '/dashboard');

    // Navigate to favorites/songs page
    cy.visit('/dashboard/songs?favorites=true');
    cy.location('pathname').should('include', '/dashboard/songs');

    // Verify the deleted song is not in favorites (should be cascade deleted)
    cy.get('[data-testid="song-row"]').should('not.contain', testSong.title);
  });

  it('should prevent deletion of songs with active lesson assignments', () => {
    // Create another song and lesson, but don't complete the lesson
    // Then try to delete and verify it's blocked

    const activeSong = {
      title: `Active Lesson Song ${Date.now()}`,
      author: 'Active QA',
      level: 'beginner',
      key: 'G',
      ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/active-test-song',
    };

    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type(adminEmail);
    cy.get('[data-testid="password"]').type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('eq', '/dashboard');

    // Create active song
    cy.visit('/dashboard/songs/new');
    cy.intercept('POST', '/api/song').as('createActiveSong');
    cy.get('[data-testid="song-title"]').clear().type(activeSong.title);
    cy.get('[data-testid="song-author"]').clear().type(activeSong.author);
    cy.get('[data-testid="song-level"]').select(activeSong.level);
    cy.get('[data-testid="song-key"]').select(activeSong.key);
    cy.get('[data-testid="song-ultimate_guitar_link"]').clear().type(activeSong.ultimate_guitar_link);
    cy.get('[data-testid="song-save"]').click();

    cy.wait('@createActiveSong').then((interception) => {
      const activeSongId = interception.response?.body.id;

      // Create lesson with IN_PROGRESS status
      cy.visit('/dashboard/lessons/new');
      cy.intercept('POST', '/api/lesson').as('createActiveLesson');
      cy.get('[data-testid="lesson-title"]').clear().type(`Active Lesson ${Date.now()}`);
      cy.get('[data-testid="lesson-student"]').select(createdStudentId);
      cy.get('[data-testid="lesson-date"]').type('2025-12-01');
      cy.get('[data-testid="lesson-time"]').type('15:00');
      cy.get('[data-testid="lesson-status"]').select('IN_PROGRESS');

      // Add song to lesson
      cy.get('[data-testid="lesson-add-song"]').click();
      cy.get('[data-testid="song-select"]').select(activeSong.title);
      cy.get('[data-testid="song-status"]').select('started');

      cy.get('[data-testid="lesson-save"]').click();

      cy.wait('@createActiveLesson').then(() => {
        // Now try to delete the song
        cy.visit('/dashboard/songs');
        cy.get('[data-testid="song-row"]').contains(activeSong.title).parents('[data-testid="song-row"]').within(() => {
          cy.get('[data-testid="song-delete-button"]').click();
        });

        // Should show error message about active assignments
        cy.get('[data-testid="delete-error-dialog"]').should('be.visible');
        cy.get('[data-testid="delete-error-message"]').should('contain', 'Cannot delete song with active lesson assignments');
        cy.get('[data-testid="delete-error-message"]').should('contain', 'Complete or cancel the lesson first');

        // Verify song still exists
        cy.get('[data-testid="song-row"]').should('contain', activeSong.title);
      });
    });
  });
});