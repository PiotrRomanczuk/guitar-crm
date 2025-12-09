/// <reference types="cypress" />

describe('Song Detail View', () => {
  const TEACHER_EMAIL = 'teacher@example.com';
  const TEACHER_PASSWORD = 'test123_teacher';
  const SONG_TITLE = `Detail Song ${Date.now()}`;

  beforeEach(() => {
    // Login
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(TEACHER_EMAIL);
    cy.get('[data-testid="password"]').clear().type(TEACHER_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('include', '/dashboard');
  });

  it('should display song details and related sections', () => {
    // 1. Create a new song
    cy.visit('/dashboard/songs/new');
    cy.get('[data-testid="title-input"]').type(SONG_TITLE);
    cy.get('[data-testid="artist-input"]').type('Test Artist');
    cy.get('[data-testid="submit-button"]').click();

    // 2. Verify list and click
    cy.location('pathname').should('eq', '/dashboard/songs');
    cy.contains(SONG_TITLE).click();

    // 3. Verify Detail Page
    cy.location('pathname').should('match', /\/dashboard\/songs\/[a-f0-9-]+/);
    cy.get('h1').should('contain', SONG_TITLE);
    cy.contains('Test Artist').should('be.visible');

    // 4. Verify Sections
    // "Active Students" might be hidden if empty, but let's check if the code renders it for teachers
    // The code says: {canViewStudents && ( ... <SongStudents ... /> )}
    // And SongStudents says: if (students.length === 0) return ... "No students..."
    // So it should be visible.
    cy.contains('Active Students').should('be.visible');
    cy.contains('No students have this song').should('be.visible');

    // "Related Assignments"
    // SongAssignments says: if (assignments.length === 0) return null;
    // So it should NOT be visible initially.
    cy.contains('Related Assignments').should('not.exist');

    // 5. Verify SearchParams handling
    cy.location('href').then((url) => {
      cy.visit(`${url}?filter=active`);
      cy.get('h1').should('contain', SONG_TITLE);
    });
  });
});
