// @ts-nocheck
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
import transporter from '@/lib/email/smtp-client';
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

// Re-export getNotificationHtml helper (will be used by retry logic)
async function getNotificationHtml(
  type: NotificationType,
  templateData: Record<string, unknown>,
  recipient: { full_name: string | null; email: string }
): Promise<string> {
  let baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL_REMOTE ||
    'http://localhost:3000';

  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }

  const recipientName = recipient.full_name || 'there';

  // Get subject from notification type
  const subjectMap: Record<NotificationType, (data: Record<string, unknown>) => string> = {
    lesson_reminder_24h: () => 'Upcoming Lesson Reminder',
    lesson_recap: (data) => `Lesson Recap: ${data.lessonTitle || 'Your Recent Lesson'}`,
    lesson_cancelled: () => 'Lesson Cancelled',
    lesson_rescheduled: () => 'Lesson Rescheduled',
    assignment_created: (data) => `New Assignment: ${data.assignmentTitle}`,
    assignment_due_reminder: (data) => `Assignment Due Soon: ${data.assignmentTitle}`,
    assignment_overdue_alert: (data) => `Overdue Assignment: ${data.assignmentTitle}`,
    assignment_completed: (data) => `Assignment Completed: ${data.assignmentTitle}`,
    song_mastery_achievement: (data) => `Congratulations! You Mastered "${data.songTitle}"`,
    milestone_reached: (data) => `Milestone Reached: ${data.milestone}`,
    student_welcome: () => 'Welcome to Guitar CRM!',
    trial_ending_reminder: () => 'Your Trial Period is Ending Soon',
    teacher_daily_summary: (data) => `Daily Summary - ${data.date}`,
    weekly_progress_digest: () => 'Your Weekly Progress Report',
    calendar_conflict_alert: () => 'Calendar Conflict Detected',
    webhook_expiration_notice: () => 'Calendar Integration Expiring',
    admin_error_alert: (data) => `System Error: ${data.errorType}`,
  };

  const subjectGenerator = subjectMap[type];
  const subject = subjectGenerator ? subjectGenerator(templateData) : 'Notification from Guitar CRM';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">

        <!-- Header -->
        <div style="background-color: #18181b; padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Guitar CRM</h1>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
          <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">${subject}</h2>
          <p style="color: #52525b; margin: 0 0 24px 0; line-height: 1.6;">
            Hi ${recipientName},<br><br>
            This is a notification from Guitar CRM.
          </p>

          <pre style="background-color: #f4f4f5; padding: 16px; border-radius: 8px; overflow-x: auto;">
${JSON.stringify(templateData, null, 2)}
          </pre>
        </div>

        <!-- Footer -->
        <div style="background-color: #f4f4f5; padding: 24px; text-align: center; border-top: 1px solid #e4e4e7;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #71717a;">
            <a href="${baseUrl}/settings/notifications" style="color: #3b82f6; text-decoration: none;">Manage notification preferences</a>
          </p>
          <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
            © ${new Date().getFullYear()} Guitar CRM. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
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
    const { data: queuedNotifications, error: fetchError } = await supabase
      .rpc('get_pending_notifications', { batch_size: batchSize });

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
            notification_type: notification.notification_type,
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
