import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  try {
    const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();

    if (!user || (!isAdmin && !isTeacher && !isStudent)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();
    const url = new URL(request.url);

    // Filtering parameters
    const searchQuery = url.searchParams.get('search');
    const roleFilter = url.searchParams.get('role');
    const studentStatus = url.searchParams.get('studentStatus');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Student role: can only see their own profile
    if (isStudent && !isAdmin && !isTeacher) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        return Response.json({ error: 'Profile not found' }, { status: 404 });
      }

      const mapped = {
        id: data.id,
        email: data.email,
        firstName: data.full_name ? data.full_name.split(' ')[0] : '',
        lastName: data.full_name ? data.full_name.split(' ').slice(1).join(' ') : '',
        full_name: data.full_name,
        isAdmin: data.is_admin,
        isTeacher: data.is_teacher,
        isStudent: data.is_student,
        isShadow: data.is_shadow,
        isActive: data.is_active ?? true,
        isRegistered: true,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return Response.json(
        { data: [mapped], total: 1, limit, offset },
        { status: 200 }
      );
    }

    // Teacher role: can only see students linked via active lessons
    // Determine allowed profile IDs for teacher
    let allowedStudentIds: string[] | null = null;
    if (isTeacher && !isAdmin) {
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('student_id')
        .eq('teacher_id', user.id)
        .is('deleted_at', null);

      allowedStudentIds = Array.from(
        new Set((lessonData || []).map((l) => l.student_id))
      );

      // If teacher has no students, return empty result
      if (allowedStudentIds.length === 0) {
        return Response.json(
          { data: [], total: 0, limit, offset },
          { status: 200 }
        );
      }
    }

    // Build query
    let query = supabase.from('profiles').select('*', { count: 'exact' });

    // For teachers, restrict to their students only
    if (allowedStudentIds !== null) {
      query = query.in('id', allowedStudentIds);
    }

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

    // Filter by student status (only applies to students)
    if (studentStatus && studentStatus !== 'all') {
      query = query.eq('student_status', studentStatus);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Optimize: Fetch all auth users in a single query instead of N+1 individual queries
    // Build a map of userId -> auth user data for quick lookup
    const authUserMap = new Map<string, { isRegistered: boolean }>();

    if (data && data.length > 0) {
      try {
        // Filter out shadow users (they don't exist in auth.users)
        const nonShadowProfileIds = data.filter(p => !p.is_shadow).map(p => p.id);

        if (nonShadowProfileIds.length > 0) {
          // Fetch all auth users in a single paginated query
          // Note: listUsers returns max 1000 users per page, but we handle pagination if needed
          let page = 1;
          let hasMore = true;

          while (hasMore && page <= 10) { // Safety limit: max 10 pages (10k users)
            const {
              data: { users: authUsers },
            } = await supabaseAdmin.auth.admin.listUsers({
              page,
              perPage: 1000,
            });

            if (authUsers && authUsers.length > 0) {
              authUsers.forEach((authUser) => {
                // Check registration status based on identities and sign-in history
                const hasSignedIn = !!authUser.last_sign_in_at;
                const hasOauthProvider = authUser.app_metadata?.providers?.some(
                  (p: string) => p !== 'email'
                );

                authUserMap.set(authUser.id, {
                  isRegistered: hasSignedIn || !!hasOauthProvider,
                });
              });

              // Check if we need to fetch more pages
              hasMore = authUsers.length === 1000;
              page++;
            } else {
              hasMore = false;
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch auth users in batch:', err);
        // Continue with empty map - users will show as not registered
      }
    }

    // Map profiles with auth data from the lookup map
    const mappedData = (data || []).map((profile) => {
      const authData = authUserMap.get(profile.id);
      const isRegistered = authData?.isRegistered ?? false;

      return {
        id: profile.id,
        email: profile.email,
        // Split full_name into firstName/lastName
        firstName: profile.full_name ? profile.full_name.split(' ')[0] : '',
        lastName: profile.full_name ? profile.full_name.split(' ').slice(1).join(' ') : '',
        full_name: profile.full_name,
        isAdmin: profile.is_admin,
        isTeacher: profile.is_teacher,
        isStudent: profile.is_student,
        isShadow: profile.is_shadow,
        isActive: profile.is_active ?? true,
        isRegistered: isRegistered,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };
    });

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
    const supabaseAdmin = createAdminClient();

    let isShadow = reqIsShadow || false;

    // Construct full_name
    let finalFullName = full_name;
    if (!finalFullName && (firstName || lastName)) {
      finalFullName = `${firstName || ''} ${lastName || ''}`.trim();
    }

    // Clean up $$$ from name if present (common in imported data)
    if (finalFullName && finalFullName.includes('$$$')) {
      finalFullName = finalFullName.replace(/\$\$\$\s*/g, '').trim();
    }

    let finalEmail = email;

    if (!email || email.trim() === '') {
      // Shadow User Creation - profile only, no auth user
      isShadow = true;
      const newId = randomUUID();
      finalEmail = `shadow_${newId}@placeholder.com`;

      const { data: profileData, error: profileError } = await supabase
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
            is_student: reqIsStudent || true,
            is_shadow: true,
          },
        ])
        .select()
        .single();

      if (profileError) {
        return Response.json({ error: profileError.message }, { status: 500 });
      }

      return Response.json(profileData, { status: 201 });
    }

    // Real User Creation - create in auth.users (trigger creates profile)
    // Check if email exists in profiles
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return Response.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Create user in auth.users - this triggers handle_new_user to create profile
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        firstName: firstName || '',
        lastName: lastName || '',
        full_name: finalFullName || '',
      },
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return Response.json({ error: authError.message }, { status: 500 });
    }

    const userId = authData.user.id;

    // Update the profile with additional fields (trigger creates basic profile)
    const { data: profileData, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: finalFullName || null,
        phone: phone || null,
        notes: notes || null,
        is_admin: reqIsAdmin || false,
        is_teacher: reqIsTeacher || false,
        is_student: reqIsStudent !== false, // Default to true unless explicitly false
        is_shadow: false,
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      // Profile was created by trigger, just couldn't update extra fields
      // Return success anyway with basic data
      return Response.json({ id: userId, email: email }, { status: 201 });
    }

    return Response.json(profileData, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
