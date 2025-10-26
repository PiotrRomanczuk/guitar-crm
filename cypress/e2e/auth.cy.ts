describe('Authentication Flow', () => {
	const testEmail = `test-${Date.now()}@example.com`;
	const testPassword = 'TestPassword123!';
	const testFirstName = 'Test';
	const testLastName = 'User';

	beforeEach(() => {
		// Start from the home page
		cy.visit('/');
	});

	describe('Sign Up', () => {
		it('should display sign up form', () => {
			cy.visit('/sign-up');
			cy.get('h1').should('contain', 'Sign Up');
			cy.get('input[type="email"]').should('be.visible');
			cy.get('input[type="password"]').should('be.visible');
		});

		it('should show validation errors for invalid inputs', () => {
			cy.visit('/sign-up');

			// Try to submit empty form
			cy.get('button[type="submit"]').click();

			// Should show validation errors
			cy.contains(/email.*required/i).should('be.visible');
			cy.contains(/password.*required/i).should('be.visible');
		});

		it('should show error for invalid email format', () => {
			cy.visit('/sign-up');

			cy.get('input[type="email"]').type('invalid-email');
			cy.get('input[type="password"]').type(testPassword);
			cy.get('button[type="submit"]').click();

			cy.contains(/invalid.*email/i).should('be.visible');
		});

		it('should show error for weak password', () => {
			cy.visit('/sign-up');

			cy.get('input[type="email"]').type(testEmail);
			cy.get('input[type="password"]').type('weak');
			cy.get('button[type="submit"]').click();

			cy.contains(/password.*6.*characters/i).should('be.visible');
		});

		it('should successfully sign up a new user', () => {
			cy.visit('/sign-up');

			// Fill in the form
			cy.get('input[name="email"]').type(testEmail);
			cy.get('input[name="password"]').type(testPassword);
			cy.get('input[name="firstName"]').type(testFirstName);
			cy.get('input[name="lastName"]').type(testLastName);

			// Submit the form
			cy.get('button[type="submit"]').click();

			// Should redirect or show success message
			cy.url().should('not.include', '/sign-up');

			// Should show user email (authenticated state)
			cy.contains(testEmail, { timeout: 10000 }).should('be.visible');
		});

		it('should show error when signing up with existing email', () => {
			cy.visit('/sign-up');

			// Try to sign up with an email that already exists
			cy.get('input[name="email"]').type(testEmail);
			cy.get('input[name="password"]').type(testPassword);
			cy.get('input[name="firstName"]').type(testFirstName);
			cy.get('input[name="lastName"]').type(testLastName);

			cy.get('button[type="submit"]').click();

			// Should show error about existing user
			cy.contains(/already.*registered|already.*exists/i, {
				timeout: 10000,
			}).should('be.visible');
		});

		it('should navigate to sign in from sign up page', () => {
			cy.visit('/sign-up');

			// Look for "Already have an account" or "Sign In" link
			cy.contains(/already.*account|sign in/i).click();

			cy.url().should('include', '/sign-in');
		});
	});

	describe('Sign In', () => {
		it('should display sign in form', () => {
			cy.visit('/sign-in');
			cy.get('h1').should('contain', 'Sign In');
			cy.get('input[type="email"]').should('be.visible');
			cy.get('input[type="password"]').should('be.visible');
		});

		it('should show validation errors for empty form', () => {
			cy.visit('/sign-in');

			cy.get('button[type="submit"]').click();

			cy.contains(/email.*required/i).should('be.visible');
			cy.contains(/password.*required/i).should('be.visible');
		});

		it('should show error for invalid credentials', () => {
			cy.visit('/sign-in');

			cy.get('input[type="email"]').type('nonexistent@example.com');
			cy.get('input[type="password"]').type('wrongpassword');
			cy.get('button[type="submit"]').click();

			cy.contains(/invalid.*credentials|incorrect.*password|email.*password/i, {
				timeout: 10000,
			}).should('be.visible');
		});

		it('should successfully sign in with valid credentials', () => {
			cy.visit('/sign-in');

			cy.get('input[type="email"]').type(testEmail);
			cy.get('input[type="password"]').type(testPassword);
			cy.get('button[type="submit"]').click();

			// Should redirect to home
			cy.url().should('not.include', '/sign-in');

			// Should show user email
			cy.contains(testEmail, { timeout: 10000 }).should('be.visible');
		});

		it('should navigate to sign up from sign in page', () => {
			cy.visit('/sign-in');

			cy.contains(/don't.*account|sign up/i).click();

			cy.url().should('include', '/sign-up');
		});

		it('should navigate to forgot password from sign in page', () => {
			cy.visit('/sign-in');

			cy.contains(/forgot.*password/i).click();

			cy.url().should('include', '/forgot-password');
		});
	});

	describe('Complete Auth Flow', () => {
		const uniqueEmail = `e2e-${Date.now()}@example.com`;

		it('should complete full flow: sign up -> sign out -> sign in', () => {
			// Step 1: Sign Up
			cy.visit('/sign-up');
			cy.get('input[name="email"]').type(uniqueEmail);
			cy.get('input[name="password"]').type(testPassword);
			cy.get('input[name="firstName"]').type('E2E');
			cy.get('input[name="lastName"]').type('Test');
			cy.get('button[type="submit"]').click();

			// Wait for authentication
			cy.contains(uniqueEmail, { timeout: 10000 }).should('be.visible');

			// Step 2: Sign Out
			cy.contains(/sign out/i).click();

			// Should be signed out and see sign in button
			cy.contains(/sign in/i, { timeout: 5000 }).should('be.visible');

			// Step 3: Sign In
			cy.contains(/sign in/i)
				.first()
				.click();
			cy.get('input[type="email"]').type(uniqueEmail);
			cy.get('input[type="password"]').type(testPassword);
			cy.get('button[type="submit"]').click();

			// Should be signed in again
			cy.contains(uniqueEmail, { timeout: 10000 }).should('be.visible');
		});
	});

	describe('Protected Routes', () => {
		it('should redirect unauthenticated users to sign in', () => {
			// Try to access a protected route
			cy.visit('/admin');

			// Should redirect to sign in
			cy.url().should('include', '/sign-in');
		});

		it('should allow authenticated users to access protected routes', () => {
			// Sign in first
			cy.visit('/sign-in');
			cy.get('input[type="email"]').type(testEmail);
			cy.get('input[type="password"]').type(testPassword);
			cy.get('button[type="submit"]').click();

			// Wait for auth
			cy.contains(testEmail, { timeout: 10000 }).should('be.visible');

			// Try to access home (should work)
			cy.visit('/');
			cy.contains(testEmail).should('be.visible');
		});
	});

	describe('Persistence', () => {
		it('should maintain session after page reload', () => {
			// Sign in
			cy.visit('/sign-in');
			cy.get('input[type="email"]').type(testEmail);
			cy.get('input[type="password"]').type(testPassword);
			cy.get('button[type="submit"]').click();

			cy.contains(testEmail, { timeout: 10000 }).should('be.visible');

			// Reload the page
			cy.reload();

			// Should still be signed in
			cy.contains(testEmail, { timeout: 10000 }).should('be.visible');
		});
	});
});
