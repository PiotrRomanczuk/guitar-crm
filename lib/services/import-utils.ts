import { createClient } from '@/lib/supabase/server';
import { Database } from '@/database.types';

type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

export type MatchStatus = 'MATCHED' | 'AMBIGUOUS' | 'NONE';

export interface StudentMatch {
  status: MatchStatus;
  candidates: Array<{
    id: string;
    email: string;
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
  
  // Use correct column names: full_name, is_student
  // Note: user_id might not exist in types yet if we just added migration, 
  // but we can try to select it. If it fails, we handle it.
  
  // @ts-ignore - user_id is added via migration but might not be in types yet
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, user_id') 
    .eq('email', email);
    // .eq('is_student', true); // Don't filter by is_student, match any profile with this email
  
  if (error || !profiles) {
    console.error('Error matching student:', error);
    return { status: 'NONE', candidates: [] };
  }
  
  if (profiles.length === 0) {
    return { status: 'NONE', candidates: [] };
  }
  
  const candidates = profiles.map(p => {
    const nameParts = (p.full_name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    return {
      id: p.id,
      email: p.email,
      firstName,
      lastName,
      // @ts-ignore
      user_id: p.user_id || null
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
  
  // Use correct column names matching database.types.ts
  const profileData: ProfileInsert = {
    email,
    full_name: fullName,
    is_student: true,
    is_teacher: false,
    is_admin: false,
    is_development: false,
    // @ts-ignore - user_id added in migration
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
  
  return { success: true, profileId: data.id };
}
