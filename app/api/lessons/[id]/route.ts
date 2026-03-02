import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { updateLessonHandler, deleteLessonHandler } from '../handlers';
import { TEST_ACCOUNT_MUTATION_ERROR } from '@/lib/auth/test-account-guard';

/**
 * Helper to get user profile with roles
 */
async function getUserProfile(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin, is_teacher, is_student, is_development')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return null;
  }

  return {
    isAdmin: profile.is_admin,
    isTeacher: profile.is_teacher,
    isStudent: profile.is_student,
    isDevelopment: profile.is_development ?? false,
  };
}

/**
 * GET /api/lessons/[id]
 * Get a single lesson
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('id, teacher_id, student_id, status, date, time, lesson_teacher_number, scheduled_at, notes, created_at, updated_at')
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

    if (profile.isDevelopment) {
      return NextResponse.json({ error: TEST_ACCOUNT_MUTATION_ERROR }, { status: 403 });
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

    if (profile.isDevelopment) {
      return NextResponse.json({ error: TEST_ACCOUNT_MUTATION_ERROR }, { status: 403 });
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
