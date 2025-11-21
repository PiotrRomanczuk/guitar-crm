import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AdminSongsQuerySchema } from '@/schemas/CommonSchema';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		
		// Validate query parameters
		const queryValidation = AdminSongsQuerySchema.safeParse({
			userId: searchParams.get('userId'),
			level: searchParams.get('level'),
		});

		if (!queryValidation.success) {
			return NextResponse.json(
				{ 
					error: 'Invalid query parameters', 
					details: queryValidation.error.format() 
				},
				{ status: 400 }
			);
		}

		const { userId, level } = queryValidation.data;

		const supabase = await createClient();

		// 1. Verify user has teacher or admin role
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('is_admin, is_teacher')
			.eq('id', userId)
			.single();

		if (profileError || !profile) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		if (!profile.is_admin && !profile.is_teacher) {
			return NextResponse.json(
				{ error: 'Insufficient permissions' },
				{ status: 403 }
			);
		}

		// 2. Fetch all songs (teachers and admins can see all)
		let query = supabase.from('songs').select('*');

		if (level) {
			query = query.eq('level', level);
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
