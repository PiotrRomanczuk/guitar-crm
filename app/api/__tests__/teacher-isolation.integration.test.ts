/**
 * Integration tests: Teacher data isolation in assignment handlers
 *
 * Verifies that the assignment API enforces strict data isolation:
 * - Teachers see only their own assignments
 * - Teachers cannot create assignments on behalf of other teachers
 * - Admins bypass teacher-level filters
 * - Students see only assignments assigned to them
 */

jest.mock('@/lib/services/notification-service', () => ({
  queueNotification: jest.fn().mockResolvedValue(undefined),
}));

import {
  createMockQueryBuilder,
  createMockAuthContext,
  MOCK_DATA_IDS,
} from '@/lib/testing/integration-helpers';
import {
  getAssignmentsHandler,
  createAssignmentHandler,
} from '../assignments/handlers';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEACHER_A = createMockAuthContext('teacher');
const TEACHER_B_ID = '00000000-dddd-4000-a000-000000000099';
const ADMIN = createMockAuthContext('admin');
const STUDENT = createMockAuthContext('student');

function buildMockSupabase(mainBuilder: ReturnType<typeof createMockQueryBuilder>) {
  return {
    from: jest.fn().mockReturnValue(mainBuilder),
  } as unknown as Parameters<typeof getAssignmentsHandler>[0];
}

/**
 * Build a Supabase mock that returns different query builders depending
 * on the table. For createAssignment we need `profiles` to return a valid
 * student and `assignments` to return the created row.
 */
function buildMultiTableSupabase(
  tables: Record<string, ReturnType<typeof createMockQueryBuilder>>
) {
  return {
    from: jest.fn((table: string) => {
      return tables[table] ?? createMockQueryBuilder();
    }),
  } as unknown as Parameters<typeof createAssignmentHandler>[0];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Teacher isolation - assignment handlers', () => {
  // -----------------------------------------------------------------------
  // 1. Teacher A can only see their own assignments
  // -----------------------------------------------------------------------
  it('filters assignments by teacher_id for a teacher role', async () => {
    const assignments = [
      { id: MOCK_DATA_IDS.assignment, title: 'Practice scales', teacher_id: TEACHER_A.userId },
    ];
    const qb = createMockQueryBuilder(assignments);
    const supabase = buildMockSupabase(qb);

    const result = await getAssignmentsHandler(
      supabase,
      TEACHER_A.userId,
      TEACHER_A.profileMapped,
      {}
    );

    expect(result.status).toBe(200);
    expect(result.assignments).toEqual(assignments);

    // The handler must have called .eq('teacher_id', userId)
    expect(qb.eq).toHaveBeenCalledWith('teacher_id', TEACHER_A.userId);
  });

  // -----------------------------------------------------------------------
  // 2. Teacher A cannot create assignments for Teacher B
  // -----------------------------------------------------------------------
  it('returns 403 when a teacher creates an assignment for another teacher', async () => {
    const qb = createMockQueryBuilder();
    const supabase = buildMockSupabase(qb);

    const result = await createAssignmentHandler(
      supabase,
      TEACHER_A.userId,
      TEACHER_A.profileMapped,
      {
        title: 'Homework',
        teacher_id: TEACHER_B_ID,
        student_id: STUDENT.userId,
      }
    );

    expect(result.status).toBe(403);
    expect(result.error).toMatch(/only create assignments for themselves/i);
  });

  // -----------------------------------------------------------------------
  // 3. Admin can see all assignments (no teacher_id filter)
  // -----------------------------------------------------------------------
  it('does not filter by teacher_id for an admin role', async () => {
    const allAssignments = [
      { id: '1', title: 'A1', teacher_id: TEACHER_A.userId },
      { id: '2', title: 'A2', teacher_id: TEACHER_B_ID },
    ];
    const qb = createMockQueryBuilder(allAssignments);
    const supabase = buildMockSupabase(qb);

    const result = await getAssignmentsHandler(
      supabase,
      ADMIN.userId,
      ADMIN.profileMapped,
      {}
    );

    expect(result.status).toBe(200);
    expect(result.assignments).toEqual(allAssignments);

    // eq should have been called with 'deleted_at' filter (via .is) but
    // NOT with 'teacher_id' — verify no teacher_id filter was applied
    const teacherIdCalls = (qb.eq as jest.Mock).mock.calls.filter(
      ([field]: [string]) => field === 'teacher_id'
    );
    expect(teacherIdCalls).toHaveLength(0);
  });

  // -----------------------------------------------------------------------
  // 4. Student can only see their own assignments (filtered by student_id)
  // -----------------------------------------------------------------------
  it('filters assignments by student_id for a student role', async () => {
    const studentAssignments = [
      { id: '10', title: 'Chord transitions', student_id: STUDENT.userId },
    ];
    const qb = createMockQueryBuilder(studentAssignments);
    const supabase = buildMockSupabase(qb);

    const result = await getAssignmentsHandler(
      supabase,
      STUDENT.userId,
      STUDENT.profileMapped,
      {}
    );

    expect(result.status).toBe(200);
    expect(result.assignments).toEqual(studentAssignments);

    // The handler must have called .eq('student_id', userId)
    expect(qb.eq).toHaveBeenCalledWith('student_id', STUDENT.userId);
  });
});
