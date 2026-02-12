'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { OnboardingData } from '@/types/onboarding';

export async function completeOnboarding(onboardingData: OnboardingData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  const adminClient = createAdminClient();

  // Get existing user metadata
  const firstName = user.user_metadata?.first_name || '';
  const lastName = user.user_metadata?.last_name || '';
  const fullName = user.user_metadata?.full_name || `${firstName} ${lastName}`.trim();

  try {
    // 1. Update profile with onboarding data and assign student role via boolean flag
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        full_name: fullName,
        is_student: true,
        updated_at: new Date().toISOString(),
        // Store onboarding preferences in JSONB column if it exists
        // Otherwise, these can be stored in a separate onboarding_data table
        onboarding_completed: true,
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return { error: 'Failed to update profile' };
    }

    // TODO: Store in user_preferences table
    // await adminClient.from('user_preferences').insert({
    //   user_id: user.id,
    //   goals: onboardingData.goals,
    //   skill_level: onboardingData.skillLevel,
    //   learning_style: onboardingData.learningStyle,
    //   instrument_preference: onboardingData.instrumentPreference,
    // });
  } catch (error) {
    console.error('Onboarding error:', error);
    return { error: 'An unexpected error occurred' };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}
