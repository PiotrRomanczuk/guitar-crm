/// <reference types="cypress" />

// You can add global Cypress configuration and
// behavior that modifies Cypress here.

// Add Cypress Testing Library commands
import '@testing-library/cypress/add-commands';

// Clear Supabase session before each test
beforeEach(() => {
	cy.clearCookies();
	cy.clearLocalStorage();
	
	// Clear Supabase auth from localStorage
	cy.window().then((win) => {
		Object.keys(win.localStorage).forEach((key) => {
			if (key.includes('supabase')) {
				win.localStorage.removeItem(key);
			}
		});
	});
});
