import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);

    const userRoles = roles?.map((r) => r.role) || [];
    const isAdmin = userRoles.includes('admin');

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .order('full_name');

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    // Get all roles to map back to legacy format
    const { data: allRoles } = await supabase.from('user_roles').select('*');

    const usersWithRoles = users?.map((u) => {
      const uRoles = allRoles?.filter((r) => r.user_id === u.id).map((r) => r.role) || [];
      return {
        ...u,
        is_teacher: uRoles.includes('teacher'),
        is_student: uRoles.includes('student'),
        is_admin: uRoles.includes('admin'),
      };
    });

    return NextResponse.json({ users: usersWithRoles || [] });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
