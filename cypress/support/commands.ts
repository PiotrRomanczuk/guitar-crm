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
