import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { LessonInputSchema, LessonSchema, type LessonInput } from '@/schemas';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create lessons (using user_roles)
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const userRoles = roles?.map((r) => r.role) || [];
    const canCreate = userRoles.includes('admin') || userRoles.includes('teacher');

    if (!canCreate) {
      return NextResponse.json(
        { error: 'Forbidden', debug: { user, roles, rolesError } },
        { status: 403 }
      );
    }

    // Validate input data using the schema
    let validatedData: LessonInput;
    try {
      validatedData = LessonInputSchema.parse(body);
    } catch (validationError) {
      console.error('Lesson input validation error:', validationError);
      return NextResponse.json(
        { error: 'Invalid lesson data', details: validationError },
        { status: 400 }
      );
    }

    // Calculate the next lesson_teacher_number for this teacher-student pair
    const { data: existingLessons } = await supabase
      .from('lessons')
      .select('lesson_teacher_number')
      .eq('teacher_id', validatedData.teacher_id)
      .eq('student_id', validatedData.student_id)
      .order('lesson_teacher_number', { ascending: false })
      .limit(1);

    const nextLessonNumber =
      (existingLessons && existingLessons.length > 0
        ? existingLessons[0].lesson_teacher_number
        : 0) + 1;

    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert({
        teacher_id: validatedData.teacher_id,
        student_id: validatedData.student_id,
        lesson_teacher_number: nextLessonNumber,
        scheduled_at: validatedData.scheduled_at,
        notes: validatedData.notes || null,
        status: validatedData.status || 'SCHEDULED',
        creator_user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lesson:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Validate the created lesson
    try {
      const validatedLesson = LessonSchema.parse(lesson);
      return NextResponse.json(validatedLesson);
    } catch (validationError) {
      console.error('Created lesson validation error:', validationError);
      return NextResponse.json({ error: 'Invalid lesson data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in lesson creation API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
