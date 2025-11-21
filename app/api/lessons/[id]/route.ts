import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { updateLessonHandler, deleteLessonHandler } from '../handlers';
import { RouteParamsSchema } from '@/schemas/CommonSchema';

/**
 * Helper to get user profile with roles
 */
async function getUserProfile(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin, is_teacher, is_student')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return null;
  }

  return {
    isAdmin: profile.is_admin,
    isTeacher: profile.is_teacher,
    isStudent: profile.is_student,
  };
}

/**
 * GET /api/lessons/[id]
 * Get a single lesson
 */
// eslint-disable-next-line complexity
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const paramsData = await params;
    
    // Validate route parameters
    const validationResult = RouteParamsSchema.safeParse(paramsData);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid lesson ID format', 
          details: validationResult.error.format() 
        }, 
        { status: 400 }
      );
    }
    
    const { id } = validationResult.data;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getUserProfile(supabase, user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching lesson:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Role-based access check
    if (!profile.isAdmin) {
      if (profile.isTeacher) {
        // Teacher can only see their students' lessons
        const { data: teacherLesson } = await supabase
          .from('lessons')
          .select('id')
          .eq('id', id)
          .eq('teacher_id', user.id)
          .single();

        if (!teacherLesson) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      } else {
        // Student can only see their own lessons
        if (lesson.student_id !== user.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Error in lesson API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/lessons/[id]
 * Update a lesson (admin/teacher only)
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getUserProfile(supabase, user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const result = await updateLessonHandler(supabase, user, profile, id, body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.lesson, { status: result.status });
  } catch (error) {
    console.error('Error in lesson update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/lessons/[id]
 * Delete a lesson (admin/teacher only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getUserProfile(supabase, user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const result = await deleteLessonHandler(supabase, user, profile, id);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true }, { status: result.status });
  } catch (error) {
    console.error('Error in lesson delete API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
