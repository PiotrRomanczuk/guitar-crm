/// <reference types="cypress" />

import { interceptLessonsApi } from '../../support/journeys';

/**
 * ==========================================
 * LESSONS E2E - STUDENT ROLE
 * ==========================================
 *
 * Comprehensive E2E tests for student lesson viewing
 * Based on implemented pages:
 * - /student/lessons - Read-only list view
 * - /student/lessons/[id] - Read-only detail view
 *
 * Student Role Capabilities:
 * - View only their own lessons (read-only)
 * - Cannot create, edit, or delete lessons
 * - Cannot access teacher or admin routes
 * - See lesson details including teacher info
 * ==========================================
 */
describe('Lessons E2E - Student', () => {
	const STUDENT_EMAIL = 'student@example.com';
	const STUDENT_PASSWORD = 'test123_student';

	beforeEach(() => {
		cy.clearCookies();
		cy.clearLocalStorage();

		// Authenticate as student using direct sign-in flow
		cy.visit('/sign-in');
		cy.get('input[type="email"]').type(STUDENT_EMAIL);
		cy.get('input[type="password"]').type(STUDENT_PASSWORD);
		cy.get('form button[type="submit"]').click();

		// Wait for sign-in to complete
		cy.url({ timeout: 10000 }).should('not.include', '/sign-in');

		// Setup API intercepts
		interceptLessonsApi();
	});

	it('should display read-only lessons list', () => {
		// REQUIREMENT: /student/lessons route exists
		cy.visit('/student/lessons');
		cy.location('pathname').should('eq', '/student/lessons');

		// REQUIREMENT: Page title
		cy.get('[data-testid="page-title"]').should(
			'contain',
			/my lessons|lessons/i
		);

		// REQUIREMENT: API call filtered to student's lessons
		cy.wait('@getLessons').then((interception) => {
			expect(interception.response?.statusCode).to.eq(200);
			expect(interception.request.url).to.match(/student/);
		});

		// REQUIREMENT: Read-only table
		cy.get('[data-testid="lessons-table"]').should('exist');
		cy.get('[data-testid="lessons-table"]').within(() => {
			cy.contains('th', /teacher/i).should('exist');
			cy.contains('th', /date/i).should('exist');
			cy.contains('th', /time/i).should('exist');
			cy.contains('th', /status/i).should('exist');
			// Should NOT have "Actions" column (read-only)
			cy.contains('th', /actions/i).should('not.exist');
		});

		// REQUIREMENT: NO create button (students cannot create)
		cy.get('[data-testid="create-lesson-button"]').should('not.exist');
	});

	it('should block access to create lesson route', () => {
		// REQUIREMENT: /student/lessons/new should not exist or redirect
		cy.visit('/student/lessons/new');

		cy.location('pathname', { timeout: 5000 }).should((path) => {
			if (path === '/student/lessons/new') {
				// If page loads, must show forbidden message
				cy.get('[data-testid="forbidden-message"]').should('be.visible');
				cy.contains(/access denied|not authorized|forbidden/i).should(
					'be.visible'
				);
			} else {
				// Or redirects to student area
				expect(path).to.match(/^\/student|^\/$/);
			}
		});
	});

	it('should display lesson details in read-only mode', () => {
		// Create lesson first via API (teacher creates for student)
		cy.request({
			method: 'POST',
			url: '/api/lessons',
			body: {
				student_id:
					Cypress.env('TEST_STUDENT_ID') ||
					'00000000-0000-0000-0000-000000000003',
				teacher_id:
					Cypress.env('TEST_TEACHER_ID') ||
					'00000000-0000-0000-0000-000000000002',
				date: '2025-11-28',
				start_time: '10:00',
				title: 'Student View Test',
				notes: 'Practice scales',
				status: 'SCHEDULED',
			},
		}).then((resp) => {
			const lessonId = resp.body.id;

			// REQUIREMENT: Can view lesson details
			cy.visit(`/student/lessons/${lessonId}`);
			cy.location('pathname').should('eq', `/student/lessons/${lessonId}`);

			cy.wait('@getLessonById').its('response.statusCode').should('eq', 200);

			// REQUIREMENT: Display lesson information
			cy.get('[data-testid="lesson-details"]').should('exist');
			cy.contains('Student View Test').should('be.visible');
			cy.contains('Practice scales').should('be.visible');

			// REQUIREMENT: NO edit button (read-only)
			cy.get('[data-testid="edit-lesson-button"]').should('not.exist');

			// REQUIREMENT: NO delete button (read-only)
			cy.get('[data-testid="delete-lesson-button"]').should('not.exist');

			// REQUIREMENT: Form fields should be disabled or display-only
			cy.get('input[name="title"]').should('be.disabled');
			cy.get('textarea[name="notes"]').should('be.disabled');
			cy.get('select[name="status"]').should('be.disabled');
		});
	});

	it('should not access teacher lessons routes', () => {
		// REQUIREMENT: Cannot access teacher-specific routes
		cy.visit('/teacher/lessons');

		cy.location('pathname', { timeout: 5000 }).should((path) => {
			if (path === '/teacher/lessons') {
				cy.contains(/forbidden|access denied|not authorized/i).should(
					'be.visible'
				);
			} else {
				expect(path).to.match(/^\/student|^\/$/);
			}
		});
	});

	it('should not access admin lessons routes', () => {
		// REQUIREMENT: Cannot access admin routes
		cy.visit('/admin/lessons');

		cy.location('pathname', { timeout: 5000 }).should((path) => {
			if (path === '/admin/lessons') {
				cy.contains(/forbidden|access denied|not authorized/i).should(
					'be.visible'
				);
			} else {
				expect(path).to.match(/^\/student|^\/$/);
			}
		});
	});

	it('should display upcoming lessons on dashboard', () => {
		// REQUIREMENT: Dashboard shows upcoming lessons widget
		cy.visit('/student/dashboard');
		cy.location('pathname').should('match', /\/student/);

		// REQUIREMENT: Upcoming lessons widget exists
		cy.get('[data-testid="upcoming-lessons"]').should('exist');
		cy.get('[data-testid="upcoming-lessons"]').within(() => {
			cy.contains(/upcoming|next.*lessons/i).should('exist');

			// Should show at least the lesson list
			cy.get('[data-testid="lesson-item"]').should('have.length.at.least', 0);
		});

		// REQUIREMENT: Can click to view lesson details
		cy.get('[data-testid="upcoming-lessons"]').then(($widget) => {
			if ($widget.find('[data-testid="lesson-item"]').length > 0) {
				cy.get('[data-testid="lesson-item"]').first().click();
				cy.location('pathname').should(
					'match',
					/\/student\/lessons\/[a-z0-9-]+/
				);
			}
		});
	});

	it('should filter lessons by status', () => {
		cy.visit('/student/lessons');

		// REQUIREMENT: Can filter to see past/upcoming lessons
		cy.get('[data-testid="filter-status"]').should('exist').select('COMPLETED');

		cy.wait('@getLessons').then((interception) => {
			expect(interception.request.url).to.include('status');
		});

		// Table updates with filtered results
		cy.get('[data-testid="lessons-table"]').should('exist');
	});

	it('should sort lessons by date', () => {
		cy.visit('/student/lessons');

		// REQUIREMENT: Can sort by date (most useful for students)
		cy.get('[data-testid="lessons-table"]').within(() => {
			cy.contains('th', /date/i).click();
		});

		cy.wait('@getLessons').then((interception) => {
			expect(interception.request.url).to.match(/sort|order/);
		});
	});

	it('should show empty state when no lessons', () => {
		// Mock empty response
		cy.intercept('GET', '/api/lessons*', {
			statusCode: 200,
			body: [],
		}).as('getEmptyLessons');

		cy.visit('/student/lessons');
		cy.wait('@getEmptyLessons');

		// REQUIREMENT: Empty state message
		cy.get('[data-testid="empty-state"]').should('exist');
		cy.contains(/no lessons|haven't.*scheduled/i).should('be.visible');
	});

	it('should attempt to edit lesson and fail', () => {
		// Create lesson first
		cy.request({
			method: 'POST',
			url: '/api/lessons',
			body: {
				student_id:
					Cypress.env('TEST_STUDENT_ID') ||
					'00000000-0000-0000-0000-000000000003',
				teacher_id:
					Cypress.env('TEST_TEACHER_ID') ||
					'00000000-0000-0000-0000-000000000002',
				date: '2025-11-29',
				start_time: '11:00',
				title: 'Edit Block Test',
				status: 'SCHEDULED',
			},
		}).then((resp) => {
			const lessonId = resp.body.id;

			// REQUIREMENT: Direct URL access to edit route should fail
			cy.visit(`/student/lessons/${lessonId}/edit`);

			cy.location('pathname', { timeout: 5000 }).should((path) => {
				if (path === `/student/lessons/${lessonId}/edit`) {
					cy.contains(/forbidden|access denied|read only/i).should(
						'be.visible'
					);
				} else {
					// Or redirects to view-only
					expect(path).to.eq(`/student/lessons/${lessonId}`);
				}
			});
		});
	});
});
