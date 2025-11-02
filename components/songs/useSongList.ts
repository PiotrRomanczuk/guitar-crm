import { useEffect, useState, useCallback } from 'react';
import type { Tables } from '@/lib/supabase';
import { useAuth } from '@/components/auth';

export type SongWithStatus = Tables<'songs'> & {
	status?: 'to_learn' | 'started' | 'remembered' | 'with_author' | 'mastered';
};

export type SongLevel = 'beginner' | 'intermediate' | 'advanced';

export default function useSongList() {
	const { user, isTeacher, isAdmin } = useAuth();
	const [songs, setSongs] = useState<SongWithStatus[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filterLevel, setFilterLevel] = useState<SongLevel | null>(null);

	const loadSongs = useCallback(async () => {
		if (!user?.id) {
			setError('Not authenticated');
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const params = new URLSearchParams({
				userId: user.id,
			});

			if (filterLevel) {
				params.append('level', filterLevel);
			}

			// Choose endpoint based on role
			const endpoint =
				isAdmin || isTeacher
					? '/api/song/admin-songs'
					: '/api/song/student-songs';

			const response = await fetch(`${endpoint}?${params}`);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to fetch songs');
			}

			const data = await response.json();
			setSongs(data);
			setError(null);
		} catch (err) {
			console.error('Error loading songs:', err);
			setError(err instanceof Error ? err.message : 'Failed to load songs');
			setSongs([]);
		} finally {
			setLoading(false);
		}
	}, [filterLevel, isAdmin, isTeacher, user?.id]);

	useEffect(() => {
		void loadSongs();
	}, [loadSongs]);

	return {
		songs,
		loading,
		error,
		filterLevel,
		setFilterLevel,
		refresh: loadSongs,
	};
}
