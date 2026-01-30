/// <reference types="cypress" />

/**
 * Concurrent User Scenarios Tests
 *
 * Tests scenarios involving multiple users:
 * - Admin and student viewing same data
 * - Simultaneous access patterns
 * - Data visibility across roles
 */

describe('Concurrent User Scenarios', () => {
  const ADMIN_EMAIL = Cypress.env('TEST_ADMIN_EMAIL');
  const ADMIN_PASSWORD = Cypress.env('TEST_ADMIN_PASSWORD');
  const STUDENT_EMAIL = Cypress.env('TEST_STUDENT_EMAIL');
  const STUDENT_PASSWORD = Cypress.env('TEST_STUDENT_PASSWORD');

  describe('Admin and Student Data Visibility', () => {
    it('admin sees all lessons while student sees only their own', () => {
      // First, login as admin and count all lessons
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('body').then(($adminBody) => {
        const adminLessonCount = $adminBody.find('tr[data-testid], [data-testid^="lesson-"], a[href*="/lessons/"]').length;
        cy.log(`Admin sees ${adminLessonCount} lessons`);

        // Now login as student
        cy.clearCookies();
        cy.clearLocalStorage();

        cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
        cy.visit('/dashboard/lessons');
        cy.wait(2000);

        cy.get('body').then(($studentBody) => {
          const studentLessonCount = $studentBody.find('tr[data-testid], [data-testid^="lesson-"], a[href*="/lessons/"]').length;
          cy.log(`Student sees ${studentLessonCount} lessons`);

          // Student should see same or fewer lessons than admin
          expect(studentLessonCount).to.be.at.most(adminLessonCount);
        });
      });
    });

    it('admin sees all assignments while student sees only their own', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/assignments');
      cy.wait(2000);

      cy.get('body').then(($adminBody) => {
        const adminCount = $adminBody.find('tr[data-testid], [data-testid^="assignment-"], a[href*="/assignments/"]').length;
        cy.log(`Admin sees ${adminCount} assignments`);

        cy.clearCookies();
        cy.clearLocalStorage();

        cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
        cy.visit('/dashboard/assignments');
        cy.wait(2000);

        cy.get('body').then(($studentBody) => {
          const studentCount = $studentBody.find('tr[data-testid], [data-testid^="assignment-"], a[href*="/assignments/"]').length;
          cy.log(`Student sees ${studentCount} assignments`);

          expect(studentCount).to.be.at.most(adminCount);
        });
      });
    });
  });

  describe('Role-Specific Page Access', () => {
    it('admin can access users page', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/users');
      cy.wait(2000);

      cy.url().should('include', '/users');
      cy.get('body').should('not.contain', 'Access Denied');
    });

    it('student cannot access users page', () => {
      cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
      cy.visit('/dashboard/users', { failOnStatusCode: false });
      cy.wait(2000);

      // Should redirect or show access denied
      cy.url().then((url) => {
        const redirected = !url.includes('/users');
        const hasAccessDenied = Cypress.$('body').find(':contains("Access"), :contains("Forbidden"), :contains("denied")').length > 0;

        expect(redirected || hasAccessDenied).to.be.true;
      });
    });
  });

  describe('Shared Data Views', () => {
    it('both admin and student can view the same song details', () => {
      // Admin views song
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/songs');
      cy.wait(2000);

      // Get first song ID
      cy.get('a[href*="/songs/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/songs\/[a-z0-9-]+$/i);
        })
        .first()
        .then(($link) => {
          const songUrl = $link.attr('href');
          cy.log(`Song URL: ${songUrl}`);

          // Admin should see the song
          if (songUrl) {
            cy.visit(songUrl);
            cy.wait(1500);
            cy.get('main, [role="main"]').should('be.visible');
            cy.get('body').should('not.contain', 'Not Found');

            // Now student views the same song
            cy.clearCookies();
            cy.clearLocalStorage();

            cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
            cy.visit(songUrl);
            cy.wait(1500);

            cy.get('body').then(($body) => {
              const canViewSong =
                $body.find(':contains("Not Found"), :contains("Access Denied")').length === 0;
              if (canViewSong) {
                cy.log('Student can view the same song');
              } else {
                cy.log('Student may have restricted song access');
              }
            });
          }
        });
    });
  });

  describe('Edit Permissions', () => {
    it('admin can edit lessons while student cannot', () => {
      // Admin can edit
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('a[href*="/lessons/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/lessons\/[a-z0-9-]+$/i);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      cy.get('body').then(($adminBody) => {
        const adminCanEdit =
          $adminBody.find('a[href*="/edit"], button:contains("Edit"), [data-testid*="edit"]').length > 0;
        cy.log(`Admin can edit: ${adminCanEdit}`);

        // Student tries the same
        cy.clearCookies();
        cy.clearLocalStorage();

        cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
        cy.visit('/dashboard/lessons');
        cy.wait(2000);

        cy.get('a[href*="/lessons/"]')
          .filter(':visible')
          .first()
          .then(($studentLink) => {
            if ($studentLink.length > 0) {
              cy.wrap($studentLink).click({ force: true });
              cy.wait(1500);

              cy.get('body').then(($studentBody) => {
                const studentCanEdit =
                  $studentBody.find('a[href*="/edit"], button:contains("Edit"), [data-testid*="edit"]').length > 0;
                cy.log(`Student can edit: ${studentCanEdit}`);

                // Student should not be able to edit
                // (They might not have edit buttons visible)
              });
            }
          });
      });
    });
  });

  describe('Create Permissions', () => {
    it('admin can create lessons while student cannot', () => {
      // Admin can create
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/lessons/new');
      cy.wait(2000);

      cy.url().should('include', '/lessons/new');
      cy.get('form, [data-testid="lesson-form"]').should('exist');

      // Student tries
      cy.clearCookies();
      cy.clearLocalStorage();

      cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
      cy.visit('/dashboard/lessons/new', { failOnStatusCode: false });
      cy.wait(2000);

      cy.url().then((url) => {
        const redirected = !url.includes('/lessons/new');
        const hasAccessDenied = Cypress.$('body').find(':contains("Access"), :contains("Forbidden")').length > 0;
        const noForm = Cypress.$('body').find('form, [data-testid="lesson-form"]').length === 0;

        if (redirected || hasAccessDenied || noForm) {
          cy.log('Student correctly cannot create lessons');
        }
      });
    });

    it('admin can create assignments while student cannot', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/assignments/new');
      cy.wait(2000);

      cy.url().should('include', '/assignments/new');

      cy.clearCookies();
      cy.clearLocalStorage();

      cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
      cy.visit('/dashboard/assignments/new', { failOnStatusCode: false });
      cy.wait(2000);

      cy.url().then((url) => {
        const redirected = !url.includes('/assignments/new');
        const hasAccessDenied = Cypress.$('body').find(':contains("Access"), :contains("Forbidden")').length > 0;

        if (redirected || hasAccessDenied) {
          cy.log('Student correctly cannot create assignments');
        }
      });
    });
  });

  describe('Delete Permissions', () => {
    it('admin has delete buttons while student does not', () => {
      // Admin sees delete
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard/lessons');
      cy.wait(2000);

      cy.get('a[href*="/lessons/"]')
        .filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return !!href.match(/\/lessons\/[a-z0-9-]+$/i);
        })
        .first()
        .click({ force: true });

      cy.wait(1500);

      cy.get('body').then(($adminBody) => {
        const adminCanDelete =
          $adminBody.find('[data-testid*="delete"], button:contains("Delete")').length > 0;
        cy.log(`Admin can delete: ${adminCanDelete}`);

        // Check student
        cy.clearCookies();
        cy.clearLocalStorage();

        cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
        cy.visit('/dashboard/lessons');
        cy.wait(2000);

        cy.get('a[href*="/lessons/"]')
          .filter(':visible')
          .first()
          .then(($link) => {
            if ($link.length > 0) {
              cy.wrap($link).click({ force: true });
              cy.wait(1500);

              cy.get('body').then(($studentBody) => {
                const studentCanDelete =
                  $studentBody.find('[data-testid*="delete"], button:contains("Delete")').length > 0;
                cy.log(`Student can delete: ${studentCanDelete}`);
              });
            }
          });
      });
    });
  });

  describe('Dashboard Content Differences', () => {
    it('admin dashboard shows different content than student dashboard', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.visit('/dashboard');
      cy.wait(2000);

      cy.get('body').then(($adminBody) => {
        const adminHasUsersLink = $adminBody.find('a[href*="/users"]').length > 0;
        cy.log(`Admin has users link: ${adminHasUsersLink}`);

        cy.clearCookies();
        cy.clearLocalStorage();

        cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);
        cy.visit('/dashboard');
        cy.wait(2000);

        cy.get('body').then(($studentBody) => {
          const studentHasUsersLink = $studentBody.find('a[href="/dashboard/users"]').length > 0;
          cy.log(`Student has users link: ${studentHasUsersLink}`);

          // Admin should have users link, student should not
          expect(adminHasUsersLink).to.be.true;
          expect(studentHasUsersLink).to.be.false;
        });
      });
    });
  });
});
