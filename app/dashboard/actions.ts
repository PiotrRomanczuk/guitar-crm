'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function inviteUser(
  email: string,
  fullName: string,
  role: 'student' | 'teacher' | 'admin' = 'student',
  phone?: string
) {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    throw new Error('Unauthorized: Authentication required');
  }

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

  if (!userId) {
    const { data: authData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email
    );

    if (inviteError) throw new Error(`Failed to invite user: ${inviteError.message}`);
    if (!authData.user) throw new Error('User creation failed');
    userId = authData.user.id;
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

async function findOrCreateAuthUser(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  studentEmail: string
): Promise<string> {
  // 1. Search existing auth users
  let page = 1;
  while (page <= 5) {
    const {
      data: { users },
      error,
    } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 100 });

    if (error || !users || users.length === 0) break;

    const found = users.find((u) => u.email?.toLowerCase() === studentEmail.toLowerCase());
    if (found) return found.id;
    page++;
  }

  // 2. Try generateLink, then createUser as fallback
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: studentEmail,
    options: {
      data: { is_student: true, full_name: studentEmail.split('@')[0] },
    },
  });

  if (linkError) {
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: studentEmail,
      email_confirm: true,
      user_metadata: { is_student: true, full_name: studentEmail.split('@')[0] },
    });

    if (createError) throw new Error(`Failed to create/find user: ${createError.message}`);
    return newUser.user.id;
  }

  if (linkData?.user) {
    if (!linkData.user.email_confirmed_at) {
      await supabaseAdmin.auth.admin.updateUserById(linkData.user.id, { email_confirm: true });
    }
    return linkData.user.id;
  }

  throw new Error('Could not obtain user ID for shadow user');
}

async function upsertStudentProfile(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  userId: string,
  studentEmail: string
): Promise<void> {
  const { error } = await supabaseAdmin.from('profiles').upsert(
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

  if (!error) return;

  // Handle duplicate email (orphan profile)
  if (error.code === '23505' && error.message?.includes('email')) {
    await cleanupOrphanProfiles(supabaseAdmin, userId, studentEmail);
    return;
  }

  console.error('Failed to upsert shadow profile:', error);
  throw new Error('Failed to ensure shadow profile exists');
}

async function cleanupOrphanProfiles(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  userId: string,
  studentEmail: string
): Promise<void> {
  const { data: orphan } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', studentEmail)
    .single();

  if (!orphan || orphan.id === userId) return;

  // Rename orphan email to free constraint
  const tempEmail = `${studentEmail}_migrated_${Date.now()}`;
  await supabaseAdmin.from('profiles').update({ email: tempEmail }).eq('id', orphan.id);

  // Create new profile
  const { error } = await supabaseAdmin.from('profiles').upsert(
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

  if (error) throw new Error(`Failed to create profile after cleanup: ${error.message}`);

  // Migrate related data
  await supabaseAdmin.from('lessons').update({ student_id: userId }).eq('student_id', orphan.id);
  await supabaseAdmin.from('lessons').update({ teacher_id: userId }).eq('teacher_id', orphan.id);
  await supabaseAdmin.from('assignments').update({ student_id: userId }).eq('student_id', orphan.id);
  await supabaseAdmin.from('assignments').update({ teacher_id: userId }).eq('teacher_id', orphan.id);

  // Delete orphan
  await supabaseAdmin.from('profiles').delete().eq('id', orphan.id);
}

export async function createShadowUser(studentEmail: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, is_teacher')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin && !profile?.is_teacher) {
    throw new Error('Unauthorized: Only teachers and admins can create shadow users');
  }

  const supabaseAdmin = createAdminClient();
  const userId = await findOrCreateAuthUser(supabaseAdmin, studentEmail);
  await upsertStudentProfile(supabaseAdmin, userId, studentEmail);

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error('Unauthorized: Admin access required');
  }

  const supabaseAdmin = createAdminClient();

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);

  const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', userId);

  if (profileError) {
    console.error('Error deleting profile:', profileError);
  }

  if (authUser?.user) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting auth user:', error);
      if (!profileError) {
        return { success: true, warning: 'Profile deleted but auth user deletion failed' };
      }
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  return { success: true };
}
