// Cypress journey helpers
// NOTE: Keep helpers tiny and UI-driven; avoid direct API auth to emulate real user flows.

export function signIn(email: string, password: string) {
	cy.visit('/sign-in');

	cy.findByLabelText(/email address/i).type(email);
	cy.findByLabelText(/password/i).type(password);

	// Find the submit button specifically (not the header button)
	cy.get('form')
		.findByRole('button', { name: /sign in/i })
		.click();

	// Wait for potential redirects; sign-in page navigates to '/'
	cy.location('pathname', { timeout: 10000 }).should((path) => {
		expect(path).to.not.equal('/sign-in');
	});
}

export function interceptLessonsApi() {
	cy.intercept('GET', '/api/lessons*').as('getLessons');
	cy.intercept('POST', '/api/lessons').as('createLesson');
	cy.intercept('GET', '/api/lessons/*').as('getLessonById');
	cy.intercept('PATCH', '/api/lessons/*').as('updateLesson');
	cy.intercept('DELETE', '/api/lessons/*').as('deleteLesson');
}
