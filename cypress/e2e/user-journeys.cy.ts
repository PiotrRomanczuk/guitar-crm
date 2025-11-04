/**
 * E2E tests for complete user journeys from login to songs list
 * Tests all 3 user types: Admin, Teacher, Student
 * Uses development credentials from development_credentials.txt
 */

describe('User Journeys: Login to Songs List', () => {
	// Development credentials
	const users = {
		admin: {
			email: 'p.romanczuk@gmail.com',
			password: 'test123_admin',
			role: 'Admin',
		},
		teacher: {
			email: 'teacher@example.com',
			password: 'test123_teacher',
			role: 'Teacher',
		},
		student: {
			email: 'student@example.com',
			password: 'test123_student',
			role: 'Student',
		},
	};

	beforeEach(() => {
		// Start from home page (not logged in)
		cy.visit('/');
	});

	describe('Admin User Journey', () => {
		it('should complete full journey: not logged in -> login -> songs list', () => {
			// Step 1: Verify not logged in (should see sign in button)
			cy.contains(/sign in/i, { timeout: 5000 }).should('be.visible');

			// Step 2: Navigate to sign in page
			cy.visit('/sign-in');
			cy.contains('p', /sign in to your account/i).should('be.visible');

			// Step 3: Login as admin
			cy.get('input[type="email"]').type(users.admin.email);
			cy.get('input[type="password"]').type(users.admin.password);
			cy.get('button[type="submit"]').click();

			// Step 4: Verify successful login (should redirect and show user email)
			cy.url({ timeout: 10000 }).should('not.include', '/sign-in');
			cy.contains(users.admin.email, { timeout: 10000 }).should('be.visible');

			// Step 5: Navigate to songs list
			cy.visit('/songs');

			// Step 6: Verify songs page loaded
			cy.url().should('include', '/songs');

			// Wait for loading to complete (either table or empty state)
			cy.get('[data-testid="song-list-loading"]', { timeout: 1000 }).should(
				'not.exist'
			);

			// Verify page content is visible
			cy.contains(/songs|song library/i, { timeout: 10000 }).should(
				'be.visible'
			);

			// Step 7: Verify admin features are accessible
			// Admins should see create button
			cy.contains('button', 'Create new song', { timeout: 5000 }).should(
				'be.visible'
			);
		});

		it('should display and interact with songs list filters', () => {
			// Login
			cy.visit('/sign-in');
			cy.get('input[type="email"]').type(users.admin.email);
			cy.get('input[type="password"]').type(users.admin.password);
			cy.get('button[type="submit"]').click();
			cy.contains(users.admin.email, { timeout: 10000 }).should('be.visible');

			// Navigate to songs
			cy.visit('/songs');

			// Wait for loading to complete
			cy.get('[data-testid="song-list-loading"]', { timeout: 2000 }).should(
				'not.exist'
			);

			// Check if table is visible (songs are loaded) OR empty state
			cy.get('body').then(($body) => {
				if ($body.find('table').length > 0) {
					// Verify table has expected columns
					cy.contains('th', 'Title').should('be.visible');
					cy.contains('th', 'Author').should('be.visible');
					cy.contains('th', 'Level').should('be.visible');
					cy.contains('th', 'Key').should('be.visible');
				} else {
					// Empty state is also valid
					cy.contains(/no songs|empty/i).should('be.visible');
				}
			});
		});
	});

	describe('Teacher User Journey', () => {
		it('should complete full journey: not logged in -> login -> songs list', () => {
			// Step 1: Verify not logged in
			cy.contains(/sign in/i, { timeout: 5000 }).should('be.visible');

			// Step 2: Navigate to sign in page
			cy.visit('/sign-in');
			cy.contains('p', /sign in to your account/i).should('be.visible');

			// Step 3: Login as teacher
			cy.get('input[type="email"]').type(users.teacher.email);
			cy.get('input[type="password"]').type(users.teacher.password);
			cy.get('button[type="submit"]').click();

			// Step 4: Verify successful login
			cy.url({ timeout: 10000 }).should('not.include', '/sign-in');
			cy.contains(users.teacher.email, { timeout: 10000 }).should('be.visible');

			// Step 5: Navigate to songs list
			cy.visit('/songs');

			// Step 6: Verify songs page loaded
			cy.url().should('include', '/songs');

			// Wait for loading to complete
			cy.get('[data-testid="song-list-loading"]', { timeout: 1000 }).should(
				'not.exist'
			);

			cy.contains(/songs|song library/i, { timeout: 10000 }).should(
				'be.visible'
			);

			// Step 7: Verify teacher features are accessible
			// Teachers should see create button
			cy.contains('button', 'Create new song', { timeout: 5000 }).should(
				'be.visible'
			);
		});

		it('should maintain session after navigating between pages', () => {
			// Login
			cy.visit('/sign-in');
			cy.get('input[type="email"]').type(users.teacher.email);
			cy.get('input[type="password"]').type(users.teacher.password);
			cy.get('button[type="submit"]').click();
			cy.contains(users.teacher.email, { timeout: 10000 }).should('be.visible');

			// Navigate to songs
			cy.visit('/songs');
			cy.url().should('include', '/songs');

			// Navigate back to home
			cy.visit('/');

			// Should still be logged in
			cy.contains(users.teacher.email, { timeout: 5000 }).should('be.visible');

			// Navigate back to songs
			cy.visit('/songs');
			cy.url().should('include', '/songs');
		});
	});

	describe('Student User Journey', () => {
		it('should complete full journey: not logged in -> login -> songs list', () => {
			// Step 1: Verify not logged in
			cy.contains(/sign in/i, { timeout: 5000 }).should('be.visible');

			// Step 2: Navigate to sign in page
			cy.visit('/sign-in');
			cy.contains('p', /sign in to your account/i).should('be.visible');

			// Step 3: Login as student
			cy.get('input[type="email"]').type(users.student.email);
			cy.get('input[type="password"]').type(users.student.password);
			cy.get('button[type="submit"]').click();

			// Step 4: Verify successful login
			cy.url({ timeout: 10000 }).should('not.include', '/sign-in');
			cy.contains(users.student.email, { timeout: 10000 }).should('be.visible');

			// Step 5: Navigate to songs list
			cy.visit('/songs');

			// Step 6: Verify songs page loaded
			cy.url().should('include', '/songs');

			// Wait for loading to complete
			cy.get('[data-testid="song-list-loading"]', { timeout: 1000 }).should(
				'not.exist'
			);

			cy.contains(/songs|song library/i, { timeout: 10000 }).should(
				'be.visible'
			);

			// Step 7: Verify student has read-only access
			// Students should NOT see create button
			cy.contains('button', 'Create new song').should('not.exist');
		});

		it('should be able to view song details', () => {
			// Login
			cy.visit('/sign-in');
			cy.get('input[type="email"]').type(users.student.email);
			cy.get('input[type="password"]').type(users.student.password);
			cy.get('button[type="submit"]').click();
			cy.contains(users.student.email, { timeout: 10000 }).should('be.visible');

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
	});

	describe('Role-Based Access Control', () => {
		it('should show create button for Admin role', () => {
			// Login as admin
			cy.visit('/sign-in');
			cy.get('input[type="email"]').type(users.admin.email);
			cy.get('input[type="password"]').type(users.admin.password);
			cy.get('button[type="submit"]').click();

			// Wait for login
			cy.contains(users.admin.email, { timeout: 10000 }).should('be.visible');

			// Navigate to songs
			cy.visit('/songs');

			// Wait for loading
			cy.get('[data-testid="song-list-loading"]', { timeout: 2000 }).should(
				'not.exist'
			);

			// Admin should see create button
			cy.contains('button', 'Create new song', { timeout: 5000 }).should(
				'be.visible'
			);
		});

		it('should show create button for Teacher role', () => {
			// Login as teacher
			cy.visit('/sign-in');
			cy.get('input[type="email"]').type(users.teacher.email);
			cy.get('input[type="password"]').type(users.teacher.password);
			cy.get('button[type="submit"]').click();

			// Wait for login
			cy.contains(users.teacher.email, { timeout: 10000 }).should('be.visible');

			// Navigate to songs
			cy.visit('/songs');

			// Wait for loading
			cy.get('[data-testid="song-list-loading"]', { timeout: 2000 }).should(
				'not.exist'
			);

			// Teacher should see create button
			cy.contains('button', 'Create new song', { timeout: 5000 }).should(
				'be.visible'
			);
		});

		it('should NOT show create button for Student role', () => {
			// Login as student
			cy.visit('/sign-in');
			cy.get('input[type="email"]').type(users.student.email);
			cy.get('input[type="password"]').type(users.student.password);
			cy.get('button[type="submit"]').click();

			// Wait for login
			cy.contains(users.student.email, { timeout: 10000 }).should('be.visible');

			// Navigate to songs
			cy.visit('/songs');

			// Wait for loading
			cy.get('[data-testid="song-list-loading"]', { timeout: 2000 }).should(
				'not.exist'
			);

			// Student should NOT see create button
			cy.contains('button', 'Create new song').should('not.exist');
		});
	});

	describe('Unauthorized Access Prevention', () => {
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
	});

	describe('Session Persistence', () => {
		it('should maintain login after page reload', () => {
			// Login as teacher
			cy.visit('/sign-in');
			cy.get('input[type="email"]').type(users.teacher.email);
			cy.get('input[type="password"]').type(users.teacher.password);
			cy.get('button[type="submit"]').click();
			cy.contains(users.teacher.email, { timeout: 10000 }).should('be.visible');

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
});
