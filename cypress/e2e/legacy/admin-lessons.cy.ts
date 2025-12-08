/// <reference types="cypress" />

describe('Admin Lesson Management', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'test123_admin';

  beforeEach(() => {
    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(adminEmail);
    cy.get('[data-testid="password"]').clear().type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 10000 }).should('eq', '/dashboard');
  });

  it('should navigate to lessons page', () => {
    cy.visit('/dashboard/lessons');
    cy.contains('h1', 'Lessons').should('be.visible');
  });

  it('should create a new lesson', () => {
    cy.visit('/dashboard/lessons/new');

    // Fill form
    cy.get('[data-testid="lesson-title"]').type('Cypress Test Lesson');
    cy.get('[data-testid="lesson-scheduled-at"]').type('2025-12-01T14:00');

    // Select Student (Test Student)
    cy.get('[data-testid="lesson-student_id"]').select('Test Student (student@example.com)'); // Assuming this format based on ProfileSelect code

    // Select Teacher (Test Teacher)
    cy.get('[data-testid="lesson-teacher_id"]').select('Test Teacher (teacher@example.com)');

    cy.get('[data-testid="lesson-notes"]').type('This is a test lesson created by Cypress.');

    // Submit
    cy.contains('button', 'Create Lesson').click();

    // Verify redirect and list update
    // Note: There is a known bug where it might redirect to /lessons instead of /dashboard/lessons
    // We will assert the correct behavior we WANT.
    cy.location('pathname', { timeout: 10000 }).should('include', '/dashboard/lessons');

    cy.contains('Cypress Test Lesson').should('be.visible');
  });

  it('should edit an existing lesson', () => {
    // Intercept the create request to debug errors
    cy.intercept('POST', '/api/lessons').as('createLesson');

    // 1. Create a lesson to edit
    cy.visit('/dashboard/lessons/new');
    cy.get('[data-testid="lesson-title"]').type('Lesson to Edit');
    cy.get('[data-testid="lesson-scheduled-at"]').type('2025-12-02T10:00');

    // Select Student and Teacher
    // We need to handle the case where the select might not be populated yet or the value format is different
    // But assuming the previous test passed (or would pass), we use the same logic.
    // We'll use a more robust selection strategy if needed.
    cy.get('[data-testid="lesson-student_id"]').then(($select) => {
      const val = $select.find('option:contains("Test Student")').val();
      if (val) cy.wrap($select).select(val.toString());
    });
    cy.get('[data-testid="lesson-teacher_id"]').then(($select) => {
      const val = $select.find('option:contains("Test Teacher")').val();
      if (val) cy.wrap($select).select(val.toString());
    });

    cy.contains('button', 'Create Lesson').click();

    cy.wait('@createLesson').then((interception) => {
      if (interception.response?.statusCode !== 200 && interception.response?.statusCode !== 201) {
        cy.log('Create Lesson Failed:', JSON.stringify(interception.response?.body));
        throw new Error(`Create Lesson Failed: ${JSON.stringify(interception.response?.body)}`);
      }
    });

    // Wait for redirect
    cy.location('pathname', { timeout: 10000 }).should('include', '/dashboard/lessons');

    // 2. Edit the lesson
    cy.contains('tr', 'Lesson to Edit').within(() => {
      cy.get('[data-testid="lesson-edit-button"]').click();
    });

    // 3. Update fields
    const newTitle = `Edited Lesson ${Date.now()}`;
    const newDate = '2025-12-25T15:30';
    const newNotes = 'Updated notes via Cypress';

    cy.get('[data-testid="lesson-title"]').clear().type(newTitle);
    cy.get('[data-testid="lesson-scheduled-at"]').clear().type(newDate);
    cy.get('[data-testid="lesson-notes"]').clear().type(newNotes);

    // 4. Submit
    cy.get('[data-testid="lesson-submit"]').click();

    // 5. Verify redirect to detail page
    cy.location('pathname').should('match', /\/dashboard\/lessons\/[a-f0-9-]+$/);

    // Verify title on detail page
    cy.contains(newTitle).should('be.visible');

    // 6. Verify in list
    cy.visit('/dashboard/lessons');
    cy.contains(newTitle).should('be.visible');
    cy.contains('Lesson to Edit').should('not.exist');
  });
});
