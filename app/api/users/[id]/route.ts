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

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', parseInt(id))
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
    const body = await request.json();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('profiles')
      .update({
        firstName: body.firstName,
        lastName: body.lastName,
        username: body.username,
        isAdmin: body.isAdmin,
        isTeacher: body.isTeacher,
        isStudent: body.isStudent,
        isActive: body.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parseInt(id))
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

    const { error } = await supabase.from('profiles').delete().eq('id', parseInt(id));

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
