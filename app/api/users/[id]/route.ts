import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { z } from 'zod';

const UpdateUserSchema = z.object({
  full_name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  isAdmin: z.boolean().optional(),
  isTeacher: z.boolean().optional(),
  isStudent: z.boolean().optional(),
  isParent: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, isAdmin } = await getUserWithRolesSSR();

    if (!user || !isAdmin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, first_name, last_name, phone, notes, is_admin, is_teacher, is_student, is_shadow, is_active, student_status, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, isAdmin } = await getUserWithRolesSSR();

    if (!user || !isAdmin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    let body: z.infer<typeof UpdateUserSchema>;
    try {
      const text = await request.text();
      if (!text) {
        return Response.json({ error: 'Empty request body' }, { status: 400 });
      }
      const parsed = JSON.parse(text);
      const result = UpdateUserSchema.safeParse(parsed);
      if (!result.success) {
        return Response.json({ error: 'Invalid request body', details: result.error.issues }, { status: 400 });
      }
      body = result.data;
    } catch (e) {
      console.error('Error parsing JSON body:', e);
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const supabase = await createClient();

    let fullName = body.full_name;
    if (!fullName && (body.firstName || body.lastName)) {
      fullName = `${body.firstName || ''} ${body.lastName || ''}`.trim();
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        is_admin: body.isAdmin,
        is_teacher: body.isTeacher,
        is_student: body.isStudent,
        is_parent: body.isParent,
        is_active: body.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, isAdmin } = await getUserWithRolesSSR();

    if (!user || !isAdmin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase.from('profiles').delete().eq('id', id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
