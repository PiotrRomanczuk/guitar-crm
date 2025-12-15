'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function completeOnboarding(formData: FormData) {
  const fullName = formData.get('fullName') as string;

  if (!fullName) {
    return { error: 'Full name is required' };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Update profile
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        full_name: fullName,
        is_student: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return { error: 'Failed to update profile' };
    }

    // 2. Assign student role
    const { error: roleError } = await adminClient.from('user_roles').insert({
      user_id: user.id,
      role: 'student',
    });

    if (roleError) {
      // Ignore duplicate key error (23505)
      if (roleError.code !== '23505') {
        console.error('Error assigning role:', roleError);
        return { error: 'Failed to assign role' };
      }
    }
  } catch (error) {
    console.error('Onboarding error:', error);
    return { error: 'An unexpected error occurred' };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}
