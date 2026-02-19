'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { watchCalendar } from '@/lib/google';
import { getAppConfig } from '@/lib/config';

export async function enableCalendarWebhook() {
  const { user, isTeacher } = await getUserWithRolesSSR();

  if (!user || !isTeacher) {
    return { success: false, error: 'Unauthorized' };
  }

  const { apiUrl } = getAppConfig();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || apiUrl?.replace(/\/$/, '');

  if (!appUrl) {
    console.error('Missing NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_API_BASE_URL');
    return { success: false, error: 'Server configuration error: Missing App URL' };
  }

  // Google Webhooks require HTTPS. Localhost is not supported without a tunnel (e.g. ngrok).
  if (appUrl.includes('localhost') && !appUrl.includes('ngrok')) {
    console.warn('Google Calendar Webhooks require HTTPS and a public URL. Localhost will fail.');
    // We can return a specific error to the UI so the user knows they need a tunnel
    return {
      success: false,
      error:
        'Google Webhooks require a public HTTPS URL. Please use ngrok or deploy to a public server.',
    };
  }

  const webhookUrl = `${appUrl}/api/webhooks/google-calendar`;

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
