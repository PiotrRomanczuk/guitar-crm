/// <reference types="cypress" />

describe('Admin - Create User Journey', () => {
  const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
  const ADMIN_PASSWORD = 'test123_admin';

  beforeEach(() => {
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(ADMIN_EMAIL);
    cy.get('[data-testid="password"]').clear().type(ADMIN_PASSWORD);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 10000 }).should('not.include', '/sign-in');
  });

  it('should create a new Student user', () => {
    const timestamp = Date.now();
    const studentEmail = `student.${timestamp}@example.com`;
    const username = `student_${timestamp}`;

    cy.visit('/dashboard/users/new');

    cy.get('[data-testid="firstName-input"]').type('Test');
    cy.get('[data-testid="lastName-input"]').type('Student');
    cy.get('[data-testid="email-input"]').type(studentEmail);
    cy.get('[data-testid="username-input"]').type(username);
    
    // Select Student role
    cy.get('[data-testid="isStudent-checkbox"]').check();
    
    // Ensure Active is checked (default)
    cy.get('[data-testid="isActive-checkbox"]').should('be.checked');

    // Submit
    cy.get('button[type="submit"]').click();

    // Verify redirect
    cy.location('pathname').should('eq', '/dashboard/users');

    // Verify in list
    cy.contains(studentEmail).should('be.visible');
    cy.contains('Student').should('be.visible');
  });

  it('should create a new Teacher user', () => {
    const timestamp = Date.now();
    const teacherEmail = `teacher.${timestamp}@example.com`;
    const username = `teacher_${timestamp}`;

    cy.visit('/dashboard/users/new');

    cy.get('[data-testid="firstName-input"]').type('Test');
    cy.get('[data-testid="lastName-input"]').type('Teacher');
    cy.get('[data-testid="email-input"]').type(teacherEmail);
    cy.get('[data-testid="username-input"]').type(username);
    
    // Select Teacher role
    cy.get('[data-testid="isTeacher-checkbox"]').check();

    // Submit
    cy.get('button[type="submit"]').click();

    // Verify in list
    cy.contains(teacherEmail).should('be.visible');
    cy.contains('Teacher').should('be.visible');
  });

  it('should create a new Admin user', () => {
    const timestamp = Date.now();
    const adminUserEmail = `admin.${timestamp}@example.com`;
    const username = `admin_${timestamp}`;

    cy.visit('/dashboard/users/new');

    cy.get('[data-testid="firstName-input"]').type('Test');
    cy.get('[data-testid="lastName-input"]').type('Admin');
    cy.get('[data-testid="email-input"]').type(adminUserEmail);
    cy.get('[data-testid="username-input"]').type(username);
    
    // Select Admin role
    cy.get('[data-testid="isAdmin-checkbox"]').check();

    // Submit
    cy.get('button[type="submit"]').click();

    // Verify in list
    cy.contains(adminUserEmail).should('be.visible');
    cy.contains('Admin').should('be.visible');
  });
});
