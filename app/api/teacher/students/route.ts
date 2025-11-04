import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/clients/server';

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
			.select('*')
			.eq('user_id', user.id)
			.single();

		if (!profile || !profile.isTeacher) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Get students assigned to this teacher
		const { data: students, error: studentsError } = await supabase
			.from('profiles')
			.select('user_id, full_name, isStudent')
			.eq('isStudent', true)
			.order('full_name');

		if (studentsError) {
			return NextResponse.json(
				{ error: studentsError.message },
				{ status: 500 }
			);
		}

		return NextResponse.json({ students: students || [] });
	} catch (error) {
		console.error('Error fetching teacher students:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
