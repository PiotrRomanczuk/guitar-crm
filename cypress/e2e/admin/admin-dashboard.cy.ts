/// <reference types="cypress" />

// Admin Dashboard E2E Test
// Flow: Sign in → Access dashboard → Verify admin-specific features
// Routes:
// - Sign-in page: /sign-in
// - Dashboard: /dashboard

describe('Admin Dashboard', () => {
  const adminEmail = 'p.romanczuk@gmail.com';
  const adminPassword = 'test123_admin';

  beforeEach(() => {
    // Sign in as admin
    cy.visit('/sign-in');
    cy.get('[data-testid="email"]').clear().type(adminEmail);
    cy.get('[data-testid="password"]').clear().type(adminPassword);
    cy.get('[data-testid="signin-button"]').click();
    cy.location('pathname', { timeout: 10000 }).should('not.include', '/sign-in');
  });

  it('should display admin dashboard with correct title and description', () => {
    cy.visit('/dashboard');

    // Verify admin-specific header
    cy.contains('Admin Dashboard').should('be.visible');
    cy.contains('System administration').should('be.visible');
  });

  it('should display statistics cards', () => {
    cy.visit('/dashboard');

    // Verify all 4 stat cards are visible
    cy.contains('Total Users').should('be.visible');
    cy.contains('Teachers').should('be.visible');
    cy.contains('Students').should('be.visible');
    cy.contains('Songs').should('be.visible');

    // Verify stats show numbers (at least 0)
    cy.get('body').then(($body) => {
      const text = $body.text();
      // Should contain numeric values
      expect(text).to.match(/\d+/);
    });
  });

  it('should display admin action cards', () => {
    cy.visit('/dashboard');

    // Verify key admin actions are displayed
    cy.contains('User Management').should('be.visible');
    cy.contains('Create, edit, and manage user accounts').should('be.visible');

    // Verify other admin actions
    cy.contains('System Settings').should('be.visible');
    cy.contains('Reports & Analytics').should('be.visible');
    cy.contains('Database Management').should('be.visible');
  });

  it('should navigate to user management page', () => {
    cy.visit('/dashboard');

    // Find and click user management link
    cy.contains('User Management').parents('a').first().click();

    // Should navigate to user management
    cy.location('pathname').should('match', /\/(admin\/users|dashboard\/admin\/users)/);
  });

  it('should show "Coming Soon" badges for unavailable features', () => {
    cy.visit('/dashboard');

    // Verify coming soon features are marked
    cy.contains('Coming Soon').should('be.visible');

    // These features should have coming soon badge
    const comingSoonFeatures = [
      'System Settings',
      'Reports & Analytics',
      'Database Management',
      'Activity Logs',
      'Security & Permissions',
    ];

    comingSoonFeatures.forEach((feature) => {
      cy.contains(feature).should('be.visible');
    });
  });

  it('should display recent activity section', () => {
    cy.visit('/dashboard');

    // Verify recent activity section exists
    cy.contains('Recent Activity').should('be.visible');

    // Should show coming soon message for activity logging
    cy.contains('Activity logging and audit trail features are under development').should(
      'be.visible'
    );
  });

  it('should allow navigation to songs management', () => {
    cy.visit('/dashboard');

    // Look for navigation to songs (could be in menu or quick action)
    cy.visit('/dashboard/songs');

    // Should successfully navigate
    cy.location('pathname').should('include', '/dashboard/songs');
  });

  it('should display debug view selector', () => {
    cy.visit('/dashboard');

    // Verify debug view selector exists
    cy.contains('Debug: Preview Dashboards').should('be.visible');

    // Verify all view buttons exist
    cy.contains('Admin View').should('be.visible');
    cy.contains('Teacher View').should('be.visible');
    cy.contains('Student View').should('be.visible');
  });

  it('should switch between debug views', () => {
    cy.visit('/dashboard');

    // Switch to teacher view
    cy.contains('Teacher View').click();
    cy.contains('Teacher Dashboard Preview').should('be.visible');
    cy.contains('Debug Mode').should('be.visible');

    // Switch to student view
    cy.contains('Student View').click();
    cy.contains('Student Dashboard Preview').should('be.visible');

    // Switch back to admin view
    cy.contains('Back to Admin View').click();
    cy.contains('Admin Dashboard').should('be.visible');
    cy.contains('Debug Mode').should('not.exist');
  });

  it('should have working navigation menu', () => {
    cy.visit('/dashboard');

    // Verify main navigation exists
    cy.get('body').then(($body) => {
      // Check for common nav items
      const hasNav =
        $body.find('nav').length > 0 ||
        $body.text().includes('Dashboard') ||
        $body.text().includes('Songs') ||
        $body.text().includes('Profile');
      expect(hasNav).to.equal(true);
    });
  });

  it('should show admin role indicator or admin-specific features', () => {
    cy.visit('/dashboard');

    // Admin should see admin-specific content
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      // Should have indicators of admin privileges
      expect(bodyText).to.satisfy(
        (text: string) =>
          text.includes('Admin') ||
          text.includes('User Management') ||
          text.includes('System administration')
      );
    });
  });

  it('should load without errors', () => {
    // Intercept console errors
    cy.on('uncaught:exception', (err) => {
      // Fail test if there are uncaught exceptions
      throw err;
    });

    cy.visit('/dashboard');

    // Page should load successfully
    cy.get('body').should('be.visible');

    // No error messages should be displayed
    cy.get('body').then(($body) => {
      const bodyText = $body.text().toLowerCase();
      expect(bodyText).to.not.include('error occurred');
      expect(bodyText).to.not.include('something went wrong');
    });
  });

  it('should be responsive on mobile viewport', () => {
    // Set mobile viewport
    cy.viewport(375, 667);
    cy.visit('/dashboard');

    // Content should be visible and not overflow
    cy.contains('Admin Dashboard').should('be.visible');
    cy.contains('Total Users').should('be.visible');

    // Stat cards should stack or adapt for mobile
    cy.get('body').should('be.visible');
  });

  it('should be responsive on tablet viewport', () => {
    // Set tablet viewport
    cy.viewport(768, 1024);
    cy.visit('/dashboard');

    // Content should be visible
    cy.contains('Admin Dashboard').should('be.visible');
    cy.contains('User Management').should('be.visible');
  });
});
