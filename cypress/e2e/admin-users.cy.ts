describe('Admin User Management', () => {
  beforeEach(() => {
    // Login as admin before each test
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').type('p.romanczuk@gmail.com');
    cy.get('[data-testid="password"]').type('test123_admin');
    cy.get('[data-testid="signin-button"]').click();

    // Wait for dashboard to load
    cy.url().should('include', '/dashboard');
    cy.contains('h1', 'Dashboard').should('be.visible');
  });

  it('should navigate to users page', () => {
    cy.get('a[href="/dashboard/users"]').click();
    cy.url().should('include', '/dashboard/users');
    cy.contains('h1', 'Users').should('be.visible');
  });

  it('should create a new teacher user', () => {
    const timestamp = new Date().getTime();
    const teacherEmail = `teacher_${timestamp}@test.com`;
    const teacherName = `Teacher ${timestamp}`;

    cy.visit('/dashboard/users');
    cy.get('[data-testid="create-user-button"]').click();

    cy.url().should('include', '/dashboard/users/new');

    // Fill form
    cy.get('[data-testid="firstName-input"]').type('Test');
    cy.get('[data-testid="lastName-input"]').type(teacherName);
    cy.get('[data-testid="email-input"]').type(teacherEmail);
    cy.get('[data-testid="username-input"]').type(`teacher_${timestamp}`);

    // Select Teacher role
    cy.get('[data-testid="isTeacher-checkbox"]').check();

    // Submit
    cy.get('[data-testid="submit-button"]').click();

    // Verify redirect and list
    cy.url().should('eq', Cypress.config().baseUrl + '/dashboard/users');
    cy.contains(teacherEmail).should('be.visible');
    cy.contains('teacher').should('be.visible');
  });

  it('should create a new student user', () => {
    const timestamp = new Date().getTime();
    const studentEmail = `student_${timestamp}@test.com`;
    const studentName = `Student ${timestamp}`;

    cy.visit('/dashboard/users');
    cy.get('[data-testid="create-user-button"]').click();

    // Fill form
    cy.get('[data-testid="firstName-input"]').type('Test');
    cy.get('[data-testid="lastName-input"]').type(studentName);
    cy.get('[data-testid="email-input"]').type(studentEmail);
    cy.get('[data-testid="username-input"]').type(`student_${timestamp}`);

    // Select Student role
    cy.get('[data-testid="isStudent-checkbox"]').check();

    // Submit
    cy.get('[data-testid="submit-button"]').click();

    // Verify redirect and list
    cy.url().should('eq', Cypress.config().baseUrl + '/dashboard/users');
    cy.contains(studentEmail).should('be.visible');
    cy.contains('student').should('be.visible');
  });

  it('should filter users by role', () => {
    cy.visit('/dashboard/users');

    // Filter by Teacher
    cy.get('[data-testid="role-filter"]').select('teacher');
  });
});
