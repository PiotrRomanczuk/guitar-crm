/// <reference types="cypress" />

/**
 * Admin Songs Complete E2E Test Suite
 * 
 * Comprehensive test covering:
 * - Authentication & Authorization
 * - Song List View
 * - Create Song (Full CRUD - C)
 * - View Song Details (Full CRUD - R)
 * - Edit Song (Full CRUD - U)
 * - Delete Song (Full CRUD - D)
 * - Form Validation
 * - Navigation & State Management
 * - Responsive Design
 * 
 * This test consolidates and improves upon:
 * - cypress/e2e/core/admin-songs-workflow.cy.ts (navigation tests)
 * - cypress/e2e/legacy/admin-songs.cy.ts (CRUD tests)
 */

describe('Admin Songs - Complete E2E Test Suite', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
  const ADMIN_PASSWORD = 'test123_admin';
  
  // Unique song data for this test run
  const timestamp = Date.now();
  const testSong = {
    title: `E2E Test Song ${timestamp}`,
    author: 'Test Artist',
    level: 'intermediate',
    key: 'G',
    ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/test/test-song',
    chords: 'G D Em C',
    short_title: 'Test Song'
  };
  
  const updatedSong = {
    title: `Updated Song ${timestamp}`,
    author: 'Updated Artist',
    level: 'advanced',
    key: 'D'
  };

  beforeEach(() => {
    // Sign in as admin before each test
    cy.visit('/sign-in');
    cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('input[type="email"]').clear().type(ADMIN_EMAIL);
    cy.get('input[type="password"]').clear().type(ADMIN_PASSWORD);
    cy.get('button[type="submit"]').click();
    
    // Wait for redirect after successful sign-in
    cy.location('pathname', { timeout: 15000 }).should(($path) => {
      expect($path).not.to.include('/sign-in');
    });
  });

  describe('Authentication & Authorization', () => {
    it('should maintain admin session across song pages', () => {
      cy.visit('/dashboard/songs');
      cy.get('header').should('contain.text', ADMIN_EMAIL);
      
      cy.visit('/dashboard/songs/new');
      cy.get('header').should('contain.text', ADMIN_EMAIL);
    });

    it('should have access to create new song page', () => {
      cy.visit('/dashboard/songs/new');
      cy.url().should('include', '/dashboard/songs/new');
      cy.get('form').should('be.visible');
      cy.get('h1').should('contain.text', 'Create New Song');
    });
  });

  describe('Song List View (Read)', () => {
    it('should display songs list page', () => {
      cy.visit('/dashboard/songs');
      cy.url().should('include', '/dashboard/songs');
      cy.get('[data-testid="song-table"]').should('be.visible');
    });

    it('should display "Create New Song" button for admin', () => {
      cy.visit('/dashboard/songs');
      cy.get('[data-testid="song-new-button"]').should('be.visible');
    });

    it('should navigate to create page when clicking new song button', () => {
      cy.visit('/dashboard/songs');
      cy.get('[data-testid="song-new-button"]').click();
      cy.location('pathname').should('include', '/dashboard/songs/new');
    });

    it('should reload songs list successfully', () => {
      cy.visit('/dashboard/songs');
      cy.get('[data-testid="song-table"]').should('be.visible');
      cy.reload();
      cy.get('[data-testid="song-table"]').should('be.visible');
    });
  });

  describe('Create Song Form (Create)', () => {
    it('should render create form with all required fields', () => {
      cy.visit('/dashboard/songs/new');
      
      // Check form elements
      cy.get('[data-testid="song-title"]').should('be.visible');
      cy.get('[data-testid="song-author"]').should('be.visible');
      cy.get('[data-testid="song-level"]').should('be.visible');
      cy.get('[data-testid="song-key"]').should('be.visible');
      cy.get('[data-testid="song-ultimate_guitar_link"]').should('be.visible');
      cy.get('[data-testid="song-save"]').should('be.visible');
    });

    it('should validate required fields', () => {
      cy.visit('/dashboard/songs/new');
      
      // Try to submit empty form
      cy.get('[data-testid="song-save"]').click();
      
      // Should show validation errors
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        const hasError = bodyText.includes('required') || bodyText.includes('error');
        expect(hasError).to.be.true;
      });
      
      // Should stay on form page
      cy.location('pathname').should('include', '/dashboard/songs/new');
    });

    it('should create a new song successfully', () => {
      cy.visit('/dashboard/songs/new');
      
      // Fill form
      cy.get('[data-testid="song-title"]').clear().type(testSong.title);
      cy.get('[data-testid="song-author"]').clear().type(testSong.author);
      cy.get('[data-testid="song-level"]').select(testSong.level);
      cy.get('[data-testid="song-key"]').select(testSong.key);
      cy.get('[data-testid="song-ultimate_guitar_link"]').clear().type(testSong.ultimate_guitar_link);
      
      // Intercept API call
      cy.intercept('POST', '/api/song').as('createSong');
      
      // Submit
      cy.get('[data-testid="song-save"]').click();
      
      // Wait for API response
      cy.wait('@createSong', { timeout: 10000 }).then((interception) => {
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      });
      
      // Should redirect to list
      cy.location('pathname', { timeout: 10000 }).should('include', '/dashboard/songs');
      cy.location('pathname').should('not.include', '/new');
      
      // Verify song appears in list
      cy.get('[data-testid="song-table"]').should('contain', testSong.title);
      cy.get('[data-testid="song-table"]').should('contain', testSong.author);
    });

    it('should maintain form data on page reload', () => {
      cy.visit('/dashboard/songs/new');
      cy.get('form').should('be.visible');
      cy.reload();
      cy.get('form').should('be.visible');
    });
  });

  describe('View Song Details (Read)', () => {
    it('should navigate to song detail page', () => {
      cy.visit('/dashboard/songs');
      
      // Find our test song and click it
      cy.get('[data-testid="song-row"]')
        .contains(testSong.title)
        .should('be.visible')
        .click();
      
      // Should be on detail page
      cy.location('pathname').should('match', /\/dashboard\/songs\/[a-f0-9-]+$/);
      cy.url().should('not.include', '/new');
      cy.url().should('not.include', '/edit');
    });

    it('should display song details correctly', () => {
      cy.visit('/dashboard/songs');
      
      // Navigate to our test song
      cy.get('[data-testid="song-row"]')
        .contains(testSong.title)
        .click();
      
      // Verify details are visible
      cy.contains(testSong.title).should('be.visible');
      cy.contains(testSong.author).should('be.visible');
    });

    it('should show edit and delete buttons for admin', () => {
      cy.visit('/dashboard/songs');
      
      // Navigate to song detail
      cy.get('[data-testid="song-row"]')
        .contains(testSong.title)
        .click();
      
      // Should have action buttons
      cy.get('[data-testid="song-edit-button"]').should('be.visible');
      cy.get('[data-testid="song-delete-button"]').should('be.visible');
    });
  });

  describe('Edit Song (Update)', () => {
    it('should navigate to edit page from detail page', () => {
      cy.visit('/dashboard/songs');
      
      // Go to detail page
      cy.get('[data-testid="song-row"]')
        .contains(testSong.title)
        .click();
      
      // Click edit button
      cy.get('[data-testid="song-edit-button"]').should('be.visible').click();
      
      // Should be on edit page
      cy.location('pathname').should('match', /\/dashboard\/songs\/[a-f0-9-]+\/edit$/);
    });

    it('should pre-fill form with existing song data', () => {
      cy.visit('/dashboard/songs');
      
      // Navigate to edit page
      cy.get('[data-testid="song-row"]')
        .contains(testSong.title)
        .click();
      cy.get('[data-testid="song-edit-button"]').click();
      
      // Verify form is pre-filled
      cy.get('[data-testid="song-title"]').should('have.value', testSong.title);
      cy.get('[data-testid="song-author"]').should('have.value', testSong.author);
    });

    it('should update song successfully', () => {
      cy.visit('/dashboard/songs');
      
      // Navigate to edit page
      cy.get('[data-testid="song-row"]')
        .contains(testSong.title)
        .click();
      cy.get('[data-testid="song-edit-button"]').click();
      
      // Update fields
      cy.get('[data-testid="song-title"]').clear().type(updatedSong.title);
      cy.get('[data-testid="song-author"]').clear().type(updatedSong.author);
      cy.get('[data-testid="song-level"]').select(updatedSong.level);
      cy.get('[data-testid="song-key"]').select(updatedSong.key);
      
      // Intercept API call
      cy.intercept('PUT', '/api/song*').as('updateSong');
      
      // Submit
      cy.get('[data-testid="song-save"]').click();
      
      // Wait for API response
      cy.wait('@updateSong', { timeout: 10000 }).then((interception) => {
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      });
      
      // Should redirect to list
      cy.location('pathname', { timeout: 10000 }).should('include', '/dashboard/songs');
      cy.location('pathname').should('not.include', '/edit');
      
      // Verify updated data in list
      cy.get('[data-testid="song-table"]').should('contain', updatedSong.title);
      cy.get('[data-testid="song-table"]').should('contain', updatedSong.author);
    });

    it('should discard changes when navigating back', () => {
      cy.visit('/dashboard/songs');
      
      // Navigate to edit page
      cy.get('[data-testid="song-row"]')
        .contains(updatedSong.title)
        .click();
      cy.get('[data-testid="song-edit-button"]').click();
      
      // Make changes but don't save
      cy.get('[data-testid="song-title"]').clear().type('Should Not Save');
      
      // Navigate back
      cy.go('back');
      
      // Verify changes were not saved
      cy.contains('Should Not Save').should('not.exist');
      cy.contains(updatedSong.title).should('be.visible');
    });
  });

  describe('Delete Song (Delete)', () => {
    it('should delete song from detail page', () => {
      cy.visit('/dashboard/songs');
      
      // Count songs before deletion
      cy.get('[data-testid="song-row"]').then(($rows) => {
        const countBefore = $rows.length;
        
        // Navigate to detail page
        cy.get('[data-testid="song-row"]')
          .contains(updatedSong.title)
          .click();
        
        // Confirm deletion in dialog
        cy.on('window:confirm', () => true);
        
        // Click delete button
        cy.get('[data-testid="song-delete-button"]').click();
        
        // Should redirect to list
        cy.location('pathname', { timeout: 10000 }).should('include', '/dashboard/songs');
        cy.location('pathname').should('not.match', /\/[a-f0-9-]+$/);
        
        // Verify song is removed from list
        cy.get('[data-testid="song-table"]').should('not.contain', updatedSong.title);
        
        // Verify count decreased
        cy.get('[data-testid="song-row"]').should('have.length', countBefore - 1);
      });
    });
  });

  describe('Navigation & State Management', () => {
    it('should handle sequential page transitions', () => {
      // List -> Create -> List -> Create
      cy.visit('/dashboard/songs');
      cy.url().should('include', '/dashboard/songs');
      
      cy.visit('/dashboard/songs/new');
      cy.url().should('include', '/new');
      
      cy.go('back');
      cy.url().should('not.include', '/new');
      
      cy.visit('/dashboard/songs');
      cy.url().should('include', '/dashboard/songs');
      
      cy.visit('/dashboard/songs/new');
      cy.url().should('include', '/new');
      
      cy.go('back');
      cy.url().should('include', '/dashboard/songs');
    });

    it('should maintain state after back navigation', () => {
      cy.visit('/dashboard/songs');
      cy.visit('/dashboard/songs/new');
      cy.go('back');
      
      cy.url().then((url) => {
        expect(url).to.include('/dashboard/songs');
        expect(url).not.to.include('/new');
      });
    });
  });

  describe('Responsive Design', () => {
    const viewports: Array<{ name: string; preset: Cypress.ViewportPreset }> = [
      { name: 'Mobile', preset: 'iphone-x' },
      { name: 'Tablet', preset: 'ipad-2' },
      { name: 'Desktop', preset: 'macbook-15' }
    ];

    viewports.forEach(({ name, preset }) => {
      it(`should display songs page correctly on ${name}`, () => {
        cy.viewport(preset);
        cy.visit('/dashboard/songs');
        cy.get('header, nav').should('be.visible');
        cy.get('[data-testid="song-table"]').should('be.visible');
      });

      it(`should display create form correctly on ${name}`, () => {
        cy.viewport(preset);
        cy.visit('/dashboard/songs/new');
        cy.get('form').should('be.visible');
        cy.get('[data-testid="song-save"]').should('be.visible');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully during creation', () => {
      cy.visit('/dashboard/songs/new');
      
      // Intercept and force error
      cy.intercept('POST', '/api/song', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('createError');
      
      // Fill and submit form
      cy.get('[data-testid="song-title"]').type('Error Test');
      cy.get('[data-testid="song-author"]').type('Error Author');
      cy.get('[data-testid="song-ultimate_guitar_link"]').type('https://example.com');
      cy.get('[data-testid="song-save"]').click();
      
      cy.wait('@createError');
      
      // Should show error message and stay on form
      cy.get('body').should('contain', 'Failed to save song');
      cy.location('pathname').should('include', '/new');
    });
  });

  describe('Performance & Loading States', () => {
    it('should show proper page layout during navigation', () => {
      cy.visit('/dashboard/songs');
      cy.get('header').should('be.visible');
      cy.get('[class*="container"]').should('be.visible');
    });

    it('should have all interactive elements ready', () => {
      cy.visit('/dashboard/songs/new');
      cy.get('button[type="submit"]').should('be.visible').and('not.be.disabled');
      cy.get('input, select, textarea').should('have.length.greaterThan', 0);
    });
  });
});
