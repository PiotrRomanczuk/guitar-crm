/**
 * Shared types for song components
 */

import type { Tables } from '@/lib/supabase';

export type Song = Tables<'songs'>;

export type SongStatus =
	| 'to_learn'
	| 'started'
	| 'remembered'
	| 'with_author'
	| 'mastered';

export type SongWithStatus = Song & {
	status?: SongStatus;
};

export type SongLevel = 'beginner' | 'intermediate' | 'advanced';

export type SongFilters = {
	level: SongLevel | null;
	key?: string | null;
	author?: string;
	search?: string;
	hasAudio?: boolean;
	hasChords?: boolean;
};
