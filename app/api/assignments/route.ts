import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { NextResponse } from 'next/server';
import { AssignmentQuerySchema } from '@/schemas/CommonSchema';
import { AssignmentInputSchema } from '@/schemas/AssignmentSchema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryValidation = AssignmentQuerySchema.safeParse({
      status: searchParams.get('status'),
      priority: searchParams.get('priority'),
      user_id: searchParams.get('user_id'),
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters', 
          details: queryValidation.error.format() 
        },
        { status: 400 }
      );
    }

    const { status, priority, user_id: userId } = queryValidation.data;

    const supabase = await createClient();
    const { user, isAdmin } = await getUserWithRolesSSR();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase.from('assignments').select('*').order('created_at', { ascending: false });

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
      query = query.eq('user_id', userId);
    }

    // Non-admins can only see their own assignments
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
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
      ...validatedData,
      user_id: validatedData.user_id || user.id,
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
