/// <reference types="cypress" />

import { restRequest, getProfileByEmail } from '../../../support/supabase';

// API-only tests for Lessons via Supabase REST (no UI pages required)
// Requires env:
// - NEXT_PUBLIC_SUPABASE_URL (default http://127.0.0.1:54321)
// - SUPABASE_SERVICE_ROLE_KEY

describe('Lessons API-only via Supabase REST', () => {
	const teacherEmail = 'teacher@example.com';
	const studentEmail = 'student@example.com';

	let teacherId: string;
	let studentId: string;
	let createdLessonId: string;

	before(() => {
		// Resolve profile IDs for test accounts
		getProfileByEmail(teacherEmail).then((p) => (teacherId = p.user_id));
		getProfileByEmail(studentEmail).then((p) => (studentId = p.user_id));
	});

	it('creates a lesson', () => {
		// Wait until IDs are resolved
		cy.wrap(null).should(() => {
			expect(teacherId, 'teacherId').to.match(/[0-9a-f-]{36}/i);
			expect(studentId, 'studentId').to.match(/[0-9a-f-]{36}/i);
		});

		const payload = {
			teacher_id: teacherId,
			student_id: studentId,
			creator_user_id: teacherId, // Required field
			date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format for DATE column
			start_time: '12:00:00', // HH:MM:SS format for TIME column
			title: 'E2E API-only Lesson',
			notes: 'Created via Cypress API test',
			status: 'SCHEDULED',
		};

		restRequest<Record<string, unknown>[]>('POST', '/lessons', {
			body: payload,
		}).then((resp) => {
			if (resp.status !== 201 && resp.status !== 200) {
				cy.log('Create failed:', resp.status, JSON.stringify(resp.body));
			}
			expect(resp.status).to.be.oneOf([201, 200]);
			expect(resp.body).to.be.an('array');
			const rec = resp.body[0] as { id: string };
			expect(rec).to.have.property('id');
			createdLessonId = rec.id;
		});
	});

	it('reads the created lesson by id', () => {
		cy.wrap(createdLessonId).should('match', /[0-9a-f-]{36}/i);

		restRequest<Record<string, unknown>[]>('GET', '/lessons', {
			qs: { select: '*', id: `eq.${createdLessonId}` },
		}).then((resp) => {
			expect(resp.status).to.eq(200);
			expect(resp.body).to.be.an('array').and.have.length(1);
			const rec = resp.body[0] as { id: string };
			expect(rec.id).to.eq(createdLessonId);
		});
	});

	it('updates the lesson title', () => {
		const newTitle = 'E2E API-only Lesson (Updated)';

		restRequest<Record<string, unknown>[]>('PATCH', '/lessons', {
			qs: { id: `eq.${createdLessonId}` },
			body: { title: newTitle },
		}).then((resp) => {
			expect(resp.status).to.eq(200);
			const rec = resp.body[0] as { title?: string };
			expect(rec.title).to.eq(newTitle);
		});
	});

	it('deletes the lesson', () => {
		restRequest<unknown>('DELETE', '/lessons', {
			qs: { id: `eq.${createdLessonId}` },
		}).then((resp) => {
			expect(resp.status).to.be.oneOf([200, 204]);
		});

		// Verify it no longer exists
		restRequest<Record<string, unknown>[]>('GET', '/lessons', {
			qs: { select: 'id', id: `eq.${createdLessonId}` },
		}).then((resp) => {
			expect(resp.status).to.eq(200);
			expect(resp.body).to.be.an('array').and.have.length(0);
		});
	});
});
