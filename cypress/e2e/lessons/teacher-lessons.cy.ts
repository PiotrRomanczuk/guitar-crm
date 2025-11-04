/// <reference types="cypress" />

import { interceptLessonsApi } from '../../support/journeys';

/**
 * ==========================================
 * LESSONS E2E - TEACHER ROLE
 * ==========================================
 *
 * Comprehensive E2E tests for teacher lesson management
 * Based on implemented pages:
 * - /teacher/lessons - Filtered list view
 * - /teacher/lessons/new - Create form
 * - /teacher/lessons/[id] - Detail/edit page
 *
 * Teacher Role Capabilities:
 * - View only their own lessons (auto-filtered by teacher ID)
 * - Create lessons for their assigned students
 * - Edit their own lessons only
 * - Delete their own lessons only
 * - Cannot access other teachers' lessons
 * - Cannot access admin routes
 * ==========================================
 */
describe('Lessons E2E - Teacher', () => {
	const TEACHER_EMAIL = 'teacher@example.com';
	const TEACHER_PASSWORD = 'test123_teacher';

	beforeEach(() => {
		cy.clearCookies();
		cy.clearLocalStorage();

		// Authenticate as teacher using direct sign-in flow
		cy.visit('/sign-in');
		cy.get('input[type="email"]').type(TEACHER_EMAIL);
		cy.get('input[type="password"]').type(TEACHER_PASSWORD);
		cy.get('form button[type="submit"]').click();

		// Wait for sign-in to complete
		cy.url({ timeout: 10000 }).should('not.include', '/sign-in');

		// Setup API intercepts
		interceptLessonsApi();
	});

	describe('List View (/teacher/lessons)', () => {
		it('should display filtered lessons list for teacher', () => {
			cy.visit('/teacher/lessons');
			cy.location('pathname').should('eq', '/teacher/lessons');

			// Page heading
			cy.contains('h1', /my lessons|lessons/i).should('be.visible');

			// API call should be filtered to teacher
			cy.wait('@getLessons').then((interception) => {
				expect(interception.response?.statusCode).to.eq(200);
				expect(interception.request.url).to.match(/teacher/);
			});

			// Table exists
			cy.get('[data-testid="lessons-table"]').should('exist');

			// Create button
			cy.get('[data-testid="new-lesson-button"]')
				.should('exist')
				.and('contain', 'Create Lesson');
		});

		it('should navigate to detail page when clicking view link', () => {
			cy.visit('/teacher/lessons');
			cy.wait('@getLessons');

			cy.get('body').then(($body) => {
				if (!$body.text().includes('No lessons found')) {
					cy.get('[data-testid="lesson-view-link"]').first().click();

					cy.location('pathname').should(
						'match',
						/\/teacher\/lessons\/[a-z0-9-]+$/
					);
				}
			});
		});
	});

	describe('Create Form (/teacher/lessons/new)', () => {
		it('should display create form with filtered student dropdown', () => {
			cy.visit('/teacher/lessons/new');
			cy.location('pathname').should('eq', '/teacher/lessons/new');

			// Page heading
			cy.contains('h1', /create.*lesson/i).should('be.visible');

			// Student dropdown (filtered to teacher's students)
			cy.get('[data-testid="student-select"]').should('exist');
			cy.get('[data-testid="student-select"] option', {
				timeout: 10000,
			}).should('have.length.gt', 1);

			// NO teacher dropdown (auto-filled as current teacher)
			cy.get('[data-testid="teacher-select"]').should('not.exist');

			// Other required fields
			cy.get('[data-testid="date-input"]').should('exist');
			cy.get('[data-testid="time-input"]').should('exist');
			cy.get('[data-testid="title-input"]').should('exist');
			cy.get('[data-testid="notes-input"]').should('exist');
			cy.get('[data-testid="status-select"]').should('exist');

			// Action buttons
			cy.get('[data-testid="submit-button"]').should('exist');
			cy.contains('button', /cancel|back/i).should('exist');
		});

		it('should create lesson for assigned student', () => {
			cy.visit('/teacher/lessons/new');

			// Wait for dropdown to populate
			cy.get('[data-testid="student-select"] option', {
				timeout: 10000,
			}).should('have.length.gt', 1);

			// Fill form
			cy.get('[data-testid="student-select"]').select(1);

			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			const dateString = tomorrow.toISOString().split('T')[0];
			cy.get('[data-testid="date-input"]').type(dateString);
			cy.get('[data-testid="time-input"]').type('15:00');
			cy.get('[data-testid="title-input"]').type('Teacher E2E Lesson');
			cy.get('[data-testid="notes-input"]').type('Test notes');

			// Submit
			cy.get('[data-testid="submit-button"]').click();

			// API call (teacher_id auto-filled by backend)
			cy.wait('@createLesson').then((interception) => {
				expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
			});

			// Redirect to list
			cy.location('pathname', { timeout: 10000 }).should(
				'eq',
				'/teacher/lessons'
			);
		});

		it('should validate required fields', () => {
			cy.visit('/teacher/lessons/new');

			// Try submit without filling
			cy.get('[data-testid="submit-button"]').click();

			// Should stay on form (client-side validation)
			cy.location('pathname').should('eq', '/teacher/lessons/new');

			// No API call
			cy.get('@createLesson.all').should('have.length', 0);
		});
	});

	describe('Detail Page (/teacher/lessons/[id])', () => {
		it('should display lesson details and allow editing', () => {
			// First create a lesson through the UI
			cy.visit('/teacher/lessons/new');

			cy.get('[data-testid="student-select"] option', {
				timeout: 10000,
			}).should('have.length.gt', 1);

			cy.get('[data-testid="student-select"]').select(1);

			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			const dateString = tomorrow.toISOString().split('T')[0];
			cy.get('[data-testid="date-input"]').type(dateString);
			cy.get('[data-testid="time-input"]').type('16:00');
			cy.get('[data-testid="title-input"]').type('Detail Test Lesson');
			cy.get('[data-testid="notes-input"]').type('For testing detail view');

			cy.get('[data-testid="submit-button"]').click();

			cy.wait('@createLesson').then((interception) => {
				const lessonId = interception.response?.body.id;

				// Navigate to detail page
				cy.visit(`/teacher/lessons/${lessonId}`);
				cy.location('pathname').should('eq', `/teacher/lessons/${lessonId}`);

				// Lesson info should be visible
				cy.contains('Detail Test Lesson').should('be.visible');
				cy.contains('For testing detail view').should('be.visible');

				// Edit form fields should exist
				cy.get('[data-testid="title-input"]').should('exist');
				cy.get('[data-testid="notes-input"]').should('exist');
				cy.get('[data-testid="submit-button"]').should('exist');
				cy.get('[data-testid="delete-button"]').should('exist');

				// Edit the lesson
				cy.get('[data-testid="title-input"]').clear().type('Updated Title');
				cy.get('[data-testid="submit-button"]').click();

				cy.wait('@updateLesson').its('response.statusCode').should('eq', 200);

				// Verify update
				cy.contains('Updated Title').should('be.visible');
			});
		});

		it('should delete lesson with confirmation', () => {
			// Create lesson first
			cy.visit('/teacher/lessons/new');

			cy.get('[data-testid="student-select"] option', {
				timeout: 10000,
			}).should('have.length.gt', 1);

			cy.get('[data-testid="student-select"]').select(1);

			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			const dateString = tomorrow.toISOString().split('T')[0];
			cy.get('[data-testid="date-input"]').type(dateString);
			cy.get('[data-testid="time-input"]').type('17:00');
			cy.get('[data-testid="title-input"]').type('Delete Test');

			cy.get('[data-testid="submit-button"]').click();

			cy.wait('@createLesson').then((interception) => {
				const lessonId = interception.response?.body.id;

				// Navigate to detail page
				cy.visit(`/teacher/lessons/${lessonId}`);

				// Delete the lesson
				cy.get('[data-testid="delete-button"]').click();

				// Confirm deletion (browser confirm dialog)
				cy.on('window:confirm', () => true);

				cy.wait('@deleteLesson')
					.its('response.statusCode')
					.should('be.oneOf', [200, 204]);

				// Should redirect to list
				cy.location('pathname').should('eq', '/teacher/lessons');
			});
		});
	});

	describe('Access Control', () => {
		it('should not access non-existent lesson', () => {
			const fakeId = '99999999-9999-9999-9999-999999999999';

			cy.visit(`/teacher/lessons/${fakeId}`);

			// Should show error or redirect
			cy.location('pathname', { timeout: 5000 }).then((path) => {
				if (path === `/teacher/lessons/${fakeId}`) {
					// If stayed on page, should show error
					cy.contains(/not found|error|doesn't exist/i).should('be.visible');
				} else {
					// Or redirected away
					expect(path).to.not.eq(`/teacher/lessons/${fakeId}`);
				}
			});
		});

		it('should not access admin lesson routes', () => {
			cy.visit('/admin/lessons');

			// Should redirect or show error
			cy.location('pathname', { timeout: 5000 }).then((path) => {
				if (path === '/admin/lessons') {
					// If stayed, should show forbidden message
					cy.contains(/forbidden|access denied|not authorized/i).should(
						'be.visible'
					);
				} else {
					// Or redirected to teacher area or home
					expect(path).to.match(/^\/teacher|^\/$/);
				}
			});
		});
	});
});
