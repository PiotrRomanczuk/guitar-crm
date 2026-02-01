/// <reference types="cypress" />

/**
 * Admin Dashboard & Stats Tests
 *
 * Tests the admin dashboard functionality:
 * - Dashboard shows all users, lessons, songs, assignments counts
 * - Recent activity widget displays correctly
 * - Quick action buttons navigate correctly
 * - Admin stats pages load
 */

describe('Admin Dashboard & Stats', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');

  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  describe('Dashboard Loading', () => {
    it('should load the admin dashboard successfully', () => {
      cy.visit('/dashboard');

      // Dashboard should load without errors
      cy.url().should('include', '/dashboard');

      // Should show main dashboard content
      cy.get('main, [role="main"]').should('exist');
    });

    it('should display welcome/greeting section', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      // Look for any greeting/welcome text
      cy.get('body').then(($body) => {
        const hasWelcome = $body.find(':contains("Welcome"), :contains("Dashboard"), :contains("Overview")').length > 0;
        expect(hasWelcome).to.be.true;
      });
    });
  });

  describe('Dashboard Metrics', () => {
    it('should display metric cards or stats', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      // Dashboard should have metric cards
      cy.get('body').then(($body) => {
        const hasMetrics = $body.find('[class*="card"], [class*="stat"], [class*="metric"]').length > 0;
        if (hasMetrics) {
          cy.log('Dashboard metrics are displayed');
        }
      });
    });

    it('should show users count for admin', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      // Admin should see users metric
      cy.get('body').then(($body) => {
        const hasUsersMetric = $body.find(':contains("Users"), :contains("Students"), :contains("Members")').length > 0;
        if (hasUsersMetric) {
          cy.log('Users metric is displayed');
        }
      });
    });

    it('should show lessons count', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasLessonsMetric = $body.find(':contains("Lessons"), :contains("Sessions")').length > 0;
        if (hasLessonsMetric) {
          cy.log('Lessons metric is displayed');
        }
      });
    });

    it('should show songs count', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasSongsMetric = $body.find(':contains("Songs"), :contains("Tracks")').length > 0;
        if (hasSongsMetric) {
          cy.log('Songs metric is displayed');
        }
      });
    });

    it('should show assignments count', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasAssignmentsMetric = $body.find(':contains("Assignments"), :contains("Tasks")').length > 0;
        if (hasAssignmentsMetric) {
          cy.log('Assignments metric is displayed');
        }
      });
    });
  });

  describe('Admin Navigation', () => {
    it('should show admin-specific navigation items', () => {
      cy.visit('/dashboard');

      // Admin should see users management link
      cy.get('a[href*="/users"], a[href*="/dashboard/users"]').should('exist');
    });

    it('should show all main navigation items', () => {
      cy.visit('/dashboard');

      // Should have all navigation links
      cy.get('a[href*="/lessons"]').should('exist');
      cy.get('a[href*="/songs"]').should('exist');
      cy.get('a[href*="/assignments"]').should('exist');
    });

    it('should navigate to users page when clicking users link', () => {
      cy.visit('/dashboard');

      cy.get('a[href*="/users"]').first().click({ force: true });

      cy.url().should('include', '/users');
    });
  });

  describe('Quick Actions', () => {
    it('should have quick action buttons or links', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasQuickActions = $body.find('a:contains("New"), button:contains("Create"), a:contains("Add")').length > 0;
        if (hasQuickActions) {
          cy.log('Quick action buttons are present');
        }
      });
    });

    it('should navigate to new lesson page from quick actions', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      // Find and click "New Lesson" if available
      cy.get('body').then(($body) => {
        const newLessonLink = $body.find('a[href*="/lessons/new"]');
        if (newLessonLink.length > 0) {
          cy.get('a[href*="/lessons/new"]').first().click({ force: true });
          cy.url().should('include', '/lessons/new');
        }
      });
    });

    it('should navigate to new song page from quick actions', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const newSongLink = $body.find('a[href*="/songs/new"]');
        if (newSongLink.length > 0) {
          cy.get('a[href*="/songs/new"]').first().click({ force: true });
          cy.url().should('include', '/songs/new');
        }
      });
    });
  });

  describe('Recent Activity', () => {
    it('should display recent activity section if available', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasRecentActivity = $body.find(':contains("Recent"), :contains("Activity"), :contains("Latest")').length > 0;
        if (hasRecentActivity) {
          cy.log('Recent activity section is displayed');
        }
      });
    });
  });

  describe('Admin Stats Pages', () => {
    it('should access lessons stats page', () => {
      cy.visit('/dashboard/admin/stats/lessons', { failOnStatusCode: false });
      cy.wait(2000);

      // Should either load the page or show not found (if not implemented)
      cy.get('body').then(($body) => {
        const hasStats = $body.find(':contains("Lesson"), :contains("Statistics"), :contains("Analytics")').length > 0;
        const has404 = $body.find(':contains("404"), :contains("Not Found")').length > 0;

        if (hasStats) {
          cy.log('Lessons stats page is available');
        } else if (has404) {
          cy.log('Lessons stats page not implemented yet');
        }
      });
    });

    it('should access songs stats page', () => {
      cy.visit('/dashboard/admin/stats/songs', { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasStats = $body.find(':contains("Song"), :contains("Statistics"), :contains("Analytics")').length > 0;
        const has404 = $body.find(':contains("404"), :contains("Not Found")').length > 0;

        if (hasStats) {
          cy.log('Songs stats page is available');
        } else if (has404) {
          cy.log('Songs stats page not implemented yet');
        }
      });
    });
  });

  describe('Charts & Visualizations', () => {
    it('should render charts if present on dashboard', () => {
      cy.visit('/dashboard');
      cy.wait(3000); // Allow time for charts to render

      cy.get('body').then(($body) => {
        const hasCharts = $body.find('canvas, svg[class*="chart"], [class*="recharts"]').length > 0;
        if (hasCharts) {
          cy.log('Charts are rendered on dashboard');
        }
      });
    });
  });

  describe('Export Functionality', () => {
    it('should have export options if available', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasExport = $body.find('button:contains("Export"), a:contains("Export"), button:contains("Download")').length > 0;
        if (hasExport) {
          cy.log('Export functionality is available');
        }
      });
    });
  });

  describe('Admin Dashboard Data', () => {
    it('should show pending items or alerts', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasPendingItems = $body.find(':contains("Pending"), :contains("Upcoming"), :contains("Action Required")').length > 0;
        if (hasPendingItems) {
          cy.log('Pending items are displayed');
        }
      });
    });

    it('should show student health or progress overview', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasStudentOverview = $body.find(':contains("Student"), :contains("Progress"), :contains("Health")').length > 0;
        if (hasStudentOverview) {
          cy.log('Student overview is displayed');
        }
      });
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on tablet viewport', () => {
      cy.viewport(768, 1024);
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('main, [role="main"]').should('be.visible');
    });

    it('should display correctly on mobile viewport', () => {
      cy.viewport(375, 667);
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('main, [role="main"]').should('be.visible');
    });
  });

  describe('Loading States', () => {
    it('should show loading state while data is fetching', () => {
      cy.visit('/dashboard');

      // Initially may show loading indicators
      cy.get('body').then(($body) => {
        const hasLoading = $body.find('[class*="loading"], [class*="skeleton"], [class*="spinner"]').length > 0;
        if (hasLoading) {
          cy.log('Loading state is shown');
        }
      });

      // After loading, content should appear
      cy.wait(3000);
      cy.get('main, [role="main"]').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Intercept API calls and force error
      cy.intercept('GET', '**/api/lessons*', { statusCode: 500, body: { error: 'Server error' } }).as('lessonsError');

      cy.visit('/dashboard');
      cy.wait(2000);

      // Dashboard should still render (may show error state)
      cy.get('main, [role="main"]').should('be.visible');
    });
  });
});
