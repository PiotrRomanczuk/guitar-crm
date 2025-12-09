/// <reference types="cypress" />

describe('Teacher - Lesson Management', () => {
  const TEACHER_EMAIL = 'teacher@example.com';
  const TEACHER_PASSWORD = 'test123_teacher';
  const LESSON_TITLE = `Lesson ${Date.now()}`;

  before(() => {
    // Create a student as admin to ensure one exists
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type('p.romanczuk@gmail.com');
    cy.get('[data-testid="password"]').clear().type('test123_admin');
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('include', '/dashboard');

    cy.visit('/dashboard/users/new');
    cy.get('[data-testid="firstName-input"]').type('Test');
    cy.get('[data-testid="lastName-input"]').type('Student');
    cy.get('[data-testid="username-input"]').type(`student_${Date.now()}`);
    cy.get('[data-testid="email-input"]').type(`student_${Date.now()}@example.com`);
    cy.get('[data-testid="isStudent-checkbox"]').checkShadcn();
    cy.get('[data-testid="submit-button"]').click();
    cy.location('pathname').should('include', '/dashboard/users');

    // Logout
    cy.contains('button', 'Sign Out').click();
  });

  beforeEach(() => {
    // Mock students
    cy.intercept('GET', '/api/users*', (req) => {
      req.continue((res) => {
        if (res.body && res.body.data) {
           if (!res.body.data.find((u: any) => u.email === 'student@example.com')) {
             res.body.data.push({
               id: 'mock-student-id',
               full_name: 'Test Student',
               email: 'student@example.com',
               isStudent: true,
               is_student: true
             });
           }
        }
      });
    }).as('getStudents');

    // Mock POST /api/lessons
    cy.intercept('POST', '/api/lessons', {
      statusCode: 201,
      body: {
        id: 'mock-lesson-id',
        title: LESSON_TITLE,
        student_id: 'mock-student-id',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString()
      }
    }).as('createLesson');

    // Mock PUT /api/lessons/*
    cy.intercept('PUT', '/api/lessons/*', {
      statusCode: 200,
      body: {
        id: 'mock-lesson-id',
        title: LESSON_TITLE + ' Updated',
      }
    }).as('updateLesson');

    // Mock DELETE /api/lessons/*
    cy.intercept('DELETE', '/api/lessons/*', {
      statusCode: 200,
      body: { success: true }
    }).as('deleteLesson');

    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(TEACHER_EMAIL);
    cy.get('[data-testid="password"]').clear().type(TEACHER_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname').should('include', '/dashboard');
  });

  it('should create a new lesson for a student', () => {
    cy.visit('/dashboard/lessons/new');

    cy.get('[data-testid="lesson-title"]').type(LESSON_TITLE);

    // Select a student
    cy.get('[data-testid="lesson-student_id"]')
      .find('option')
      .eq(1)
      .then(($option) => {
        cy.get('[data-testid="lesson-student_id"]').select($option.val());
      });

    // Set date/time
    cy.get('[data-testid="lesson-scheduled-at"]').type('2025-12-25T10:00');

    cy.get('button[type="submit"]').click();

    // Verify redirect
    cy.location('pathname').should('eq', '/dashboard/lessons');
    cy.contains(LESSON_TITLE).should('be.visible');
  });

  it('should edit an existing lesson', () => {
    cy.visit('/dashboard/lessons');
    cy.contains(LESSON_TITLE).click(); // Or click edit button

    // Assuming we are on detail page, click edit
    cy.get('[data-testid="edit-button"]').click();

    cy.get('[data-testid="title-input"]').clear().type(`${LESSON_TITLE} Updated`);
    cy.get('[data-testid="submit-button"]').click();

    cy.contains(`${LESSON_TITLE} Updated`).should('be.visible');
  });

  it('should delete a lesson', () => {
    cy.visit('/dashboard/lessons');
    cy.contains(`${LESSON_TITLE} Updated`)
      .parents('tr')
      .within(() => {
        cy.get('[data-testid="delete-button"]').click();
      });

    // Confirm deletion if modal exists
    cy.get('[data-testid="confirm-delete"]').click();

    cy.contains(`${LESSON_TITLE} Updated`).should('not.exist');
  });
});
