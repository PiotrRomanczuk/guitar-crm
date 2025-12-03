import { createClient } from '@/lib/supabase/server';
import { TablesInsert } from '@/types/database.types';

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
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, firstName, lastName, user_id')
    .eq('email', email)
    .eq('isStudent', true);
  
  if (error || !profiles) {
    return { status: 'NONE', candidates: [] };
  }
  
  if (profiles.length === 0) {
    return { status: 'NONE', candidates: [] };
  }
  
  if (profiles.length === 1) {
    return { status: 'MATCHED', candidates: profiles };
  }
  
  return { status: 'AMBIGUOUS', candidates: profiles };
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
  
  const profileData: TablesInsert<'profiles'> = {
    email,
    firstName,
    lastName,
    isStudent: true,
    isTeacher: false,
    isAdmin: false,
    isActive: true,
    canEdit: false,
    user_id: null, // Shadow profile
  };
  
  const { data, error } = await supabase
    .from('profiles')
    .insert(profileData)
    .select('id')
    .single();
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true, profileId: data.id.toString() }; // Ensure ID is string if needed, though DB type is number usually for profiles.id in this project based on types file.
}
