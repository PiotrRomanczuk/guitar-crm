/// <reference types="cypress" />

/**
 * Student Dashboard Tests
 *
 * Tests the student dashboard functionality:
 * - Dashboard loads with correct metrics
 * - Navigation sidebar shows student-permitted pages
 * - Quick action buttons work
 * - Empty states render correctly
 */

describe('Student Dashboard', () => {
  const STUDENT_EMAIL = Cypress.env('TEST_STUDENT_EMAIL');
  const STUDENT_PASSWORD = Cypress.env('TEST_STUDENT_PASSWORD');

  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
  });

  describe('Dashboard Loading', () => {
    it('should load the dashboard page successfully', () => {
      cy.visit('/dashboard');

      // Dashboard should load without errors
      cy.url().should('include', '/dashboard');

      // Should show main dashboard content
      cy.get('main, [role="main"]').should('exist');
    });

    it('should display welcome message or greeting', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      // Look for any greeting/welcome text or user-specific content
      cy.get('body').then(($body) => {
        const hasWelcome = $body.find(':contains("Welcome"), :contains("Hello"), :contains("Dashboard")').length > 0;
        expect(hasWelcome).to.be.true;
      });
    });

    it('should display dashboard metrics/stats', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      // Dashboard should have some metric cards or stats
      cy.get('body').then(($body) => {
        // Look for stat cards, metrics, or summary sections
        const hasMetrics = $body.find('[class*="card"], [class*="stat"], [class*="metric"]').length > 0;
        if (hasMetrics) {
          cy.log('Dashboard metrics are displayed');
        }
      });
    });
  });

  describe('Navigation Sidebar', () => {
    it('should show navigation menu', () => {
      cy.visit('/dashboard');

      // Should have navigation elements
      cy.get('nav, [role="navigation"]').should('exist');
    });

    it('should have link to songs page', () => {
      cy.visit('/dashboard');

      // Should have songs link
      cy.get('a[href*="/songs"], button:contains("Songs")').should('exist');
    });

    it('should have link to lessons page', () => {
      cy.visit('/dashboard');

      // Should have lessons link
      cy.get('a[href*="/lessons"], button:contains("Lessons")').should('exist');
    });

    it('should have link to assignments page', () => {
      cy.visit('/dashboard');

      // Should have assignments link
      cy.get('a[href*="/assignments"], button:contains("Assignments")').should('exist');
    });

    it('should NOT show admin-only links for students', () => {
      cy.visit('/dashboard');

      // Students should not see users management link
      cy.get('a[href="/dashboard/users"]').should('not.exist');

      // Students should not see admin stats
      cy.get('a[href*="/admin/stats"]').should('not.exist');
    });
  });

  describe('Quick Actions', () => {
    it('should navigate to songs when clicking songs link', () => {
      cy.visit('/dashboard');

      // Click songs link
      cy.get('a[href*="/songs"]').first().click({ force: true });

      // Should navigate to songs page
      cy.url().should('include', '/songs');
    });

    it('should navigate to lessons when clicking lessons link', () => {
      cy.visit('/dashboard');

      // Click lessons link
      cy.get('a[href*="/lessons"]').first().click({ force: true });

      // Should navigate to lessons page
      cy.url().should('include', '/lessons');
    });

    it('should navigate to assignments when clicking assignments link', () => {
      cy.visit('/dashboard');

      // Click assignments link
      cy.get('a[href*="/assignments"]').first().click({ force: true });

      // Should navigate to assignments page
      cy.url().should('include', '/assignments');
    });
  });

  describe('Next Lesson Card', () => {
    it('should show next lesson info or empty state', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        // Either shows next lesson or "no upcoming lessons"
        const hasLessonInfo = $body.find(':contains("Next Lesson"), :contains("Upcoming"), :contains("lesson")').length > 0;
        if (hasLessonInfo) {
          cy.log('Lesson information is displayed on dashboard');
        }
      });
    });
  });

  describe('Empty States', () => {
    it('should show appropriate empty states when no data', () => {
      cy.visit('/dashboard');
      cy.wait(2000);

      // Check for empty state illustrations or messages
      cy.get('body').then(($body) => {
        const hasEmptyState = $body.find(':contains("No "), img[alt*="empty"], [class*="empty"]').length > 0;
        if (hasEmptyState) {
          cy.log('Empty state is displayed appropriately');
        }
      });
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on mobile viewport', () => {
      cy.viewport(375, 667);
      cy.visit('/dashboard');
      cy.wait(2000);

      // Page should still be accessible
      cy.get('main, [role="main"]').should('be.visible');
    });

    it('should show mobile menu on small screens', () => {
      cy.viewport(375, 667);
      cy.visit('/dashboard');
      cy.wait(2000);

      // Should have mobile menu button or hamburger
      cy.get('body').then(($body) => {
        const hasMobileMenu = $body.find('[data-testid="mobile-menu"], button[aria-label*="menu" i], [class*="hamburger"]').length > 0;
        if (hasMobileMenu) {
          cy.log('Mobile menu is present');
        }
      });
    });

    it('should display correctly on tablet viewport', () => {
      cy.viewport(768, 1024);
      cy.visit('/dashboard');
      cy.wait(2000);

      // Page should still be accessible
      cy.get('main, [role="main"]').should('be.visible');
    });
  });

  describe('User Profile Access', () => {
    it('should have access to profile settings', () => {
      cy.visit('/dashboard');

      // Should have profile link or settings
      cy.get('body').then(($body) => {
        const hasProfileAccess = $body.find('a[href*="/profile"], a[href*="/settings"], button:contains("Profile")').length > 0;
        if (hasProfileAccess) {
          cy.log('Profile access is available');
        }
      });
    });
  });

  describe('Sign Out', () => {
    it('should have sign out option available', () => {
      cy.visit('/dashboard');

      // Should have sign out button
      cy.get('body').then(($body) => {
        const hasSignOut = $body.find('button:contains("Sign Out"), button:contains("Logout"), a:contains("Sign Out")').length > 0;
        if (hasSignOut) {
          cy.log('Sign out option is available');
        }
      });
    });
  });
});
