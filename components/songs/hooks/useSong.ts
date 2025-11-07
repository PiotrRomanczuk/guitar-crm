'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Song } from '@/schemas/SongSchema';

export default function useSong(songId: string) {
	const [song, setSong] = useState<Song | undefined>(undefined);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadSong() {
			if (!songId) {
				setSong(undefined);
				setLoading(false);
				setError(null);
				return;
			}

			setLoading(true);
			try {
				const supabase = getSupabaseBrowserClient();
				const { data, error: fetchError } = await supabase
					.from('songs')
					.select('*')
					.eq('id', songId)
					.single();

				if (fetchError) {
					setError('Failed to load song');
					return;
				}

				setSong(data);
			} catch {
				setError('Failed to load song');
			} finally {
				setLoading(false);
			}
		}

		loadSong();
	}, [songId]);

	return { song, loading, error };
}
