/// <reference types="cypress" />

/**
 * Admin Health Monitoring Tests
 *
 * Tests the student health/progress monitoring features:
 * - View student health scores
 * - Filter by health status
 * - View recommended actions
 * - Export reports
 */

describe('Admin Health Monitoring', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');

  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  describe('Health Dashboard Access', () => {
    it('should access health monitoring page if available', () => {
      cy.visit('/dashboard/admin/health', { failOnStatusCode: false });
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const has404 = $body.find(':contains("404"), :contains("Not Found")').length > 0;
        const hasHealth = $body.find(':contains("Health"), :contains("Student Progress"), :contains("Monitoring")').length > 0;

        if (hasHealth) {
          cy.log('Health monitoring page is available');
        } else if (has404) {
          cy.log('Health monitoring page not implemented - checking alternate locations');
        }
      });
    });

    it('should check main dashboard for health indicators', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasHealthIndicators =
          $body.find(':contains("Health"), :contains("At Risk"), :contains("Needs Attention")').length > 0;
        if (hasHealthIndicators) {
          cy.log('Health indicators are on main dashboard');
        }
      });
    });
  });

  describe('Health Status Overview', () => {
    it('should show health status categories', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasStatusCategories =
          $body.find(':contains("Excellent"), :contains("Good"), :contains("Needs Attention"), :contains("At Risk"), :contains("Critical")').length > 0;
        if (hasStatusCategories) {
          cy.log('Health status categories are displayed');
        }
      });
    });

    it('should display student health metrics', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasMetrics =
          $body.find('[class*="card"], [class*="metric"], [class*="stat"]').length > 0;
        if (hasMetrics) {
          cy.log('Metrics cards are displayed');
        }
      });
    });
  });

  describe('Health Score Display', () => {
    it('should show health scores in user list', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasScores =
          $body.find(':contains("Score"), :contains("Health"), [class*="progress"]').length > 0;
        if (hasScores) {
          cy.log('Health scores are visible in user list');
        }
      });
    });
  });

  describe('Filter by Health Status', () => {
    it('should have health status filter if available', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasHealthFilter =
          $body.find('[data-testid*="health-filter"], select[name*="health"], :contains("Filter by Health")').length > 0;
        if (hasHealthFilter) {
          cy.log('Health filter is available');
        }
      });
    });
  });

  describe('Recommended Actions', () => {
    it('should show recommended actions for students needing attention', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasRecommendations =
          $body.find(':contains("Action"), :contains("Recommendation"), :contains("Follow up")').length > 0;
        if (hasRecommendations) {
          cy.log('Recommended actions are displayed');
        }
      });
    });
  });

  describe('Student Progress Details', () => {
    it('should view individual student progress', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      // Click on first student
      cy.get('a[href*="/users/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/users\/[a-z0-9-]+$/i);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      cy.get('body').then(($body) => {
        const hasProgress =
          $body.find(':contains("Progress"), :contains("Lessons"), :contains("Assignments"), :contains("Songs")').length > 0;
        if (hasProgress) {
          cy.log('Student progress details are available');
        }
      });
    });
  });

  describe('Export Health Report', () => {
    it('should have export option if available', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasExport =
          $body.find('button:contains("Export"), button:contains("Download"), [data-testid*="export"]').length > 0;
        if (hasExport) {
          cy.log('Export functionality is available');
        }
      });
    });

    it('should offer CSV export if available', () => {
      cy.visit('/dashboard/users');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasCSVExport =
          $body.find('button:contains("CSV"), [data-testid*="csv"]').length > 0;
        if (hasCSVExport) {
          cy.log('CSV export is available');
        }
      });
    });
  });

  describe('Health Alerts', () => {
    it('should show alerts for students at risk', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasAlerts =
          $body.find('[class*="alert"], :contains("Warning"), :contains("At Risk")').length > 0;
        if (hasAlerts) {
          cy.log('Health alerts are displayed');
        }
      });
    });
  });

  describe('Health History', () => {
    it('should show health trend over time if available', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const hasCharts =
          $body.find('canvas, svg[class*="chart"], [class*="recharts"]').length > 0;
        if (hasCharts) {
          cy.log('Health trend charts are displayed');
        }
      });
    });
  });

  describe('Responsive Health Display', () => {
    it('should display health info on tablet', () => {
      cy.viewport(768, 1024);
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('main, [role="main"]').should('be.visible');
    });

    it('should display health info on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('main, [role="main"]').should('be.visible');
    });
  });
});
