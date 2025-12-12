'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { watchCalendar } from '@/lib/google';

export async function enableCalendarWebhook() {
  const { user, isTeacher } = await getUserWithRolesSSR();
  
  if (!user || !isTeacher) {
    return { success: false, error: 'Unauthorized' };
  }

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/google-calendar`;
  
  try {
    const { channelId, resourceId, expiration } = await watchCalendar(user.id, webhookUrl);
    
    if (!channelId || !resourceId) {
      throw new Error('Failed to register webhook');
    }

    const supabase = await createClient();
    
    // Store subscription
    const { error } = await supabase.from('webhook_subscriptions').insert({
      user_id: user.id,
      provider: 'google_calendar',
      channel_id: channelId,
      resource_id: resourceId,
      expiration: expiration || Date.now() + 7 * 24 * 60 * 60 * 1000, // Default 7 days
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error enabling webhook:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
