'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { guardTestAccountMutation } from '@/lib/auth/test-account-guard';
import { SelfRatingSchema } from '@/schemas/SelfRatingSchema';
import { createLogger } from '@/lib/logger';

const log = createLogger('self-rating-actions');

export async function updateSelfRatingAction(
  repertoireId: string,
  rating: number
): Promise<{ success: true } | { error: string }> {
  const { isDevelopment } = await getUserWithRolesSSR();
  const guard = guardTestAccountMutation(isDevelopment);
  if (guard) return { error: guard.error };

  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized' };
  }

  // 2. Validate input
  const parsed = SelfRatingSchema.safeParse({ repertoireId, rating });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // 3. Verify ownership — student can only rate their own repertoire entries
  const { data: entry, error: fetchError } = await supabase
    .from('student_repertoire')
    .select('student_id')
    .eq('id', parsed.data.repertoireId)
    .single();

  if (fetchError || !entry) {
    return { error: 'Repertoire entry not found' };
  }

  if (entry.student_id !== user.id) {
    return { error: 'You can only rate your own repertoire songs' };
  }

  // 4. Update self-rating
  const { error: updateError } = await supabase
    .from('student_repertoire')
    .update({
      self_rating: parsed.data.rating,
      self_rating_updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.repertoireId);

  if (updateError) {
    log.error('Failed to update self-rating', {
      repertoireId: parsed.data.repertoireId,
      error: updateError,
    });
    return { error: updateError.message };
  }

  revalidatePath('/dashboard/repertoire');
  revalidatePath(`/dashboard/users/${entry.student_id}`);
  return { success: true };
}
