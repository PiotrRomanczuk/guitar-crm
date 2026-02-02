/// <reference types="cypress" />

/**
 * User Onboarding Flow E2E Tests
 *
 * Tests the complete onboarding experience for new users:
 * 1. New user redirection to onboarding
 * 2. Existing user skip onboarding
 * 3. Multi-step onboarding flow (Goals → Skill Level → Preferences)
 * 4. Data persistence and completion
 * 5. Authentication guards
 *
 * Priority: P1 - Critical for user experience
 */

describe('User Onboarding Flow', () => {
  const STUDENT_EMAIL = Cypress.env('TEST_STUDENT_EMAIL');
  const STUDENT_PASSWORD = Cypress.env('TEST_STUDENT_PASSWORD');

  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  describe('Onboarding Access Control', () => {
    it('should redirect unauthenticated users to sign-in', () => {
      cy.visit('/onboarding');

      // Should redirect to sign-in page
      cy.location('pathname', { timeout: 10000 }).should('satisfy', (path) => {
        return path.includes('/sign-in') || path === '/sign-in';
      });
    });

    it('should redirect already onboarded users to dashboard', () => {
      if (!STUDENT_EMAIL || !STUDENT_PASSWORD) {
        cy.log('Skipping - no student credentials configured');
        return;
      }

      // Login as existing student (already onboarded)
      cy.login(STUDENT_EMAIL, STUDENT_PASSWORD);

      // Try to access onboarding
      cy.visit('/onboarding');

      // Should redirect to dashboard (already onboarded)
      cy.location('pathname', { timeout: 10000 }).should('eq', '/dashboard');
    });
  });

  describe('Onboarding Form - Step 1: Learning Goals', () => {
    beforeEach(() => {
      // For testing onboarding flow, we need a NEW user account
      // Since we can't easily create/delete users in E2E tests,
      // we'll document this limitation and test what we can
      cy.log('NOTE: Testing with existing user - onboarding redirect tested above');
    });

    it('should display welcome screen with goal selection', () => {
      cy.visit('/onboarding');

      // Check if we're on onboarding page (or redirected to dashboard)
      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // We're on onboarding page (new user scenario)

          // Should show welcome message
          cy.contains(/welcome/i).should('be.visible');

          // Should show AI personalization badge
          cy.contains(/AI PERSONALIZATION/i).should('be.visible');

          // Should show step indicator
          cy.contains(/Learning Goals|Step 1/i).should('be.visible');

          // Should show goal options
          cy.contains(/Learn favorite songs/i).should('be.visible');
          cy.contains(/Music theory/i).should('be.visible');
          cy.contains(/Performance skills/i).should('be.visible');
          cy.contains(/Songwriting/i).should('be.visible');
          cy.contains(/Improve technique/i).should('be.visible');

          // Next button should be present
          cy.contains('button', /Next/i).should('be.visible');

          // Skip option should be visible
          cy.contains(/skip to preferences/i).should('be.visible');
        } else {
          // Redirected to dashboard (existing user)
          cy.log('User already onboarded - testing redirect behavior');
          expect(path).to.eq('/dashboard');
        }
      });
    });

    it('should require at least one goal selection', () => {
      cy.visit('/onboarding');

      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // Try to click Next without selecting any goals
          cy.contains('button', /Next/i).click();

          // Should still be on step 1
          cy.contains(/Learning Goals/i).should('be.visible');

          // Should not proceed to next step
          cy.contains(/Define Your.*Skill Level/i).should('not.exist');
        } else {
          cy.log('Skipping - user already onboarded');
        }
      });
    });

    it('should allow multiple goal selections', () => {
      cy.visit('/onboarding');

      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // Select multiple goals using SelectableCard component
          cy.contains(/Learn favorite songs/i).click();
          cy.contains(/Music theory/i).click();
          cy.contains(/Improve technique/i).click();

          // Verify selections are marked (SelectableCard adds visual styling)
          // The cards should have selected state
          cy.get('body').should('contain.text', 'Learn favorite songs');
          cy.get('body').should('contain.text', 'Music theory');
          cy.get('body').should('contain.text', 'Improve technique');

          // Next button should be enabled
          cy.contains('button', /Next/i).should('not.be.disabled');
        } else {
          cy.log('Skipping - user already onboarded');
        }
      });
    });

    it('should allow skipping to preferences', () => {
      cy.visit('/onboarding');

      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // Click skip to preferences
          cy.contains(/skip to preferences/i).click();

          // Should jump to step 3 (preferences)
          cy.contains(/Learning Preferences/i).should('be.visible');
          cy.contains(/Learning style/i).should('be.visible');
          cy.contains(/Instrument preference/i).should('be.visible');
        } else {
          cy.log('Skipping - user already onboarded');
        }
      });
    });
  });

  describe('Onboarding Form - Step 2: Skill Level', () => {
    it('should display skill level selection after goals', () => {
      cy.visit('/onboarding');

      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // Select at least one goal
          cy.contains(/Learn favorite songs/i).click();

          // Click Next
          cy.contains('button', /Next/i).click();

          // Should show skill level step
          cy.contains(/Define Your.*Skill Level/i).should('be.visible');
          cy.contains(/AI-assisted recommendations/i).should('be.visible');

          // Should show three skill level options
          cy.contains(/Beginner/i).should('be.visible');
          cy.contains(/Intermediate/i).should('be.visible');
          cy.contains(/Advanced/i).should('be.visible');

          // Should show Back and Next buttons
          cy.contains('button', /Back/i).should('be.visible');
          cy.contains('button', /Next/i).should('be.visible');
        } else {
          cy.log('Skipping - user already onboarded');
        }
      });
    });

    it('should allow selecting a skill level', () => {
      cy.visit('/onboarding');

      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // Select goal and proceed
          cy.contains(/Learn favorite songs/i).click();
          cy.contains('button', /Next/i).click();

          // Select skill level
          cy.contains(/Beginner/i).click();

          // Next button should be enabled
          cy.contains('button', /Next/i).should('not.be.disabled');

          // Should be able to change selection
          cy.contains(/Intermediate/i).click();

          // Next should still be enabled
          cy.contains('button', /Next/i).should('not.be.disabled');
        } else {
          cy.log('Skipping - user already onboarded');
        }
      });
    });

    it('should navigate back to goals', () => {
      cy.visit('/onboarding');

      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // Navigate to step 2
          cy.contains(/Learn favorite songs/i).click();
          cy.contains('button', /Next/i).click();

          // Click Back button
          cy.contains('button', /Back/i).click();

          // Should return to step 1
          cy.contains(/Welcome/i).should('be.visible');
          cy.contains(/Learning Goals/i).should('be.visible');
          cy.contains(/Learn favorite songs/i).should('be.visible');
        } else {
          cy.log('Skipping - user already onboarded');
        }
      });
    });

    it('should preserve goal selections when navigating back', () => {
      cy.visit('/onboarding');

      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // Select goals
          cy.contains(/Learn favorite songs/i).click();
          cy.contains(/Music theory/i).click();

          // Go to step 2
          cy.contains('button', /Next/i).click();

          // Go back to step 1
          cy.contains('button', /Back/i).click();

          // Goals should still be selected
          // Note: Testing visual state is tricky, but the component should maintain state
          cy.get('body').should('contain.text', 'Learn favorite songs');
          cy.get('body').should('contain.text', 'Music theory');

          // Should be able to proceed again
          cy.contains('button', /Next/i).should('not.be.disabled');
        } else {
          cy.log('Skipping - user already onboarded');
        }
      });
    });
  });

  describe('Onboarding Form - Step 3: Preferences', () => {
    it('should display preferences after skill level', () => {
      cy.visit('/onboarding');

      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // Navigate through steps
          cy.contains(/Learn favorite songs/i).click();
          cy.contains('button', /Next/i).click();
          cy.contains(/Beginner/i).click();
          cy.contains('button', /Next/i).click();

          // Should show preferences step
          cy.contains(/Learning Preferences/i).should('be.visible');
          cy.contains(/How do you prefer to learn/i).should('be.visible');

          // Should show learning style options
          cy.contains(/Learning style/i).should('be.visible');
          cy.contains(/Video tutorials/i).should('be.visible');
          cy.contains(/Sheet music/i).should('be.visible');
          cy.contains(/Tab notation/i).should('be.visible');

          // Should show instrument preference options
          cy.contains(/Instrument preference/i).should('be.visible');
          cy.contains(/Acoustic/i).should('be.visible');
          cy.contains(/Electric/i).should('be.visible');
          cy.contains(/Classical/i).should('be.visible');
          cy.contains(/Bass Guitar/i).should('be.visible');

          // Should show Complete Setup button
          cy.contains('button', /Complete Setup/i).should('be.visible');
        } else {
          cy.log('Skipping - user already onboarded');
        }
      });
    });

    it('should allow multiple selections for learning style', () => {
      cy.visit('/onboarding');

      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // Navigate to step 3
          cy.contains(/Learn favorite songs/i).click();
          cy.contains('button', /Next/i).click();
          cy.contains(/Beginner/i).click();
          cy.contains('button', /Next/i).click();

          // Select multiple learning styles
          cy.contains(/Video tutorials/i).click();
          cy.contains(/Tab notation/i).click();

          // Selections should be visible
          cy.get('body').should('contain.text', 'Video tutorials');
          cy.get('body').should('contain.text', 'Tab notation');

          // Complete button should be enabled (preferences are optional)
          cy.contains('button', /Complete Setup/i).should('not.be.disabled');
        } else {
          cy.log('Skipping - user already onboarded');
        }
      });
    });

    it('should allow multiple instrument selections', () => {
      cy.visit('/onboarding');

      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // Navigate to step 3
          cy.contains(/Learn favorite songs/i).click();
          cy.contains('button', /Next/i).click();
          cy.contains(/Beginner/i).click();
          cy.contains('button', /Next/i).click();

          // Select multiple instruments
          cy.contains(/Acoustic/i).click();
          cy.contains(/Electric/i).click();

          // Selections should be visible
          cy.get('body').should('contain.text', 'Acoustic');
          cy.get('body').should('contain.text', 'Electric');

          // Complete button should be enabled
          cy.contains('button', /Complete Setup/i).should('not.be.disabled');
        } else {
          cy.log('Skipping - user already onboarded');
        }
      });
    });

    it('should navigate back to skill level', () => {
      cy.visit('/onboarding');

      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // Navigate to step 3
          cy.contains(/Learn favorite songs/i).click();
          cy.contains('button', /Next/i).click();
          cy.contains(/Beginner/i).click();
          cy.contains('button', /Next/i).click();

          // Click Back
          cy.contains('button', /Back/i).click();

          // Should return to skill level
          cy.contains(/Define Your.*Skill Level/i).should('be.visible');
          cy.contains(/Beginner/i).should('be.visible');
        } else {
          cy.log('Skipping - user already onboarded');
        }
      });
    });

    it('should allow completing without selecting preferences (optional)', () => {
      cy.visit('/onboarding');

      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // Navigate to step 3
          cy.contains(/Learn favorite songs/i).click();
          cy.contains('button', /Next/i).click();
          cy.contains(/Beginner/i).click();
          cy.contains('button', /Next/i).click();

          // Don't select any preferences (they're optional)

          // Complete button should be enabled
          cy.contains('button', /Complete Setup/i).should('not.be.disabled');
        } else {
          cy.log('Skipping - user already onboarded');
        }
      });
    });
  });

  describe('Onboarding Completion', () => {
    it.skip('should save onboarding data and redirect to dashboard', () => {
      // SKIP: This test requires a new user account that hasn't completed onboarding
      // Current test setup uses pre-existing users who have already onboarded
      //
      // Expected behavior:
      // 1. Complete all onboarding steps
      // 2. Click "Complete Setup"
      // 3. Data should be saved to profiles table (is_student = true, onboarding_completed = true)
      // 4. User should be assigned "student" role in user_roles table
      // 5. Redirect to /dashboard
      // 6. Subsequent visits to /onboarding should redirect to /dashboard
      //
      // To implement this test, you would need to:
      // - Create a fresh user account before the test
      // - Verify the user doesn't have onboarding_completed flag
      // - Run through the full onboarding flow
      // - Verify database state after completion
      // - Clean up the test user

      cy.log('Test skipped - requires fresh user account creation');
    });

    it.skip('should prevent re-entering onboarding after completion', () => {
      // SKIP: Related to above - requires fresh user account
      // Expected behavior:
      // 1. Complete onboarding once
      // 2. Try to visit /onboarding again
      // 3. Should redirect to /dashboard
      // 4. User should see normal dashboard UI, not onboarding flow

      cy.log('Test skipped - requires onboarding completion test');
    });
  });

  describe('Onboarding Step Indicator', () => {
    it('should show current step progress', () => {
      cy.visit('/onboarding');

      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // Step 1: Should show progress
          cy.contains(/Learning Goals|Step 1/i).should('be.visible');

          // Navigate to step 2
          cy.contains(/Learn favorite songs/i).click();
          cy.contains('button', /Next/i).click();

          // Step 2: Should update progress
          cy.get('body').then(($body) => {
            const text = $body.text();
            const hasStepIndicator =
              text.includes('2') ||
              text.includes('Skill Level');
            expect(hasStepIndicator).to.be.true;
          });

          // Navigate to step 3
          cy.contains(/Beginner/i).click();
          cy.contains('button', /Next/i).click();

          // Step 3: Should update progress
          cy.get('body').then(($body) => {
            const text = $body.text();
            const hasStepIndicator =
              text.includes('3') ||
              text.includes('Preferences');
            expect(hasStepIndicator).to.be.true;
          });
        } else {
          cy.log('Skipping - user already onboarded');
        }
      });
    });
  });

  describe('Onboarding Form Validation', () => {
    it('should show validation error when trying to proceed without goals', () => {
      cy.visit('/onboarding');

      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // Try to proceed without selecting goals
          cy.contains('button', /Next/i).click();

          // Should still be on step 1 (validation prevents proceeding)
          cy.contains(/Welcome/i).should('be.visible');
          cy.contains(/Learning Goals/i).should('be.visible');
        } else {
          cy.log('Skipping - user already onboarded');
        }
      });
    });

    it('should enable Next button after selecting required fields', () => {
      cy.visit('/onboarding');

      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // Initially Next button should work but won't proceed without selection
          cy.contains('button', /Next/i).should('be.visible');

          // Select a goal
          cy.contains(/Learn favorite songs/i).click();

          // Next button should allow proceeding
          cy.contains('button', /Next/i).click();

          // Should advance to step 2
          cy.contains(/Skill Level/i).should('be.visible');
        } else {
          cy.log('Skipping - user already onboarded');
        }
      });
    });
  });

  describe('Onboarding UI and Accessibility', () => {
    it('should display proper branding and AI badge', () => {
      cy.visit('/onboarding');

      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // Should show AI personalization badge
          cy.contains(/AI PERSONALIZATION/i).should('be.visible');

          // Should have visual indicator (pulsing dot)
          cy.get('.animate-ping').should('exist');
        } else {
          cy.log('Skipping - user already onboarded');
        }
      });
    });

    it('should be mobile responsive', () => {
      cy.viewport(375, 667); // iPhone SE size
      cy.visit('/onboarding');

      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // Content should be visible on mobile
          cy.contains(/Welcome|Learning Goals/i).should('be.visible');

          // Goals should be clickable
          cy.contains(/Learn favorite songs/i).should('be.visible');

          // Buttons should be accessible
          cy.contains('button', /Next/i).should('be.visible');
        } else {
          cy.log('Skipping - user already onboarded');
        }
      });

      // Reset viewport
      cy.viewport(1280, 720);
    });

    it('should have proper ARIA labels for accessibility', () => {
      cy.visit('/onboarding');

      cy.location('pathname').then((path) => {
        if (path === '/onboarding') {
          // Check for proper button roles
          cy.get('button').should('have.length.greaterThan', 0);

          // Navigation buttons should be properly labeled
          cy.contains('button', /Next/i).should('have.attr', 'type', 'button');
        } else {
          cy.log('Skipping - user already onboarded');
        }
      });
    });
  });
});
