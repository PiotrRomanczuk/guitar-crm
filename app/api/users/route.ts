import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

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
    const { user, isAdmin } = await getUserWithRolesSSR();

    if (!user || !isAdmin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();
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

    // Fetch auth data for each user to check registration status
    const profilesWithAuth = await Promise.all(
      (data as unknown as UserProfile[]).map(async (profile) => {
        try {
          const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(profile.id);
          
          // Check registration status based on identities and sign-in history
          // A user is considered "Registered" if:
          // 1. They have signed in at least once (last_sign_in_at is present)
          // 2. OR they have a confirmed email AND identities (though identities seem hidden in some admin views)
          // 3. OR they have app_metadata.providers containing 'google' or other oauth (indicates real signup)
          
          const hasSignedIn = !!user?.last_sign_in_at;
          const hasOauthProvider = user?.app_metadata?.providers?.some((p: string) => p !== 'email');
          
          // Shadow users created via admin API usually have:
          // - No last_sign_in_at
          // - app_metadata.providers = ['email']
          // - confirmed_at (because we auto-confirm them)
          
          // Real users who signed up via email/password usually have:
          // - last_sign_in_at (if they logged in)
          // - But if they just signed up and verified email but never logged in?
          //   They would look similar to shadow users except for maybe metadata.
          
          // However, for the purpose of "Activated", checking if they have EVER signed in is a very strong signal.
          // If they haven't signed in, they are effectively still "Shadow" or "Pending" from the perspective of usage.
          
          // Also check for Google/OAuth users who might not have signed in recently but are definitely registered
          const isRegistered = hasSignedIn || hasOauthProvider;
          
          return {
            ...profile,
            isRegistered
          };
        } catch (err) {
          console.error(`Failed to fetch auth user for ${profile.id}:`, err);
          return {
            ...profile,
            isRegistered: false
          };
        }
      })
    );

    return Response.json(
      {
        data: profilesWithAuth as UserProfile[],
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
