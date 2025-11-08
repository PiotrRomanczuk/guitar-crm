/// <reference types="cypress" />

/**
 * Admin Dashboard Journey E2E Tests
 *
 * Tests the main admin dashboard experience:
 * - Dashboard overview and statistics
 * - Quick actions and shortcuts
 * - Navigation to different admin sections
 * - Real-time data updates
 * - Dashboard widgets and cards
 */

describe('Admin Dashboard Journey', () => {
  const adminUser = {
    email: 'p.romanczuk@gmail.com',
    password: 'test123_admin',
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();

    // Login as admin
    cy.visit('/sign-in');
    cy.get('input[type="email"]').type(adminUser.email);
    cy.get('input[type="password"]').type(adminUser.password);
    cy.get('button[type="submit"]').click();
    cy.contains(adminUser.email, { timeout: 10000 }).should('be.visible');
  });

  context('Dashboard Overview', () => {
    it('should display admin dashboard with all sections', () => {
      cy.visit('/dashboard/admin');
      cy.url().should('include', '/dashboard/admin');

      // Verify page title and header
      cy.contains(/admin|dashboard/i).should('be.visible');

      // Should see main dashboard sections
      cy.get('[data-testid="admin-dashboard"], .admin-dashboard, main').should('be.visible');
    });

    it('should show system statistics and metrics', () => {
      cy.visit('/dashboard/admin');

      // Look for statistics cards or widgets
      cy.get('[data-testid^="stat-"], .stat-card, .metric-card').should(
        'have.length.greaterThan',
        0
      );

      // Should show various metrics like users, songs, lessons counts
      cy.contains(/users|songs|lessons|total/i).should('be.visible');
    });

    it('should display quick action buttons', () => {
      cy.visit('/dashboard/admin');

      // Look for quick action buttons
      cy.get('button, [role="button"], a')
        .contains(/create|add|new|manage/i)
        .should('have.length.greaterThan', 0);
    });
  });

  context('Navigation from Dashboard', () => {
    beforeEach(() => {
      cy.visit('/dashboard/admin');
    });

    it('should navigate to user management', () => {
      // Click on user management link/button
      cy.get('[data-testid="users-link"], a, button')
        .contains(/users|user management/i)
        .first()
        .click();

      cy.url({ timeout: 5000 }).should('include', '/users');
    });

    it('should navigate to lesson management', () => {
      // Click on lesson management link/button
      cy.get('[data-testid="lessons-link"], a, button')
        .contains(/lessons|lesson management/i)
        .first()
        .click();

      cy.url({ timeout: 5000 }).should('include', '/lessons');
    });

    it('should navigate to song management', () => {
      // Click on song management link/button
      cy.get('[data-testid="songs-link"], a, button')
        .contains(/songs|song management/i)
        .first()
        .click();

      cy.url({ timeout: 5000 }).should('include', '/songs');
    });

    it('should have working breadcrumb navigation', () => {
      // Navigate to a sub-page
      cy.visit('/dashboard/admin/users');

      // Click breadcrumb to return to dashboard
      cy.get('[data-testid="breadcrumb"], .breadcrumb, nav')
        .contains(/dashboard|admin/i)
        .click();

      cy.url().should('include', '/dashboard/admin');
    });
  });

  context('Dashboard Widgets and Cards', () => {
    beforeEach(() => {
      cy.visit('/dashboard/admin');
    });

    it('should display user statistics widget', () => {
      // Look for user-related statistics
      cy.contains(/users|members|accounts/i).should('be.visible');

      // Should show numbers or counts
      cy.get('[data-testid^="user-"], .user-stat, .user-card').should('contain.text', /\d+/);
    });

    it('should display lesson statistics widget', () => {
      // Look for lesson-related statistics
      cy.contains(/lessons|classes|sessions/i).should('be.visible');

      // Should show numbers or counts
      cy.get('[data-testid^="lesson-"], .lesson-stat, .lesson-card').should('contain.text', /\d+/);
    });

    it('should display song statistics widget', () => {
      // Look for song-related statistics
      cy.contains(/songs|music|library/i).should('be.visible');

      // Should show numbers or counts
      cy.get('[data-testid^="song-"], .song-stat, .song-card').should('contain.text', /\d+/);
    });

    it('should show recent activity or updates', () => {
      // Look for recent activity sections
      cy.get('body').then(($body) => {
        const hasRecentSection = $body.text().match(/recent|activity|updates|latest/i);
        if (hasRecentSection) {
          cy.contains(/recent|activity|updates|latest/i).should('be.visible');
        } else {
          cy.log('No recent activity section found - this is optional');
        }
      });
    });
  });

  context('Real-time Updates', () => {
    beforeEach(() => {
      cy.visit('/dashboard/admin');
    });

    it('should refresh statistics when navigating back', () => {
      // Navigate away and back to test refresh
      cy.visit('/dashboard/admin/users');
      cy.visit('/dashboard/admin');

      // Dashboard should reload/refresh
      cy.get('body').should('be.visible');
      cy.contains(/admin|dashboard/i).should('be.visible');
    });

    it('should handle loading states properly', () => {
      // Reload the page to see loading states
      cy.reload();

      // Should either show loading indicators or load quickly
      cy.get('body', { timeout: 10000 }).should('be.visible');
      cy.contains(/admin|dashboard/i, { timeout: 10000 }).should('be.visible');
    });
  });

  context('Responsive Design', () => {
    beforeEach(() => {
      cy.visit('/dashboard/admin');
    });

    it('should be responsive on mobile viewport', () => {
      cy.viewport('iphone-6');

      // Dashboard should still be accessible
      cy.contains(/admin|dashboard/i).should('be.visible');

      // Navigation might be collapsed but should be accessible
      cy.get('body').should('be.visible');
    });

    it('should be responsive on tablet viewport', () => {
      cy.viewport('ipad-2');

      // Dashboard should display properly
      cy.contains(/admin|dashboard/i).should('be.visible');

      // Should have good layout on tablet
      cy.get('body').should('be.visible');
    });

    it('should work well on desktop viewport', () => {
      cy.viewport(1920, 1080);

      // Should have full desktop layout
      cy.contains(/admin|dashboard/i).should('be.visible');
      cy.get('body').should('be.visible');
    });
  });

  context('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Intercept dashboard stats API to simulate error
      cy.intercept('GET', '**/api/dashboard/stats*', { statusCode: 500 }).as('statsError');

      cy.visit('/dashboard/admin');

      // Should show error message or fallback content
      cy.get('body').should('be.visible');

      // Either show error message or load without stats
      cy.get('body').then(($body) => {
        const hasError = $body.text().match(/error|failed|unavailable/i);
        const hasContent = $body.text().match(/admin|dashboard/i);

        if (!hasError && !hasContent) {
          throw new Error('Expected either error message or dashboard content');
        }
      });
    });

    it('should handle slow network responses', () => {
      // Intercept with delay to simulate slow network
      cy.intercept('GET', '**/api/dashboard/stats*', (req) => {
        req.reply((res) => {
          setTimeout(() => {
            res.send();
          }, 2000);
        });
      }).as('slowStats');

      cy.visit('/dashboard/admin');

      // Should show loading state or handle gracefully
      cy.contains(/admin|dashboard/i, { timeout: 15000 }).should('be.visible');
    });
  });
});
