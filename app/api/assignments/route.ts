import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define assignment input schema for this API
const AssignmentInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  due_date: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z
    .enum(['OPEN', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED', 'CANCELLED', 'BLOCKED'])
    .optional(),
  user_id: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const userId = searchParams.get('user_id');

    const supabase = await createClient();
    const { user, isAdmin } = await getUserWithRolesSSR();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
      .from('assignments')
      .select('*, student:profiles!assignments_student_id_fkey(full_name, email)')
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by priority if provided
    if (priority) {
      query = query.eq('priority', priority);
    }

    // Filter by user if provided
    if (userId) {
      query = query.eq('student_id', userId);
    }

    // Non-admins can only see their own assignments
    if (!isAdmin) {
      query = query.eq('student_id', user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching assignments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in assignments GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { user, isAdmin } = await getUserWithRolesSSR();

    if (!user || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = AssignmentInputSchema.parse(body);

    const assignmentData = {
      title: validatedData.title,
      description: validatedData.description,
      due_date: validatedData.due_date,
      priority: validatedData.priority,
      status: validatedData.status,
      student_id: validatedData.user_id || user.id,
      teacher_id: user.id,
    };

    const { data, error } = await supabase
      .from('assignments')
      .insert([assignmentData])
      .select()
      .single();

    if (error) {
      console.error('Error creating assignment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in assignments POST:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
