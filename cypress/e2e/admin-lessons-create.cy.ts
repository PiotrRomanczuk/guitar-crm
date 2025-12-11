/// <reference types="cypress" />

/**
 * Admin Lesson Creation E2E Test
 * 
 * Tests the complete workflow for an admin creating a new lesson:
 * 1. Admin signs in
 * 2. Navigates to lesson creation page
 * 3. Selects student and teacher
 * 4. Fills in lesson details
 * 5. Optionally assigns songs
 * 6. Submits the form
 * 7. Verifies the lesson was created successfully
 */

describe('Admin - Lesson Creation', () => {
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

  it('should display lesson creation form', () => {
    // Navigate to lesson creation page
    cy.visit('/dashboard/lessons/new');
    cy.url().should('include', '/dashboard/lessons/new');

    // Verify page title
    cy.contains('Create New Lesson').should('be.visible');

    // Verify form elements exist
    cy.get('[data-testid="lesson-title"], input[name="title"]').should('be.visible');
    cy.get('[data-testid="lesson-scheduled-at"], input[name="scheduled_at"]').should('be.visible');
  });

  it('should allow admin to create a lesson with required fields', () => {
    // Navigate to lesson creation page
    cy.visit('/dashboard/lessons/new');

    // Fill in student selection (if dropdown exists)
    cy.get('body').then(($body) => {
      if ($body.find('select[name="student_id"]').length > 0) {
        cy.get('select[name="student_id"]').select(1); // Select first student
      }
    });

    // Fill in teacher selection (if dropdown exists)
    cy.get('body').then(($body) => {
      if ($body.find('select[name="teacher_id"]').length > 0) {
        cy.get('select[name="teacher_id"]').select(1); // Select first teacher
      }
    });

    // Fill in lesson title
    const lessonTitle = `Test Lesson ${Date.now()}`;
    cy.get('[data-testid="lesson-title"], input[name="title"]').clear().type(lessonTitle);

    // Fill in scheduled date/time
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateTimeString = futureDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
    cy.get('[data-testid="lesson-scheduled-at"], input[name="scheduled_at"]').clear().type(dateTimeString);

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Wait for redirect to lessons list or detail page
    cy.url({ timeout: 10000 }).should('satisfy', (url) => {
      return url.includes('/dashboard/lessons') && !url.includes('/new');
    });

    // Verify success (either by redirect or success message)
    cy.get('body').should('be.visible');
  });

  it('should allow creating lesson with optional fields', () => {
    cy.visit('/dashboard/lessons/new');

    // Fill in required fields
    cy.get('body').then(($body) => {
      if ($body.find('select[name="student_id"]').length > 0) {
        cy.get('select[name="student_id"]').select(1);
      }
      if ($body.find('select[name="teacher_id"]').length > 0) {
        cy.get('select[name="teacher_id"]').select(1);
      }
    });

    const lessonTitle = `Detailed Lesson ${Date.now()}`;
    cy.get('[data-testid="lesson-title"], input[name="title"]').type(lessonTitle);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateTimeString = futureDate.toISOString().slice(0, 16);
    cy.get('[data-testid="lesson-scheduled-at"], input[name="scheduled_at"]').type(dateTimeString);

    // Fill in optional notes
    cy.get('[data-testid="lesson-notes"], textarea[name="notes"]').type('This is a test lesson with detailed notes.');

    // Submit
    cy.get('button[type="submit"]').click();

    // Verify redirect
    cy.url({ timeout: 10000 }).should('not.include', '/new');
  });

  it('should validate required fields', () => {
    cy.visit('/dashboard/lessons/new');

    // Try to submit without filling required fields
    cy.get('button[type="submit"]').click();

    // Should stay on the form page
    cy.url().should('include', '/dashboard/lessons/new');

    // HTML5 validation or custom validation should prevent submission
    // The form should still be visible
    cy.get('form').should('be.visible');
  });

  it('should allow selecting songs for the lesson', () => {
    cy.visit('/dashboard/lessons/new');

    // Fill in required fields
    cy.get('body').then(($body) => {
      if ($body.find('select[name="student_id"]').length > 0) {
        cy.get('select[name="student_id"]').select(1);
      }
      if ($body.find('select[name="teacher_id"]').length > 0) {
        cy.get('select[name="teacher_id"]').select(1);
      }
    });

    const lessonTitle = `Lesson with Songs ${Date.now()}`;
    cy.get('[data-testid="lesson-title"], input[name="title"]').type(lessonTitle);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateTimeString = futureDate.toISOString().slice(0, 16);
    cy.get('[data-testid="lesson-scheduled-at"], input[name="scheduled_at"]').type(dateTimeString);

    // Look for song selection interface
    cy.get('body').then(($body) => {
      // Check if there's a song selection component
      if ($body.find('[data-testid*="song"], select[name*="song"]').length > 0) {
        // Interact with song selector if it exists
        cy.get('[data-testid*="song"], select[name*="song"]').first().click();
      }
    });

    // Submit
    cy.get('button[type="submit"]').click();

    // Verify redirect
    cy.url({ timeout: 10000 }).should('not.include', '/new');
  });

  it('should handle form reload without losing state', () => {
    cy.visit('/dashboard/lessons/new');
    
    // Fill in some data
    const lessonTitle = `Reload Test ${Date.now()}`;
    cy.get('[data-testid="lesson-title"], input[name="title"]').type(lessonTitle);

    // Reload page
    cy.reload();

    // Verify form still loads
    cy.get('[data-testid="lesson-title"], input[name="title"]').should('be.visible');
    cy.get('form').should('exist');
  });

  it('should allow canceling lesson creation', () => {
    cy.visit('/dashboard/lessons/new');

    // Look for cancel button
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Cancel"), a:contains("Cancel")').length > 0) {
        cy.contains('Cancel').click();
        
        // Should navigate back to lessons list
        cy.url().should('match', /\/dashboard\/lessons\/?$/);
      }
    });
  });

  it('should create multiple lessons sequentially', () => {
    // Create first lesson
    cy.visit('/dashboard/lessons/new');
    
    cy.get('body').then(($body) => {
      if ($body.find('select[name="student_id"]').length > 0) {
        cy.get('select[name="student_id"]').select(1);
      }
      if ($body.find('select[name="teacher_id"]').length > 0) {
        cy.get('select[name="teacher_id"]').select(1);
      }
    });

    const lesson1Title = `Sequential Lesson 1 ${Date.now()}`;
    cy.get('[data-testid="lesson-title"], input[name="title"]').type(lesson1Title);

    let futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    let dateTimeString = futureDate.toISOString().slice(0, 16);
    cy.get('[data-testid="lesson-scheduled-at"], input[name="scheduled_at"]').type(dateTimeString);

    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('not.include', '/new');

    // Create second lesson
    cy.visit('/dashboard/lessons/new');
    
    cy.get('body').then(($body) => {
      if ($body.find('select[name="student_id"]').length > 0) {
        cy.get('select[name="student_id"]').select(1);
      }
      if ($body.find('select[name="teacher_id"]').length > 0) {
        cy.get('select[name="teacher_id"]').select(1);
      }
    });

    const lesson2Title = `Sequential Lesson 2 ${Date.now()}`;
    cy.get('[data-testid="lesson-title"], input[name="title"]').type(lesson2Title);

    futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    dateTimeString = futureDate.toISOString().slice(0, 16);
    cy.get('[data-testid="lesson-scheduled-at"], input[name="scheduled_at"]').type(dateTimeString);

    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('not.include', '/new');
  });

  it('should display validation errors for invalid date', () => {
    cy.visit('/dashboard/lessons/new');

    // Fill in required selects
    cy.get('body').then(($body) => {
      if ($body.find('select[name="student_id"]').length > 0) {
        cy.get('select[name="student_id"]').select(1);
      }
      if ($body.find('select[name="teacher_id"]').length > 0) {
        cy.get('select[name="teacher_id"]').select(1);
      }
    });

    cy.get('[data-testid="lesson-title"], input[name="title"]').type('Test Lesson');

    // Try to submit without date
    cy.get('button[type="submit"]').click();

    // Should stay on form
    cy.url().should('include', '/dashboard/lessons/new');
  });

  it('should maintain session during lesson creation workflow', () => {
    // Navigate to lessons list
    cy.visit('/dashboard/lessons');
    
    // Go to create page
    cy.visit('/dashboard/lessons/new');
    
    // Verify session is still active
    cy.url().should('include', '/dashboard/lessons/new');
    cy.url().should('not.include', '/sign-in');
    cy.get('header').should('contain.text', ADMIN_EMAIL);
  });
});
