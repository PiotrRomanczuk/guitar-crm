import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
	const supabase = await createClient();

	// Require authenticated user and use session user ID
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const userId = user.id;

	// 1. Get all lesson IDs for this user (as student)
	const { data: lessons, error: lessonsError } = await supabase
		.from('lessons')
		.select('id')
		.eq('student_id', userId);
	if (lessonsError) {
		return NextResponse.json(
			{ error: 'Error fetching lessons' },
			{ status: 500 }
		);
	}

	const lessonIds = lessons?.map((l: { id: string }) => l.id);
	if (!lessonIds || lessonIds.length === 0) {
		return NextResponse.json([]); // No lessons, so no songs
	}

	// 2. Get all song IDs and their status from lesson_songs for these lessons
	const { data: lessonSongs, error: lessonSongsError } = await supabase
		.from('lesson_songs')
		.select('song_id, song_status')
		.in('lesson_id', lessonIds);
	if (lessonSongsError) {
		return NextResponse.json(
			{ error: 'Error fetching lesson songs' },
			{ status: 500 }
		);
	}
	const songIdToStatus = new Map<string, string>();
	const songIds = lessonSongs?.map(
		(ls: { song_id: string; song_status: string | null }) => {
			if (ls.song_status) {
				songIdToStatus.set(ls.song_id, ls.song_status);
			}
			return ls.song_id;
		}
	);
	if (!songIds || songIds.length === 0) {
		return NextResponse.json([]); // No songs for these lessons
	}

	// 3. Get all songs from songs table for these song IDs
	const { data: songs, error: songsError } = await supabase
		.from('songs')
		.select('*')
		.in('id', songIds);
	if (songsError) {
		return NextResponse.json(
			{ error: 'Error fetching songs' },
			{ status: 500 }
		);
	}

	// 4. Attach song_status to each song
	const songsWithStatus = songs.map((song: unknown) => {
		if (typeof song === 'object' && song !== null && 'id' in song) {
			return {
				...(song as { [key: string]: unknown }),
				song_status: songIdToStatus.get((song as { id: string }).id) || null,
			};
		}
		return song;
	});

	return NextResponse.json(songsWithStatus);
}
