/// <reference types="cypress" />

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Clicks a shadcn/ui checkbox (which is a button with role="checkbox")
       */
      checkShadcn(): Chainable<JQuery<HTMLElement>>;

      /**
       * Unchecks a shadcn/ui checkbox
       */
      uncheckShadcn(): Chainable<JQuery<HTMLElement>>;

      /**
       * Selects an option from a shadcn/ui select component
       * @param optionText The text of the option to select
       */
      selectShadcnOption(optionText: string): Chainable<JQuery<HTMLElement>>;

      // Enhanced testing commands
      // Authentication commands
      login(role?: 'admin' | 'teacher' | 'student'): Chainable<void>;
      logout(): Chainable<void>;

      // Navigation commands
      navigateTo(page: string): Chainable<void>;
      waitForPageLoad(): Chainable<void>;

      // Form interaction commands
      fillForm(data: Record<string, any>): Chainable<void>;
      submitForm(): Chainable<void>;
      clearForm(): Chainable<void>;

      // Data management commands
      createTestStudent(data?: Partial<any>): Chainable<void>;
      createTestLesson(data?: Partial<any>): Chainable<void>;
      createTestSong(data?: Partial<any>): Chainable<void>;

      // Verification commands
      verifyToast(message: string, type?: 'success' | 'error' | 'warning'): Chainable<void>;
      verifyPageTitle(title: string): Chainable<void>;
      verifyTableContains(data: string[]): Chainable<void>;

      // Performance commands
      measurePageLoad(): Chainable<void>;
      checkNoConsoleErrors(): Chainable<void>;
    }
  }
}

export {};

Cypress.Commands.add('checkShadcn', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).click();
  cy.wrap(subject).should('have.attr', 'aria-checked', 'true');
});

Cypress.Commands.add('uncheckShadcn', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).click();
  cy.wrap(subject).should('have.attr', 'aria-checked', 'false');
});

Cypress.Commands.add('selectShadcnOption', { prevSubject: 'element' }, (subject, optionText) => {
  cy.wrap(subject).click();
  cy.get('[role="option"]').contains(optionText).click();
});

// Enhanced Authentication commands
Cypress.Commands.add('login', (role: 'admin' | 'teacher' | 'student' = 'admin') => {
  const credentials = {
    admin: { email: Cypress.env('TEST_ADMIN_EMAIL'), password: Cypress.env('TEST_ADMIN_PASSWORD') },
    teacher: {
      email: Cypress.env('TEST_TEACHER_EMAIL'),
      password: Cypress.env('TEST_TEACHER_PASSWORD'),
    },
    student: {
      email: Cypress.env('TEST_STUDENT_EMAIL'),
      password: Cypress.env('TEST_STUDENT_PASSWORD'),
    },
  };

  const user = credentials[role];

  cy.session(`${role}-session`, () => {
    cy.visit('/auth/signin');
    cy.get('input[name="email"]').type(user.email);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button[type="submit"]').click();

    // Wait for successful login redirect
    cy.url().should('not.include', '/auth/signin');
    cy.url().should('include', '/dashboard');
  });
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('not.include', '/dashboard');
});

// Navigation commands
Cypress.Commands.add('navigateTo', (page: string) => {
  const routes = {
    dashboard: '/dashboard',
    students: '/dashboard/students',
    lessons: '/dashboard/lessons',
    songs: '/dashboard/songs',
    assignments: '/dashboard/assignments',
    settings: '/dashboard/settings',
  };

  const route = routes[page] || page;
  cy.visit(route);
  cy.waitForPageLoad();
});

Cypress.Commands.add('waitForPageLoad', () => {
  // Wait for page to be fully loaded
  cy.get('[data-testid="loading-spinner"]').should('not.exist');
  cy.get('main, [role="main"]').should('be.visible');
});

// Form interaction commands
Cypress.Commands.add('fillForm', (data: Record<string, any>) => {
  Object.entries(data).forEach(([field, value]) => {
    if (value !== null && value !== undefined) {
      cy.get(`[name="${field}"], [data-testid="${field}"]`).then(($el) => {
        const tagName = $el.prop('tagName').toLowerCase();
        const inputType = $el.attr('type');

        if (tagName === 'select') {
          cy.wrap($el).select(value.toString());
        } else if (inputType === 'checkbox' || inputType === 'radio') {
          if (value) {
            cy.wrap($el).check();
          } else {
            cy.wrap($el).uncheck();
          }
        } else {
          cy.wrap($el).clear().type(value.toString());
        }
      });
    }
  });
});

Cypress.Commands.add('submitForm', () => {
  cy.get('button[type="submit"], [data-testid="submit-button"]').click();
});

Cypress.Commands.add('clearForm', () => {
  cy.get('form input, form textarea, form select').each(($el) => {
    const tagName = $el.prop('tagName').toLowerCase();
    if (tagName === 'input' || tagName === 'textarea') {
      cy.wrap($el).clear();
    }
  });
});

// Verification commands
Cypress.Commands.add(
  'verifyToast',
  (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    cy.get(`[data-testid="toast-${type}"]`).should('contain.text', message);
    cy.get(`[data-testid="toast-${type}"]`).should('not.exist', { timeout: 10000 });
  }
);

Cypress.Commands.add('verifyPageTitle', (title: string) => {
  cy.get('h1, [data-testid="page-title"]').should('contain.text', title);
});

Cypress.Commands.add('verifyTableContains', (data: string[]) => {
  data.forEach((item) => {
    cy.get('table, [data-testid="data-table"]').should('contain.text', item);
  });
});

// Performance commands
Cypress.Commands.add('measurePageLoad', () => {
  cy.window().then((win) => {
    const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
    cy.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).to.be.lessThan(3000); // Page should load in under 3 seconds
  });
});

Cypress.Commands.add('checkNoConsoleErrors', () => {
  cy.window().then((win) => {
    const errors = win.console.error;
    expect(errors).to.be.undefined;
  });
});
