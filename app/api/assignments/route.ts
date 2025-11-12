import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase';
import { 
  AssignmentInputSchema, 
  AssignmentFilterSchema, 
  AssignmentSortSchema 
} from '@/schemas/AssignmentSchema';

/**
 * GET /api/assignments
 * List assignments with role-based filtering
 * 
 * Query params:
 * - teacher_id: Filter by teacher (UUID)
 * - student_id: Filter by student (UUID)
 * - lesson_id: Filter by lesson (UUID)
 * - status: Filter by status (not_started, in_progress, completed, overdue, cancelled)
 * - search: Search in title and description
 * - due_date_from: Filter assignments due after this date (ISO string)
 * - due_date_to: Filter assignments due before this date (ISO string)
 * - sortField: Field to sort by (title, due_date, created_at, updated_at, status)
 * - sortDirection: Sort direction (asc, desc)
 * 
 * Role-based access:
 * - Admin: See all assignments
 * - Teacher: See assignments they created (teacher_id = user)
 * - Student: See assignments assigned to them (student_id = user)
 */
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const supabase = createClient(headersList);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user role from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, is_teacher, is_student')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filterParams = {
      teacher_id: searchParams.get('teacher_id') || undefined,
      student_id: searchParams.get('student_id') || undefined,
      lesson_id: searchParams.get('lesson_id') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      due_date_from: searchParams.get('due_date_from') || undefined,
      due_date_to: searchParams.get('due_date_to') || undefined,
    };

    const sortParams = {
      field: searchParams.get('sortField') || 'created_at',
      direction: (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc',
    };

    // Validate filters
    const filters = AssignmentFilterSchema.parse(filterParams);
    const sort = AssignmentSortSchema.parse(sortParams);

    // Build query with role-based filtering
    let query = supabase
      .from('assignments')
      .select(`
        *,
        teacher_profile:profiles!assignments_teacher_id_fkey(id, email, full_name),
        student_profile:profiles!assignments_student_id_fkey(id, email, full_name),
        lesson:lessons(id, lesson_teacher_number, scheduled_at)
      `);

    // Apply role-based access control
    if (!profile.is_admin) {
      if (profile.is_teacher) {
        // Teachers see their own assignments
        query = query.eq('teacher_id', user.id);
      } else if (profile.is_student) {
        // Students see assignments assigned to them
        query = query.eq('student_id', user.id);
      } else {
        // No role? No access
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Apply filters
    if (filters.teacher_id) {
      query = query.eq('teacher_id', filters.teacher_id);
    }
    if (filters.student_id) {
      query = query.eq('student_id', filters.student_id);
    }
    if (filters.lesson_id) {
      query = query.eq('lesson_id', filters.lesson_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.due_date_from) {
      query = query.gte('due_date', filters.due_date_from);
    }
    if (filters.due_date_to) {
      query = query.lte('due_date', filters.due_date_to);
    }

    // Apply sorting
    query = query.order(sort.field, { ascending: sort.direction === 'asc' });

    const { data: assignments, error } = await query;

    if (error) {
      console.error('Error fetching assignments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch assignments' },
        { status: 500 }
      );
    }

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Unexpected error in GET /api/assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assignments
 * Create a new assignment
 * 
 * Request body: AssignmentInput (title, description, due_date, teacher_id, student_id, lesson_id, status)
 * 
 * Role-based access:
 * - Admin: Can create any assignment
 * - Teacher: Can create assignments for their students (teacher_id must match user)
 * - Student: Cannot create assignments
 */
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const supabase = createClient(headersList);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user role from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, is_teacher, is_student')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check permissions: only admins and teachers can create assignments
    if (!profile.is_admin && !profile.is_teacher) {
      return NextResponse.json(
        { error: 'Only teachers and admins can create assignments' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const input = AssignmentInputSchema.parse(body);

    // Non-admin teachers can only create assignments where they are the teacher
    if (!profile.is_admin && input.teacher_id !== user.id) {
      return NextResponse.json(
        { error: 'Teachers can only create assignments for themselves' },
        { status: 403 }
      );
    }

    // Verify student exists and is a student
    const { data: studentProfile, error: studentError } = await supabase
      .from('profiles')
      .select('id, is_student')
      .eq('id', input.student_id)
      .single();

    if (studentError || !studentProfile) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    if (!studentProfile.is_student) {
      return NextResponse.json(
        { error: 'Specified user is not a student' },
        { status: 400 }
      );
    }

    // Verify lesson exists if lesson_id provided
    if (input.lesson_id) {
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('id, teacher_id, student_id')
        .eq('id', input.lesson_id)
        .single();

      if (lessonError || !lesson) {
        return NextResponse.json(
          { error: 'Lesson not found' },
          { status: 404 }
        );
      }

      // Verify lesson matches teacher and student
      if (lesson.teacher_id !== input.teacher_id || lesson.student_id !== input.student_id) {
        return NextResponse.json(
          { error: 'Lesson does not match specified teacher and student' },
          { status: 400 }
        );
      }
    }

    // Create assignment
    const { data: assignment, error } = await supabase
      .from('assignments')
      .insert({
        title: input.title,
        description: input.description,
        due_date: input.due_date,
        teacher_id: input.teacher_id,
        student_id: input.student_id,
        lesson_id: input.lesson_id,
        status: input.status || 'not_started',
      })
      .select(`
        *,
        teacher_profile:profiles!assignments_teacher_id_fkey(id, email, full_name),
        student_profile:profiles!assignments_student_id_fkey(id, email, full_name),
        lesson:lessons(id, lesson_teacher_number, scheduled_at)
      `)
      .single();

    if (error) {
      console.error('Error creating assignment:', error);
      return NextResponse.json(
        { error: 'Failed to create assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/assignments:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
