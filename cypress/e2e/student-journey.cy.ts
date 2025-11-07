/**
 * E2E tests for Student user journey
 * Uses development credentials from development_credentials.txt
 */

describe('Student User Journey', () => {
	const studentUser = {
		email: 'student@example.com',
		password: 'test123_student',
		role: 'Student',
	};

	beforeEach(() => {
		// Start from home page (not logged in)
		cy.visit('/');
	});

	it('should complete full journey: not logged in -> login -> songs list', () => {
		// Step 1: Verify not logged in
		cy.contains(/sign in/i, { timeout: 5000 }).should('be.visible');

		// Step 2: Navigate to sign in page
		cy.visit('/sign-in');
		cy.contains('p', /sign in to your account/i).should('be.visible');

		// Step 3: Login as student
		cy.get('input[type="email"]').type(studentUser.email);
		cy.get('input[type="password"]').type(studentUser.password);
		cy.get('button[type="submit"]').click();

		// Step 4: Verify successful login
		cy.url({ timeout: 10000 }).should('not.include', '/sign-in');
		cy.contains(studentUser.email, { timeout: 10000 }).should('be.visible');

		// Step 5: Navigate to songs list
		cy.visit('/songs');

		// Step 6: Verify songs page loaded
		cy.url().should('include', '/songs');

		// Wait for loading to complete
		cy.get('[data-testid="song-list-loading"]', { timeout: 1000 }).should(
			'not.exist'
		);

		cy.contains(/songs|song library/i, { timeout: 10000 }).should('be.visible');

		// Step 7: Verify student has read-only access
		// Students should NOT see create button
		cy.contains('button', 'Create new song').should('not.exist');
	});

	it('should be able to view songs list or empty state', () => {
		// Login
		cy.visit('/sign-in');
		cy.get('input[type="email"]').type(studentUser.email);
		cy.get('input[type="password"]').type(studentUser.password);
		cy.get('button[type="submit"]').click();
		cy.contains(studentUser.email, { timeout: 10000 }).should('be.visible');

		// Navigate to songs
		cy.visit('/songs');
		cy.url().should('include', '/songs');

		// Wait for loading to complete
		cy.get('[data-testid="song-list-loading"]', { timeout: 2000 }).should(
			'not.exist'
		);

		// Verify songs table or empty state displays
		cy.get('body').then(($body) => {
			if ($body.find('table').length > 0) {
				cy.contains('th', 'Title').should('be.visible');
				cy.contains('th', 'Author').should('be.visible');
			} else {
				// Empty state is acceptable
				cy.contains(/no songs|empty/i).should('be.visible');
			}
		});
	});

	it('should NOT show create button (role-based access)', () => {
		// Login as student
		cy.visit('/sign-in');
		cy.get('input[type="email"]').type(studentUser.email);
		cy.get('input[type="password"]').type(studentUser.password);
		cy.get('button[type="submit"]').click();

		// Wait for login
		cy.contains(studentUser.email, { timeout: 10000 }).should('be.visible');

		// Navigate to songs
		cy.visit('/songs');

		// Wait for loading
		cy.get('[data-testid="song-list-loading"]', { timeout: 2000 }).should(
			'not.exist'
		);

		// Student should NOT see create button
		cy.contains('button', 'Create new song').should('not.exist');
	});

	it('should redirect unauthenticated users trying to access songs', () => {
		// Try to access songs without logging in
		cy.visit('/songs');

		// Should either:
		// 1. Redirect to sign-in
		// 2. Show "Unauthorized" message
		// 3. Stay on page but show login prompt
		cy.url().then((url) => {
			if (url.includes('/sign-in')) {
				// Redirected to sign-in
				cy.contains(/sign in/i).should('be.visible');
			} else {
				// Stayed on page, check for unauthorized message
				cy.get('body').should(
					'contain.text',
					/unauthorized|not authorized|please.*sign in|login.*required/i
				);
			}
		});
	});

	it('should maintain login after page reload', () => {
		// Login
		cy.visit('/sign-in');
		cy.get('input[type="email"]').type(studentUser.email);
		cy.get('input[type="password"]').type(studentUser.password);
		cy.get('button[type="submit"]').click();
		cy.contains(studentUser.email, { timeout: 10000 }).should('be.visible');

		// Navigate to songs
		cy.visit('/songs');
		cy.url().should('include', '/songs');

		// Reload the page
		cy.reload();

		// Should still be on songs page and logged in
		cy.url().should('include', '/songs');
		cy.contains(/songs/i, { timeout: 10000 }).should('be.visible');
	});
});
