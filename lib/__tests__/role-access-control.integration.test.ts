/**
 * Integration tests: Role-based access control across assignment AND lesson handlers
 *
 * Validates RBAC rules for both resource types:
 * - Admin: sees all, can mutate
 * - Teacher: sees own, can mutate
 * - Student: sees own, cannot mutate
 * - Unauthenticated: rejected
 * - validateMutationPermission helper correctness
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

jest.mock('@/lib/services/notification-service', () => ({
  queueNotification: jest.fn(),
}));

jest.mock('@/lib/email/send-lesson-email', () => ({
  sendLessonCompletedEmail: jest.fn(),
}));

jest.mock('@/lib/services/calendar-lesson-sync', () => ({
  syncLessonCreation: jest.fn(),
  syncLessonUpdate: jest.fn(),
  syncLessonDeletion: jest.fn(),
}));

jest.mock('../../app/api/lessons/utils', () => ({
  transformLessonData: jest.fn((d: any) => d),
  prepareLessonForDb: jest.fn((d: any) => d),
  addSongsToLesson: jest.fn(),
  insertLessonRecord: jest.fn(),
}));

import {
  createMockQueryBuilder,
  createMockAuthContext,
} from '@/lib/testing/integration-helpers';
import {
  getAssignmentsHandler,
  createAssignmentHandler,
} from '../../app/api/assignments/handlers';
import {
  validateMutationPermission,
} from '../../app/api/lessons/handlers';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const ADMIN = createMockAuthContext('admin');
const TEACHER = createMockAuthContext('teacher');
const STUDENT = createMockAuthContext('student');

function buildSupabase(mainBuilder: ReturnType<typeof createMockQueryBuilder>) {
  return {
    from: jest.fn().mockReturnValue(mainBuilder),
  } as unknown as Parameters<typeof getAssignmentsHandler>[0];
}

// ---------------------------------------------------------------------------
// Assignment RBAC
// ---------------------------------------------------------------------------

describe('RBAC - assignment handlers', () => {
  it('admin sees all assignments (no teacher_id / student_id filter)', async () => {
    const all = [
      { id: '1', title: 'A1', teacher_id: TEACHER.userId },
      { id: '2', title: 'A2', teacher_id: 'other-teacher' },
    ];
    const qb = createMockQueryBuilder(all);
    const supabase = buildSupabase(qb);

    const result = await getAssignmentsHandler(
      supabase,
      ADMIN.userId,
      ADMIN.profileMapped,
      {}
    );

    expect(result.status).toBe(200);
    expect(result.assignments).toEqual(all);

    // No teacher_id or student_id eq calls
    const eqCalls = (qb.eq as jest.Mock).mock.calls;
    const roleFilterCalls = eqCalls.filter(
      ([field]: [string]) => field === 'teacher_id' || field === 'student_id'
    );
    expect(roleFilterCalls).toHaveLength(0);
  });

  it('teacher sees only their own assignments (eq teacher_id)', async () => {
    const mine = [{ id: '1', title: 'Mine', teacher_id: TEACHER.userId }];
    const qb = createMockQueryBuilder(mine);
    const supabase = buildSupabase(qb);

    const result = await getAssignmentsHandler(
      supabase,
      TEACHER.userId,
      TEACHER.profileMapped,
      {}
    );

    expect(result.status).toBe(200);
    expect(qb.eq).toHaveBeenCalledWith('teacher_id', TEACHER.userId);
  });

  it('student sees only their own assignments (eq student_id)', async () => {
    const mine = [{ id: '5', title: 'Homework', student_id: STUDENT.userId }];
    const qb = createMockQueryBuilder(mine);
    const supabase = buildSupabase(qb);

    const result = await getAssignmentsHandler(
      supabase,
      STUDENT.userId,
      STUDENT.profileMapped,
      {}
    );

    expect(result.status).toBe(200);
    expect(qb.eq).toHaveBeenCalledWith('student_id', STUDENT.userId);
  });

  it('student cannot create assignments (returns 403)', async () => {
    const qb = createMockQueryBuilder();
    const supabase = buildSupabase(qb);

    const result = await createAssignmentHandler(
      supabase,
      STUDENT.userId,
      STUDENT.profileMapped,
      {
        title: 'Self-assign',
        teacher_id: TEACHER.userId,
        student_id: STUDENT.userId,
      }
    );

    expect(result.status).toBe(403);
    expect(result.error).toMatch(/only teachers and admins/i);
  });

  it('unauthenticated-equivalent role gets no access', async () => {
    // A profile with no roles acts as an unauthenticated-equivalent user
    const noRoleProfile = { isAdmin: false, isTeacher: false, isStudent: false };
    const qb = createMockQueryBuilder([]);
    const supabase = buildSupabase(qb);

    const result = await getAssignmentsHandler(
      supabase,
      'no-role-user-id',
      noRoleProfile,
      {}
    );

    // The handler falls through to a dead-end filter (id = impossible UUID)
    expect(result.status).toBe(200);
    // .eq was called with the impossible UUID guard
    expect(qb.eq).toHaveBeenCalledWith('id', '00000000-0000-0000-0000-000000000000');
  });
});

// ---------------------------------------------------------------------------
// Lesson RBAC - validateMutationPermission
// ---------------------------------------------------------------------------

describe('RBAC - validateMutationPermission (lessons)', () => {
  it('returns true for admin', () => {
    expect(validateMutationPermission(ADMIN.profileMapped)).toBe(true);
  });

  it('returns true for teacher', () => {
    expect(validateMutationPermission(TEACHER.profileMapped)).toBe(true);
  });

  it('returns false for student', () => {
    expect(validateMutationPermission(STUDENT.profileMapped)).toBe(false);
  });

  it('returns false for null profile', () => {
    expect(validateMutationPermission(null)).toBe(false);
  });
});
