import { createClient } from '@/utils/supabase/clients/server';
import { NextRequest, NextResponse } from 'next/server';
import { getLessonsHandler, createLessonHandler } from './handlers';

/**
 * Helper to get user profile with roles
 */
async function getUserProfile(
	supabase: Awaited<ReturnType<typeof createClient>>,
	userId: string
) {
	const { data: profile, error } = await supabase
		.from('profiles')
		.select('isAdmin, isTeacher, isStudent')
		.eq('user_id', userId)
		.single();

	if (error || !profile) {
		return null;
	}

	return profile;
}

/**
 * Extract query parameters from request
 */
function extractQueryParams(searchParams: URLSearchParams) {
	return {
		userId: searchParams.get('userId') || undefined,
		studentId: searchParams.get('studentId') || undefined,
		filter: searchParams.get('filter') || undefined,
		sort: searchParams.get('sort') as
			| 'created_at'
			| 'date'
			| 'lesson_number'
			| undefined,
		sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' | undefined,
		page: searchParams.get('page')
			? parseInt(searchParams.get('page')!)
			: undefined,
		limit: searchParams.get('limit')
			? parseInt(searchParams.get('limit')!)
			: undefined,
	};
}

/**
 * GET /api/lessons
 * List all lessons with role-based filtering
 */
// eslint-disable-next-line complexity
export async function GET(request: NextRequest) {
	try {
		console.log('[Lessons API] GET request received');
		const supabase = await createClient();
		console.log('[Lessons API] Supabase client created');

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		console.log('[Lessons API] Auth check:', {
			hasUser: !!user,
			userId: user?.id,
			error: authError?.message,
		});

		if (!user) {
			console.log('[Lessons API] No user found - returning 401');
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		console.log('[Lessons API] User authenticated:', user.email);

		const profile = await getUserProfile(supabase, user.id);
		console.log('[Lessons API] Profile loaded:', {
			hasProfile: !!profile,
			isAdmin: profile?.isAdmin,
			isTeacher: profile?.isTeacher,
			isStudent: profile?.isStudent,
		});

		if (!profile) {
			console.log('[Lessons API] Profile not found - returning 404');
			return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
		}

		const { searchParams } = new URL(request.url);
		const queryParams = extractQueryParams(searchParams);
		console.log('[Lessons API] Query params:', queryParams);

		const result = await getLessonsHandler(
			supabase,
			user,
			profile,
			queryParams
		);
		console.log('[Lessons API] Handler result:', {
			success: !result.error,
			lessonCount: result.lessons?.length,
			error: result.error,
		});

		if (result.error) {
			return NextResponse.json(
				{ error: result.error },
				{ status: result.status }
			);
		}

		return NextResponse.json(
			{
				lessons: result.lessons || [],
				count: result.count || 0,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error in lessons API:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/lessons
 * Create a new lesson (admin/teacher only)
 */
export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const profile = await getUserProfile(supabase, user.id);
		if (!profile) {
			return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
		}

		const body = await request.json();
		const result = await createLessonHandler(supabase, user, profile, body);

		if (result.error) {
			return NextResponse.json(
				{ error: result.error },
				{ status: result.status }
			);
		}

		return NextResponse.json(result.lesson, { status: result.status });
	} catch (error) {
		console.error('Error in lesson creation API:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
