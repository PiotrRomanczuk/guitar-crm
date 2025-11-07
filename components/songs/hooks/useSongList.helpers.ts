import type { SongFilters } from '../types';

/**
 * Builds URL search parameters from song filters
 */
export function buildSongFilterParams(
	userId: string,
	filters: SongFilters
): URLSearchParams {
	const params = new URLSearchParams({ userId });

	if (filters.level) params.append('level', filters.level);
	if (filters.key) params.append('key', String(filters.key));
	if (filters.author) params.append('author', filters.author);
	if (filters.search) params.append('search', filters.search);
	if (filters.hasAudio) params.append('hasAudio', 'true');
	if (filters.hasChords) params.append('hasChords', 'true');

	return params;
}

/**
 * Determines the correct API endpoint based on user role
 */
export function getSongEndpoint(isAdmin: boolean, isTeacher: boolean): string {
	return isAdmin || isTeacher
		? '/api/song/admin-songs'
		: '/api/song/student-songs';
}
