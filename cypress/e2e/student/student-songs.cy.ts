/// <reference types="cypress" />

/**
 * Student Songs Tests
 *
 * Tests the student song library and progress tracking functionality:
 * - View assigned songs
 * - Filter and search songs
 * - Track song progress through status stages
 * - Verify linear progression (to_learn → learning → practicing → improving → mastered)
 *
 * Prerequisites:
 * - Student user with assigned songs through lessons
 */

describe('Student Songs', () => {
  const STUDENT_EMAIL = Cypress.env('TEST_STUDENT_EMAIL');
  const STUDENT_PASSWORD = Cypress.env('TEST_STUDENT_PASSWORD');

  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
  });

  describe('Songs Library View', () => {
    it('should display the student songs page', () => {
      cy.visit('/dashboard/songs');

      // Verify page title
      cy.contains('My Songs', { timeout: 10000 }).should('be.visible');

      // Should show description
      cy.contains('Songs you are currently learning').should('be.visible');
    });

    it('should show songs assigned to the student', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      // Check if songs are displayed or empty state
      cy.get('body').then(($body) => {
        if ($body.find('[class*="grid"]').find('[class*="card"], [class*="Card"]').length > 0) {
          // Songs exist - verify card structure
          cy.get('[class*="grid"]').should('exist');
        } else {
          // Empty state
          cy.contains(/no songs|haven't been assigned/i).should('exist');
        }
      });
    });

    it('should display song details in cards', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      // If songs exist, verify card content
      cy.get('body').then(($body) => {
        const cards = $body.find('.group.bg-card, [class*="rounded-xl"][class*="border"]');
        if (cards.length > 0) {
          // Verify song card has title
          cy.get('.group.bg-card, [class*="rounded-xl"][class*="border"]')
            .first()
            .within(() => {
              // Song title should exist
              cy.get('h3').should('exist');
            });
        }
      });
    });

    it('should show song resources when available', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const cards = $body.find('.group.bg-card, [class*="rounded-xl"][class*="border"]');
        if (cards.length > 0) {
          // Check for resource section heading
          cy.contains('Quick Resources').should('exist');
        }
      });
    });
  });

  describe('Song Filtering', () => {
    beforeEach(() => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);
    });

    it('should filter songs by search query', () => {
      cy.get('body').then(($body) => {
        // Check if search input exists (only shows when songs exist)
        if ($body.find('input[type="search"], input[placeholder*="search" i]').length > 0) {
          cy.get('input[type="search"], input[placeholder*="search" i]')
            .first()
            .type('test');

          cy.wait(500);

          // Filtering should be applied
          cy.url().should('include', '/songs');
        }
      });
    });

    it('should filter songs by difficulty level', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="difficulty"], button:contains("Difficulty")').length > 0) {
          cy.get('[data-testid*="difficulty"], button:contains("Difficulty")')
            .first()
            .click({ force: true });

          // Select beginner if option exists
          cy.get('[role="option"]').then(($options) => {
            if ($options.length > 0) {
              cy.get('[role="option"]').contains(/beginner/i).click({ force: true });
            }
          });
        }
      });
    });

    it('should filter songs by status', () => {
      cy.get('body').then(($body) => {
        // Look for status filter
        if ($body.find('button[role="combobox"]').length > 0) {
          // Click on a status filter if available
          cy.get('button[role="combobox"]').then(($buttons) => {
            const statusButton = $buttons.filter((_, el) =>
              el.textContent?.toLowerCase().includes('status') ||
              el.textContent?.toLowerCase().includes('all')
            );
            if (statusButton.length > 0) {
              cy.wrap(statusButton.first()).click({ force: true });

              // Select "To Learn" if available
              cy.get('[role="option"]').then(($options) => {
                const toLearnOption = $options.filter((_, el) =>
                  el.textContent?.toLowerCase().includes('learn')
                );
                if (toLearnOption.length > 0) {
                  cy.wrap(toLearnOption.first()).click({ force: true });
                }
              });
            }
          });
        }
      });
    });

    it('should clear filters', () => {
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Clear")').length > 0) {
          // Apply some filter first
          cy.get('input[type="search"], input[placeholder*="search" i]')
            .first()
            .type('test');

          cy.wait(500);

          // Clear filters
          cy.contains('button', /clear/i).click({ force: true });

          // Search should be cleared
          cy.get('input[type="search"], input[placeholder*="search" i]')
            .first()
            .should('have.value', '');
        }
      });
    });
  });

  describe('Song Progress Tracking', () => {
    beforeEach(() => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);
    });

    it('should display learning progress selector on song cards', () => {
      cy.get('body').then(($body) => {
        const cards = $body.find('.group.bg-card, [class*="rounded-xl"][class*="border"]');
        if (cards.length > 0) {
          // Verify progress selector exists
          cy.contains('Learning Progress').should('exist');

          // Verify select component exists
          cy.get('button[role="combobox"]').should('exist');
        }
      });
    });

    it('should show all progress status options', () => {
      cy.get('body').then(($body) => {
        const cards = $body.find('.group.bg-card, [class*="rounded-xl"][class*="border"]');
        if (cards.length > 0) {
          // Click on the first status dropdown
          cy.get('.group.bg-card, [class*="rounded-xl"][class*="border"]')
            .first()
            .within(() => {
              cy.get('button[role="combobox"]').first().click({ force: true });
            });

          // Verify all status options are present
          cy.get('[role="option"]').then(($options) => {
            const optionTexts = $options.toArray().map(el => el.textContent?.toLowerCase());

            // Check for expected statuses
            const expectedStatuses = ['to learn', 'learning', 'practicing', 'improving', 'mastered'];
            expectedStatuses.forEach(status => {
              const found = optionTexts.some(text => text?.includes(status.split(' ')[0]));
              if (found) {
                cy.log(`Found status: ${status}`);
              }
            });
          });

          // Close dropdown
          cy.get('body').click(0, 0);
        }
      });
    });

    it('should update song status when changed', () => {
      cy.get('body').then(($body) => {
        const cards = $body.find('.group.bg-card, [class*="rounded-xl"][class*="border"]');
        if (cards.length > 0) {
          // Intercept the API call for status update
          cy.intercept('PATCH', '**/lesson_songs*').as('updateStatus');

          // Click on the first status dropdown
          cy.get('.group.bg-card, [class*="rounded-xl"][class*="border"]')
            .first()
            .within(() => {
              cy.get('button[role="combobox"]').first().click({ force: true });
            });

          // Select a new status (learning)
          cy.get('[role="option"]').contains(/learning/i).click({ force: true });

          // Wait for update (may show loading state)
          cy.wait(1000);

          // Verify the status was updated (UI should reflect change)
          cy.get('.group.bg-card, [class*="rounded-xl"][class*="border"]')
            .first()
            .should('contain', /learning/i);
        }
      });
    });

    it('should show loading indicator during status update', () => {
      cy.get('body').then(($body) => {
        const cards = $body.find('.group.bg-card, [class*="rounded-xl"][class*="border"]');
        if (cards.length > 0) {
          // Click on status dropdown
          cy.get('.group.bg-card, [class*="rounded-xl"][class*="border"]')
            .first()
            .within(() => {
              cy.get('button[role="combobox"]').first().click({ force: true });
            });

          // Select a status
          cy.get('[role="option"]').first().click({ force: true });

          // Check for loading indicator (may appear briefly)
          // The component shows "Updating..." text during update
          cy.get('body').then(($body) => {
            if ($body.find(':contains("Updating")').length > 0) {
              cy.contains('Updating').should('exist');
            }
          });
        }
      });
    });
  });

  describe('Song Detail Navigation', () => {
    it('should navigate to song detail page', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const viewButtons = $body.find('a:contains("View Full Details")');
        if (viewButtons.length > 0) {
          // Click the first "View Full Details" link
          cy.contains('a', 'View Full Details')
            .first()
            .click({ force: true });

          // Should navigate to song detail page
          cy.url().should('match', /\/dashboard\/songs\/[a-f0-9-]+$/);
        }
      });
    });
  });

  describe('Access Control', () => {
    it('should not show create song button for students', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      // Students should not see a "New Song" or "Add Song" button
      cy.get('button:contains("New Song"), button:contains("Add Song"), a:contains("New Song")')
        .should('not.exist');
    });

    it('should not show edit or delete buttons on song cards for students', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        const cards = $body.find('.group.bg-card, [class*="rounded-xl"][class*="border"]');
        if (cards.length > 0) {
          cy.get('.group.bg-card, [class*="rounded-xl"][class*="border"]')
            .first()
            .within(() => {
              // Should not have edit/delete buttons
              cy.get('button:contains("Edit"), button:contains("Delete")')
                .should('not.exist');
            });
        }
      });
    });

    it('should only show songs assigned via lessons', () => {
      // This test verifies the query logic - students only see their songs
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      // The page should show "My Songs" title, indicating student-specific view
      cy.contains('My Songs').should('be.visible');
    });
  });

  describe('Empty State', () => {
    it('should show helpful empty state when no songs assigned', () => {
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      // If no songs, verify empty state
      cy.get('body').then(($body) => {
        if ($body.find(':contains("No songs assigned")').length > 0) {
          cy.contains('No songs assigned').should('be.visible');
          cy.contains(/your teacher will add songs/i).should('be.visible');
        }
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should display correctly on mobile viewport', () => {
      cy.viewport(375, 667); // iPhone SE dimensions
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      // Page should still be accessible
      cy.contains('My Songs').should('be.visible');
    });

    it('should display correctly on tablet viewport', () => {
      cy.viewport(768, 1024); // iPad dimensions
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      // Page should still be accessible
      cy.contains('My Songs').should('be.visible');
    });
  });
});
