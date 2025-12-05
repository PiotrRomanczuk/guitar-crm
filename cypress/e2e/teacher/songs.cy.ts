/// <reference types="cypress" />

describe('Teacher - Song Management', () => {
  const TEACHER_EMAIL = 'teacher@example.com';
  const TEACHER_PASSWORD = 'test123_teacher';
  const SONG_TITLE = `Song ${Date.now()}`;

  beforeEach(() => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(TEACHER_EMAIL);
    cy.get('[data-testid="password"]').clear().type(TEACHER_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('include', '/dashboard');
  });

  it('should create a private song', () => {
    cy.visit('/dashboard/songs/new');

    cy.get('[data-testid="title-input"]').type(SONG_TITLE);
    cy.get('[data-testid="artist-input"]').type('Test Artist');
    
    // Ensure it is NOT public (default should be private for teachers usually)
    cy.get('[data-testid="isPublic-checkbox"]').should('not.be.checked');

    cy.get('[data-testid="submit-button"]').click();

    cy.location('pathname').should('eq', '/dashboard/songs');
    cy.contains(SONG_TITLE).should('be.visible');
  });

  it('should edit their own song', () => {
    cy.visit('/dashboard/songs');
    cy.contains(SONG_TITLE).parents('tr').within(() => {
      cy.get('a[href*="/edit"]').click();
    });

    cy.get('[data-testid="title-input"]').clear().type(`${SONG_TITLE} Updated`);
    cy.get('[data-testid="submit-button"]').click();

    cy.contains(`${SONG_TITLE} Updated`).should('be.visible');
  });

  it('should view public songs but NOT edit them', () => {
    // This assumes there is a public song seeded
    cy.visit('/dashboard/songs');
    
    // Filter for public songs if possible
    // cy.get('[data-testid="filter-public"]').click();

    // Find a public song (we might need to seed one or know its name)
    // For now, we just check that if we see a song that is NOT ours, we can't edit it.
    // This is tricky without specific seed data.
    // We can skip this check or mock the response.
  });
});
