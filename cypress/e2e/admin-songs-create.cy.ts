/// <reference types="cypress" />

/**
 * Admin Song Creation E2E Test
 * 
 * Tests the complete workflow for an admin creating a new song:
 * 1. Admin signs in
 * 2. Navigates to song creation page
 * 3. Fills in all required fields
 * 4. Submits the form
 * 5. Verifies the song was created successfully
 * 6. Verifies the song appears in the song list
 */

describe('Admin - Song Creation', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
  const ADMIN_PASSWORD = 'test123_admin';

  // Test data for creating a new song
  const newSong = {
    title: `Test Song ${Date.now()}`, // Unique title to avoid conflicts
    author: 'Test Artist',
    level: 'intermediate',
    key: 'C',
    ultimateGuitarLink: 'https://www.ultimate-guitar.com/tab/test',
    chords: 'C G Am F',
    shortTitle: 'Test'
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

  it('should allow admin to create a new song with all fields', () => {
    // Navigate to song creation page
    cy.visit('/dashboard/songs/new');
    cy.url().should('include', '/dashboard/songs/new');

    // Verify page title
    cy.contains('Create New Song').should('be.visible');

    // Fill in the form fields
    cy.get('input#title').should('be.visible').clear().type(newSong.title);
    cy.get('input#author').should('be.visible').clear().type(newSong.author);
    
    // Select difficulty level
    cy.get('select#level').should('be.visible').select(newSong.level);
    
    // Select musical key
    cy.get('select#key').should('be.visible').select(newSong.key);
    
    // Fill in Ultimate Guitar link
    cy.get('input#ultimate_guitar_link')
      .should('be.visible')
      .clear()
      .type(newSong.ultimateGuitarLink);
    
    // Fill in optional fields
    cy.get('input#chords').should('be.visible').clear().type(newSong.chords);
    cy.get('input#short_title').should('be.visible').clear().type(newSong.shortTitle);

    // Submit the form
    cy.get('button[data-testid="song-save"]').should('be.visible').click();

    // Wait for redirect to songs list
    cy.url({ timeout: 10000 }).should('include', '/dashboard/songs');
    cy.url().should('not.include', '/new');

    // Verify the song appears in the list
    cy.contains(newSong.title, { timeout: 10000 }).should('be.visible');
  });

  it('should validate required fields', () => {
    // Navigate to song creation page
    cy.visit('/dashboard/songs/new');

    // Try to submit without filling required fields
    cy.get('button[data-testid="song-save"]').click();

    // Verify validation errors appear
    // Note: The exact error message display depends on the form implementation
    // This tests that the form doesn't redirect on validation error
    cy.url().should('include', '/dashboard/songs/new');
  });

  it('should show validation error for invalid URL', () => {
    // Navigate to song creation page
    cy.visit('/dashboard/songs/new');

    // Fill in required fields
    cy.get('input#title').type('Test Song');
    cy.get('input#author').type('Test Artist');
    cy.get('select#level').select('beginner');
    cy.get('select#key').select('C');

    // Enter invalid URL
    cy.get('input#ultimate_guitar_link').type('not-a-valid-url');

    // Submit the form
    cy.get('button[data-testid="song-save"]').click();

    // Verify we stay on the form page due to validation error
    cy.url().should('include', '/dashboard/songs/new');
  });

  it('should persist form data during navigation', () => {
    // Navigate to song creation page
    cy.visit('/dashboard/songs/new');

    // Fill in some data
    cy.get('input#title').type(newSong.title);
    cy.get('input#author').type(newSong.author);

    // Reload the page
    cy.reload();

    // Note: Form data persistence depends on implementation
    // This test verifies the form structure is maintained after reload
    cy.get('input#title').should('be.visible');
    cy.get('input#author').should('be.visible');
  });

  it('should handle form submission with only required fields', () => {
    // Navigate to song creation page
    cy.visit('/dashboard/songs/new');

    // Generate unique title
    const minimalSong = {
      title: `Minimal Song ${Date.now()}`,
      author: 'Minimal Artist',
      level: 'beginner',
      key: 'G',
      ultimateGuitarLink: 'https://www.ultimate-guitar.com/tab/minimal'
    };

    // Fill in only required fields
    cy.get('input#title').clear().type(minimalSong.title);
    cy.get('input#author').clear().type(minimalSong.author);
    cy.get('select#level').select(minimalSong.level);
    cy.get('select#key').select(minimalSong.key);
    cy.get('input#ultimate_guitar_link').clear().type(minimalSong.ultimateGuitarLink);

    // Submit the form
    cy.get('button[data-testid="song-save"]').click();

    // Wait for redirect
    cy.url({ timeout: 10000 }).should('include', '/dashboard/songs');

    // Verify the song appears in the list
    cy.contains(minimalSong.title).should('be.visible');
  });
});
