describe('Guitar CRM - Smoke', () => {
	it('loads the home page', () => {
		cy.visit('/');
		cy.contains('Guitar CRM');
		cy.contains('Student Management System');
	});
});
