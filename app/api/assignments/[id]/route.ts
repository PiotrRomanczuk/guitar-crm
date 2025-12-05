import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AssignmentUpdateSchema } from '@/schemas/AssignmentSchema';
import {
  getAssignmentHandler,
  updateAssignmentHandler,
  deleteAssignmentHandler,
} from './handlers';

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
 * GET /api/assignments/[id]
 * Fetch a single assignment by ID
 */
export async function GET(
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

    const result = await getAssignmentHandler(supabase, id, user.id, profile);

    return NextResponse.json(
      result.data ? result.data : { error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error('Error in GET /api/assignments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/assignments/[id]
 * Update an assignment
 */
export async function PATCH(
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

    // Parse and validate input
    const body = await request.json();
    const input = AssignmentUpdateSchema.parse({ ...body, id });

    const result = await updateAssignmentHandler(supabase, id, user.id, profile, input, body);

    return NextResponse.json(
      result.data ? result.data : { error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error('Error in PATCH /api/assignments/[id]:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/assignments/[id]
 * Delete an assignment
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

    const result = await deleteAssignmentHandler(supabase, id, user.id, profile);

    return NextResponse.json(
      result.data ? result.data : { error: result.error },
      { status: result.status }
    );
  } catch (error) {
    console.error('Error in DELETE /api/assignments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
