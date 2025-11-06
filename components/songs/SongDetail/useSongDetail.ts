'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { Song } from '../types';

export function useSongDetail(songId: string, onDeleted?: () => void) {
	const [song, setSong] = useState<Song | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);
	const router = useRouter();

	const loadSong = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const { data, error: fetchError } = await supabase
				.from('songs')
				.select('*')
				.eq('id', songId);

			if (fetchError || !data || data.length === 0) {
				setError('Song not found');
				return;
			}

			setSong(data[0]);
		} catch {
			setError('Failed to load song');
		} finally {
			setLoading(false);
		}
	}, [songId]);

	useEffect(() => {
		loadSong();
	}, [loadSong]);

	const handleDelete = async () => {
		if (
			!song ||
			!window.confirm('Are you sure you want to delete this song?')
		) {
			return;
		}

		setDeleting(true);

		try {
			const { error: deleteError } = await supabase
				.from('songs')
				.delete()
				.eq('id', song.id);

			if (deleteError) {
				setError('Failed to delete song');
				return;
			}

			onDeleted?.();
			router.push('/songs');
		} catch {
			setError('Failed to delete song');
		} finally {
			setDeleting(false);
		}
	};

	return {
		song,
		loading,
		error,
		deleting,
		handleDelete,
	};
}
