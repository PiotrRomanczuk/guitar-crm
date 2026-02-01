/**
 * AssignmentSchema Tests
 *
 * Tests validation for assignment-related Zod schemas:
 * - AssignmentSchema (full assignment validation)
 * - AssignmentInputSchema (create operations)
 * - AssignmentUpdateSchema (partial updates)
 * - AssignmentStatusEnum (status values)
 * - AssignmentFilterSchema (filtering)
 * - calculateAssignmentStatus (status helper)
 *
 * @see schemas/AssignmentSchema.ts
 */

import {
  AssignmentSchema,
  AssignmentInputSchema,
  AssignmentUpdateSchema,
  AssignmentStatusEnum,
  AssignmentFilterSchema,
  AssignmentSortSchema,
  AssignmentWithProfilesSchema,
  calculateAssignmentStatus,
} from '../AssignmentSchema';

describe('AssignmentSchema', () => {
  const validTeacherId = '550e8400-e29b-41d4-a716-446655440001';
  const validStudentId = '550e8400-e29b-41d4-a716-446655440002';

  describe('AssignmentStatusEnum', () => {
    const validStatuses = ['not_started', 'in_progress', 'completed', 'overdue', 'cancelled'];

    it('should accept all valid statuses', () => {
      for (const status of validStatuses) {
        const result = AssignmentStatusEnum.safeParse(status);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid status', () => {
      const result = AssignmentStatusEnum.safeParse('invalid');
      expect(result.success).toBe(false);
    });

    it('should reject uppercase status', () => {
      const result = AssignmentStatusEnum.safeParse('COMPLETED');
      expect(result.success).toBe(false);
    });
  });

  describe('AssignmentInputSchema', () => {
    const validAssignmentInput = {
      title: 'Practice chord transitions',
      teacher_id: validTeacherId,
      student_id: validStudentId,
    };

    it('should validate a valid assignment input', () => {
      const result = AssignmentInputSchema.safeParse(validAssignmentInput);
      expect(result.success).toBe(true);
    });

    it('should require title', () => {
      const result = AssignmentInputSchema.safeParse({
        ...validAssignmentInput,
        title: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required');
      }
    });

    it('should validate title max length', () => {
      const result = AssignmentInputSchema.safeParse({
        ...validAssignmentInput,
        title: 'a'.repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it('should validate teacher_id is UUID', () => {
      const result = AssignmentInputSchema.safeParse({
        ...validAssignmentInput,
        teacher_id: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should validate student_id is UUID', () => {
      const result = AssignmentInputSchema.safeParse({
        ...validAssignmentInput,
        student_id: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should accept optional description', () => {
      const result = AssignmentInputSchema.safeParse({
        ...validAssignmentInput,
        description: 'Focus on smooth transitions between C and G chords',
      });
      expect(result.success).toBe(true);
    });

    it('should validate description max length', () => {
      const result = AssignmentInputSchema.safeParse({
        ...validAssignmentInput,
        description: 'a'.repeat(2001),
      });
      expect(result.success).toBe(false);
    });

    it('should accept optional due_date', () => {
      const result = AssignmentInputSchema.safeParse({
        ...validAssignmentInput,
        due_date: '2024-01-20T00:00:00Z',
      });
      expect(result.success).toBe(true);
    });

    it('should validate due_date is datetime', () => {
      const result = AssignmentInputSchema.safeParse({
        ...validAssignmentInput,
        due_date: 'not-a-date',
      });
      expect(result.success).toBe(false);
    });

    it('should accept optional lesson_id', () => {
      const result = AssignmentInputSchema.safeParse({
        ...validAssignmentInput,
        lesson_id: '550e8400-e29b-41d4-a716-446655440003',
      });
      expect(result.success).toBe(true);
    });

    it('should accept null lesson_id', () => {
      const result = AssignmentInputSchema.safeParse({
        ...validAssignmentInput,
        lesson_id: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept optional status', () => {
      const result = AssignmentInputSchema.safeParse({
        ...validAssignmentInput,
        status: 'in_progress',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('AssignmentUpdateSchema', () => {
    const validAssignmentId = '550e8400-e29b-41d4-a716-446655440000';

    it('should require id for updates', () => {
      const result = AssignmentUpdateSchema.safeParse({
        title: 'Updated Title',
      });
      expect(result.success).toBe(false);
    });

    it('should allow partial updates with id', () => {
      const result = AssignmentUpdateSchema.safeParse({
        id: validAssignmentId,
        title: 'Updated Title',
      });
      expect(result.success).toBe(true);
    });

    it('should validate id is UUID', () => {
      const result = AssignmentUpdateSchema.safeParse({
        id: 'not-a-uuid',
        title: 'Updated Title',
      });
      expect(result.success).toBe(false);
    });

    it('should allow status-only update', () => {
      const result = AssignmentUpdateSchema.safeParse({
        id: validAssignmentId,
        status: 'completed',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('AssignmentSchema', () => {
    it('should validate a complete assignment', () => {
      const result = AssignmentSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Practice Assignment',
        description: 'Complete the exercises',
        teacher_id: validTeacherId,
        student_id: validStudentId,
        status: 'not_started',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      });
      expect(result.success).toBe(true);
    });

    it('should default status to not_started', () => {
      const result = AssignmentSchema.safeParse({
        title: 'Practice Assignment',
        teacher_id: validTeacherId,
        student_id: validStudentId,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('not_started');
      }
    });
  });

  describe('AssignmentFilterSchema', () => {
    it('should validate empty filter', () => {
      const result = AssignmentFilterSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate filter by teacher_id', () => {
      const result = AssignmentFilterSchema.safeParse({
        teacher_id: validTeacherId,
      });
      expect(result.success).toBe(true);
    });

    it('should validate filter by student_id', () => {
      const result = AssignmentFilterSchema.safeParse({
        student_id: validStudentId,
      });
      expect(result.success).toBe(true);
    });

    it('should validate filter by status', () => {
      const result = AssignmentFilterSchema.safeParse({
        status: 'completed',
      });
      expect(result.success).toBe(true);
    });

    it('should validate date range filter', () => {
      const result = AssignmentFilterSchema.safeParse({
        due_date_from: '2024-01-01T00:00:00Z',
        due_date_to: '2024-01-31T23:59:59Z',
      });
      expect(result.success).toBe(true);
    });

    it('should validate search string', () => {
      const result = AssignmentFilterSchema.safeParse({
        search: 'chord practice',
      });
      expect(result.success).toBe(true);
    });

    it('should validate multiple filters', () => {
      const result = AssignmentFilterSchema.safeParse({
        teacher_id: validTeacherId,
        student_id: validStudentId,
        status: 'in_progress',
        search: 'guitar',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('AssignmentSortSchema', () => {
    it('should validate sort by due_date', () => {
      const result = AssignmentSortSchema.safeParse({
        field: 'due_date',
        direction: 'asc',
      });
      expect(result.success).toBe(true);
    });

    it('should default field to due_date', () => {
      const result = AssignmentSortSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.field).toBe('due_date');
      }
    });

    it('should default direction to asc', () => {
      const result = AssignmentSortSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.direction).toBe('asc');
      }
    });

    it('should accept all valid sort fields', () => {
      const fields = ['due_date', 'created_at', 'updated_at', 'title', 'status'];
      for (const field of fields) {
        const result = AssignmentSortSchema.safeParse({ field });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid sort field', () => {
      const result = AssignmentSortSchema.safeParse({
        field: 'invalid_field',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('AssignmentWithProfilesSchema', () => {
    const baseAssignment = {
      title: 'Practice Assignment',
      teacher_id: validTeacherId,
      student_id: validStudentId,
      status: 'not_started',
    };

    it('should validate assignment with profiles', () => {
      const result = AssignmentWithProfilesSchema.safeParse({
        ...baseAssignment,
        teacher_profile: {
          id: validTeacherId,
          email: 'teacher@example.com',
          full_name: 'Teacher Name',
        },
        student_profile: {
          id: validStudentId,
          email: 'student@example.com',
          full_name: 'Student Name',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should validate assignment with lesson', () => {
      const result = AssignmentWithProfilesSchema.safeParse({
        ...baseAssignment,
        lesson: {
          id: '550e8400-e29b-41d4-a716-446655440003',
          lesson_teacher_number: 5,
          scheduled_at: '2024-01-15T10:00:00Z',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should allow null lesson', () => {
      const result = AssignmentWithProfilesSchema.safeParse({
        ...baseAssignment,
        lesson: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('calculateAssignmentStatus', () => {
    it('should keep completed status', () => {
      const result = calculateAssignmentStatus('2024-01-01T00:00:00Z', 'completed');
      expect(result).toBe('completed');
    });

    it('should keep cancelled status', () => {
      const result = calculateAssignmentStatus('2024-01-01T00:00:00Z', 'cancelled');
      expect(result).toBe('cancelled');
    });

    it('should return overdue for past due_date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);
      const result = calculateAssignmentStatus(pastDate.toISOString(), 'not_started');
      expect(result).toBe('overdue');
    });

    it('should keep current status for future due_date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const result = calculateAssignmentStatus(futureDate.toISOString(), 'in_progress');
      expect(result).toBe('in_progress');
    });

    it('should return not_started for null due_date with no status', () => {
      const result = calculateAssignmentStatus(null, 'not_started');
      expect(result).toBe('not_started');
    });

    it('should keep in_progress for null due_date', () => {
      const result = calculateAssignmentStatus(null, 'in_progress');
      expect(result).toBe('in_progress');
    });
  });
});
