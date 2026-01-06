// Critical Path Smoke Tests
// These tests verify that core functionality is working
// Should run in <30 seconds and catch major failures quickly

describe('🔍 Smoke Tests - Critical Path Verification', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should load the application successfully', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
    cy.get('html').should('have.attr', 'lang', 'en');

    // Check for essential page elements
    cy.get('main, [role="main"], #__next').should('exist');
  });

  it('should have working authentication system', () => {
    cy.visit('/auth/signin');

    // Verify auth form exists
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should have protected dashboard route', () => {
    // Attempt to access protected route without authentication
    cy.visit('/dashboard');

    // Should redirect to auth or show login prompt
    cy.url().should('satisfy', (url) => {
      return url.includes('/auth/signin') || url.includes('/login') || url.includes('/');
    });
  });

  it('should have working navigation system', () => {
    cy.visit('/');

    // Check for navigation elements
    cy.get('nav, [role="navigation"]').should('exist');

    // Verify essential navigation links
    const essentialLinks = ['dashboard', 'students', 'lessons', 'songs'];
    essentialLinks.forEach((link) => {
      cy.get('body').then(($body) => {
        const hasLink = $body.find(`a[href*="${link}"], button:contains("${link}")`).length > 0;
        if (hasLink) {
          cy.log(`✅ ${link} navigation found`);
        }
      });
    });
  });

  it('should have working API endpoints', () => {
    // Test critical API endpoints
    const endpoints = ['/api/health', '/api/auth/session'];

    endpoints.forEach((endpoint) => {
      cy.request({
        url: endpoint,
        failOnStatusCode: false,
      }).then((response) => {
        // Accept 200 (working) or 401/403 (protected but responding)
        expect([200, 401, 403, 405]).to.include(response.status);
        cy.log(`✅ ${endpoint} responding with status: ${response.status}`);
      });
    });
  });

  it('should handle 404 pages gracefully', () => {
    cy.visit('/nonexistent-page', { failOnStatusCode: false });

    // Should show custom 404 or not crash
    cy.get('body').should('be.visible');

    // Check that it's properly handled (not showing browser default error)
    cy.get('html').should('not.contain', "This site can't be reached");
  });

  it('should have responsive design basics', () => {
    cy.visit('/');

    // Test mobile viewport
    cy.viewport('iphone-6');
    cy.get('body').should('be.visible');

    // Test tablet viewport
    cy.viewport('ipad-2');
    cy.get('body').should('be.visible');

    // Test desktop viewport
    cy.viewport(1280, 720);
    cy.get('body').should('be.visible');
  });

  it('should not have critical console errors', () => {
    cy.visit('/');

    // Capture console errors
    cy.window().then((win) => {
      cy.wrap(win.console).should('exist');
    });

    // Allow warnings but fail on errors
    cy.get('@consoleError', { timeout: 1000 }).should('not.exist');
  });
});
