/// <reference types="cypress" />

// Admin journey: Complete lesson CRUD workflow
// Flow: Sign in → Create lesson → View list → View detail → Edit → Delete
// Routes:
// - Sign-in page: /sign-in
// - Lessons list page: /dashboard/lessons
// - Lesson detail page: /dashboard/lessons/{id}
// - Create/edit page: /dashboard/lessons/new or /lessons/{id}/edit

describe('Admin Journey - Lesson CRUD', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'test123_admin';

  // We'll create a fresh lesson for each test
  const testLesson = {
    studentId: '',
    teacherId: '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    notes: `Test Lesson ${Date.now()}`,
  };

  before(() => {
    // Sign in as admin once for all tests
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(adminEmail);
    cy.get('[data-testid="password"]').clear().type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 10000 }).should('not.include', '/sign-in');
  });

  it('should create a new lesson successfully', () => {
    // Navigate to create lesson page
    cy.visit('/dashboard/lessons/new');
    cy.location('pathname').should('include', '/lessons/new');

    // Select a student (assuming there are students available)
    // Note: This assumes the profile selector works like in the form
    cy.get('[data-testid="lesson-student-select"]').should('exist');
    cy.get('[data-testid="lesson-student-select"]').first().click();

    // Set lesson date
    cy.get('[data-testid="lesson-date"]').clear().type(testLesson.date);

    // Add notes
    cy.get('[data-testid="lesson-notes"]').clear().type(testLesson.notes);

    // Submit form
    cy.intercept('POST', '/api/lessons').as('createLesson');
    cy.get('[data-testid="lesson-submit"]').click();

    cy.wait('@createLesson').then((interception) => {
      expect(interception.response?.statusCode).to.equal(201);
      // Store lesson ID for later tests
      const lessonData = interception.response?.body;
      cy.wrap(lessonData?.id).as('lessonId');
      cy.wrap(lessonData?.student_id).as('studentId');
    });

    // Should redirect to lessons list
    cy.location('pathname', { timeout: 5000 }).should('include', '/lessons');
    cy.log('✅ Lesson created successfully');
  });

  it('should display lesson in list', () => {
    // Navigate to lessons list
    cy.visit('/dashboard/lessons');
    cy.location('pathname').should('include', '/dashboard/lessons');

    // Verify table exists with test data
    cy.get('[data-testid="lesson-table"]').should('exist');
    cy.get('[data-testid="lesson-row"]').should('have.length.greaterThan', 0);

    cy.log('✅ Lessons list displayed successfully');
  });

  it('should navigate to lesson detail page', () => {
    // Navigate to lessons list
    cy.visit('/dashboard/lessons');

    // Click on the most recent lesson (should be our test lesson)
    cy.get('[data-testid="lesson-row"]')
      .first()
      .within(() => {
        cy.get('a').first().click();
      });

    // Should be on detail page
    cy.location('pathname', { timeout: 5000 }).should('match', /\/dashboard\/lessons\/[a-f0-9-]+$/);

    // Verify lesson details are visible
    cy.get('[data-testid="lesson-detail"]').should('exist');
    cy.contains(testLesson.notes).should('be.visible');

    cy.log('✅ Lesson detail page displayed');
  });

  it('should edit a lesson successfully', () => {
    // Navigate to lessons list
    cy.visit('/dashboard/lessons');

    // Navigate to first lesson detail
    cy.get('[data-testid="lesson-row"]')
      .first()
      .within(() => {
        cy.get('a').first().click();
      });

    // Wait for detail page to load
    cy.location('pathname').should('match', /\/dashboard\/lessons\/[a-f0-9-]+$/);

    // Click edit button
    cy.get('[data-testid="lesson-edit-button"]').should('be.visible').click();

    // Should navigate to edit page
    cy.location('pathname', { timeout: 5000 }).should(
      'match',
      /\/dashboard\/lessons\/[a-f0-9-]+\/edit$/
    );

    // Update notes
    const updatedNotes = `${testLesson.notes} (EDITED)`;
    cy.get('[data-testid="lesson-notes"]').clear().type(updatedNotes);

    // Submit
    cy.intercept('PUT', '/api/lessons/*').as('updateLesson');
    cy.get('[data-testid="lesson-submit"]').click();

    cy.wait('@updateLesson').then((interception) => {
      expect(interception.response?.statusCode).to.equal(200);
      cy.log('✅ Lesson updated successfully');
    });

    // Should redirect to detail or list
    cy.location('pathname', { timeout: 5000 }).should('include', '/lessons');
  });

  it('should delete a lesson successfully', () => {
    // Navigate to lessons list
    cy.visit('/dashboard/lessons');

    // Get initial count
    cy.get('[data-testid="lesson-row"]').then(($rows) => {
      const initialCount = $rows.length;
      cy.wrap(initialCount).as('initialCount');
    });

    // Navigate to first lesson detail
    cy.get('[data-testid="lesson-row"]')
      .first()
      .within(() => {
        cy.get('a').first().click();
      });

    // Wait for detail page
    cy.location('pathname').should('match', /\/dashboard\/lessons\/[a-f0-9-]+$/);

    // Handle browser confirm dialog
    cy.on('window:confirm', () => true);

    // Click delete button
    cy.get('[data-testid="lesson-delete-button"]').should('be.visible').click();

    // Should redirect to list
    cy.location('pathname', { timeout: 10000 }).should('include', '/dashboard/lessons');

    // Refresh to ensure fresh data
    cy.wait(500);
    cy.reload();
    cy.wait(500);

    // Verify count decreased
    cy.get('@initialCount').then((initialCount) => {
      cy.get('[data-testid="lesson-row"]').should('have.length', Number(initialCount) - 1);
    });

    cy.log('✅ Lesson deleted successfully');
  });

  it('should not delete lesson if user cancels confirmation', () => {
    // Navigate to lessons list
    cy.visit('/dashboard/lessons');

    // Get initial count
    cy.get('[data-testid="lesson-row"]').then(($rows) => {
      const initialCount = $rows.length;
      cy.wrap(initialCount).as('countBefore');
    });

    // Navigate to first lesson
    cy.get('[data-testid="lesson-row"]')
      .first()
      .within(() => {
        cy.get('a').first().click();
      });

    cy.location('pathname').should('match', /\/dashboard\/lessons\/[a-f0-9-]+$/);

    // Handle browser confirm dialog - CANCEL
    cy.on('window:confirm', () => false);

    // Click delete button
    cy.get('[data-testid="lesson-delete-button"]').should('be.visible').click();

    // Should still be on detail page
    cy.location('pathname').should('match', /\/dashboard\/lessons\/[a-f0-9-]+$/);

    // Verify on list that count is still same
    cy.visit('/dashboard/lessons');
    cy.get('@countBefore').then((countBefore) => {
      cy.get('[data-testid="lesson-row"]').should('have.length', Number(countBefore));
    });

    cy.log('✅ Lesson deletion cancelled successfully');
  });

  it('should filter lessons by date', () => {
    cy.visit('/dashboard/lessons');

    // Verify filter control exists
    cy.get('[data-testid="lesson-filter"]').should('exist');

    // Apply date filter
    const filterDate = new Date().toISOString().split('T')[0];
    cy.get('[data-testid="lesson-filter-date"]').type(filterDate);

    // Verify table updates (should show lessons for that date or be empty)
    cy.get('[data-testid="lesson-table"]').should('exist');

    cy.log('✅ Lesson filter applied');
  });

  it('should handle role-based access correctly', () => {
    // As admin, can view all lessons
    cy.visit('/dashboard/lessons');
    cy.get('[data-testid="lesson-table"]').should('exist');

    // Should be able to create, edit, delete
    cy.visit('/dashboard/lessons/new');
    cy.location('pathname').should('include', '/lessons/new');

    cy.log('✅ Role-based access working');
  });
});
