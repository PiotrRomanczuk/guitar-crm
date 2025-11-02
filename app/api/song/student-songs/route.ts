import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/clients/server';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get('userId');
		const level = searchParams.get('level');

		if (!userId) {
			return NextResponse.json(
				{ error: 'User ID is required' },
				{ status: 400 }
			);
		}

		const supabase = await createClient();

		// 1. Verify user exists and has student role
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('isstudent')
			.eq('user_id', userId)
			.single();

		if (profileError || !profile) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		// 2. Get lessons for this student
		const { data: lessons, error: lessonsError } = await supabase
			.from('lessons')
			.select('id')
			.eq('student_id', userId);

		if (lessonsError) {
			return NextResponse.json(
				{ error: 'Failed to fetch lessons' },
				{ status: 500 }
			);
		}

		if (!lessons || lessons.length === 0) {
			return NextResponse.json([]);
		}

		const lessonIds = lessons.map((l) => l.id);

		// 3. Get assigned songs from lesson_songs table
		const { data: lessonSongs, error: lessonError } = await supabase
			.from('lesson_songs')
			.select('song_id, song_status')
			.in('lesson_id', lessonIds);

		if (lessonError) {
			return NextResponse.json(
				{ error: 'Failed to fetch assigned songs' },
				{ status: 500 }
			);
		}

		if (!lessonSongs || lessonSongs.length === 0) {
			return NextResponse.json([]);
		}

		// 4. Get full song details
		const songIds = [...new Set(lessonSongs.map((ls) => ls.song_id))];
		let query = supabase.from('songs').select('*').in('id', songIds);

		if (level) {
			query = query.eq('level', level as 'beginner' | 'intermediate' | 'advanced');
		}

		const { data: songs, error: songsError } = await query;

		if (songsError) {
			return NextResponse.json(
				{ error: 'Failed to fetch songs' },
				{ status: 500 }
			);
		}

		// 5. Merge song details with status
		const statusMap = new Map(
			lessonSongs.map((ls) => [ls.song_id, ls.song_status])
		);

		const songsWithStatus = (songs || []).map((song) => ({
			...song,
			status: statusMap.get(song.id) || 'to_learn',
		}));

		return NextResponse.json(songsWithStatus);
	} catch (error) {
		console.error('Error in student-songs route:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
