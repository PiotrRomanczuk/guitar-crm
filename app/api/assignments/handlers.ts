import { AssignmentFilterSchema, AssignmentSortSchema } from '@/schemas/AssignmentSchema';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Assignment API Handlers
 * Business logic separated from route handlers for better testability and maintainability
 */

type Profile = {
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
};

type QueryParams = {
  teacher_id?: string;
  student_id?: string;
  lesson_id?: string;
  status?: string;
  search?: string;
  due_date_from?: string;
  due_date_to?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
};

type AssignmentInput = {
  title: string;
  description?: string;
  due_date?: string;
  teacher_id: string;
  student_id: string;
  lesson_id?: string | null;
  status?: string;
};

/**
 * Build base query with role-based filters
 */
function buildAssignmentQuery(supabase: SupabaseClient, userId: string, profile: Profile) {
  const query = supabase.from('assignments').select(`
      *,
      teacher_profile:profiles!assignments_teacher_id_fkey(id, email, full_name),
      student_profile:profiles!assignments_student_id_fkey(id, email, full_name),
      lesson:lessons(id, lesson_teacher_number, scheduled_at)
    `);

  // Apply role-based filters
  if (profile.isAdmin) return query; // Admins see all
  if (profile.isTeacher) return query.eq('teacher_id', userId);
  if (profile.isStudent) return query.eq('student_id', userId);

  return query.eq('id', '00000000-0000-0000-0000-000000000000'); // No access
}

/**
 * Apply additional filters to query
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(query: any, filters: Record<string, any>) {
  let result = query;

  if (filters.teacher_id) result = result.eq('teacher_id', filters.teacher_id);
  if (filters.student_id) result = result.eq('student_id', filters.student_id);
  if (filters.lesson_id) result = result.eq('lesson_id', filters.lesson_id);
  if (filters.status) result = result.eq('status', filters.status);
  if (filters.search) {
    result = result.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }
  if (filters.due_date_from) result = result.gte('due_date', filters.due_date_from);
  if (filters.due_date_to) result = result.lte('due_date', filters.due_date_to);

  return result;
}

/**
 * GET handler - Fetch assignments with role-based filtering
 */
export async function getAssignmentsHandler(
  supabase: SupabaseClient,
  userId: string,
  profile: Profile,
  queryParams: QueryParams
) {
  try {
    const filters = AssignmentFilterSchema.parse({
      teacher_id: queryParams.teacher_id,
      student_id: queryParams.student_id,
      lesson_id: queryParams.lesson_id,
      status: queryParams.status,
      search: queryParams.search,
      due_date_from: queryParams.due_date_from,
      due_date_to: queryParams.due_date_to,
    });

    const sort = AssignmentSortSchema.parse({
      field: queryParams.sortField || 'created_at',
      direction: queryParams.sortDirection || 'desc',
    });

    let query = buildAssignmentQuery(supabase, userId, profile);
    query = applyFilters(query, filters);
    query = query.order(sort.field, { ascending: sort.direction === 'asc' });

    const { data: assignments, error } = await query;

    if (error) {
      console.error('Error fetching assignments:', error);
      return { error: 'Failed to fetch assignments', status: 500 };
    }

    return { assignments, status: 200 };
  } catch (error) {
    console.error('Error in getAssignmentsHandler:', error);
    return { error: 'Internal server error', status: 500 };
  }
}

/**
 * Verify student is valid for assignment
 */
async function verifyStudent(supabase: SupabaseClient, studentId: string) {
  const { data: studentProfile, error } = await supabase
    .from('profiles')
    .select('id, is_student')
    .eq('id', studentId)
    .single();

  if (error || !studentProfile) {
    return { valid: false, error: 'Student not found' };
  }

  if (!studentProfile.is_student) {
    return { valid: false, error: 'Specified user is not a student' };
  }

  return { valid: true };
}

/**
 * Verify lesson matches teacher and student
 */
async function verifyLesson(
  supabase: SupabaseClient,
  lessonId: string,
  teacherId: string,
  studentId: string
) {
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('id, teacher_id, student_id')
    .eq('id', lessonId)
    .single();

  if (error || !lesson) {
    return { valid: false, error: 'Lesson not found' };
  }

  if (lesson.teacher_id !== teacherId || lesson.student_id !== studentId) {
    return { valid: false, error: 'Lesson does not match specified teacher and student' };
  }

  return { valid: true };
}

/**
 * Check if user can create assignment
 */
function checkCreatePermissions(profile: Profile, userId: string, teacherId: string) {
  if (!profile.isAdmin && !profile.isTeacher) {
    return { allowed: false, error: 'Only teachers and admins can create assignments' };
  }

  if (!profile.isAdmin && teacherId !== userId) {
    return { allowed: false, error: 'Teachers can only create assignments for themselves' };
  }

  return { allowed: true };
}

/**
 * POST handler - Create new assignment
 */
export async function createAssignmentHandler(
  supabase: SupabaseClient,
  userId: string,
  profile: Profile,
  input: AssignmentInput
) {
  try {
    // Check permissions
    const permissionCheck = checkCreatePermissions(profile, userId, input.teacher_id);
    if (!permissionCheck.allowed) {
      return { error: permissionCheck.error, status: 403 };
    }

    // Verify student
    const studentCheck = await verifyStudent(supabase, input.student_id);
    if (!studentCheck.valid) {
      return { error: studentCheck.error, status: 400 };
    }

    // Verify lesson if provided
    if (input.lesson_id) {
      const lessonCheck = await verifyLesson(
        supabase,
        input.lesson_id,
        input.teacher_id,
        input.student_id
      );
      if (!lessonCheck.valid) {
        return { error: lessonCheck.error, status: 400 };
      }
    }

    // Create assignment
    const { data: assignment, error } = await supabase
      .from('assignments')
      .insert({
        title: input.title,
        description: input.description,
        due_date: input.due_date,
        teacher_id: input.teacher_id,
        student_id: input.student_id,
        lesson_id: input.lesson_id,
        status: input.status || 'not_started',
      })
      .select(
        `
        *,
        teacher_profile:profiles!assignments_teacher_id_fkey(id, email, full_name),
        student_profile:profiles!assignments_student_id_fkey(id, email, full_name),
        lesson:lessons(id, lesson_teacher_number, scheduled_at)
      `
      )
      .single();

    if (error) {
      console.error('Error creating assignment:', error);
      return { error: 'Failed to create assignment', status: 500 };
    }

    return { assignment, status: 201 };
  } catch (error) {
    console.error('Error in createAssignmentHandler:', error);
    return { error: 'Internal server error', status: 500 };
  }
}
