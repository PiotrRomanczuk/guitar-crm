// Pure functions for lesson API business logic - testable without Next.js dependencies

import { LessonInputSchema } from '@/schemas';
import { ZodError } from 'zod';

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

export function validateMutationPermission(
	profile: UserProfile | null
): boolean {
	return !!(profile?.isAdmin || profile?.isTeacher);
}

export function canViewAll(profile: UserProfile | null): boolean {
	return !!profile?.isAdmin;
}

function validateSortField(
	sort?: string
): 'created_at' | 'date' | 'lesson_number' {
	const allowed = ['created_at', 'date', 'lesson_number'] as const;
	return (allowed as readonly string[]).includes(sort || '')
		? (sort as 'created_at' | 'date' | 'lesson_number')
		: 'created_at';
}

// Helper types for query building
type SupabaseQuery = ReturnType<
	Awaited<
		ReturnType<typeof import('@/utils/supabase/clients/server').createClient>
	>['from']
>;

type SupabaseClient = Awaited<
	ReturnType<typeof import('@/utils/supabase/clients/server').createClient>
>;

/**
 * Get teacher's student IDs
 */
async function getTeacherStudentIds(
	supabase: SupabaseClient,
	teacherId: string
): Promise<string[]> {
	const { data } = await supabase
		.from('lessons')
		.select('student_id')
		.eq('teacher_id', teacherId);

	const uniqueStudentIds = [...new Set(data?.map((l) => l.student_id) || [])];
	return uniqueStudentIds;
}

/**
 * Apply role-based filtering to lessons query
 */
async function applyRoleBasedFiltering(
	supabase: SupabaseClient,
	dbQuery: ReturnType<SupabaseQuery>,
	user: { id: string },
	profile: UserProfile,
	params: LessonQueryParams
): Promise<
	ReturnType<SupabaseQuery> | { lessons: []; count: number; status: number }
> {
	console.log('[applyRoleBasedFiltering] Profile:', {
		isAdmin: profile.isAdmin,
		isTeacher: profile.isTeacher,
		isStudent: profile.isStudent,
	});

	if (canViewAll(profile)) {
		console.log(
			'[applyRoleBasedFiltering] Admin access - returning all lessons'
		);
		// Admin sees all lessons
		return applyLessonFilters(dbQuery, params);
	}

	if (profile.isTeacher) {
		console.log(
			'[applyRoleBasedFiltering] Teacher access - fetching student IDs...'
		);
		// Teacher sees only their students' lessons
		const studentIds = await getTeacherStudentIds(supabase, user.id);
		console.log(
			'[applyRoleBasedFiltering] Teacher has',
			studentIds.length,
			'students'
		);
		if (studentIds.length === 0) {
			console.log(
				'[applyRoleBasedFiltering] No students - returning empty array'
			);
			return { lessons: [], count: 0, status: 200 };
		}
		const filteredQuery = dbQuery.in('student_id', studentIds);
		return applyLessonFilters(filteredQuery, { filter: params.filter });
	}

	console.log(
		'[applyRoleBasedFiltering] Student access - filtering by student ID'
	);
	// Student sees only their own lessons
	const studentQuery = dbQuery.eq('student_id', user.id);
	return applyLessonFilters(studentQuery, { filter: params.filter });
}

function applyLessonFilters(
	query: ReturnType<SupabaseQuery>,
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
	query: ReturnType<SupabaseQuery>,
	sort: string,
	sortOrder: string,
	page: number,
	limit: number
) {
	const ascending = sortOrder === 'asc';
	const offset = (page - 1) * limit;
	return query.order(sort, { ascending }).range(offset, offset + limit - 1);
}

// Complexity is slightly over due to role-based filtering logic
// eslint-disable-next-line complexity, max-lines-per-function
export async function getLessonsHandler(
	supabase: Awaited<
		ReturnType<typeof import('@/utils/supabase/clients/server').createClient>
	>,
	user: { id: string } | null,
	profile: UserProfile | null,
	query: LessonQueryParams
): Promise<{
	lessons?: unknown[];
	count?: number;
	status: number;
	error?: string;
}> {
	console.log('[getLessonsHandler] Starting...');
	if (!user) {
		console.log('[getLessonsHandler] No user - returning 401');
		return { error: 'Unauthorized', status: 401 };
	}

	if (!profile) {
		console.log('[getLessonsHandler] No profile - returning 404');
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

	console.log('[getLessonsHandler] Parsed params:', {
		userId,
		studentId,
		filter,
		sort,
		sortOrder,
		page,
		limit,
	});

	const sortField = validateSortField(sort);

	console.log('[getLessonsHandler] Creating base query...');
	const baseQuery = supabase.from('lessons').select('*', { count: 'exact' });

	console.log('[getLessonsHandler] Applying role-based filtering...');
	// Apply role-based filtering
	const filteredQuery = await applyRoleBasedFiltering(
		supabase,
		baseQuery,
		user,
		profile,
		{ userId, studentId, filter }
	);

	console.log(
		'[getLessonsHandler] Role filtering complete, checking for early return...'
	);
	// Check if early return (teacher with no students)
	if ('lessons' in filteredQuery) {
		console.log('[getLessonsHandler] Early return - teacher with no students');
		return filteredQuery;
	}

	console.log('[getLessonsHandler] Applying sort and pagination...');
	const finalQuery = applySortAndPagination(
		filteredQuery,
		sortField,
		sortOrder,
		page,
		limit
	);

	console.log('[getLessonsHandler] Executing final query...');
	const { data, error, count } = await finalQuery;
	console.log('[getLessonsHandler] Query executed:', {
		dataLength: data?.length,
		error: error?.message,
		count,
	});

	if (error) {
		console.log('[getLessonsHandler] Query error:', error.message);
		return { error: error.message, status: 500 };
	}

	console.log(
		'[getLessonsHandler] Returning success with',
		data?.length,
		'lessons'
	);
	return { lessons: data || [], count: count ?? 0, status: 200 };
}

export async function createLessonHandler(
	supabase: Awaited<
		ReturnType<typeof import('@/utils/supabase/clients/server').createClient>
	>,
	user: { id: string } | null,
	profile: UserProfile | null,
	body: unknown
): Promise<{ lesson?: unknown; status: number; error?: string }> {
	if (!user) return { error: 'Unauthorized', status: 401 };
	if (!profile) return { error: 'Profile not found', status: 404 };
	if (!validateMutationPermission(profile)) {
		return {
			error: 'Forbidden: Only teachers and admins can create lessons',
			status: 403,
		};
	}

	try {
		const validated = LessonInputSchema.parse(body);
		const { data, error } = await supabase
			.from('lessons')
			.insert({
				teacher_id: validated.teacher_id,
				student_id: validated.student_id,
				date: validated.date,
				start_time: validated.start_time,
				title: validated.title ?? null,
				notes: validated.notes ?? null,
				status: validated.status ?? 'SCHEDULED',
				creator_user_id: user.id,
			})
			.select()
			.single();

		if (error) return { error: error.message, status: 500 };
		return { lesson: data, status: 201 };
	} catch (err) {
		if (err instanceof ZodError) {
			return { error: 'Validation failed', status: 422 };
		}
		return { error: 'Internal server error', status: 500 };
	}
}

export async function updateLessonHandler(
	supabase: Awaited<
		ReturnType<typeof import('@/utils/supabase/clients/server').createClient>
	>,
	user: { id: string } | null,
	profile: UserProfile | null,
	lessonId: string,
	body: unknown
): Promise<{ lesson?: unknown; status: number; error?: string }> {
	if (!user) return { error: 'Unauthorized', status: 401 };
	if (!profile) return { error: 'Profile not found', status: 404 };
	if (!validateMutationPermission(profile)) {
		return {
			error: 'Forbidden: Only teachers and admins can update lessons',
			status: 403,
		};
	}

	try {
		const validated = LessonInputSchema.partial().parse(body);
		const { data, error } = await supabase
			.from('lessons')
			.update({
				title: validated.title,
				notes: validated.notes,
				date: validated.date,
				start_time: validated.start_time,
				status: validated.status,
				updated_at: new Date().toISOString(),
			})
			.eq('id', lessonId)
			.select()
			.single();

		if (error) return { error: error.message, status: 500 };
		return { lesson: data, status: 200 };
	} catch (err) {
		if (err instanceof ZodError) {
			return { error: 'Validation failed', status: 422 };
		}
		return { error: 'Internal server error', status: 500 };
	}
}

export async function deleteLessonHandler(
	supabase: Awaited<
		ReturnType<typeof import('@/utils/supabase/clients/server').createClient>
	>,
	user: { id: string } | null,
	profile: UserProfile | null,
	lessonId: string
): Promise<{ success?: boolean; status: number; error?: string }> {
	if (!user) return { error: 'Unauthorized', status: 401 };
	if (!profile) return { error: 'Profile not found', status: 404 };
	if (!validateMutationPermission(profile)) {
		return {
			error: 'Forbidden: Only teachers and admins can delete lessons',
			status: 403,
		};
	}

	const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
	if (error) return { error: error.message, status: 500 };
	return { success: true, status: 200 };
}
