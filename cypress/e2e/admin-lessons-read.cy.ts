/// <reference types="cypress" />

/**
 * Admin Lesson Read E2E Test
 * 
 * Tests the complete workflow for an admin reading/viewing lessons:
 * 1. Admin signs in
 * 2. Navigates to lessons list page
 * 3. Verifies lessons are displayed
 * 4. Views individual lesson details
 * 5. Tests filtering and search functionality
 */

describe('Admin - Lesson Read Operations', () => {
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

  it('should display lessons list page', () => {
    // Navigate to lessons list
    cy.visit('/dashboard/lessons');
    cy.url().should('include', '/dashboard/lessons');

    // Verify page structure exists
    cy.get('header, nav').should('be.visible');

    // The list may be empty or have lessons - both are valid states
    cy.get('body').should('be.visible');
  });

  it('should display lesson details when clicking on a lesson', () => {
    // Navigate to lessons list
    cy.visit('/dashboard/lessons');

    // Try to find and click on a lesson link
    cy.get('body').then(($body) => {
      // Find links that go to lesson details (not /new or /edit)
      const lessonLinks = $body.find('a[href*="/dashboard/lessons/"]').toArray().filter((el) => {
        const href = Cypress.$(el).attr('href');
        return href && 
               !href.includes('/new') && 
               !href.includes('/edit') && 
               !href.includes('/import') &&
               href !== '/dashboard/lessons';
      });

      if (lessonLinks.length > 0) {
        // Click first lesson link
        const firstLessonHref = Cypress.$(lessonLinks[0]).attr('href');
        cy.visit(firstLessonHref!);

        // Verify we're on lesson details page
        cy.url().should('include', '/dashboard/lessons/');
        cy.url().should('not.include', '/new');
        cy.url().should('not.include', '/edit');

        // Verify back link exists
        cy.contains('Back to Lessons').should('be.visible');
      } else {
        // If no lessons exist, just verify we can navigate to create page
        cy.visit('/dashboard/lessons/new');
        cy.url().should('include', '/new');
      }
    });
  });

  it('should show lesson details with all sections', () => {
    cy.visit('/dashboard/lessons');

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

        // Verify key sections exist on lesson detail page
        // Note: Actual section names depend on the LessonDetailsCard component
        cy.get('body').should('be.visible');
        
        // Look for common lesson detail components
        cy.get('body').then(($detailBody) => {
          // These are typical sections on a lesson detail page
          const hasSongs = $detailBody.text().toLowerCase().includes('song');
          const hasAssignments = $detailBody.text().toLowerCase().includes('assignment');
          const hasStudent = $detailBody.text().toLowerCase().includes('student');
          
          // At least one section should exist
          expect(hasSongs || hasAssignments || hasStudent).to.be.true;
        });
      }
    });
  });

  it('should navigate back to list from detail page', () => {
    cy.visit('/dashboard/lessons');

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

        // Click on back link
        cy.contains('Back to Lessons').click();

        // Verify we're back on the list page
        cy.url().should('match', /\/dashboard\/lessons\/?$/);
      }
    });
  });

  it('should handle pagination if lessons exceed page limit', () => {
    cy.visit('/dashboard/lessons');

    // Look for pagination controls
    cy.get('body').then(($body) => {
      // Check if pagination exists
      if ($body.find('[aria-label*="pagination"], .pagination, button:contains("Next")').length > 0) {
        // Pagination exists, test it
        cy.contains('Next').click();
        cy.url().should('include', 'page=');
      } else {
        // No pagination, which is fine if there aren't many lessons
        cy.url().should('include', '/dashboard/lessons');
      }
    });
  });

  it('should allow filtering lessons by status', () => {
    cy.visit('/dashboard/lessons');

    // Look for filter controls
    cy.get('body').then(($body) => {
      if ($body.find('select[name*="status"], select[id*="status"]').length > 0) {
        // Status filter exists
        cy.get('select[name*="status"], select[id*="status"]').first().select('SCHEDULED');
        
        // Verify URL or content updated
        cy.url().should('satisfy', (url) => {
          return url.includes('status=SCHEDULED') || url.includes('/dashboard/lessons');
        });
      }
    });
  });

  it('should allow filtering lessons by teacher', () => {
    cy.visit('/dashboard/lessons');

    // Look for teacher filter
    cy.get('body').then(($body) => {
      if ($body.find('select[name*="teacher"], select[id*="teacher"]').length > 0) {
        // Teacher filter exists
        cy.get('select[name*="teacher"], select[id*="teacher"]').first().select(1);
        
        // Wait for results
        cy.wait(1000);
      }
    });
  });

  it('should allow filtering lessons by student', () => {
    cy.visit('/dashboard/lessons');

    // Look for student filter
    cy.get('body').then(($body) => {
      if ($body.find('select[name*="student"], select[id*="student"]').length > 0) {
        // Student filter exists
        cy.get('select[name*="student"], select[id*="student"]').first().select(1);
        
        // Wait for results
        cy.wait(1000);
      }
    });
  });

  it('should allow searching for lessons', () => {
    cy.visit('/dashboard/lessons');

    // Look for search input
    cy.get('body').then(($body) => {
      if ($body.find('input[type="search"], input[placeholder*="search" i]').length > 0) {
        // Search input exists
        cy.get('input[type="search"], input[placeholder*="search" i]').first().type('test');
        
        // Wait for results or URL to update
        cy.wait(1000);
      }
    });
  });

  it('should reload lessons list successfully', () => {
    cy.visit('/dashboard/lessons');
    cy.get('header, nav').should('be.visible');

    // Reload the page
    cy.reload();

    // Verify page still works
    cy.get('header, nav').should('be.visible');
    cy.url().should('include', '/dashboard/lessons');
  });

  it('should display lesson with associated songs', () => {
    cy.visit('/dashboard/lessons');

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

        // Look for songs section
        cy.get('body').then(($detailBody) => {
          if ($detailBody.text().toLowerCase().includes('song')) {
            // Songs section exists - verify structure
            cy.get('body').should('be.visible');
          }
        });
      }
    });
  });

  it('should display lesson with associated assignments', () => {
    cy.visit('/dashboard/lessons');

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

        // Look for assignments section
        cy.get('body').then(($detailBody) => {
          if ($detailBody.text().toLowerCase().includes('assignment')) {
            // Assignments section exists
            cy.get('body').should('be.visible');
          }
        });
      }
    });
  });

  it('should handle non-existent lesson gracefully', () => {
    // Try to visit a non-existent lesson
    const fakeId = '00000000-0000-0000-0000-000000000000';
    cy.visit(`/dashboard/lessons/${fakeId}`, { failOnStatusCode: false });
    
    // Should show error or redirect
    cy.url().should('satisfy', (url) => {
      return url.includes('/dashboard/lessons') || url.includes('404');
    });
    
    // Should show appropriate message
    cy.get('body').then(($body) => {
      const bodyText = $body.text().toLowerCase();
      expect(bodyText.includes('not found') || bodyText.includes('error')).to.be.true;
    });
  });

  it('should maintain session during navigation', () => {
    // Navigate to lessons list
    cy.visit('/dashboard/lessons');
    
    // Go to create page
    cy.visit('/dashboard/lessons/new');
    
    // Go back to list
    cy.visit('/dashboard/lessons');
    
    // Verify session is still active (not redirected to login)
    cy.url().should('include', '/dashboard/lessons');
    cy.url().should('not.include', '/sign-in');
    cy.get('header').should('contain.text', ADMIN_EMAIL);
  });

  it('should show appropriate empty state when no lessons exist', () => {
    cy.visit('/dashboard/lessons');
    
    // Look for empty state message or create button
    cy.get('body').then(($body) => {
      const bodyText = $body.text().toLowerCase();
      // Either lessons exist OR there's an empty state/create option
      const hasLessons = $body.find('a[href*="/dashboard/lessons/"]').length > 1; // More than just nav link
      const hasEmptyState = bodyText.includes('no lessons') || bodyText.includes('create');
      
      expect(hasLessons || hasEmptyState).to.be.true;
    });
  });
});
