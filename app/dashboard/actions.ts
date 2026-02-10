'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function inviteUser(
  email: string,
  fullName: string,
  role: 'student' | 'teacher' | 'admin' = 'student',
  phone?: string
) {
  // ✅ Authorization check - CRITICAL SECURITY FIX
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    throw new Error('Unauthorized: Authentication required');
  }

  // Check if current user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', currentUser.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error('Unauthorized: Only admins can invite users');
  }

  const supabaseAdmin = createAdminClient();

  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = existingUsers.users.find((u) => u.email === email);

  let userId = existingUser?.id;

  console.log(`[Invite Debug] Checking if user ${email} exists... Found ID: ${userId || 'No'}`);

  if (!userId) {
    console.log(`[Invite Debug] Sending invite to ${email}...`);
    const { data: authData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email
    );
    console.log('[Invite Debug] Supabase Response:', {
      user: authData.user?.id,
      error: inviteError?.message,
    });

    if (inviteError) throw new Error(`Failed to invite user: ${inviteError.message}`);
    if (!authData.user) throw new Error('User creation failed');
    userId = authData.user.id;
  } else {
    console.log(`[Invite Debug] User already exists. Skipping invite email.`);
  }

  const updates: Record<string, unknown> = {
    full_name: fullName,
    phone: phone || null,
    is_student: role === 'student',
    is_teacher: role === 'teacher',
    is_admin: role === 'admin',
  };

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (profileError) console.error('Error updating profile:', profileError);

  return { success: true, userId };
}

export async function createShadowUser(studentEmail: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // ✅ Authorization check - CRITICAL SECURITY FIX
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, is_teacher')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin && !profile?.is_teacher) {
    throw new Error('Unauthorized: Only teachers and admins can create shadow users');
  }

  const supabaseAdmin = createAdminClient();

  // 1. Try to find existing auth user first (to avoid duplicate error)
  let userId: string | undefined;

  // Scan first few pages of users
  let page = 1;
  const MAX_PAGES = 5;

  while (!userId && page <= MAX_PAGES) {
    const {
      data: { users },
      error: listError,
    } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (listError || !users || users.length === 0) break;

    const found = users.find((u) => u.email?.toLowerCase() === studentEmail.toLowerCase());
    if (found) {
      userId = found.id;
    }
    page++;
  }

  // 2. If not found, try to get or create user via generateLink
  if (!userId) {
    try {
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: studentEmail,
        options: {
          data: {
            is_student: true,
            full_name: studentEmail.split('@')[0],
          },
        },
      });

      if (linkError) {
        console.error('Generate link failed:', linkError);
        const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser(
          {
            email: studentEmail,
            email_confirm: true,
            user_metadata: {
              is_student: true,
              full_name: studentEmail.split('@')[0],
            },
          }
        );

        if (createUserError) {
          throw new Error(`Failed to create/find user: ${createUserError.message}`);
        }
        userId = newUser.user.id;
      } else if (linkData?.user) {
        userId = linkData.user.id;
        if (!linkData.user.email_confirmed_at) {
          await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true });
        }
      }
    } catch (err) {
      console.error('Error in user creation flow:', err);
      throw new Error(
        `Failed to process shadow user: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  if (!userId) {
    throw new Error('Could not obtain user ID for shadow user');
  }

  // 3. Ensure profile exists and is correct (Upsert)
  const { error: upsertProfileError } = await supabaseAdmin.from('profiles').upsert(
    {
      id: userId,
      email: studentEmail,
      full_name: studentEmail.split('@')[0],
      is_student: true,
      is_teacher: false,
      is_admin: false,
      is_development: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (upsertProfileError) {
    // Handle duplicate email error (orphan profile cleanup)
    if (
      upsertProfileError.code === '23505' &&
      upsertProfileError.message?.includes('profiles_email_key')
    ) {
      console.log(
        `[createShadowUser] Detected orphan profile for ${studentEmail}. Attempting cleanup...`
      );

      // 1. Find the orphan profile
      const { data: orphanProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', studentEmail)
        .single();

      if (orphanProfile && orphanProfile.id !== userId) {
        // 2. Rename orphan profile email to free up the unique constraint
        const tempEmail = `${studentEmail}_migrated_${Date.now()}`;
        const { error: renameError } = await supabaseAdmin
          .from('profiles')
          .update({ email: tempEmail })
          .eq('id', orphanProfile.id);

        if (renameError) {
          console.error('Failed to rename orphan profile:', renameError);
          throw new Error('Failed to cleanup orphan profile');
        }

        // 3. Create the new profile
        const { error: retryError } = await supabaseAdmin.from('profiles').upsert(
          {
            id: userId,
            email: studentEmail,
            full_name: studentEmail.split('@')[0],
            is_student: true,
            is_teacher: false,
            is_admin: false,
            is_development: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

        if (retryError) {
          throw new Error(`Failed to create profile after cleanup: ${retryError.message}`);
        }

        // 4. Migrate related data
        // Lessons
        await supabaseAdmin
          .from('lessons')
          .update({ student_id: userId })
          .eq('student_id', orphanProfile.id);
        await supabaseAdmin
          .from('lessons')
          .update({ teacher_id: userId })
          .eq('teacher_id', orphanProfile.id);

        // Assignments
        await supabaseAdmin
          .from('assignments')
          .update({ student_id: userId })
          .eq('student_id', orphanProfile.id);
        await supabaseAdmin
          .from('assignments')
          .update({ teacher_id: userId })
          .eq('teacher_id', orphanProfile.id);

        // 5. Delete orphan profile
        await supabaseAdmin.from('profiles').delete().eq('id', orphanProfile.id);

        console.log(
          `[createShadowUser] Successfully migrated data from orphan profile ${orphanProfile.id} to ${userId}`
        );
        return { success: true, userId };
      }
    }

    console.error('Failed to upsert shadow profile:', upsertProfileError);
    throw new Error('Failed to ensure shadow profile exists');
  }

  return { success: true, userId };
}

export async function deleteUser(userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Check if requester is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error('Unauthorized: Admin access required');
  }

  const supabaseAdmin = createAdminClient();

  // Check if user exists in auth.users before trying to delete
  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);

  // Delete from profiles first (to ensure clean state if no cascade)
  const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', userId);

  if (profileError) {
    console.error('Error deleting profile:', profileError);
    // Continue anyway - profile might be already gone
  }

  // Only delete from auth.users if user exists there
  if (authUser?.user) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting auth user:', error);
      // If profile was already deleted successfully, don't fail completely
      if (!profileError) {
        return { success: true, warning: 'Profile deleted but auth user deletion failed' };
      }
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  return { success: true };
}
