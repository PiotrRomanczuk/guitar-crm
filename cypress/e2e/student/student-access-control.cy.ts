/// <reference types="cypress" />

/**
 * Student Access Control Tests (Negative Tests)
 *
 * Tests that students cannot access admin-only pages or perform unauthorized actions:
 * - Cannot access /dashboard/users
 * - Cannot access /dashboard/admin/* pages
 * - Cannot access other students' data via URL manipulation
 * - API calls return 403 for unauthorized actions
 */

describe('Student Access Control', () => {
  const STUDENT_EMAIL = Cypress.env('TEST_STUDENT_EMAIL');
  const STUDENT_PASSWORD = Cypress.env('TEST_STUDENT_PASSWORD');

  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
  });

  describe('Admin Page Access Restrictions', () => {
    it('should NOT allow access to users management page', () => {
      cy.visit('/dashboard/users', { failOnStatusCode: false });
      cy.wait(2000);

      // Should either redirect away or show access denied
      cy.url().then((url) => {
        const isRedirected = !url.includes('/dashboard/users');
        const hasAccessDenied = Cypress.$('body').find(':contains("Access Denied"), :contains("Forbidden"), :contains("not authorized")').length > 0;

        expect(isRedirected || hasAccessDenied).to.be.true;
      });
    });

    it('should NOT allow access to create new user page', () => {
      cy.visit('/dashboard/users/new', { failOnStatusCode: false });
      cy.wait(2000);

      cy.url().then((url) => {
        const isRedirected = !url.includes('/dashboard/users/new');
        const hasAccessDenied = Cypress.$('body').find(':contains("Access Denied"), :contains("Forbidden"), :contains("not authorized")').length > 0;

        expect(isRedirected || hasAccessDenied).to.be.true;
      });
    });

    it('should NOT allow access to admin stats pages', () => {
      cy.visit('/dashboard/admin/stats/lessons', { failOnStatusCode: false });
      cy.wait(2000);

      cy.url().then((url) => {
        const isRedirected = !url.includes('/admin/stats');
        const has404 = Cypress.$('body').find(':contains("404"), :contains("Not Found")').length > 0;
        const hasAccessDenied = Cypress.$('body').find(':contains("Access Denied"), :contains("Forbidden")').length > 0;

        expect(isRedirected || has404 || hasAccessDenied).to.be.true;
      });
    });

    it('should NOT allow access to Spotify matches admin page', () => {
      cy.visit('/dashboard/admin/spotify-matches', { failOnStatusCode: false });
      cy.wait(2000);

      cy.url().then((url) => {
        const isRedirected = !url.includes('/admin/spotify-matches');
        const has404 = Cypress.$('body').find(':contains("404"), :contains("Not Found")').length > 0;
        const hasAccessDenied = Cypress.$('body').find(':contains("Access Denied"), :contains("Forbidden")').length > 0;

        expect(isRedirected || has404 || hasAccessDenied).to.be.true;
      });
    });

    it('should NOT allow access to health monitoring page', () => {
      cy.visit('/dashboard/admin/health', { failOnStatusCode: false });
      cy.wait(2000);

      cy.url().then((url) => {
        const isRedirected = !url.includes('/admin/health');
        const has404 = Cypress.$('body').find(':contains("404"), :contains("Not Found")').length > 0;
        const hasAccessDenied = Cypress.$('body').find(':contains("Access Denied"), :contains("Forbidden")').length > 0;

        expect(isRedirected || has404 || hasAccessDenied).to.be.true;
      });
    });
  });

  describe('Create Actions Restrictions', () => {
    it('should NOT allow access to create new lesson page', () => {
      cy.visit('/dashboard/lessons/new', { failOnStatusCode: false });
      cy.wait(2000);

      cy.url().then((url) => {
        const isRedirected = !url.includes('/lessons/new');
        const hasAccessDenied = Cypress.$('body').find(':contains("Access Denied"), :contains("Forbidden"), :contains("not authorized")').length > 0;

        expect(isRedirected || hasAccessDenied).to.be.true;
      });
    });

    it('should NOT allow access to create new song page', () => {
      cy.visit('/dashboard/songs/new', { failOnStatusCode: false });
      cy.wait(2000);

      cy.url().then((url) => {
        const isRedirected = !url.includes('/songs/new');
        const hasAccessDenied = Cypress.$('body').find(':contains("Access Denied"), :contains("Forbidden"), :contains("not authorized")').length > 0;

        expect(isRedirected || hasAccessDenied).to.be.true;
      });
    });

    it('should NOT allow access to create new assignment page', () => {
      cy.visit('/dashboard/assignments/new', { failOnStatusCode: false });
      cy.wait(2000);

      cy.url().then((url) => {
        const isRedirected = !url.includes('/assignments/new');
        const hasAccessDenied = Cypress.$('body').find(':contains("Access Denied"), :contains("Forbidden"), :contains("not authorized")').length > 0;

        expect(isRedirected || hasAccessDenied).to.be.true;
      });
    });
  });

  describe('API Authorization', () => {
    it('should return 403 when trying to create a user via API', () => {
      cy.request({
        method: 'POST',
        url: '/api/users',
        body: {
          email: 'unauthorized@test.com',
          firstName: 'Unauthorized',
          lastName: 'User',
        },
        failOnStatusCode: false,
      }).then((response) => {
        // Should be forbidden or bad request (unauthorized)
        expect(response.status).to.be.oneOf([401, 403, 400]);
      });
    });

    it('should return 403 when trying to delete a user via API', () => {
      cy.request({
        method: 'DELETE',
        url: '/api/users/some-random-id',
        failOnStatusCode: false,
      }).then((response) => {
        // Should be forbidden or not found
        expect(response.status).to.be.oneOf([401, 403, 404]);
      });
    });

    it('should return 403 when trying to create a lesson via API', () => {
      cy.request({
        method: 'POST',
        url: '/api/lessons',
        body: {
          title: 'Unauthorized Lesson',
          student_id: 'some-id',
          teacher_id: 'some-id',
        },
        failOnStatusCode: false,
      }).then((response) => {
        // Should be forbidden or bad request
        expect(response.status).to.be.oneOf([401, 403, 400]);
      });
    });

    it('should return 403 when trying to create a song via API', () => {
      cy.request({
        method: 'POST',
        url: '/api/songs',
        body: {
          title: 'Unauthorized Song',
          author: 'Test Artist',
        },
        failOnStatusCode: false,
      }).then((response) => {
        // Should be forbidden
        expect(response.status).to.be.oneOf([401, 403, 400]);
      });
    });
  });

  describe('URL Manipulation Protection', () => {
    it('should NOT allow viewing other users profiles via URL manipulation', () => {
      // Try to access a random user ID
      cy.visit('/dashboard/users/00000000-0000-0000-0000-000000000000', { failOnStatusCode: false });
      cy.wait(2000);

      cy.url().then((url) => {
        const isRedirected = !url.includes('/users/00000000');
        const hasNotFound = Cypress.$('body').find(':contains("Not Found"), :contains("404")').length > 0;
        const hasAccessDenied = Cypress.$('body').find(':contains("Access Denied"), :contains("Forbidden")').length > 0;

        expect(isRedirected || hasNotFound || hasAccessDenied).to.be.true;
      });
    });

    it('should NOT allow editing other users via URL manipulation', () => {
      cy.visit('/dashboard/users/00000000-0000-0000-0000-000000000000/edit', { failOnStatusCode: false });
      cy.wait(2000);

      cy.url().then((url) => {
        const isRedirected = !url.includes('/users/00000000');
        const hasNotFound = Cypress.$('body').find(':contains("Not Found"), :contains("404")').length > 0;
        const hasAccessDenied = Cypress.$('body').find(':contains("Access Denied"), :contains("Forbidden")').length > 0;

        expect(isRedirected || hasNotFound || hasAccessDenied).to.be.true;
      });
    });
  });

  describe('Navigation Element Restrictions', () => {
    it('should NOT show admin navigation items', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      // Check that admin-only navigation items are not visible
      cy.get('nav, [role="navigation"]').within(() => {
        cy.get('a[href="/dashboard/users"]').should('not.exist');
        cy.get('a[href*="/admin"]').should('not.exist');
      });
    });

    it('should NOT show create buttons for restricted resources', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      // Should not see "Create User" type buttons
      cy.get('body').then(($body) => {
        const hasCreateUser = $body.find('button:contains("New User"), a:contains("New User")').length > 0;
        expect(hasCreateUser).to.be.false;
      });
    });
  });

  describe('Own Data Access', () => {
    it('SHOULD allow viewing own profile', () => {
      cy.visit('/dashboard/profile');
      cy.wait(2000);

      // Should be able to access own profile
      cy.url().should('include', '/profile');

      // Should not get access denied for own profile
      cy.get('body').then(($body) => {
        const hasAccessDenied = $body.find(':contains("Access Denied"), :contains("Forbidden")').length > 0;
        expect(hasAccessDenied).to.be.false;
      });
    });

    it('SHOULD allow viewing own lessons', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Should be able to access lessons page
      cy.url().should('include', '/lessons');

      // Page should load without access denied
      cy.contains(/lessons/i).should('exist');
    });

    it('SHOULD allow viewing own assignments', () => {
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      // Should be able to access assignments page
      cy.url().should('include', '/assignments');

      // Page should load without access denied
      cy.contains(/assignments/i).should('exist');
    });

    it('SHOULD allow viewing own songs', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      // Should be able to access songs page
      cy.url().should('include', '/songs');

      // Page should load without access denied
      cy.contains(/songs|my songs/i).should('exist');
    });
  });

  describe('Error Page Handling', () => {
    it('should show 404 page for non-existent routes', () => {
      cy.visit('/dashboard/nonexistent-page', { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const has404 = $body.find(':contains("404"), :contains("Not Found"), :contains("page does not exist")').length > 0;
        const isRedirected = !Cypress.$('body').find(':contains("nonexistent")').length;

        expect(has404 || isRedirected).to.be.true;
      });
    });
  });

  describe('Session Security', () => {
    it('should redirect to login when session expires', () => {
      // Clear cookies to simulate session expiry
      cy.clearCookies();
      cy.clearLocalStorage();

      cy.visit('/dashboard', { failOnStatusCode: false });
      cy.wait(2000);

      // Should redirect to login
      cy.url().should('match', /\/sign-in|\/login|\/$/);
    });
  });
});
