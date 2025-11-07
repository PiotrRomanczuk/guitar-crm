// Pure functions for song API business logic - testable without Next.js dependencies

import { Song } from '@/types/Song';
import { SongInputSchema } from '@/schemas/SongSchema';
import { ZodError } from 'zod';

export interface SongQueryParams {
	level?: string;
	key?: string;
	author?: string;
	search?: string;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: string;
}

export interface SongResponse {
	songs: Song[];
	count?: number;
}

export interface SongError {
	error: string;
	status: number;
}

export type SongResult = SongResponse | SongError;

export interface AuthResult {
	user: { id: string } | null;
	profile: { isAdmin?: boolean; isTeacher?: boolean } | null;
	error?: string;
}

/**
 * Validate that user has required role for mutation operations
 */
export function validateMutationPermission(
	profile: { isAdmin?: boolean; isTeacher?: boolean } | null
): boolean {
	return !!(profile?.is_admin || profile?.is_teacher);
}

/**
 * Validate sort field to prevent injection
 */
function validateSortField(sortBy?: string): string {
	const validSortFields = [
		'created_at',
		'updated_at',
		'title',
		'author',
		'level',
		'key',
	];
	return validSortFields.includes(sortBy || '') ? sortBy! : 'created_at';
}

/**
 * Apply filters to Supabase query
 */
function applyFilters(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	query: any,
	params: { level?: string; key?: string; author?: string; search?: string }
) {
	let result = query;
	if (params.level) result = result.eq('level', params.level);
	if (params.key) result = result.eq('key', params.key);
	if (params.author) result = result.eq('author', params.author);
	if (params.search) result = result.ilike('title', `%${params.search}%`);
	return result;
}

/**
 * Apply sorting and pagination to query
 */
function applySortAndPagination(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	query: any,
	sortBy: string,
	sortOrder: string,
	page: number,
	limit: number
) {
	const ascending = sortOrder === 'asc';
	const offset = (page - 1) * limit;
	return query.order(sortBy, { ascending }).range(offset, offset + limit - 1);
}

export async function getSongsHandler(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	supabase: any,
	user: { id: string } | null,
	profile: { isAdmin?: boolean } | null,
	query: SongQueryParams
): Promise<SongResult> {
	if (!user) {
		return { error: 'Unauthorized', status: 401 };
	}

	const {
		level,
		key,
		author,
		search,
		page = 1,
		limit = 50,
		sortBy = 'created_at',
		sortOrder = 'desc',
	} = query;

	const validatedSortBy = validateSortField(sortBy);
	let dbQuery = supabase.from('songs').select('*', { count: 'exact' });

	dbQuery = applyFilters(dbQuery, { level, key, author, search });
	dbQuery = applySortAndPagination(
		dbQuery,
		validatedSortBy,
		sortOrder,
		page,
		limit
	);

	const { data: songs, error, count } = await dbQuery;

	if (error) {
		return { error: error.message, status: 500 };
	}

	return { songs: songs || [], count, status: 200 };
}

export async function createSongHandler(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	supabase: any,
	user: { id: string } | null,
	profile: { isAdmin?: boolean; isTeacher?: boolean } | null,
	body: unknown
): Promise<{ song?: Song; error?: string; status: number }> {
	if (!user) {
		return { error: 'Unauthorized', status: 401 };
	}

	if (!validateMutationPermission(profile)) {
		return {
			error: 'Forbidden: Only teachers and admins can create songs',
			status: 403,
		};
	}

	try {
		const validatedSong = SongInputSchema.parse(body);

		const { data: song, error } = await supabase
			.from('songs')
			.insert(validatedSong)
			.select()
			.single();

		if (error) {
			return { error: error.message, status: 500 };
		}

		return { song, status: 201 };
	} catch (err) {
		if (err instanceof ZodError) {
			const fieldErrors = err.flatten().fieldErrors;
			return {
				error: `Validation failed: ${JSON.stringify(fieldErrors)}`,
				status: 422,
			};
		}
		return { error: 'Internal server error', status: 500 };
	}
}

export async function updateSongHandler(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	supabase: any,
	user: { id: string } | null,
	profile: { isAdmin?: boolean; isTeacher?: boolean } | null,
	songId: string,
	body: unknown
): Promise<{ song?: Song; error?: string; status: number }> {
	if (!user) {
		return { error: 'Unauthorized', status: 401 };
	}

	if (!validateMutationPermission(profile)) {
		return {
			error: 'Forbidden: Only teachers and admins can update songs',
			status: 403,
		};
	}

	try {
		const updateData = {
			...(typeof body === 'object' && body !== null ? body : {}),
			updated_at: new Date().toISOString(),
		};

		const { data: song, error } = await supabase
			.from('songs')
			.update(updateData)
			.eq('id', songId)
			.select()
			.single();

		if (error) {
			return { error: error.message, status: 500 };
		}

		return { song, status: 200 };
	} catch {
		return { error: 'Internal server error', status: 500 };
	}
}

export async function deleteSongHandler(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	supabase: any,
	user: { id: string } | null,
	profile: { isAdmin?: boolean; isTeacher?: boolean } | null,
	songId: string
): Promise<{ success?: boolean; error?: string; status: number }> {
	if (!user) {
		return { error: 'Unauthorized', status: 401 };
	}

	if (!validateMutationPermission(profile)) {
		return {
			error: 'Forbidden: Only teachers and admins can delete songs',
			status: 403,
		};
	}

	const { error } = await supabase.from('songs').delete().eq('id', songId);

	if (error) {
		return { error: error.message, status: 500 };
	}

	return { success: true, status: 200 };
}
