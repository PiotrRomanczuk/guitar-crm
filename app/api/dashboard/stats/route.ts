import { createClient } from '@/utils/supabase/clients/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/dashboard/stats
 * Returns dashboard statistics based on user role
 */
export async function GET() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get user profile to check roles
		const { data: profile } = await supabase
			.from('profiles')
			.select('isAdmin, isTeacher, isStudent')
			.eq('user_id', user.id)
			.single();

		if (!profile) {
			return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
		}

		// Admin stats
		if (profile.isAdmin) {
			const [
				{ count: totalUsers },
				{ count: totalTeachers },
				{ count: totalStudents },
				{ count: totalSongs },
			] = await Promise.all([
				supabase.from('profiles').select('*', { count: 'exact', head: true }),
				supabase
					.from('profiles')
					.select('*', { count: 'exact', head: true })
					.eq('isTeacher', true),
				supabase
					.from('profiles')
					.select('*', { count: 'exact', head: true })
					.eq('isStudent', true),
				supabase.from('songs').select('*', { count: 'exact', head: true }),
			]);

			return NextResponse.json({
				role: 'admin',
				stats: {
					totalUsers: totalUsers || 0,
					totalTeachers: totalTeachers || 0,
					totalStudents: totalStudents || 0,
					totalSongs: totalSongs || 0,
				},
			});
		}

		// Teacher stats
		if (profile.isTeacher) {
			const [
				{ count: myStudents },
				{ count: activeLessons },
				{ count: songsLibrary },
			] = await Promise.all([
				supabase
					.from('lessons')
					.select('*', { count: 'exact', head: true })
					.eq('teacher_id', user.id),
				supabase
					.from('lessons')
					.select('*', { count: 'exact', head: true })
					.eq('teacher_id', user.id)
					.eq('status', 'IN_PROGRESS'),
				supabase.from('songs').select('*', { count: 'exact', head: true }),
			]);

			return NextResponse.json({
				role: 'teacher',
				stats: {
					myStudents: myStudents || 0,
					activeLessons: activeLessons || 0,
					songsLibrary: songsLibrary || 0,
					studentProgress: 0, // TODO: Calculate average progress
				},
			});
		}

		// Student stats
		if (profile.isStudent) {
			// Get lessons for this student
			const { data: lessons } = await supabase
				.from('lessons')
				.select('id, teacher_id, lesson_teacher_number')
				.eq('student_id', user.id);

			const lessonIds = lessons?.map((l) => l.id) || [];

			// Get songs count for these lessons
			const { count: songsLearning } = await supabase
				.from('lesson_songs')
				.select('*', { count: 'exact', head: true })
				.in('lesson_id', lessonIds);

			const uniqueTeachers = new Set(lessons?.map((l) => l.teacher_id)).size;
			const lessonsDone = lessons?.length || 0;

			return NextResponse.json({
				role: 'student',
				stats: {
					myTeacher: uniqueTeachers || 0,
					lessonsDone: lessonsDone,
					songsLearning: songsLearning || 0,
					progress: 0, // TODO: Calculate progress percentage
				},
			});
		}

		return NextResponse.json({
			role: 'user',
			stats: {},
		});
	} catch (error) {
		console.error('Error fetching dashboard stats:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
