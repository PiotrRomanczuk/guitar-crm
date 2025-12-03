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

  // Fetch roles from user_roles table
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  if (rolesError) {
    // Profile error - user exists but no profile record (handle gracefully in calling code)
  }

  if (roles) {
    return {
      user,
      isAdmin: roles.some((r) => r.role === 'admin'),
      isTeacher: roles.some((r) => r.role === 'teacher'),
      isStudent: roles.some((r) => r.role === 'student'),
    };
  }

  // Fallback: if user is development admin, set isAdmin true
  if (user.email === 'p.romanczuk@gmail.com') {
    return {
      user,
      isAdmin: true,
      isTeacher: true,
      isStudent: false,
    };
  }

  return {
    user,
    isAdmin: false,
    isTeacher: false,
    isStudent: false,
  };
}
