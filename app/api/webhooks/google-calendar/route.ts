import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchAndSyncRecentEvents } from '@/lib/services/google-calendar-sync';

export async function POST(req: NextRequest) {
  const channelId = req.headers.get('x-goog-channel-id');
  const resourceId = req.headers.get('x-goog-resource-id');
  const resourceState = req.headers.get('x-goog-resource-state');

  if (!channelId || !resourceId) {
    return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
  }

  // Handle sync verification
  if (resourceState === 'sync') {
    return NextResponse.json({ status: 'ok' });
  }

  const supabase = await createClient();

  // Find the user associated with this channel
  const { data: subscription, error } = await supabase
    .from('webhook_subscriptions')
    .select('user_id')
    .eq('channel_id', channelId)
    .eq('resource_id', resourceId)
    .single();

  if (error || !subscription) {
    console.error('Webhook subscription not found:', { channelId, resourceId });
    // Return 200 to stop Google from retrying if it's an invalid channel
    return NextResponse.json({ status: 'ignored' });
  }

  // Trigger sync for the user
  // We don't await this to return quickly to Google
  fetchAndSyncRecentEvents(subscription.user_id).catch((err) => {
    console.error('Background sync failed:', err);
  });

  return NextResponse.json({ status: 'processed' });
}
