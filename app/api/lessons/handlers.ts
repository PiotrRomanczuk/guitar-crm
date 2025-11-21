// Pure functions for lesson API business logic - testable without Next.js dependencies
import { LessonInputSchema, LessonSchema } from '../../../schemas/LessonSchema';
import { z, ZodError } from 'zod';

type Lesson = z.infer<typeof LessonSchema>;

export interface LessonQueryParams {
  userId?: string;
  studentId?: string;
  filter?: string; // status
  sort?: 'created_at' | 'date' | 'lesson_number';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface LessonError {
  error: string;
  status: number;
}

export interface UserProfile {
  isAdmin: boolean;
  isTeacher: boolean | null;
  isStudent: boolean | null;
}

export function validateMutationPermission(profile: UserProfile | null): boolean {
  return !!(profile?.isAdmin || profile?.isTeacher);
}

export function canViewAll(profile: UserProfile | null): boolean {
  return !!profile?.isAdmin;
}

function validateSortField(sort?: string): 'created_at' | 'date' | 'lesson_number' {
  const allowed = ['created_at', 'date', 'lesson_number'] as const;
  return (allowed as readonly string[]).includes(sort || '')
    ? (sort as 'created_at' | 'date' | 'lesson_number')
    : 'created_at';
}

// Helper types for query building
type SupabaseClient = Awaited<
  ReturnType<typeof import('../../../lib/supabase/server').createClient>
>;

/**
 * Get teacher's student IDs
 */
async function getTeacherStudentIds(
  supabase: SupabaseClient,
  teacherId: string
): Promise<string[]> {
  const { data } = await supabase.from('lessons').select('student_id').eq('teacher_id', teacherId);

  const studentIds = data?.map((l) => l.student_id) || [];
  const uniqueStudentIds = Array.from(new Set(studentIds));
  return uniqueStudentIds;
}

/**
 * Apply role-based filtering to lessons query
 */
async function applyRoleBasedFiltering(
  supabase: SupabaseClient,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dbQuery: any,
  user: { id: string },
  profile: UserProfile,
  params: LessonQueryParams
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any | { lessons: []; count: number; status: number }> {
  if (!profile) {
    console.error('applyRoleBasedFiltering called with null profile');
    return { lessons: [], count: 0, status: 500 };
  }

  if (canViewAll(profile)) {
    // Admin sees all lessons
    return applyLessonFilters(dbQuery, params);
  }

  if (profile.isTeacher) {
    // Teacher sees only their students' lessons
    const studentIds = await getTeacherStudentIds(supabase, user.id);
    if (studentIds.length === 0) {
      return { lessons: [], count: 0, status: 200 };
    }
    const filteredQuery = dbQuery.in('student_id', studentIds);
    return applyLessonFilters(filteredQuery, { filter: params.filter });
  }

  // Student sees only their own lessons
  const studentQuery = dbQuery.eq('student_id', user.id);
  return applyLessonFilters(studentQuery, { filter: params.filter });
}

function applyLessonFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  params: LessonQueryParams
) {
  let q = query;
  if (params.userId) {
    q = q.or(`student_id.eq.${params.userId},teacher_id.eq.${params.userId}`);
  }
  if (params.studentId) {
    q = q.eq('student_id', params.studentId);
  }
  if (params.filter && params.filter !== 'all') {
    q = q.eq('status', params.filter.toUpperCase());
  }
  return q;
}

function applySortAndPagination(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  sort: string,
  sortOrder: string,
  page: number,
  limit: number
) {
  // If we received an already-executed query result, just return it
  if (query && 'data' in query && 'error' in query && 'count' in query) {
    return query;
  }

  if (!query || typeof query.order !== 'function') {
    console.error('applySortAndPagination received invalid query object');
    throw new Error('Invalid query object passed to applySortAndPagination');
  }

  const ascending = sortOrder === 'asc';
  const offset = (page - 1) * limit;
  return query.order(sort, { ascending }).range(offset, offset + limit - 1);
}

// Complexity is slightly over due to role-based filtering logic
// eslint-disable-next-line complexity
export async function getLessonsHandler(
  supabase: SupabaseClient,
  user: { id: string } | null,
  profile: UserProfile | null,
  query: LessonQueryParams
): Promise<{
  lessons?: unknown[];
  count?: number;
  status: number;
  error?: string;
}> {
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }

  if (!profile) {
    return { error: 'Profile not found', status: 404 };
  }

  const {
    userId,
    studentId,
    filter,
    sort = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 50,
  } = query;

  const sortField = validateSortField(sort);
  const baseQuery = supabase.from('lessons').select(
    `
      *,
      profile:profiles!student_id(id, full_name, email),
      teacher_profile:profiles!teacher_id(id, full_name, email)
    `,
    { count: 'exact' }
  );

  // Apply role-based filtering
  const filteredQuery = await applyRoleBasedFiltering(supabase, baseQuery, user, profile, {
    userId,
    studentId,
    filter,
  });

  // Check if early return (teacher with no students)
  if ('lessons' in filteredQuery) {
    return filteredQuery;
  }

  const finalQuery = applySortAndPagination(filteredQuery, sortField, sortOrder, page, limit);

  // If finalQuery is already an executed result, handle it directly
  if (finalQuery && 'data' in finalQuery && 'error' in finalQuery) {
    const { data, error, count } = finalQuery;
    if (error) {
      return { error: error.message, status: 500 };
    }
    return { lessons: data || [], count: count ?? 0, status: 200 };
  }

  // Otherwise, execute the query
  const { data, error, count } = await finalQuery;
  if (error) {
    return { error: error.message, status: 500 };
  }
  return { lessons: data || [], count: count ?? 0, status: 200 };
}

export async function createLessonHandler(
  supabase: SupabaseClient,
  user: { id: string } | null,
  profile: UserProfile | null,
  body: unknown
): Promise<{ lesson?: unknown; status: number; error?: string }> {
  if (!user) return { error: 'Unauthorized', status: 401 };
  if (!profile) return { error: 'Profile not found', status: 404 };

  if (!validateMutationPermission(profile)) {
    return {
      error: 'Only admins and teachers can create lessons',
      status: 403,
    };
  }

  try {
    const validatedData = LessonInputSchema.parse(body);
    const { data, error } = await supabase.from('lessons').insert(validatedData).select().single();

    if (error) {
      return { error: error.message, status: 500 };
    }

    return { lesson: data, status: 201 };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        error: `Validation error: ${error.errors.map((e) => e.message).join(', ')}`,
        status: 400,
      };
    }
    return { error: 'Internal server error', status: 500 };
  }
}

export async function updateLessonHandler(
  supabase: SupabaseClient,
  user: { id: string } | null,
  profile: UserProfile | null,
  id: string,
  body: unknown
): Promise<{ lesson?: unknown; status: number; error?: string }> {
  if (!user) return { error: 'Unauthorized', status: 401 };
  if (!profile) return { error: 'Profile not found', status: 404 };

  if (!validateMutationPermission(profile)) {
    return {
      error: 'Only admins and teachers can update lessons',
      status: 403,
    };
  }

  try {
    const validatedData = LessonInputSchema.partial().parse(body);
    const { data, error } = await supabase
      .from('lessons')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { error: error.message, status: 500 };
    }

    return { lesson: data, status: 200 };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        error: `Validation error: ${error.errors.map((e) => e.message).join(', ')}`,
        status: 400,
      };
    }
    return { error: 'Internal server error', status: 500 };
  }
}

export async function deleteLessonHandler(
  supabase: SupabaseClient,
  user: { id: string } | null,
  profile: UserProfile | null,
  id: string
): Promise<{ status: number; error?: string }> {
  if (!user) return { error: 'Unauthorized', status: 401 };
  if (!profile) return { error: 'Profile not found', status: 404 };

  if (!validateMutationPermission(profile)) {
    return {
      error: 'Only admins and teachers can delete lessons',
      status: 403,
    };
  }

  const { error } = await supabase.from('lessons').delete().eq('id', id);

  if (error) {
    return { error: error.message, status: 500 };
  }

  return { status: 200 };
}

export async function getLessonByIdHandler(
  supabase: SupabaseClient,
  user: { id: string } | null,
  profile: UserProfile | null,
  id: string
): Promise<{ lesson?: Lesson; status: number; error?: string }> {
  if (!user) return { error: 'Unauthorized', status: 401 };
  if (!profile) return { error: 'Profile not found', status: 404 };

  const { data: lesson, error } = await supabase.from('lessons').select('*').eq('id', id).single();

  if (error || !lesson) {
    return { error: 'Lesson not found', status: 404 };
  }

  // Permission check
  if (canViewAll(profile)) {
    return { lesson, status: 200 };
  }

  if (profile.isTeacher) {
    const studentIds = await getTeacherStudentIds(supabase, user.id);
    if (studentIds.includes(lesson.student_id)) {
      return { lesson, status: 200 };
    }
    return { error: 'Forbidden', status: 403 };
  }

  if (profile.isStudent) {
    if (lesson.student_id === user.id) {
      return { lesson, status: 200 };
    }
    return { error: 'Forbidden', status: 403 };
  }

  return { error: 'Forbidden', status: 403 };
}
