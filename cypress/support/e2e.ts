/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

// You can add global Cypress configuration and
// behavior that modifies Cypress here.

// Add Cypress Testing Library commands
import '@testing-library/cypress/add-commands';
import './commands';

// Mock api-keys to prevent PGRST205 error in CI due to missing migrations
beforeEach(() => {
  cy.intercept('GET', '**/api/api-keys*', {
    statusCode: 200,
    body: [],
  }).as('getApiKeys');
});

// Add a custom login command that uses cy.session for caching
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session(
    [email, password],
    () => {
      cy.visit('/sign-in');
      // Use data-testid selectors that match the SignInForm component
      cy.get('[data-testid="email"]').clear().type(email);
      cy.get('[data-testid="password"]').clear().type(password);
      cy.get('[data-testid="signin-button"]').click();
      // Wait for redirect away from sign-in (goes to / then /dashboard)
      cy.location('pathname', { timeout: 20000 }).should('not.include', '/sign-in');
      // Then verify we end up at dashboard
      cy.location('pathname', { timeout: 10000 }).should(
        'satisfy',
        (path: string) => path === '/' || path.includes('/dashboard')
      );
    },
    {
      validate() {
        // Validate session is still active by checking we can access dashboard
        cy.visit('/dashboard');
        cy.location('pathname', { timeout: 10000 }).should('not.include', '/sign-in');
      },
    }
  );
});

// Declare the login command type
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Login to the application and cache the session
       * @param email User email
       * @param password User password
       */
      login(email: string, password: string): Chainable<void>;
    }
  }
}
