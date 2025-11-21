import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { RouteParamsSchema } from '@/schemas/CommonSchema';

const AssignmentUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  due_date: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z
    .enum(['OPEN', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED', 'CANCELLED', 'BLOCKED'])
    .optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const paramsData = await params;
    
    // Validate route parameters
    const validationResult = RouteParamsSchema.safeParse(paramsData);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid assignment ID format', 
          details: validationResult.error.format() 
        }, 
        { status: 400 }
      );
    }
    
    const { id } = validationResult.data;
    const supabase = await createClient();
    const { user, isAdmin } = await getUserWithRolesSSR();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase.from('assignments').select('*').eq('id', id).single();

    if (error || !data) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Check authorization
    if (!isAdmin && data.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in assignment GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const paramsData = await params;
    
    // Validate route parameters
    const validationResult = RouteParamsSchema.safeParse(paramsData);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid assignment ID format', 
          details: validationResult.error.format() 
        }, 
        { status: 400 }
      );
    }
    
    const { id } = validationResult.data;
    const supabase = await createClient();
    const { user, isAdmin } = await getUserWithRolesSSR();

    if (!user || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = AssignmentUpdateSchema.parse(body);

    const { data, error } = await supabase
      .from('assignments')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in assignment PUT:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { user, isAdmin } = await getUserWithRolesSSR();

    if (!user || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase.from('assignments').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in assignment DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
