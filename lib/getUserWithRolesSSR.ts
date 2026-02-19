import { createClient } from '@/lib/supabase/server';

export async function getUserWithRolesSSR() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    // Optionally log or handle error
    return {
      user: null,
      isAdmin: false,
      isTeacher: false,
      isStudent: false,
    };
  }

  if (!user) {
    return {
      user: null,
      isAdmin: false,
      isTeacher: false,
      isStudent: false,
    };
  }

  // Fetch roles from profiles table boolean flags
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, is_teacher, is_student')
    .eq('id', user.id)
    .single();

  return {
    user,
    isAdmin: profile?.is_admin ?? false,
    isTeacher: profile?.is_teacher ?? false,
    isStudent: profile?.is_student ?? false,
  };
}
