/// <reference types="cypress" />

import { interceptLessonsApi } from '../../support/journeys';

/**
 * ==========================================
 * LESSONS E2E - ADMIN ROLE
 * ==========================================
 *
 * Comprehensive E2E tests for admin lesson management
 * Based on implemented pages:
 * - /admin/lessons - List view with full access
 * - /admin/lessons/new - Create form
 * - /admin/lessons/[id] - Detail/edit page
 *
 * Admin Role Capabilities:
 * - View all lessons in the system
 * - Create lessons for any teacher/student combination
 * - Edit any lesson
 * - Delete any lesson
 * - Full CRUD access without filters
 * ==========================================
 */
describe('Lessons E2E - Admin', () => {
	const ADMIN_EMAIL = 'p.romanczuk@gmail.com';
	const ADMIN_PASSWORD = 'test123_admin';

	beforeEach(() => {
		cy.clearCookies();
		cy.clearLocalStorage();

		// Authenticate as admin using direct sign-in flow
		cy.visit('/sign-in');
		cy.get('input[type="email"]').type(ADMIN_EMAIL);
		cy.get('input[type="password"]').type(ADMIN_PASSWORD);
		cy.get('form button[type="submit"]').click();

		// Wait for sign-in to complete
		cy.url({ timeout: 10000 }).should('not.include', '/sign-in');

		// Setup API intercepts
		interceptLessonsApi();
	});

	describe('List View (/admin/lessons)', () => {
		it('should display lessons list with all system lessons', () => {
			cy.visit('/admin/lessons');
			cy.location('pathname').should('eq', '/admin/lessons');

			// Page title
			cy.get('[data-testid="page-title"]').should('contain', 'Lessons');

			// API call for all lessons
			cy.wait('@getLessons').its('response.statusCode').should('eq', 200);

			// Table structure
			cy.get('[data-testid="lessons-table"]').should('exist');
			cy.get('[data-testid="lessons-table"]').within(() => {
				cy.contains('th', 'Student').should('exist');
				cy.contains('th', 'Teacher').should('exist');
				cy.contains('th', 'Date').should('exist');
				cy.contains('th', 'Time').should('exist');
				cy.contains('th', 'Status').should('exist');
			});

			// Create button
			cy.get('[data-testid="create-lesson-btn"]')
				.should('exist')
				.and('contain', 'Create Lesson');
		});

		it('should navigate to detail page when clicking lesson row', () => {
			cy.visit('/admin/lessons');
			cy.wait('@getLessons');

			// Click first lesson row (if any exist)
			cy.get('body').then(($body) => {
				if (!$body.text().includes('No lessons found')) {
					cy.get('[data-testid="lessons-table"] tbody tr').first().click();

					// Should navigate to detail page
					cy.location('pathname').should(
						'match',
						/\/admin\/lessons\/[a-z0-9-]+$/
					);
				}
			});
		});
	});

	describe('Create Form (/admin/lessons/new)', () => {
		it('should display create form with all required fields', () => {
			cy.visit('/admin/lessons/new');
			cy.location('pathname').should('eq', '/admin/lessons/new');

			// Page title
			cy.get('[data-testid="page-title"]').should('contain', 'Create Lesson');

			// Form exists
			cy.get('[data-testid="lesson-form"]').should('exist');

			// Required fields
			cy.get('[data-testid="student-select"]').should('exist');
			cy.get('[data-testid="teacher-select"]').should('exist');
			cy.get('[data-testid="date-input"]').should('exist');
			cy.get('[data-testid="time-input"]').should('exist');

			// Optional fields
			cy.get('[data-testid="title-input"]').should('exist');
			cy.get('[data-testid="notes-textarea"]').should('exist');
			cy.get('[data-testid="status-select"]').should('exist');

			// Action buttons
			cy.get('[data-testid="create-btn"]').should('contain', 'Create Lesson');
			cy.get('[data-testid="cancel-btn"]').should('contain', 'Cancel');
		});

		it('should validate required fields', () => {
			cy.visit('/admin/lessons/new');

			// Try to submit without filling required fields
			cy.get('[data-testid="create-btn"]').click();

			// Should show validation errors
			cy.contains(/student.*required/i).should('be.visible');
			cy.contains(/teacher.*required/i).should('be.visible');
			cy.contains(/date.*required/i).should('be.visible');

			// Should not make API call
			cy.get('@createLesson.all').should('have.length', 0);
		});
		it('should create a new lesson successfully', () => {
			cy.visit('/admin/lessons/new');

			// Wait for dropdowns to populate
			cy.get('[data-testid="student-select"] option', {
				timeout: 10000,
			}).should('have.length.gt', 1);
			cy.get('[data-testid="teacher-select"] option', {
				timeout: 10000,
			}).should('have.length.gt', 1);

			// Fill form
			cy.get('[data-testid="student-select"]').select(1);
			cy.get('[data-testid="teacher-select"]').select(1);

			// Date (tomorrow)
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			const dateString = tomorrow.toISOString().split('T')[0];
			cy.get('[data-testid="date-input"]').type(dateString);

			// Time
			cy.get('[data-testid="time-input"]').type('14:00');

			// Optional fields
			cy.get('[data-testid="title-input"]').type('E2E Test Lesson');
			cy.get('[data-testid="notes-textarea"]').type(
				'Created via Cypress E2E test'
			);

			// Submit
			cy.get('[data-testid="create-btn"]').click();

			// API call
			cy.wait('@createLesson', { timeout: 10000 }).then((interception) => {
				expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
			});

			// Redirect to list
			cy.location('pathname', { timeout: 10000 }).should(
				'eq',
				'/admin/lessons'
			);

			// Success message
			cy.contains(/lesson.*created|success/i, { timeout: 10000 }).should(
				'be.visible'
			);
		});

		it('should cancel and return to list', () => {
			cy.visit('/admin/lessons/new');

			cy.get('[data-testid="cancel-btn"]').click();

			cy.location('pathname').should('eq', '/admin/lessons');
		});
	});

	describe('Detail Page (/admin/lessons/[id])', () => {
		let lessonId: string;

		beforeEach(() => {
			// Create a lesson via API for detail testing
			cy.request({
				method: 'POST',
				url: '/api/admin/lessons',
				body: {
					student_id:
						Cypress.env('TEST_STUDENT_ID') ||
						'00000000-0000-0000-0000-000000000001',
					teacher_id:
						Cypress.env('TEST_TEACHER_ID') ||
						'00000000-0000-0000-0000-000000000002',
					date: '2025-12-15',
					start_time: '15:00',
					title: 'E2E Detail Test',
					notes: 'For detail page testing',
					status: 'SCHEDULED',
				},
			}).then((resp) => {
				lessonId = resp.body.id;
			});
		});

		it('should display lesson details with all fields', () => {
			cy.visit(`/admin/lessons/${lessonId}`);
			cy.location('pathname').should('eq', `/admin/lessons/${lessonId}`);

			// Page title
			cy.get('[data-testid="page-title"]').should('contain', 'Lesson Details');

			// Lesson information
			cy.get('[data-testid="lesson-detail"]').should('exist');
			cy.contains('E2E Detail Test').should('be.visible');
			cy.contains('For detail page testing').should('be.visible');

			// Action buttons
			cy.get('[data-testid="edit-btn"]').should('exist');
			cy.get('[data-testid="delete-btn"]').should('exist');
			cy.get('[data-testid="back-btn"]').should('exist');
		});

		it('should edit lesson successfully', () => {
			cy.visit(`/admin/lessons/${lessonId}`);

			// Click edit button
			cy.get('[data-testid="edit-btn"]').click();

			// Edit form should appear (inline or modal)
			cy.get('[data-testid="edit-form"]').should('exist');

			// Update title
			cy.get('[data-testid="title-input"]').clear().type('Updated E2E Lesson');

			// Save changes
			cy.get('[data-testid="save-btn"]').click();

			// API call
			cy.wait('@updateLesson').its('response.statusCode').should('eq', 200);

			// Updated content visible
			cy.contains('Updated E2E Lesson').should('be.visible');
		});

		it('should delete lesson with confirmation', () => {
			cy.visit(`/admin/lessons/${lessonId}`);

			// Click delete button
			cy.get('[data-testid="delete-btn"]').click();

			// Confirmation dialog
			cy.get('[data-testid="confirm-dialog"]').should('be.visible');
			cy.get('[data-testid="confirm-message"]').should(
				'contain',
				/delete.*lesson|confirm/i
			);

			// Confirm deletion
			cy.get('[data-testid="confirm-delete-btn"]').click();

			// API call
			cy.wait('@deleteLesson')
				.its('response.statusCode')
				.should('be.oneOf', [200, 204]);

			// Redirect to list
			cy.location('pathname').should('eq', '/admin/lessons');

			// Success message
			cy.contains(/lesson.*deleted|removed/i).should('be.visible');
		});

		it('should cancel delete operation', () => {
			cy.visit(`/admin/lessons/${lessonId}`);

			// Click delete
			cy.get('[data-testid="delete-btn"]').click();

			// Cancel in dialog
			cy.get('[data-testid="cancel-delete-btn"]').click();

			// Should stay on detail page
			cy.location('pathname').should('eq', `/admin/lessons/${lessonId}`);

			// No delete API call
			cy.get('@deleteLesson.all').should('have.length', 0);
		});

		it('should navigate back to list', () => {
			cy.visit(`/admin/lessons/${lessonId}`);

			cy.get('[data-testid="back-btn"]').click();

			cy.location('pathname').should('eq', '/admin/lessons');
		});
	});

	describe('Error Handling', () => {
		it('should handle non-existent lesson ID gracefully', () => {
			const fakeId = '99999999-9999-9999-9999-999999999999';
			cy.visit(`/admin/lessons/${fakeId}`);

			// Should show error message or redirect
			cy.location('pathname', { timeout: 5000 }).should((path) => {
				if (path === `/admin/lessons/${fakeId}`) {
					cy.contains(/not found|doesn't exist/i).should('be.visible');
				} else {
					expect(path).to.eq('/admin/lessons');
				}
			});
		});

		it('should handle API errors on list page', () => {
			// Mock API error
			cy.intercept('GET', '/api/admin/lessons*', {
				statusCode: 500,
				body: { error: 'Internal Server Error' },
			}).as('getError');

			cy.visit('/admin/lessons');
			cy.wait('@getError');

			// Should show error message
			cy.contains(/error|failed|couldn't load/i).should('be.visible');
		});
	});
});
