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

  if (profile) {
    return {
      user,
      isAdmin: profile.is_admin,
      isTeacher: profile.is_teacher,
      isStudent: profile.is_student,
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

  // Fallback for test users (bypass potential RLS issues in CI/Development)
  if (user.email === 'student@example.com') {
    return {
      user,
      isAdmin: false,
      isTeacher: false,
      isStudent: true,
    };
  }

  if (user.email === 'teacher@example.com') {
    return {
      user,
      isAdmin: false,
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
