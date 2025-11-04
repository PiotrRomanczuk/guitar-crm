import { createClient } from '@/utils/supabase/clients/server';
import { NextRequest, NextResponse } from 'next/server';
import { getLessonsHandler } from '../../lessons/handlers';

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
 * GET /api/student/lessons
 * List lessons for student (read-only, only their own lessons)
 */
export async function GET(request: NextRequest) {
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

		// Student-only check
		if (!profile.isStudent) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const { searchParams } = new URL(request.url);
		const queryParams = extractQueryParams(searchParams);

		// Students see only their own lessons
		const result = await getLessonsHandler(
			supabase,
			user,
			profile,
			queryParams
		);

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
		console.error('Error in student lessons API:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/student/lessons
 * Students cannot create lessons - read-only access
 */
export async function POST() {
	return NextResponse.json(
		{ error: 'Students cannot create lessons' },
		{ status: 403 }
	);
}
