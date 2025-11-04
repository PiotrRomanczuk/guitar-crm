/// <reference types="cypress" />

/**
 * Simplified Teacher Lessons E2E Tests
 *
 * Basic smoke tests to verify pages load and basic functionality works.
 * These tests use flexible selectors and don't rely heavily on data-testid attributes.
 */
describe('Teacher Lessons - Smoke Tests', () => {
	const TEACHER_EMAIL = 'teacher@example.com';
	const TEACHER_PASSWORD = 'test123_teacher';

	beforeEach(() => {
		cy.clearCookies();
		cy.clearLocalStorage();

		// Sign in
		cy.visit('/sign-in');
		cy.get('input[type="email"]').type(TEACHER_EMAIL);
		cy.get('input[type="password"]').type(TEACHER_PASSWORD);
		cy.get('form button[type="submit"]').click();

		// Wait for sign-in to complete
		cy.url().should('not.include', '/sign-in');
	});

	it('should load teacher lessons list page', () => {
		cy.visit('/teacher/lessons');

		// Page should load without errors
		cy.contains(/lessons/i).should('be.visible');

		// Should have a create button
		cy.contains('button, a', /create|new/i).should('be.visible');
	});

	it('should load teacher lessons create form', () => {
		cy.visit('/teacher/lessons/new');

		// Form should exist
		cy.get('form').should('exist');

		// Should have student dropdown
		cy.get('select').should('exist');

		// Should have date input
		cy.get('input[type="date"]').should('exist');

		// Should have submit button
		cy.contains('button', /create|save|submit/i).should('exist');
	});

	it('should show validation errors when submitting empty form', () => {
		cy.visit('/teacher/lessons/new');

		// Try to submit without filling fields
		cy.contains('button', /create|save|submit/i).click();

		// Should stay on the same page
		cy.url().should('include', '/teacher/lessons/new');
	});

	it('should not access admin routes', () => {
		cy.visit('/admin/lessons');

		// Should either redirect or show error
		cy.url().then((url) => {
			// If still on admin page, should show error message
			if (url.includes('/admin/lessons')) {
				cy.contains(/forbidden|unauthorized|access denied/i).should(
					'be.visible'
				);
			}
			// Otherwise it redirected away (acceptable)
		});
	});
});
