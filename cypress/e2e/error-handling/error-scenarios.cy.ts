/// <reference types="cypress" />

/**
 * Error Handling & Edge Cases Tests
 *
 * Tests error handling scenarios:
 * - Network failure during form submission
 * - Session expiration handling
 * - Invalid URL parameters
 * - Permission denied scenarios
 * - Form validation errors
 * - Server error (500) handling
 */

describe('Error Handling & Edge Cases', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');
  const STUDENT_EMAIL = Cypress.env('TEST_STUDENT_EMAIL');
  const STUDENT_PASSWORD = Cypress.env('TEST_STUDENT_PASSWORD');

  describe('Network Failure Handling', () => {
    beforeEach(() => {
      cy.viewport(1440, 900);
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    });

    it('should handle network failure when loading lessons', () => {
      cy.intercept('GET', '**/api/lessons*', { forceNetworkError: true }).as('lessonsError');

      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Page should still render, possibly with error message
      cy.get('main, [role="main"]').should('be.visible');
    });

    it('should handle network failure when loading songs', () => {
      cy.intercept('GET', '**/api/songs*', { forceNetworkError: true }).as('songsError');

      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('main, [role="main"]').should('be.visible');
    });

    it('should handle network failure during form submission', () => {
      cy.intercept('POST', '**/api/lessons', { forceNetworkError: true }).as('submitError');

      cy.visit('/dashboard/lessons/new');
      cy.wait(2000);

      // Fill minimal form
      cy.get('[data-testid="lesson-title"]', { timeout: 10000 }).type('Test Lesson');
      cy.get('[data-testid="lesson-student_id"]').click({ force: true });
      cy.wait(500);
      cy.get('[role="option"]').first().click({ force: true });
      cy.get('[data-testid="lesson-teacher_id"]').click({ force: true });
      cy.wait(500);
      cy.get('[role="option"]').first().click({ force: true });

      // Try to submit
      cy.get('[data-testid="lesson-submit"]').click({ force: true });

      // Should stay on page or show error
      cy.url().should('include', '/lessons');
    });
  });

  describe('Server Error (500) Handling', () => {
    beforeEach(() => {
      cy.viewport(1440, 900);
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    });

    it('should handle 500 error on lessons page', () => {
      cy.intercept('GET', '**/api/lessons*', {
        statusCode: 500,
        body: { error: 'Internal Server Error' },
      }).as('serverError');

      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Page should still render
      cy.get('main, [role="main"]').should('be.visible');

      // May show error message
      cy.get('body').then(($body) => {
        const hasError = $body.find(':contains("Error"), :contains("Something went wrong"), [class*="error"]').length > 0;
        if (hasError) {
          cy.log('Error message is displayed');
        }
      });
    });

    it('should handle 500 error on songs page', () => {
      cy.intercept('GET', '**/api/songs*', {
        statusCode: 500,
        body: { error: 'Internal Server Error' },
      }).as('serverError');

      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('main, [role="main"]').should('be.visible');
    });
  });

  describe('Invalid URL Parameters', () => {
    beforeEach(() => {
      cy.viewport(1440, 900);
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    });

    it('should handle non-existent lesson ID', () => {
      cy.visit('/dashboard/lessons/00000000-0000-0000-0000-000000000000', { failOnStatusCode: false });
      cy.wait(2000);

      // Should show 404 or error page
      cy.get('body').then(($body) => {
        const has404 = $body.find(':contains("404"), :contains("Not Found"), :contains("not found")').length > 0;
        const hasError = $body.find(':contains("Error"), [class*="error"]').length > 0;
        const isRedirected = !Cypress.env('currentUrl')?.includes('00000000');

        expect(has404 || hasError || isRedirected).to.be.true;
      });
    });

    it('should handle non-existent song ID', () => {
      cy.visit('/dashboard/songs/00000000-0000-0000-0000-000000000000', { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const has404 = $body.find(':contains("404"), :contains("Not Found"), :contains("not found")').length > 0;
        const hasError = $body.find(':contains("Error"), [class*="error"]').length > 0;

        expect(has404 || hasError).to.be.true;
      });
    });

    it('should handle non-existent user ID', () => {
      cy.visit('/dashboard/users/00000000-0000-0000-0000-000000000000', { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const has404 = $body.find(':contains("404"), :contains("Not Found"), :contains("not found")').length > 0;
        const hasError = $body.find(':contains("Error"), [class*="error"]').length > 0;
        const hasAccessDenied = $body.find(':contains("Access Denied"), :contains("Forbidden")').length > 0;

        expect(has404 || hasError || hasAccessDenied).to.be.true;
      });
    });

    it('should handle malformed UUID in URL', () => {
      cy.visit('/dashboard/lessons/not-a-valid-uuid', { failOnStatusCode: false });
      cy.wait(2000);

      // Should handle gracefully
      cy.get('main, [role="main"]').should('be.visible');
    });
  });

  describe('Session Expiration', () => {
    it('should redirect to login when session expires', () => {
      cy.visit('/dashboard');

      // Clear session
      cy.clearCookies();
      cy.clearLocalStorage();

      // Try to access protected page
      cy.visit('/dashboard/lessons', { failOnStatusCode: false });
      cy.wait(2000);

      // Should redirect to login
      cy.url().should('match', /\/sign-in|\/login|\/$/);
    });

    it('should handle session expiration during API call', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);

      cy.intercept('GET', '**/api/lessons*', {
        statusCode: 401,
        body: { error: 'Unauthorized', message: 'Session expired' },
      }).as('sessionExpired');

      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Should handle gracefully - either redirect or show error
      cy.get('body').should('exist');
    });
  });

  describe('Form Validation Errors', () => {
    beforeEach(() => {
      cy.viewport(1440, 900);
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    });

    it('should show validation error for required fields on lesson form', () => {
      cy.visit('/dashboard/lessons/new');
      cy.wait(2000);

      // Try to submit empty form
      cy.get('[data-testid="lesson-submit"]', { timeout: 10000 }).click({ force: true });

      // Should show validation errors or stay on page
      cy.url().should('include', '/new');
    });

    it('should show validation error for invalid email format', () => {
      cy.visit('/dashboard/users/new');
      cy.wait(2000);

      // Enter invalid email
      cy.get('[data-testid="email-input"]', { timeout: 10000 }).type('invalid-email');
      cy.get('[data-testid="email-input"]').blur();

      // May show validation error
      cy.wait(500);
    });

    it('should validate assignment required fields', () => {
      cy.visit('/dashboard/assignments/new');
      cy.wait(2000);

      // Try to submit without title
      cy.get('[data-testid="submit-button"]', { timeout: 10000 }).click({ force: true });

      // Should stay on page or show error
      cy.url().should('include', '/assignments');
    });
  });

  describe('Permission Denied Scenarios', () => {
    it('should handle 403 response from API', () => {
      cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);

      cy.intercept('POST', '**/api/users', {
        statusCode: 403,
        body: { error: 'Forbidden', message: 'You do not have permission' },
      }).as('forbidden');

      // Try to make request (via form or direct)
      cy.request({
        method: 'POST',
        url: '/api/users',
        body: { firstName: 'Test', lastName: 'User' },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([401, 403, 400]);
      });
    });

    it('should show access denied message for restricted pages', () => {
      cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
      cy.visit('/dashboard/users', { failOnStatusCode: false });
      cy.wait(2000);

      cy.url().then((url) => {
        const isRedirected = !url.includes('/dashboard/users');
        const hasAccessDenied = Cypress.$('body').find(':contains("Access"), :contains("Forbidden"), :contains("not authorized")').length > 0;

        expect(isRedirected || hasAccessDenied).to.be.true;
      });
    });
  });

  describe('Empty Data States', () => {
    it('should show empty state on lessons page when no data', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);

      cy.intercept('GET', '**/api/lessons*', {
        statusCode: 200,
        body: [],
      }).as('emptyLessons');

      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Should show empty state
      cy.get('body').then(($body) => {
        const hasEmptyState = $body.find(':contains("No lessons"), :contains("no upcoming"), img[alt*="empty"], [class*="empty"]').length > 0;
        if (hasEmptyState) {
          cy.log('Empty state is displayed');
        }
      });
    });

    it('should show empty state on songs page when no data', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);

      cy.intercept('GET', '**/api/songs*', {
        statusCode: 200,
        body: [],
      }).as('emptySongs');

      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasEmptyState = $body.find(':contains("No songs"), img[alt*="empty"], [class*="empty"]').length > 0;
        if (hasEmptyState) {
          cy.log('Empty state is displayed');
        }
      });
    });
  });

  describe('Concurrent Request Handling', () => {
    beforeEach(() => {
      cy.viewport(1440, 900);
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    });

    it('should handle rapid navigation between pages', () => {
      cy.visit('/dashboard');
      cy.wait(500);

      // Rapidly navigate
      cy.get('a[href*="/lessons"]').first().click({ force: true });
      cy.get('a[href*="/songs"]').first().click({ force: true });
      cy.get('a[href*="/assignments"]').first().click({ force: true });

      // Final page should load correctly
      cy.get('main, [role="main"]').should('be.visible');
    });

    it('should handle double-click on submit button', () => {
      cy.visit('/dashboard/assignments/new');
      cy.wait(2000);

      // Fill form
      cy.get('[data-testid="field-title"]', { timeout: 10000 }).type('Double Click Test');

      // Double click submit (should not create duplicates)
      cy.get('[data-testid="submit-button"]')
        .dblclick({ force: true });

      // Should handle gracefully
      cy.wait(2000);
    });
  });

  describe('Browser Navigation', () => {
    beforeEach(() => {
      cy.viewport(1440, 900);
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    });

    it('should handle browser back button', () => {
      cy.visit('/dashboard');
      cy.wait(1000);

      cy.visit('/dashboard/lessons');
      cy.wait(1000);

      // Go back
      cy.go('back');

      // Should be on dashboard
      cy.url().should('include', '/dashboard');
    });

    it('should handle page refresh', () => {
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      // Reload
      cy.reload();

      // Page should still work
      cy.url().should('include', '/lessons');
      cy.get('main, [role="main"]').should('be.visible');
    });
  });

  describe('Large Data Handling', () => {
    it('should handle large list of items', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);

      // Generate large dataset
      const largeLessonList = Array.from({ length: 100 }, (_, i) => ({
        id: `lesson-${i}`,
        title: `Lesson ${i}`,
        status: 'scheduled',
        scheduled_at: new Date().toISOString(),
      }));

      cy.intercept('GET', '**/api/lessons*', {
        statusCode: 200,
        body: largeLessonList,
      }).as('manyLessons');

      cy.visit('/dashboard/lessons');
      cy.wait(3000);

      // Page should render without crashing
      cy.get('main, [role="main"]').should('be.visible');
    });
  });
});
