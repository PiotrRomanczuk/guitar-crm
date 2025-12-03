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

    const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);

    const userRoles = roles?.map((r) => r.role) || [];

    if (!userRoles.includes('teacher')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get students assigned to this teacher
    // We select profiles that have a 'student' role
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('id, full_name, user_roles!inner(role)')
      .eq('user_roles.role', 'student')
      .order('full_name');

    if (studentsError) {
      return NextResponse.json({ error: studentsError.message }, { status: 500 });
    }

    // Map back to flat structure if needed, or just return profiles
    const flatStudents = students?.map((s) => ({
      id: s.id,
      full_name: s.full_name,
      is_student: true, // We know they are students because of the filter
    }));

    return NextResponse.json({ students: flatStudents || [] });
  } catch (error) {
    console.error('Error fetching teacher students:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
