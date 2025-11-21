import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

export async function GET() {
  try {
    const supabase = await createClient();
    const { user, isTeacher } = await getUserWithRolesSSR();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isTeacher) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get students assigned to this teacher via lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('student_id')
      .eq('teacher_id', user.id);

    if (lessonsError) {
      return NextResponse.json({ error: lessonsError.message }, { status: 500 });
    }

    const studentIds = Array.from(new Set(lessons?.map((l) => l.student_id) || []));

    if (studentIds.length === 0) {
      return NextResponse.json({ students: [] });
    }

    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('id, full_name, is_student')
      .in('id', studentIds)
      .order('full_name');

    if (studentsError) {
      return NextResponse.json({ error: studentsError.message }, { status: 500 });
    }

    return NextResponse.json({ students: students || [] });
  } catch (error) {
    console.error('Error fetching teacher students:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
