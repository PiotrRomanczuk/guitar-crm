import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { randomUUID } from 'crypto';

interface UserProfile {
  id: string;
  user_id: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  isAdmin: boolean;
  isTeacher: boolean | null;
  isStudent: boolean | null;
  isActive: boolean;
  isRegistered: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export async function GET(request: Request) {
  try {
    const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();

    if (!user || (!isAdmin && !isTeacher)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();
    const url = new URL(request.url);

    // Filtering parameters
    const searchQuery = url.searchParams.get('search');
    const roleFilter = url.searchParams.get('role');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = supabase.from('profiles').select('*', { count: 'exact' });

    if (searchQuery) {
      query = query.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
    }

    if (roleFilter) {
      if (roleFilter === 'admin') {
        query = query.eq('is_admin', true);
      } else if (roleFilter === 'teacher') {
        query = query.eq('is_teacher', true);
      } else if (roleFilter === 'student') {
        query = query.eq('is_student', true);
      } else if (roleFilter === 'shadow') {
        query = query.eq('is_shadow', true);
      }
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Fetch auth data for each user to check registration status and map to camelCase
    const mappedData = await Promise.all(
      (data || []).map(async (profile) => {
        let isRegistered = false;
        try {
          // Only check auth status if we have an ID (which we should)
          if (profile.id) {
            const {
              data: { user },
            } = await supabaseAdmin.auth.admin.getUserById(profile.id);

            // Check registration status based on identities and sign-in history
            const hasSignedIn = !!user?.last_sign_in_at;
            const hasOauthProvider = user?.app_metadata?.providers?.some(
              (p: string) => p !== 'email'
            );

            isRegistered = hasSignedIn || !!hasOauthProvider;
          }
        } catch (err) {
          console.error(`Failed to fetch auth user for ${profile.id}:`, err);
        }

        return {
          id: profile.id,
          email: profile.email,
          // Split full_name into firstName/lastName
          firstName: profile.full_name ? profile.full_name.split(' ')[0] : '',
          lastName: profile.full_name ? profile.full_name.split(' ').slice(1).join(' ') : '',
          full_name: profile.full_name,
          username: profile.username,
          isAdmin: profile.is_admin,
          isTeacher: profile.is_teacher,
          isStudent: profile.is_student,
          isShadow: profile.is_shadow,
          isActive: profile.is_active ?? true,
          isRegistered: isRegistered,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };
      })
    );

    return Response.json(
      {
        data: mappedData,
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
    const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();

    if (!user || (!isAdmin && !isTeacher)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      full_name, // Accept full_name directly too
      phone,
      notes,
      isAdmin: reqIsAdmin,
      isTeacher: reqIsTeacher,
      isStudent: reqIsStudent,
      isShadow: reqIsShadow, // Accept explicit isShadow flag
    } = body;

    // Permission Check
    if (!isAdmin && isTeacher) {
      // Teachers can ONLY create Students
      if (reqIsAdmin || reqIsTeacher) {
        return Response.json({ error: 'Teachers can only create students' }, { status: 403 });
      }
    }

    const supabase = await createClient();

    let finalEmail = email;
    let isShadow = reqIsShadow || false;
    const newId = randomUUID();

    // Construct full_name
    let finalFullName = full_name;
    if (!finalFullName && (firstName || lastName)) {
      finalFullName = `${firstName || ''} ${lastName || ''}`.trim();
    }

    if (!email || email.trim() === '') {
      // Shadow User Creation
      isShadow = true;
      finalEmail = `shadow_${newId}@placeholder.com`;
    } else {
      // Real User Creation (Profile only)
      // Check if email exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existing) {
        return Response.json({ error: 'User with this email already exists' }, { status: 409 });
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: newId,
          email: finalEmail,
          full_name: finalFullName || null,
          phone: phone || null,
          notes: notes || null,
          is_admin: reqIsAdmin || false,
          is_teacher: reqIsTeacher || false,
          is_student: reqIsStudent || true, // Default to student
          is_shadow: isShadow,
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
