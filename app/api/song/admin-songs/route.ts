import { NextResponse } from 'next/server';
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

		const supabase = await createClient();

		// 1. Verify user has teacher or admin role
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('isadmin, isteacher')
			.eq('user_id', userId)
			.single();

		if (profileError || !profile) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		if (!profile.isadmin && !profile.isteacher) {
			return NextResponse.json(
				{ error: 'Insufficient permissions' },
				{ status: 403 }
			);
		}

		// 2. Fetch all songs (teachers and admins can see all)
		let query = supabase.from('songs').select('*');

		if (level) {
			query = query.eq('level', level as 'beginner' | 'intermediate' | 'advanced');
		}

		const { data: songs, error: songsError } = await query;

		if (songsError) {
			return NextResponse.json(
				{ error: 'Failed to fetch songs' },
				{ status: 500 }
			);
		}

		return NextResponse.json(songs || []);
	} catch (error) {
		console.error('Error in admin-songs route:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
