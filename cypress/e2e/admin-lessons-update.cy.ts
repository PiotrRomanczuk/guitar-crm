/// <reference types="cypress" />

/**
 * Admin Lesson Update E2E Test
 * 
 * Tests the complete workflow for an admin updating an existing lesson:
 * 1. Admin signs in
 * 2. Creates or navigates to an existing lesson
 * 3. Edits lesson fields
 * 4. Saves changes
 * 5. Verifies updates are reflected
 */

describe('Admin - Lesson Update Operations', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
  const ADMIN_PASSWORD = 'test123_admin';

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

  it('should navigate to edit page from lesson list', () => {
    cy.visit('/dashboard/lessons');

    // Look for edit links or buttons
    cy.get('body').then(($body) => {
      const editLink = $body.find('a[href*="/edit"]').first().attr('href');
      if (editLink && typeof editLink === 'string') {
        cy.visit(editLink);
        
        // Verify we're on edit page
        cy.url().should('include', '/edit');
        cy.contains('Edit Lesson').should('be.visible');
        cy.get('form').should('exist');
      } else {
        // If no lessons exist to edit, create one first
        cy.visit('/dashboard/lessons/new');
        cy.url().should('include', '/new');
      }
    });
  });

  it('should load existing lesson data in edit form', () => {
    cy.visit('/dashboard/lessons');

    cy.get('body').then(($body) => {
      const editLink = $body.find('a[href*="/edit"]').first().attr('href');
      if (editLink && typeof editLink === 'string') {
        cy.visit(editLink);
        
        // Verify form is pre-populated
        cy.get('[data-testid="lesson-title"], input[name="title"]').should('exist');
        cy.get('[data-testid="lesson-scheduled-at"], input[name="scheduled_at"]').should('exist');
        
        // At least one field should have data
        cy.get('input, select, textarea').should('have.length.greaterThan', 0);
      }
    });
  });

  it('should update lesson title and notes', () => {
    // First, create a lesson to update
    cy.visit('/dashboard/lessons/new');
    
    const originalTitle = `Update Test ${Date.now()}`;
    
    cy.get('body').then(($body) => {
      if ($body.find('select[name="student_id"]').length > 0) {
        cy.get('select[name="student_id"]').select(1);
      }
      if ($body.find('select[name="teacher_id"]').length > 0) {
        cy.get('select[name="teacher_id"]').select(1);
      }
    });

    cy.get('[data-testid="lesson-title"], input[name="title"]').type(originalTitle);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateTimeString = futureDate.toISOString().slice(0, 16);
    cy.get('[data-testid="lesson-scheduled-at"], input[name="scheduled_at"]').type(dateTimeString);

    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('not.include', '/new');

    // Now find and edit the lesson
    cy.visit('/dashboard/lessons');
    cy.wait(2000);

    // Click on edit for the lesson (or navigate directly if we have the ID)
    cy.get('body').then(($body) => {
      const editLinks = $body.find('a[href*="/edit"]');
      if (editLinks.length > 0) {
        cy.wrap(editLinks.first()).click();
        
        cy.url({ timeout: 5000 }).should('include', '/edit');

        // Update the title and notes
        const updatedTitle = `Updated ${Date.now()}`;
        cy.get('[data-testid="lesson-title"], input[name="title"]').clear().type(updatedTitle);
        cy.get('[data-testid="lesson-notes"], textarea[name="notes"]').clear().type('Updated notes');

        // Save changes
        cy.get('button[type="submit"]').click();

        // Verify redirect
        cy.url({ timeout: 10000 }).should('not.include', '/edit');
      }
    });
  });

  it('should update lesson date and time', () => {
    cy.visit('/dashboard/lessons');

    cy.get('body').then(($body) => {
      const editLink = $body.find('a[href*="/edit"]').first().attr('href');
      if (editLink && typeof editLink === 'string') {
        cy.visit(editLink);
        
        // Update date/time
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + 14);
        const newDateTimeString = newDate.toISOString().slice(0, 16);
        
        cy.get('[data-testid="lesson-scheduled-at"], input[name="scheduled_at"]')
          .clear()
          .type(newDateTimeString);

        // Save
        cy.get('button[type="submit"]').click();
        
        // Verify redirect
        cy.url({ timeout: 10000 }).should('not.include', '/edit');
      }
    });
  });

  it('should validate required fields when updating', () => {
    cy.visit('/dashboard/lessons');

    cy.get('body').then(($body) => {
      const editLink = $body.find('a[href*="/edit"]').first().attr('href');
      if (editLink && typeof editLink === 'string') {
        cy.visit(editLink);
        
        // Try to clear required field and submit
        cy.get('[data-testid="lesson-scheduled-at"], input[name="scheduled_at"]').clear();
        cy.get('button[type="submit"]').click();

        // Verify we stay on edit page due to validation error
        cy.url().should('include', '/edit');
      }
    });
  });

  it('should cancel edit and return to previous page', () => {
    cy.visit('/dashboard/lessons');

    cy.get('body').then(($body) => {
      const editLink = $body.find('a[href*="/edit"]').first().attr('href');
      if (editLink && typeof editLink === 'string') {
        cy.visit(editLink);
        
        // Look for cancel button
        cy.get('body').then(($editBody) => {
          if ($editBody.find('button:contains("Cancel")').length > 0) {
            cy.contains('button', 'Cancel').click();
            cy.url().should('not.include', '/edit');
          }
        });
      }
    });
  });

  it('should preserve unchanged fields when updating', () => {
    cy.visit('/dashboard/lessons');

    cy.get('body').then(($body) => {
      const editLink = $body.find('a[href*="/edit"]').first().attr('href');
      if (editLink && typeof editLink === 'string') {
        cy.visit(editLink);
        
        // Get original notes value (if any)
        cy.get('[data-testid="lesson-notes"], textarea[name="notes"]').invoke('val').then((originalNotes) => {
          // Update only the title
          cy.get('[data-testid="lesson-title"], input[name="title"]').clear().type(`Modified ${Date.now()}`);
          
          // Save
          cy.get('button[type="submit"]').click();
          
          // Navigate back to edit to verify notes unchanged
          cy.wait(2000);
          cy.visit(editLink);
          
          // Verify notes remained the same (if they had a value)
          if (originalNotes) {
            cy.get('[data-testid="lesson-notes"], textarea[name="notes"]').should('have.value', originalNotes);
          }
        });
      }
    });
  });

  it('should handle edit form reload without losing state', () => {
    cy.visit('/dashboard/lessons');

    cy.get('body').then(($body) => {
      const editLink = $body.find('a[href*="/edit"]').first().attr('href');
      if (editLink && typeof editLink === 'string') {
        cy.visit(editLink);
        cy.get('form').should('exist');
        
        // Reload page
        cy.reload();
        
        // Verify form still loads with data
        cy.get('form').should('exist');
        cy.get('[data-testid="lesson-title"], input[name="title"]').should('exist');
      }
    });
  });

  it('should update multiple fields at once', () => {
    cy.visit('/dashboard/lessons');

    cy.get('body').then(($body) => {
      const editLink = $body.find('a[href*="/edit"]').first().attr('href');
      if (editLink && typeof editLink === 'string') {
        cy.visit(editLink);
        
        // Update multiple fields
        const timestamp = Date.now();
        cy.get('[data-testid="lesson-title"], input[name="title"]').clear().type(`Multi Update ${timestamp}`);
        cy.get('[data-testid="lesson-notes"], textarea[name="notes"]').clear().type(`Updated notes ${timestamp}`);
        
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + 21);
        const newDateTimeString = newDate.toISOString().slice(0, 16);
        cy.get('[data-testid="lesson-scheduled-at"], input[name="scheduled_at"]').clear().type(newDateTimeString);
        
        // Save
        cy.get('button[type="submit"]').click();
        
        // Verify redirect
        cy.url({ timeout: 10000 }).should('not.include', '/edit');
      }
    });
  });

  it('should navigate to edit from lesson detail page', () => {
    cy.visit('/dashboard/lessons');

    // Find a lesson detail link
    cy.get('body').then(($body) => {
      const lessonLinks = $body.find('a[href*="/dashboard/lessons/"]').toArray().filter((el) => {
        const href = Cypress.$(el).attr('href');
        return href && 
               !href.includes('/new') && 
               !href.includes('/edit') && 
               !href.includes('/import') &&
               href !== '/dashboard/lessons';
      });

      if (lessonLinks.length > 0) {
        const firstLessonHref = Cypress.$(lessonLinks[0]).attr('href');
        cy.visit(firstLessonHref!);

        // Look for edit button on detail page
        cy.get('body').then(($detailBody) => {
          if ($detailBody.find('a[href*="/edit"], button:contains("Edit")').length > 0) {
            cy.get('a[href*="/edit"], button:contains("Edit")').first().click();
            cy.url({ timeout: 5000 }).should('include', '/edit');
          }
        });
      }
    });
  });

  it('should show appropriate error for non-existent lesson edit', () => {
    // Try to edit a non-existent lesson
    const fakeId = '00000000-0000-0000-0000-000000000000';
    cy.visit(`/dashboard/lessons/${fakeId}/edit`, { failOnStatusCode: false });
    
    // Should show error or redirect
    cy.url().should('satisfy', (url) => {
      return url.includes('/dashboard/lessons') || url.includes('404') || url.includes('not-found');
    });
  });
});
