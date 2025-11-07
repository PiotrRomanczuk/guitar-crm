'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import type { SongWithStatus, SongFilters } from '../types';
import { buildSongFilterParams, getSongEndpoint } from './useSongList.helpers';

export default function useSongList() {
	const { user, isTeacher, isAdmin, loading: authLoading } = useAuth();
	const [songs, setSongs] = useState<SongWithStatus[]>([]);
	const [songsLoading, setSongsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<SongFilters>({ level: null });

	const loadSongs = useCallback(async () => {
		// Wait for auth to finish loading
		if (authLoading) {
			return;
		}

		if (!user?.id) {
			setError('Not authenticated');
			return;
		}

		try {
			setSongsLoading(true);
			setError(null);

			const params = buildSongFilterParams(user.id, filters);
			const endpoint = getSongEndpoint(isAdmin, isTeacher);

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
			setSongsLoading(false);
		}
	}, [authLoading, filters, isAdmin, isTeacher, user?.id]);

	useEffect(() => {
		void loadSongs();
	}, [loadSongs]);

	return {
		songs,
		loading: authLoading || songsLoading,
		error,
		filters,
		setFilters,
		refresh: loadSongs,
	};
}
