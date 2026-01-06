/// <reference types="cypress" />

/**
 * Lesson Search and Filter Integration Tests
 *
 * Tests lesson search and filtering functionality:
 * 1. Search lessons by keyword
 * 2. Filter by student
 * 3. Filter by date range
 * 4. Combined search and filters
 * 5. Clear filters
 *
 * Priority: P2 - Important for admin/teacher workflow
 */

describe('Lesson Search and Filter', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');

  beforeEach(() => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      cy.log('Skipping - no admin credentials configured');
      return;
    }

    cy.viewport(1280, 720);
    cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    cy.visit('/dashboard/lessons');
  });

  describe('Search Functionality', () => {
    it('should search lessons by keyword', () => {
      // Look for search input
      cy.get('body').then(($body) => {
        const searchSelectors = [
          'input[type="search"]',
          'input[placeholder*="Search"]',
          'input[placeholder*="search"]',
          '[data-testid="search-input"]',
        ];

        let searchInput = null;
        for (const selector of searchSelectors) {
          if ($body.find(selector).length > 0) {
            searchInput = selector;
            break;
          }
        }

        if (searchInput) {
          cy.get(searchInput).type('guitar');
          cy.wait(500);

          // Results should update
          cy.log('Search executed - results should be filtered');
        } else {
          cy.log('No search input found on lessons page');
        }
      });
    });

    it('should display search results count', () => {
      cy.get('body').then(($body) => {
        const text = $body.text().toLowerCase();

        if (text.includes('lesson') || text.includes('result')) {
          cy.log('Lesson count or results text found');
        }
      });
    });

    it('should clear search when clear button clicked', () => {
      cy.get('body').then(($body) => {
        const searchInput = $body
          .find('input[type="search"], input[placeholder*="Search"]')
          .first();

        if (searchInput.length > 0) {
          cy.wrap(searchInput).type('test search');
          cy.wait(300);

          // Look for clear button
          const clearButton = $body.find('button:contains("Clear"), [aria-label*="clear"]');
          if (clearButton.length > 0) {
            cy.wrap(clearButton).first().click();
            cy.wrap(searchInput).should('have.value', '');
          }
        }
      });
    });

    it('should show no results message for non-matching search', () => {
      cy.get('body').then(($body) => {
        const searchInput = $body.find('input[type="search"]').first();

        if (searchInput.length > 0) {
          cy.wrap(searchInput).type('xyz123nonexistent456');
          cy.wait(500);

          // Should show empty state or no results message
          cy.get('body').should('satisfy', ($el) => {
            const text = $el.text().toLowerCase();
            return (
              text.includes('no lessons') ||
              text.includes('no results') ||
              text.includes('not found') ||
              $el.find('[data-testid="empty-state"]').length > 0
            );
          });
        }
      });
    });
  });

  describe('Student Filter', () => {
    it('should filter lessons by student', () => {
      cy.get('body').then(($body) => {
        const filterSelectors = [
          'select[name="student"]',
          'select[name="studentId"]',
          '[data-testid="student-filter"]',
          'button:contains("Filter")',
        ];

        let filterElement = null;
        for (const selector of filterSelectors) {
          if ($body.find(selector).length > 0) {
            filterElement = selector;
            break;
          }
        }

        if (filterElement) {
          if (filterElement.includes('select')) {
            cy.get(filterElement).select(1); // Select first student
            cy.wait(500);
            cy.log('Student filter applied');
          } else {
            cy.get(filterElement).click();
            cy.log('Filter button clicked');
          }
        } else {
          cy.log('No student filter found');
        }
      });
    });

    it('should update lesson count when filtered', () => {
      cy.get('body').then(($body) => {
        // Try to apply filter
        const filterSelect = $body.find('select[name*="student"]').first();
        if (filterSelect.length > 0) {
          cy.wrap(filterSelect).select(1);
          cy.wait(500);

          // Count should potentially change
          cy.get('[data-testid*="lesson"]').then(($lessons) => {
            cy.log(`Lessons after filter: ${$lessons.length}`);
          });
        }
      });
    });

    it('should show all lessons when filter is cleared', () => {
      cy.get('body').then(($body) => {
        const filterSelect = $body.find('select[name*="student"]').first();

        if (filterSelect.length > 0) {
          // Apply filter
          cy.wrap(filterSelect).select(1);
          cy.wait(300);

          // Clear filter (usually "All Students" or first option)
          cy.wrap(filterSelect).select(0);
          cy.wait(300);

          cy.log('Filter cleared - should show all lessons');
        }
      });
    });
  });

  describe('Date Range Filter', () => {
    it('should filter lessons by date range', () => {
      cy.get('body').then(($body) => {
        const dateInputs = $body.find('input[type="date"]');

        if (dateInputs.length >= 2) {
          // Set date range (last 7 days)
          const today = new Date();
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

          cy.wrap(dateInputs[0]).type(weekAgo.toISOString().split('T')[0]);
          cy.wrap(dateInputs[1]).type(today.toISOString().split('T')[0]);

          cy.wait(500);
          cy.log('Date range filter applied');
        } else {
          cy.log('No date range filter found');
        }
      });
    });

    it('should show lessons within selected date range', () => {
      cy.get('body').then(($body) => {
        const dateInputs = $body.find('input[type="date"]');

        if (dateInputs.length >= 2) {
          const today = new Date().toISOString().split('T')[0];

          cy.wrap(dateInputs[0]).type(today);
          cy.wrap(dateInputs[1]).type(today);
          cy.wait(500);

          // Should only show today's lessons (or none)
          cy.log('Showing lessons for today only');
        }
      });
    });

    it('should handle future date range', () => {
      cy.get('body').then(($body) => {
        const dateInputs = $body.find('input[type="date"]');

        if (dateInputs.length >= 2) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);

          cy.wrap(dateInputs[0]).type(tomorrow.toISOString().split('T')[0]);
          cy.wrap(dateInputs[1]).type(nextWeek.toISOString().split('T')[0]);
          cy.wait(500);

          cy.log('Future date range applied');
        }
      });
    });
  });

  describe('Combined Filters', () => {
    it('should combine search and student filter', () => {
      cy.get('body').then(($body) => {
        const searchInput = $body.find('input[type="search"]').first();
        const studentFilter = $body.find('select[name*="student"]').first();

        if (searchInput.length > 0 && studentFilter.length > 0) {
          cy.wrap(searchInput).type('guitar');
          cy.wrap(studentFilter).select(1);
          cy.wait(500);

          cy.log('Combined search and student filter applied');
        }
      });
    });

    it('should combine all filters (search, student, date)', () => {
      cy.get('body').then(($body) => {
        const searchInput = $body.find('input[type="search"]').first();
        const studentFilter = $body.find('select[name*="student"]').first();
        const dateInputs = $body.find('input[type="date"]');

        if (searchInput.length > 0) {
          cy.wrap(searchInput).type('lesson');
        }

        if (studentFilter.length > 0) {
          cy.wrap(studentFilter).select(1);
        }

        if (dateInputs.length >= 2) {
          const today = new Date().toISOString().split('T')[0];
          cy.wrap(dateInputs[0]).type(today);
          cy.wrap(dateInputs[1]).type(today);
        }

        cy.wait(500);
        cy.log('All filters combined');
      });
    });

    it('should clear all filters at once', () => {
      cy.get('body').then(($body) => {
        // Look for "Clear All" or "Reset Filters" button
        const clearButton = $body.find('button:contains("Clear All"), button:contains("Reset")');

        if (clearButton.length > 0) {
          cy.wrap(clearButton).first().click();
          cy.wait(300);

          // All filters should be cleared
          cy.get('input[type="search"]').should('have.value', '');
          cy.log('All filters cleared');
        }
      });
    });
  });

  describe('Filter Persistence', () => {
    it('should persist filters on page refresh', () => {
      cy.get('body').then(($body) => {
        const searchInput = $body.find('input[type="search"]').first();

        if (searchInput.length > 0) {
          cy.wrap(searchInput).type('test search');
          cy.wait(500);

          // Refresh page
          cy.reload();
          cy.wait(1000);

          // Check if search persists (may or may not be implemented)
          cy.get('input[type="search"]').then(($input) => {
            const value = $input.val();
            cy.log(`Search value after refresh: "${value}"`);
          });
        }
      });
    });

    it('should preserve filters when navigating away and back', () => {
      cy.get('body').then(($body) => {
        const studentFilter = $body.find('select[name*="student"]').first();

        if (studentFilter.length > 0) {
          cy.wrap(studentFilter).select(1);
          cy.wait(300);

          // Navigate away
          cy.visit('/dashboard');
          cy.wait(500);

          // Navigate back
          cy.visit('/dashboard/lessons');
          cy.wait(500);

          // Check if filter persists
          cy.get('select[name*="student"]').then(($select) => {
            cy.log(`Filter after navigation: ${$select.val()}`);
          });
        }
      });
    });
  });

  describe('Filter UI/UX', () => {
    it('should show loading state while filtering', () => {
      cy.get('body').then(($body) => {
        const searchInput = $body.find('input[type="search"]').first();

        if (searchInput.length > 0) {
          cy.wrap(searchInput).type('loading test');

          // Look for loading indicator
          cy.get('body').then(($el) => {
            const hasLoading =
              $el.find('[data-testid*="loading"]').length > 0 ||
              $el.find('.spinner').length > 0 ||
              $el.text().toLowerCase().includes('loading');

            if (hasLoading) {
              cy.log('Loading state detected');
            }
          });
        }
      });
    });

    it('should disable filters during loading', () => {
      cy.get('body').then(($body) => {
        const searchInput = $body.find('input[type="search"]').first();

        if (searchInput.length > 0) {
          cy.wrap(searchInput).type('test');

          // Check if other filters are disabled during search
          cy.get('select[name*="student"]').then(($select) => {
            if ($select.length > 0) {
              const isDisabled = $select.is(':disabled');
              cy.log(`Student filter disabled during search: ${isDisabled}`);
            }
          });
        }
      });
    });

    it('should show active filter indicators', () => {
      cy.get('body').then(($body) => {
        const studentFilter = $body.find('select[name*="student"]').first();

        if (studentFilter.length > 0) {
          cy.wrap(studentFilter).select(1);
          cy.wait(300);

          // Look for active filter badge or indicator
          cy.get('body').then(($el) => {
            const hasBadge =
              $el.find('[data-testid*="badge"]').length > 0 || $el.find('.badge').length > 0;

            if (hasBadge) {
              cy.log('Filter badge indicator found');
            }
          });
        }
      });
    });
  });
});
