/**
 * Webhook Renewal Service
 * Automatically renews expiring Google Calendar webhook subscriptions
 *
 * This should be called periodically (e.g., via cron job) to ensure
 * webhooks don't expire and cause sync interruptions.
 */

import { createClient } from '@/lib/supabase/server';
import { watchCalendar } from '@/lib/google';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface WebhookSubscription {
  id: string;
  user_id: string;
  provider: string;
  channel_id: string;
  resource_id: string;
  expiration: number;
  created_at: string;
  updated_at: string;
}

interface RenewalResult {
  success: boolean;
  userId: string;
  error?: string;
  oldChannelId?: string;
  newChannelId?: string;
}

interface RenewalSummary {
  totalChecked: number;
  renewed: number;
  failed: number;
  skipped: number;
  results: RenewalResult[];
}

/**
 * Get webhook URL for the current environment
 */
function getWebhookUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL environment variable not set');
  }
  return `${appUrl}/api/webhooks/google-calendar`;
}

/**
 * Find webhook subscriptions that will expire within the next day
 */
export async function findExpiringWebhooks(): Promise<WebhookSubscription[]> {
  const supabase = await createClient();
  const expirationThreshold = Date.now() + ONE_DAY_MS;

  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .select('*')
    .eq('provider', 'google_calendar')
    .lt('expiration', expirationThreshold);

  if (error) {
    console.error('Error fetching expiring webhooks:', error);
    return [];
  }

  return data || [];
}

/**
 * Renew a single webhook subscription
 */
async function renewWebhook(subscription: WebhookSubscription): Promise<RenewalResult> {
  const supabase = await createClient();

  try {
    const webhookUrl = getWebhookUrl();

    // Create new webhook subscription
    const { channelId, resourceId, expiration } = await watchCalendar(
      subscription.user_id,
      webhookUrl
    );

    if (!channelId || !resourceId || !expiration) {
      throw new Error('Failed to create new webhook: Missing required fields');
    }

    // Update database with new subscription details
    const { error: updateError } = await supabase
      .from('webhook_subscriptions')
      .update({
        channel_id: channelId,
        resource_id: resourceId,
        expiration: expiration,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    if (updateError) {
      throw updateError;
    }

    console.log(
      `✓ Renewed webhook for user ${subscription.user_id}: ${subscription.channel_id} → ${channelId}`
    );

    return {
      success: true,
      userId: subscription.user_id,
      oldChannelId: subscription.channel_id,
      newChannelId: channelId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`✗ Failed to renew webhook for user ${subscription.user_id}:`, errorMessage);

    return {
      success: false,
      userId: subscription.user_id,
      error: errorMessage,
    };
  }
}

/**
 * Renew all expiring webhook subscriptions
 * This function should be called periodically (e.g., daily via cron)
 *
 * @returns Summary of renewal operations
 */
export async function renewExpiringWebhooks(): Promise<RenewalSummary> {
  console.log('🔄 Starting webhook renewal process...');

  const expiring = await findExpiringWebhooks();

  if (expiring.length === 0) {
    console.log('✓ No webhooks need renewal');
    return {
      totalChecked: 0,
      renewed: 0,
      failed: 0,
      skipped: 0,
      results: [],
    };
  }

  console.log(`Found ${expiring.length} webhook(s) expiring within 24 hours`);

  const results: RenewalResult[] = [];

  // Renew webhooks sequentially to avoid rate limiting
  for (const subscription of expiring) {
    const result = await renewWebhook(subscription);
    results.push(result);

    // Add small delay between renewals to respect rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const renewed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`✓ Renewal complete: ${renewed} renewed, ${failed} failed`);

  return {
    totalChecked: expiring.length,
    renewed,
    failed,
    skipped: 0,
    results,
  };
}

/**
 * Delete expired webhook subscriptions from database
 * (They're already inactive on Google's side)
 */
export async function cleanupExpiredWebhooks(): Promise<number> {
  const supabase = await createClient();
  const now = Date.now();

  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .delete()
    .eq('provider', 'google_calendar')
    .lt('expiration', now)
    .select();

  if (error) {
    console.error('Error cleaning up expired webhooks:', error);
    return 0;
  }

  const deletedCount = data?.length || 0;
  if (deletedCount > 0) {
    console.log(`🗑️  Cleaned up ${deletedCount} expired webhook(s)`);
  }

  return deletedCount;
}
