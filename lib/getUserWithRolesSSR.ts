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
      isParent: false,
      isDevelopment: false,
    };
  }

  if (!user) {
    return {
      user: null,
      isAdmin: false,
      isTeacher: false,
      isStudent: false,
      isParent: false,
      isDevelopment: false,
    };
  }

  // Fetch roles from profiles table boolean flags
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, is_teacher, is_student, is_parent, is_development')
    .eq('id', user.id)
    .single();

  return {
    user,
    isAdmin: profile?.is_admin ?? false,
    isTeacher: profile?.is_teacher ?? false,
    isStudent: profile?.is_student ?? false,
    isParent: profile?.is_parent ?? false,
    isDevelopment: profile?.is_development ?? false,
  };
}
