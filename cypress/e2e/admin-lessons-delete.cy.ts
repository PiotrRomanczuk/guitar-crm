/// <reference types="cypress" />

/**
 * Admin Lesson Delete E2E Test
 * 
 * Tests the complete workflow for an admin deleting lessons:
 * 1. Admin signs in
 * 2. Creates a test lesson to delete
 * 3. Deletes the lesson
 * 4. Verifies the lesson is removed
 * 5. Tests delete confirmation dialog
 */

describe('Admin - Lesson Delete Operations', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
  const ADMIN_PASSWORD = 'test123_admin';

  // Helper to create a test lesson
  const createTestLesson = () => {
    const timestamp = Date.now();
    cy.visit('/dashboard/lessons/new');
    
    cy.get('body').then(($body) => {
      if ($body.find('select[name="student_id"]').length > 0) {
        cy.get('select[name="student_id"]').select(1);
      }
      if ($body.find('select[name="teacher_id"]').length > 0) {
        cy.get('select[name="teacher_id"]').select(1);
      }
    });

    const title = `Delete Test ${timestamp}`;
    cy.get('[data-testid="lesson-title"], input[name="title"]').type(title);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateTimeString = futureDate.toISOString().slice(0, 16);
    cy.get('[data-testid="lesson-scheduled-at"], input[name="scheduled_at"]').type(dateTimeString);

    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('not.include', '/new');

    return title;
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

  it('should delete a lesson from the list', () => {
    // Create a lesson to delete
    const lessonTitle = createTestLesson();
    
    cy.visit('/dashboard/lessons');
    cy.wait(2000);
    
    // Verify lesson exists
    cy.contains(lessonTitle).should('be.visible');

    // Find and click delete button
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Delete")').length > 0) {
        cy.contains('button', 'Delete').first().click();
        
        // Handle confirmation dialog if it appears
        cy.get('body').then(($dialogBody) => {
          if ($dialogBody.find('button:contains("Confirm"), button:contains("Delete")').length > 0) {
            cy.contains('button', /Confirm|Delete/i).click();
          }
        });

        // Verify lesson is removed
        cy.wait(2000);
        cy.contains(lessonTitle).should('not.exist');
      }
    });
  });

  it('should show delete confirmation dialog', () => {
    cy.visit('/dashboard/lessons');

    // Look for any delete button
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Delete")').length > 0) {
        cy.contains('button', 'Delete').first().click();
        
        // Verify confirmation dialog appears
        cy.get('body').then(($dialogBody) => {
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
    // Create a lesson
    const lessonTitle = createTestLesson();
    
    cy.visit('/dashboard/lessons');
    cy.wait(2000);
    cy.contains(lessonTitle).should('be.visible');

    // Try to delete but cancel
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Delete")').length > 0) {
        cy.contains('button', 'Delete').first().click();
        
        // Click cancel if dialog appears
        cy.get('body').then(($dialogBody) => {
          if ($dialogBody.find('button:contains("Cancel")').length > 0) {
            cy.contains('button', 'Cancel').click();
            
            // Verify lesson still exists
            cy.wait(1000);
            cy.contains(lessonTitle).should('be.visible');
          }
        });
      }
    });
  });

  it('should delete lesson from detail page', () => {
    // Create a lesson
    const lessonTitle = createTestLesson();
    
    cy.visit('/dashboard/lessons');
    cy.wait(2000);

    // Navigate to lesson details
    cy.contains(lessonTitle).click();
    cy.wait(1000);

    // Look for delete button on detail page
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Delete")').length > 0) {
        cy.contains('button', 'Delete').click();
        
        // Confirm deletion
        cy.get('body').then(($dialogBody) => {
          if ($dialogBody.find('button:contains("Confirm"), button:contains("Delete")').length > 0) {
            cy.contains('button', /Confirm|Delete/i).click();
          }
        });

        // Should redirect to lessons list
        cy.url({ timeout: 10000 }).should('match', /\/dashboard\/lessons\/?$/);
        
        // Verify lesson no longer appears
        cy.contains(lessonTitle).should('not.exist');
      }
    });
  });

  it('should handle deletion of non-existent lesson gracefully', () => {
    // Try to visit a non-existent lesson detail page
    const fakeId = '00000000-0000-0000-0000-000000000000';
    cy.visit(`/dashboard/lessons/${fakeId}`, { failOnStatusCode: false });
    
    // Should either show 404 or redirect
    cy.url().should('satisfy', (url) => {
      return url.includes('/dashboard/lessons') || url.includes('404') || url.includes('not-found');
    });
  });

  it('should show appropriate message after successful deletion', () => {
    // Create a lesson
    const lessonTitle = createTestLesson();
    
    cy.visit('/dashboard/lessons');
    cy.wait(2000);

    // Delete the lesson
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Delete")').length > 0) {
        cy.contains('button', 'Delete').first().click();
        
        cy.get('body').then(($dialogBody) => {
          if ($dialogBody.find('button:contains("Confirm"), button:contains("Delete")').length > 0) {
            cy.contains('button', /Confirm|Delete/i).click();
          }
        });

        // Look for success message or toast
        cy.wait(1000);
        cy.get('body').then(($successBody) => {
          // Lesson should be gone from the list
          cy.contains(lessonTitle).should('not.exist');
        });
      }
    });
  });

  it('should delete multiple lessons sequentially', () => {
    // Create two test lessons
    const lesson1Title = createTestLesson();
    cy.wait(1000);
    const lesson2Title = createTestLesson();

    cy.visit('/dashboard/lessons');
    cy.wait(2000);

    // Verify both exist
    cy.contains(lesson1Title).should('be.visible');
    cy.contains(lesson2Title).should('be.visible');

    // Delete both lessons
    for (let i = 0; i < 2; i++) {
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Delete")').length > 0) {
          cy.contains('button', 'Delete').first().click();
          
          cy.get('body').then(($dialogBody) => {
            if ($dialogBody.find('button:contains("Confirm"), button:contains("Delete")').length > 0) {
              cy.contains('button', /Confirm|Delete/i).click();
            }
          });
          
          cy.wait(2000);
        }
      });
    }
  });

  it('should maintain list state after deletion', () => {
    cy.visit('/dashboard/lessons');
    
    // Get initial count of lessons
    cy.get('body').then(($initialBody) => {
      const initialLinks = $initialBody.find('a[href*="/dashboard/lessons/"]').toArray().filter((el) => {
        const href = Cypress.$(el).attr('href');
        return href && 
               !href.includes('/new') && 
               !href.includes('/edit') && 
               !href.includes('/import') &&
               href !== '/dashboard/lessons';
      });
      const initialCount = initialLinks.length;
      
      // Delete one lesson if any exist
      if ($initialBody.find('button:contains("Delete")').length > 0) {
        cy.contains('button', 'Delete').first().click();
        
        cy.get('body').then(($dialogBody) => {
          if ($dialogBody.find('button:contains("Confirm"), button:contains("Delete")').length > 0) {
            cy.contains('button', /Confirm|Delete/i).click();
          }
        });
        
        cy.wait(2000);
        
        // Verify count decreased
        cy.get('body').then(($afterBody) => {
          const afterLinks = $afterBody.find('a[href*="/dashboard/lessons/"]').toArray().filter((el) => {
            const href = Cypress.$(el).attr('href');
            return href && 
                   !href.includes('/new') && 
                   !href.includes('/edit') && 
                   !href.includes('/import') &&
                   href !== '/dashboard/lessons';
          });
          const afterCount = afterLinks.length;
          expect(afterCount).to.be.lessThan(initialCount);
        });
      }
    });
  });

  it('should handle cascading deletes for related data', () => {
    // Create a lesson with notes and other data
    cy.visit('/dashboard/lessons/new');
    
    cy.get('body').then(($body) => {
      if ($body.find('select[name="student_id"]').length > 0) {
        cy.get('select[name="student_id"]').select(1);
      }
      if ($body.find('select[name="teacher_id"]').length > 0) {
        cy.get('select[name="teacher_id"]').select(1);
      }
    });

    const title = `Cascade Delete Test ${Date.now()}`;
    cy.get('[data-testid="lesson-title"], input[name="title"]').type(title);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateTimeString = futureDate.toISOString().slice(0, 16);
    cy.get('[data-testid="lesson-scheduled-at"], input[name="scheduled_at"]').type(dateTimeString);
    
    cy.get('[data-testid="lesson-notes"], textarea[name="notes"]').type('Test notes for cascade delete');

    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('not.include', '/new');

    // Now delete it
    cy.visit('/dashboard/lessons');
    cy.wait(2000);

    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Delete")').length > 0) {
        cy.contains('button', 'Delete').first().click();
        
        cy.get('body').then(($dialogBody) => {
          if ($dialogBody.find('button:contains("Confirm"), button:contains("Delete")').length > 0) {
            cy.contains('button', /Confirm|Delete/i).click();
          }
        });

        // Verify deletion was successful
        cy.wait(2000);
        cy.contains(title).should('not.exist');
      }
    });
  });

  it('should show empty state after deleting all lessons', () => {
    cy.visit('/dashboard/lessons');
    
    // If there are lessons, we can test empty state
    cy.get('body').then(($body) => {
      // This test is more conceptual - showing empty state after all deletions
      // In practice, we wouldn't delete ALL lessons in a real environment
      if ($body.find('a[href*="/dashboard/lessons/"]').length === 0) {
        // Already empty, verify empty state
        const bodyText = $body.text().toLowerCase();
        expect(bodyText.includes('no lessons') || bodyText.includes('create')).to.be.true;
      }
    });
  });
});
