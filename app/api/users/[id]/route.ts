import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, isAdmin } = await getUserWithRolesSSR();

    if (!user || !isAdmin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();

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

    let body;
    try {
      const text = await request.text();
      if (!text) {
        return Response.json({ error: 'Empty request body' }, { status: 400 });
      }
      body = JSON.parse(text);
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
        is_active: body.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Update user_roles table to maintain consistency
    // First, remove existing roles for this user
    await supabase.from('user_roles').delete().eq('user_id', id);

    // Then add the new roles
    const rolesToInsert = [];
    if (body.isAdmin) rolesToInsert.push({ user_id: id, role: 'admin' });
    if (body.isTeacher) rolesToInsert.push({ user_id: id, role: 'teacher' });
    if (body.isStudent) rolesToInsert.push({ user_id: id, role: 'student' });

    if (rolesToInsert.length > 0) {
      const { error: rolesError } = await supabase.from('user_roles').insert(rolesToInsert);
      if (rolesError) {
        console.error('Error updating user roles:', rolesError);
        // Don't fail the request, just log the error
      }
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
