describe('Assignment Management', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'test123_admin';

  it('should display assignments list', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Sign In').click();
    cy.get('input[type="email"]').type(adminEmail);
    cy.get('input[type="password"]').type(adminPassword);
    cy.get('button[type="submit"]').click();
    cy.visit('http://localhost:3000/dashboard/assignements');
    cy.get('[data-testid="assignments-table"]').should('exist');
  });

  it('should filter by status', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Sign In').click();
    cy.get('input[type="email"]').type(adminEmail);
    cy.get('input[type="password"]').type(adminPassword);
    cy.get('button[type="submit"]').click();
    cy.visit('http://localhost:3000/dashboard/assignements');
    cy.get('[data-testid="status-filter"]').select('OPEN');
  });

  it('should filter by priority', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Sign In').click();
    cy.get('input[type="email"]').type(adminEmail);
    cy.get('input[type="password"]').type(adminPassword);
    cy.get('button[type="submit"]').click();
    cy.visit('http://localhost:3000/dashboard/assignements');
    cy.get('[data-testid="priority-filter"]').select('URGENT');
  });

  it('should navigate to create page', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Sign In').click();
    cy.get('input[type="email"]').type(adminEmail);
    cy.get('input[type="password"]').type(adminPassword);
    cy.get('button[type="submit"]').click();
    cy.visit('http://localhost:3000/dashboard/assignements');
    cy.get('[data-testid="create-assignment-button"]').click();
    cy.url().should('include', '/new');
  });

  it('should view assignment details', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Sign In').click();
    cy.get('input[type="email"]').type(adminEmail);
    cy.get('input[type="password"]').type(adminPassword);
    cy.get('button[type="submit"]').click();
    cy.visit('http://localhost:3000/dashboard/assignements');
    cy.get('a[data-testid^="view-button-"]').first().click();
    cy.url().should('include', '/dashboard/assignements/');
  });

  it('should show delete button', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Sign In').click();
    cy.get('input[type="email"]').type(adminEmail);
    cy.get('input[type="password"]').type(adminPassword);
    cy.get('button[type="submit"]').click();
    cy.visit('http://localhost:3000/dashboard/assignements');
    cy.get('button[data-testid^="delete-button-"]').should('exist');
  });

  it('should display status badges', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Sign In').click();
    cy.get('input[type="email"]').type(adminEmail);
    cy.get('input[type="password"]').type(adminPassword);
    cy.get('button[type="submit"]').click();
    cy.visit('http://localhost:3000/dashboard/assignements');
    cy.contains(/Open|Completed/).should('exist');
  });

  it('should display priority badges', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Sign In').click();
    cy.get('input[type="email"]').type(adminEmail);
    cy.get('input[type="password"]').type(adminPassword);
    cy.get('button[type="submit"]').click();
    cy.visit('http://localhost:3000/dashboard/assignements');
    cy.contains(/Low|High|Urgent/).should('exist');
  });
});
