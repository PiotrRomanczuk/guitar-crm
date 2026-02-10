import { SupabaseClient } from '@supabase/supabase-js';
import { validateStatusTransition } from '@/schemas/AssignmentSchema';

interface Profile {
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

interface Assignment {
  id: string;
  teacher_id: string;
  student_id: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface UpdateInput {
  id: string;
  title?: string;
  description?: string;
  due_date?: string;
  status?: string;
  lesson_id?: string | null;
}

/**
 * Check if user has access to view an assignment
 */
function checkViewAccess(profile: Profile, assignment: Assignment, userId: string): boolean {
  return (
    profile.isAdmin ||
    (profile.isTeacher && assignment.teacher_id === userId) ||
    (profile.isStudent && assignment.student_id === userId)
  );
}

/**
 * Check if user has access to update an assignment
 */
function checkUpdateAccess(profile: Profile, assignment: Assignment, userId: string) {
  const isTeacherOwner = profile.isTeacher && assignment.teacher_id === userId;
  const isStudentOwner = profile.isStudent && assignment.student_id === userId;

  return {
    canUpdate: profile.isAdmin || isTeacherOwner || isStudentOwner,
    isTeacherOwner,
    isStudentOwner,
  };
}

/**
 * Validate student can only update allowed fields
 */
function validateStudentUpdate(
  isStudentOwner: boolean,
  profile: Profile,
  isTeacherOwner: boolean,
  body: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
): { valid: boolean; error?: string } {
  if (isStudentOwner && !profile.isAdmin && !isTeacherOwner) {
    const allowedFields = ['status'];
    const providedFields = Object.keys(body);
    const hasDisallowedFields = providedFields.some((field) => !allowedFields.includes(field));

    if (hasDisallowedFields) {
      return { valid: false, error: 'Students can only update assignment status' };
    }
  }

  return { valid: true };
}

/**
 * Build update data object from input
 */
function buildUpdateData(input: UpdateInput) {
  const updateData: Record<string, string | null> = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.due_date !== undefined) updateData.due_date = input.due_date;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.lesson_id !== undefined) updateData.lesson_id = input.lesson_id;
  return updateData;
}

/**
 * Check if user has permission to delete an assignment
 */
function checkDeletePermission(
  profile: Profile,
  assignment: { teacher_id: string },
  userId: string
): boolean {
  return profile.isAdmin || assignment.teacher_id === userId;
}

/**
 * GET handler - Fetch single assignment
 */
export async function getAssignmentHandler(
  supabase: SupabaseClient,
  assignmentId: string,
  userId: string,
  profile: Profile
) {
  // Fetch assignment with related data
  const { data: assignment, error } = await supabase
    .from('assignments')
    .select(
      `
      *,
      teacher_profile:profiles!assignments_teacher_id_fkey(id, email, full_name),
      student_profile:profiles!assignments_student_id_fkey(id, email, full_name),
      lesson:lessons(id, lesson_teacher_number, scheduled_at, status)
    `
    )
    .eq('id', assignmentId)
    .single();

  if (error || !assignment) {
    return { data: null, error: 'Assignment not found', status: 404 };
  }

  // Check access permissions
  if (!checkViewAccess(profile, assignment, userId)) {
    return { data: null, error: 'Access denied', status: 403 };
  }

  return { data: assignment, error: null, status: 200 };
}

/**
 * PATCH handler - Update assignment
 * Optimized: combines permission check into update WHERE clause (single query in happy path)
 */
export async function updateAssignmentHandler(
  supabase: SupabaseClient,
  assignmentId: string,
  userId: string,
  profile: Profile,
  input: UpdateInput,
  body: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
) {
  // For students, validate they only update allowed fields before querying
  if (profile.isStudent && !profile.isAdmin && !profile.isTeacher) {
    const allowedFields = ['status'];
    const providedFields = Object.keys(body);
    if (providedFields.some((field) => !allowedFields.includes(field))) {
      return { data: null, error: 'Students can only update assignment status', status: 403 };
    }
  }

  // Build update data
  const updateData = buildUpdateData(input);

  // For status transitions, fetch current status first (only when status is changing)
  if (input.status) {
    const { data: current } = await supabase
      .from('assignments')
      .select('status')
      .eq('id', assignmentId)
      .single();

    if (current && input.status !== current.status) {
      const transition = validateStatusTransition(current.status, input.status);
      if (!transition.valid) {
        return { data: null, error: transition.error!, status: 400 };
      }
    }
  }

  // Single update query with permission filters in WHERE clause
  let query = supabase
    .from('assignments')
    .update(updateData)
    .eq('id', assignmentId);

  if (!profile.isAdmin) {
    if (profile.isTeacher) {
      query = query.eq('teacher_id', userId);
    } else if (profile.isStudent) {
      query = query.eq('student_id', userId);
    }
  }

  const { data: assignment, error } = await query
    .select(
      `
      *,
      teacher_profile:profiles!assignments_teacher_id_fkey(id, email, full_name),
      student_profile:profiles!assignments_student_id_fkey(id, email, full_name),
      lesson:lessons(id, lesson_teacher_number, scheduled_at, status)
    `
    )
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - either not found or permission denied
      const { data: exists } = await supabase
        .from('assignments')
        .select('id')
        .eq('id', assignmentId)
        .single();

      if (!exists) {
        return { data: null, error: 'Assignment not found', status: 404 };
      }
      return { data: null, error: 'Access denied', status: 403 };
    }
    console.error('Error updating assignment:', error);
    return { data: null, error: 'Failed to update assignment', status: 500 };
  }

  return { data: assignment, error: null, status: 200 };
}

/**
 * DELETE handler - Delete assignment
 */
export async function deleteAssignmentHandler(
  supabase: SupabaseClient,
  assignmentId: string,
  userId: string,
  profile: Profile
) {
  // Fetch existing assignment to check ownership
  const { data: existingAssignment, error: fetchError } = await supabase
    .from('assignments')
    .select('teacher_id')
    .eq('id', assignmentId)
    .single();

  if (fetchError || !existingAssignment) {
    return { data: null, error: 'Assignment not found', status: 404 };
  }

  // Check delete permissions
  if (!checkDeletePermission(profile, existingAssignment, userId)) {
    return {
      data: null,
      error: 'Only admins and the assignment creator can delete assignments',
      status: 403,
    };
  }

  // Delete assignment
  const { error } = await supabase.from('assignments').delete().eq('id', assignmentId);

  if (error) {
    console.error('Error deleting assignment:', error);
    return { data: null, error: 'Failed to delete assignment', status: 500 };
  }

  return { data: { message: 'Assignment deleted successfully' }, error: null, status: 200 };
}
