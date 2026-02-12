/**
 * Notification Queue Processor
 *
 * Handles processing of queued and failed notifications:
 * - Processing pending notifications from the queue
 * - Retrying failed notifications with exponential backoff
 * - Dead letter queue management
 */

'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import transporter, { isSmtpConfigured } from '@/lib/email/smtp-client';
import { checkRateLimit, checkSystemRateLimit } from '@/lib/email/rate-limiter';
import {
  getRetryableNotifications,
  updateNotificationRetry,
  processDeadLetterQueue,
  shouldMoveToDeadLetter,
  moveToDeadLetter,
} from '@/lib/email/retry-handler';
import {
  logBatchProcessed,
  logError,
  logInfo,
} from '@/lib/logging/notification-logger';
import type { NotificationType } from '@/types/notifications';
import { sendNotification } from './notification-service';

interface QueuedNotification {
  id: string;
  notification_type: string;
  recipient_user_id: string;
  template_data: Record<string, unknown>;
  entity_type: string | null;
  entity_id: string | null;
  priority: number;
}

async function getNotificationHtml(
  type: NotificationType,
  templateData: Record<string, unknown>,
  recipient: { full_name: string | null; email: string }
): Promise<string> {
  const { renderNotificationHtml } = await import('@/lib/email/render-notification');
  return renderNotificationHtml(type, templateData, recipient);
}

// ============================================================================
// QUEUE PROCESSING FUNCTIONS
// ============================================================================

/**
 * Process pending notifications from the queue
 */
export async function processQueuedNotifications(
  batchSize: number = 100
): Promise<{ processed: number; failed: number }> {
  try {
    const supabase = createAdminClient();

    // Get pending notifications
    const { data: rpcData, error: fetchError } = await supabase
      .rpc('get_pending_notifications' as never, { batch_size: batchSize } as never);
    const queuedNotifications = rpcData as QueuedNotification[] | null;

    if (fetchError) {
      logError(
        'Failed to fetch queued notifications',
        fetchError instanceof Error ? fetchError : new Error('Failed to fetch queued notifications')
      );
      return { processed: 0, failed: 0 };
    }

    if (!queuedNotifications || queuedNotifications.length === 0) {
      logInfo('No queued notifications to process');
      return { processed: 0, failed: 0 };
    }

    logInfo(`Processing ${queuedNotifications.length} queued notifications`);

    let processed = 0;
    let failed = 0;

    // Process each notification
    for (const notification of queuedNotifications) {
      try {
        const result = await sendNotification({
          type: notification.notification_type as NotificationType,
          recipientUserId: notification.recipient_user_id,
          templateData: notification.template_data as Record<string, unknown>,
          entityType: notification.entity_type || undefined,
          entityId: notification.entity_id || undefined,
          priority: notification.priority,
        });

        // Update queue status
        await supabase
          .from('notification_queue')
          .update({
            status: result.success ? 'sent' : 'failed',
            processed_at: new Date().toISOString(),
          })
          .eq('id', notification.id);

        if (result.success) {
          processed++;
        } else {
          failed++;
        }
      } catch (error) {
        logError(
          `Failed to process notification ${notification.id}`,
          error instanceof Error ? error : new Error('Unknown error'),
          {
            notification_id: notification.id,
            user_id: notification.recipient_user_id,
            notification_type: notification.notification_type as NotificationType,
          }
        );
        failed++;

        // Mark as failed in queue
        await supabase
          .from('notification_queue')
          .update({
            status: 'failed',
            processed_at: new Date().toISOString(),
          })
          .eq('id', notification.id);
      }
    }

    logBatchProcessed('queue', processed, failed);

    return { processed, failed };
  } catch (error) {
    logError(
      'processQueuedNotifications error',
      error instanceof Error ? error : new Error('Unknown error')
    );
    return { processed: 0, failed: 0 };
  }
}

/**
 * Retry failed notifications with exponential backoff
 */
export async function retryFailedNotifications(): Promise<{ retried: number; failed: number; deadLettered: number }> {
  try {
    const supabase = createAdminClient();

    // Get notifications ready for retry (using retry handler)
    const failedNotifications = await getRetryableNotifications(50);

    if (!failedNotifications || failedNotifications.length === 0) {
      // Process dead letter queue if no retries
      const deadLettered = await processDeadLetterQueue();
      return { retried: 0, failed: 0, deadLettered };
    }

    let retried = 0;
    let failed = 0;

    for (const notification of failedNotifications) {
      try {
        // Check if should move to dead letter before retry
        if (shouldMoveToDeadLetter(notification)) {
          await moveToDeadLetter(notification.id, 'Maximum retry attempts exceeded');
          continue;
        }

        // Get recipient info
        const { data: recipient } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .eq('id', notification.recipient_user_id)
          .single();

        if (!recipient) {
          continue;
        }

        // Generate email content
        const htmlContent = await getNotificationHtml(
          notification.notification_type as NotificationType,
          notification.template_data as Record<string, unknown>,
          recipient
        );

        // Check rate limits before retry
        const userRL = await checkRateLimit(notification.recipient_user_id);
        if (!userRL.allowed) {
          continue; // Skip this notification, try next
        }
        const systemRL = await checkSystemRateLimit();
        if (!systemRL.allowed) {
          break; // Stop all retries this cycle
        }

        // Check SMTP configuration
        if (!isSmtpConfigured()) {
          await updateNotificationRetry(notification.id, 'failed', notification.retry_count + 1, 'SMTP not configured');
          failed++;
          continue;
        }

        // Attempt to send
        await transporter.sendMail({
          from: `"Guitar CRM" <${process.env.GMAIL_USER}>`,
          to: recipient.email,
          subject: notification.subject,
          html: htmlContent,
        });

        // Update to sent (using retry handler)
        await updateNotificationRetry(
          notification.id,
          'sent',
          notification.retry_count + 1
        );

        retried++;
      } catch (error) {
        console.error(`Failed to retry notification ${notification.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Retry failed';

        // Increment retry count and update error (using retry handler)
        await updateNotificationRetry(
          notification.id,
          'failed',
          notification.retry_count + 1,
          errorMessage
        );

        failed++;
      }
    }

    logBatchProcessed('retry', retried, failed);

    // Process dead letter queue after retries
    const deadLettered = await processDeadLetterQueue();
    logBatchProcessed('dead_letter', deadLettered, 0);

    return { retried, failed, deadLettered };
  } catch (error) {
    logError(
      'retryFailedNotifications error',
      error instanceof Error ? error : new Error('Unknown error')
    );
    return { retried: 0, failed: 0, deadLettered: 0 };
  }
}
