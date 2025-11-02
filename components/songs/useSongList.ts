import { useEffect, useState, useCallback } from 'react';
import { supabase, Tables } from '@/lib/supabase';

type Song = Tables<'songs'>;

export default function useSongList() {
	const [songs, setSongs] = useState<Song[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filterLevel, setFilterLevel] = useState<string | null>(null);

	const loadSongs = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			let query = supabase.from('songs').select('*');

			if (filterLevel) {
				query = query.eq('level', filterLevel);
			}

			const { data, error: fetchError } = await query;

			if (fetchError) {
				setError('Failed to load songs');
				return;
			}

			setSongs(data || []);
		} catch {
			setError('Failed to load songs');
		} finally {
			setLoading(false);
		}
	}, [filterLevel]);

	useEffect(() => {
		loadSongs();
	}, [loadSongs]);

	return { songs, loading, error, filterLevel, setFilterLevel };
}
