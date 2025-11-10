import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

interface UserProfile {
  id: number;
  user_id: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  isAdmin: boolean;
  isTeacher: boolean | null;
  isStudent: boolean | null;
  isActive: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export async function GET(request: Request) {
  try {
    const { user, isAdmin } = await getUserWithRolesSSR();

    if (!user || !isAdmin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const url = new URL(request.url);

    // Filtering parameters
    const searchQuery = url.searchParams.get('search');
    const roleFilter = url.searchParams.get('role');
    const activeFilter = url.searchParams.get('active');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = supabase.from('profiles').select('*', { count: 'exact' });

    if (searchQuery) {
      query = query.or(
        `email.ilike.%${searchQuery}%,firstName.ilike.%${searchQuery}%,lastName.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`
      );
    }

    if (roleFilter) {
      if (roleFilter === 'admin') {
        query = query.eq('isAdmin', true);
      } else if (roleFilter === 'teacher') {
        query = query.eq('isTeacher', true);
      } else if (roleFilter === 'student') {
        query = query.eq('isStudent', true);
      }
    }

    if (activeFilter === 'true') {
      query = query.eq('isActive', true);
    } else if (activeFilter === 'false') {
      query = query.eq('isActive', false);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(
      {
        data: data as UserProfile[],
        total: count || 0,
        limit,
        offset,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, isAdmin } = await getUserWithRolesSSR();

    if (!user || !isAdmin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      username,
      isAdmin: userIsAdmin,
      isTeacher,
      isStudent,
      isActive,
    } = body;

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          email,
          firstName: firstName || null,
          lastName: lastName || null,
          username: username || null,
          isAdmin: userIsAdmin || false,
          isTeacher: isTeacher || false,
          isStudent: isStudent || false,
          isActive: isActive !== false,
        },
      ])
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
