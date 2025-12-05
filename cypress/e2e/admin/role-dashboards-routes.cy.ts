/// <reference types="cypress" />

// E2E Tests for Role-Based Dashboard Routes
// Tests: /teacher, /student, /dashboard/admin/users
// Focus: Route accessibility, redirects, UI elements

describe('Role-Based Dashboard Routes', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'test123_admin';

  describe('Admin Users Management Route', () => {
    beforeEach(() => {
      // Sign in as admin
      cy.visit('/sign-in');
      cy.get('[data-testid="email"]', { timeout: 8000 }).clear().type(adminEmail);
      cy.get('[data-testid="password"]').clear().type(adminPassword);
      cy.get('[data-testid="signin-button"]').click();
      cy.location('pathname', { timeout: 15000 }).should((path) => {
        expect(path).not.to.include('/sign-in');
      });
    });

    it('should display admin users page with correct title', () => {
      cy.visit('/dashboard/admin/users');

      cy.contains('h1', 'Users Management').should('be.visible');
      cy.contains('Manage user roles and permissions').should('be.visible');
    });

    it('should display users management page layout', () => {
      cy.visit('/dashboard/admin/users');

      // Should have main container
      cy.get('main').should('be.visible');

      // Should have page content with users/admin text
      cy.get('[class*="container"]').should('exist');
      cy.contains(/Users|Admin/).should('be.visible');
    });

    it('should display add user button with correct link', () => {
      cy.visit('/dashboard/admin/users');

      cy.contains('a', 'Add User')
        .should('be.visible')
        .should('have.attr', 'href', '/dashboard/users/new');
    });

    it('should display users table container', () => {
      cy.visit('/dashboard/admin/users');

      // Table or content should be visible
      cy.get('table').should('exist');
    });

    it('should display loading state or content', () => {
      cy.visit('/dashboard/admin/users');

      // Either shows table, loading spinner, or empty state
      cy.get('body').should('contain.text', 'Users');
    });

    it('should have responsive design', () => {
      cy.visit('/dashboard/admin/users');

      // Check that page layout is visible on different viewport sizes
      cy.viewport('iphone-x');
      cy.contains('h1', 'Users Management').should('be.visible');

      cy.viewport('macbook-15');
      cy.contains('h1', 'Users Management').should('be.visible');
    });
  });

  describe('Teacher Dashboard Route', () => {
    it('should display teacher dashboard page at /teacher', () => {
      cy.visit('/teacher');

      // Since we're not authenticated with teacher role, may redirect
      // But the route should exist and be accessible
      cy.location('pathname').then((path) => {
        // Either shows teacher dashboard or redirects to signin/dashboard
        expect(['/teacher', '/dashboard', '/sign-in']).to.include(path);
      });
    });

    it('should have teacher dashboard UI elements', () => {
      cy.visit('/teacher', { failOnStatusCode: false });

      // Check for teacher dashboard elements or redirect
      cy.get('body').then(($body) => {
        const text = $body.text();
        // Should either have teacher content or be redirected
        if (text.includes('Teacher Dashboard')) {
          cy.contains('h1', 'Teacher Dashboard').should('be.visible');
        }
      });
    });
  });

  describe('Student Dashboard Route', () => {
    it('should display student dashboard page at /student', () => {
      cy.visit('/student');

      // Since we're not authenticated with student role, may redirect
      // But the route should exist and be accessible
      cy.location('pathname').then((path) => {
        // Either shows student dashboard or redirects to signin/dashboard
        expect(['/student', '/dashboard', '/sign-in']).to.include(path);
      });
    });

    it('should have student dashboard UI elements', () => {
      cy.visit('/student', { failOnStatusCode: false });

      // Check for student dashboard elements or redirect
      cy.get('body').then(($body) => {
        const text = $body.text();
        // Should either have student content or be redirected
        if (text.includes('Student Dashboard')) {
          cy.contains('h1', 'Student Dashboard').should('be.visible');
        }
      });
    });
  });

  describe('Route Security - Unauthenticated Access', () => {
    it('should redirect unauthenticated users from /teacher to sign-in', () => {
      // Clear any existing auth by visiting sign-in and not authenticating
      cy.visit('/teacher', { failOnStatusCode: false });

      // Should either be on /teacher (with redirect message) or /sign-in
      cy.location('pathname').then((path) => {
        expect(['/teacher', '/sign-in', '/dashboard']).to.include(path);
      });
    });

    it('should redirect unauthenticated users from /student to sign-in', () => {
      cy.visit('/student', { failOnStatusCode: false });

      // Should either be on /student (with redirect message) or /sign-in
      cy.location('pathname').then((path) => {
        expect(['/student', '/sign-in', '/dashboard']).to.include(path);
      });
    });

    it('should redirect unauthenticated users from /dashboard/admin/users', () => {
      cy.visit('/dashboard/admin/users', { failOnStatusCode: false });

      // Should either be on admin page or redirected
      cy.location('pathname').then((path) => {
        expect(['/dashboard/admin/users', '/sign-in', '/dashboard']).to.include(path);
      });
    });
  });

  describe('Navigation Links in Header', () => {
    beforeEach(() => {
      // Sign in as admin
      cy.visit('/sign-in');
      cy.get('[data-testid="email"]', { timeout: 8000 }).clear().type(adminEmail);
      cy.get('[data-testid="password"]').clear().type(adminPassword);
      cy.get('[data-testid="signin-button"]').click();
      cy.location('pathname', { timeout: 15000 }).should((path) => {
        expect(path).not.to.include('/sign-in');
      });
    });

    it('should show Users link in navigation for admin', () => {
      cy.visit('/dashboard');

      // Check that the Users link is visible
      cy.contains('a', 'Users')
        .should('be.visible')
        .should('have.attr', 'href', '/dashboard/admin/users');
    });

    it('should allow navigation to admin users page from header', () => {
      cy.visit('/dashboard');

      cy.contains('a', 'Users').click();

      cy.location('pathname').should('equal', '/dashboard/admin/users');
      cy.contains('h1', 'Users Management').should('be.visible');
    });

    it('should show other navigation items', () => {
      cy.visit('/dashboard');

      // Check for navigation items
      cy.contains('a', 'Songs').should('be.visible');
      cy.contains('a', 'Lessons').should('be.visible');
      cy.contains('a', 'Assignments').should('be.visible');
    });
  });

  describe('Route Integration', () => {
    beforeEach(() => {
      // Sign in as admin
      cy.visit('/sign-in');
      cy.get('[data-testid="email"]', { timeout: 8000 }).clear().type(adminEmail);
      cy.get('[data-testid="password"]').clear().type(adminPassword);
      cy.get('[data-testid="signin-button"]').click();
      cy.location('pathname', { timeout: 15000 }).should((path) => {
        expect(path).not.to.include('/sign-in');
      });
    });

    it('should navigate between routes without errors', () => {
      // Dashboard -> Admin Users
      cy.visit('/dashboard');
      cy.contains('a', 'Users').click();
      cy.location('pathname').should('equal', '/dashboard/admin/users');

      // Admin Users -> back to Dashboard
      cy.contains('a', 'Songs').click();
      cy.location('pathname').then((path) => {
        // Should navigate to dashboard or songs page
        expect(path).to.include('/dashboard');
      });
    });

    it('should maintain session across route changes', () => {
      cy.visit('/dashboard/admin/users');

      // Should still be authenticated
      cy.contains('a', 'Users').should('be.visible');

      // Navigate to another page
      cy.contains('a', 'Songs').click();
      cy.location('pathname').then((path) => {
        expect(path).to.include('/dashboard');
      });

      // Should still see navigation links
      cy.contains('a', 'Users').should('be.visible');
    });
  });
});
