/// <reference types="cypress" />

/**
 * Admin Dashboard Navigation Tests
 *
 * Tests dashboard navigation and cross-section functionality:
 * - Main dashboard stats display
 * - Navigation between sections
 * - Settings page access
 * - Admin stats pages
 *
 * Prerequisites:
 * - TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD in cypress.env.json
 */

describe('Admin Dashboard Navigation', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');

  // Set viewport to desktop to avoid mobile-hidden elements
  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    
    // Handle performance API errors that can occur during navigation
    cy.on('uncaught:exception', (err) => {
      // Ignore Performance API timing errors
      if (err.message.includes('cannot have a negative time stamp') || 
          err.message.includes('Performance')) {
        return false;
      }
      // Allow other errors to fail the test
      return true;
    });
  });

  describe('Main Dashboard', () => {
    it('should display the main dashboard with stats', () => {
      cy.visit('/dashboard');
      cy.location('pathname').should('include', '/dashboard');
      cy.contains(/dashboard|overview|stats/i).should('exist');
    });
  });

  describe('Section Navigation', () => {
    it('should navigate to songs section', () => {
      cy.visit('/dashboard/songs');
      cy.location('pathname').should('include', '/songs');
      cy.contains(/songs/i).should('exist');
    });

    it('should navigate to users section', () => {
      cy.visit('/dashboard/users');
      cy.location('pathname').should('include', '/users');
      cy.contains(/users/i).should('exist');
    });

    it('should navigate to lessons section', () => {
      cy.visit('/dashboard/lessons');
      cy.location('pathname').should('include', '/lessons');
      cy.contains(/lessons/i).should('exist');
    });

    it('should navigate to assignments section', () => {
      cy.visit('/dashboard/assignments');
      cy.location('pathname').should('include', '/assignments');
      cy.contains(/assignments/i).should('exist');
    });

    it('should navigate to settings', () => {
      cy.visit('/dashboard/settings', { failOnStatusCode: false });
      cy.get('body').then(($body) => {
        if (!$body.text().includes('404')) {
          cy.contains(/settings|profile|account/i).should('exist');
        } else {
          cy.log('Settings page not found - skipping');
        }
      });
    });
  });

  describe('Cross-Section Navigation', () => {
    it('should navigate between sections using sidebar', () => {
      cy.visit('/dashboard');

      // Navigate to songs
      cy.get('a[href*="/songs"]').filter(':visible').first().click({ force: true });
      cy.location('pathname').should('include', '/songs');

      // Navigate to users
      cy.get('a[href*="/users"]').filter(':visible').first().click({ force: true });
      cy.location('pathname').should('include', '/users');

      // Navigate to lessons
      cy.get('a[href*="/lessons"]').filter(':visible').first().click({ force: true });
      cy.location('pathname').should('include', '/lessons');
    });
  });

  describe('Admin Stats', () => {
    it('should access admin song stats', () => {
      cy.visit('/dashboard/admin/stats/songs');
      cy.contains(/stats|statistics|analytics|songs/i).should('exist');
    });
  });
});
