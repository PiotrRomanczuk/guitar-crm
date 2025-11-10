import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
	try {
		const supabase = await createClient();

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { data: profile } = await supabase
			.from('profiles')
			.select('is_admin, is_teacher, is_student')
			.eq('id', user.id)
			.single();

		if (!profile || !profile.is_admin) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Get all users (teachers and students)
		const { data: users, error: usersError } = await supabase
			.from('profiles')
			.select('id, full_name, is_teacher, is_student')
			.order('full_name');

		if (usersError) {
			return NextResponse.json({ error: usersError.message }, { status: 500 });
		}

		return NextResponse.json({ users: users || [] });
	} catch (error) {
		console.error('Error fetching users:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
