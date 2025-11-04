import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
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

		await headers();
		const supabase = await createClient();

		// 1. Verify user exists and has student role
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('isStudent')
			.eq('user_id', userId)
			.single();

		if (profileError || !profile) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		// 2. Get assigned songs from lesson_songs table
		const { data: lessonSongs, error: lessonError } = await supabase
			.from('lesson_songs')
			.select('song_id, status')
			.in(
				'lesson_id',
				supabase.from('lessons').select('id').eq('student_id', userId)
			);

		if (lessonError) {
			return NextResponse.json(
				{ error: 'Failed to fetch assigned songs' },
				{ status: 500 }
			);
		}

		if (!lessonSongs || lessonSongs.length === 0) {
			return NextResponse.json([]);
		}

		// 3. Get full song details
		const songIds = [...new Set(lessonSongs.map((ls) => ls.song_id))];
		let query = supabase.from('songs').select('*').in('id', songIds);

		if (level) {
			query = query.eq('level', level);
		}

		const { data: songs, error: songsError } = await query;

		if (songsError) {
			return NextResponse.json(
				{ error: 'Failed to fetch songs' },
				{ status: 500 }
			);
		}

		// 4. Merge song details with status
		const statusMap = new Map(lessonSongs.map((ls) => [ls.song_id, ls.status]));

		const songsWithStatus = songs.map((song) => ({
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
