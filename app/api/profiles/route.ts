import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const supabase = await createClient();

		// Fetch all profiles - using * to get all columns
		const { data: profiles, error } = await supabase
			.from('profiles')
			.select('*')
			.order('firstname', { ascending: true });

		if (error) {
			console.error('Error fetching profiles:', error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(profiles || []);
	} catch (error) {
		console.error('Error in profiles API:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
