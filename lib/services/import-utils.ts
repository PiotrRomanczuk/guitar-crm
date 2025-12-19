import { createClient } from '@/lib/supabase/server';
// import { TablesInsert } from '@/types/database.types'; // Types are incorrect

export type MatchStatus = 'MATCHED' | 'AMBIGUOUS' | 'NONE';

export interface StudentMatch {
  status: MatchStatus;
  candidates: Array<{
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    user_id: string | null;
  }>;
}

/**
 * Match a Google Calendar attendee email to existing profiles
 */
export async function matchStudentByEmail(email: string): Promise<StudentMatch> {
  const supabase = await createClient();
  
  // Use correct column names: is_student, full_name
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, user_id')
    .eq('email', email);
    // .eq('is_student', true); // Don't filter by is_student, we want to match any existing user to avoid duplicates
  
  if (error || !profiles) {
    console.error('Error matching student:', error);
    return { status: 'NONE', candidates: [] };
  }
  
  if (profiles.length === 0) {
    return { status: 'NONE', candidates: [] };
  }
  
  // Map to expected format
  const candidates = profiles.map((p) => {
    const [firstName, ...lastNameParts] = (p.full_name || '').split(' ');
    return {
      id: p.id.toString(),
      email: p.email,
      firstName: firstName || '',
      lastName: lastNameParts.join(' ') || '',
      user_id: p.user_id
    };
  });
  
  if (candidates.length === 1) {
    return { status: 'MATCHED', candidates };
  }
  
  return { status: 'AMBIGUOUS', candidates };
}

/**
 * Create a shadow student profile (no auth user yet)
 */
export async function createShadowStudent(
  email: string,
  firstName: string,
  lastName: string
): Promise<{ success: boolean; profileId?: string; error?: string }> {
  const supabase = await createClient();
  
  const fullName = `${firstName} ${lastName}`.trim();

  // Use correct column names
  const profileData = {
    email,
    full_name: fullName,
    is_student: true,
    is_teacher: false,
    is_admin: false,
    is_shadow: true,
    user_id: null, // Shadow profile
  };
  
  const { data, error } = await supabase
    .from('profiles')
    .insert(profileData)
    .select('id')
    .single();
  
  if (error) {
    console.error('Error creating shadow student:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, profileId: data.id.toString() };
}
