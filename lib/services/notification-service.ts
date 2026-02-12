/**
 * Notification Service
 *
 * Core service for sending email notifications with:
 * - User preference checking
 * - Notification queuing
 * - Retry logic with exponential backoff
 * - Comprehensive logging
 */

'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import transporter, { isSmtpConfigured } from '@/lib/email/smtp-client';
import { checkRateLimit, checkSystemRateLimit } from '@/lib/email/rate-limiter';
import {
  logNotificationSent,
  logNotificationFailed,
  logNotificationQueued,
  logNotificationSkipped,
  logError,
} from '@/lib/logging/notification-logger';
import type {
  NotificationType,
  SendNotificationParams,
  QueueNotificationParams,
  NotificationResult,
} from '@/types/notifications';
import type { Json } from '@/database.types';

// ============================================================================
// MAIN NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Send a notification immediately (checks preferences, logs attempt)
 */
export async function sendNotification(
  params: SendNotificationParams
): Promise<NotificationResult> {
  const {
    type,
    recipientUserId,
    templateData,
    entityType,
    entityId,
  } = params;

  try {
    const supabase = createAdminClient();

    // 1. Get recipient info
    const { data: recipient, error: recipientError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', recipientUserId)
      .single();

    if (recipientError || !recipient) {
      logError(
        'Recipient not found',
        recipientError instanceof Error ? recipientError : new Error('Recipient not found'),
        { user_id: recipientUserId, notification_type: type }
      );
      return {
        success: false,
        error: 'Recipient not found',
      };
    }

    // 2. Check user preferences
    const preferenceEnabled = await checkUserPreference(recipientUserId, type);

    if (!preferenceEnabled) {
      // Log as skipped
      const { data: logEntry } = await supabase
        .from('notification_log')
        .insert({
          notification_type: type,
          recipient_user_id: recipientUserId,
          recipient_email: recipient.email,
          status: 'skipped',
          subject: getNotificationSubject(type, templateData),
          template_data: templateData as unknown as Json,
          entity_type: entityType,
          entity_id: entityId,
        })
        .select('id')
        .single();

      logNotificationSkipped(recipientUserId, type, 'User preference disabled', {
        notification_id: logEntry?.id,
        recipient_email: recipient.email,
        entity_type: entityType,
        entity_id: entityId,
      });

      return {
        success: true,
        skipped: true,
        logId: logEntry?.id,
      };
    }

    // 3. Generate email content
    const subject = getNotificationSubject(type, templateData);
    const htmlContent = await getNotificationHtml(type, templateData, recipient);

    // 4. Create log entry (pending)
    const { data: logEntry, error: logEntryError } = await supabase
      .from('notification_log')
      .insert({
        notification_type: type,
        recipient_user_id: recipientUserId,
        recipient_email: recipient.email,
        status: 'pending',
        subject,
        template_data: templateData as unknown as Json,
        entity_type: entityType,
        entity_id: entityId,
      })
      .select('id')
      .single();

    if (logEntryError || !logEntry) {
      logError(
        'Failed to create log entry',
        logEntryError instanceof Error ? logEntryError : new Error('Failed to create log entry'),
        {
          user_id: recipientUserId,
          notification_type: type,
          entity_type: entityType,
          entity_id: entityId,
        }
      );
      return {
        success: false,
        error: 'Failed to create log entry',
      };
    }

    // 5. Check rate limits
    const userRateLimit = await checkRateLimit(recipientUserId);
    if (!userRateLimit.allowed) {
      await supabase
        .from('notification_log')
        .update({ status: 'failed', error_message: `User rate limited. Retry after ${userRateLimit.retryAfter}s` })
        .eq('id', logEntry.id);
      return { success: false, error: `User rate limited. Retry after ${userRateLimit.retryAfter}s`, logId: logEntry.id };
    }
    const systemRateLimit = await checkSystemRateLimit();
    if (!systemRateLimit.allowed) {
      await supabase
        .from('notification_log')
        .update({ status: 'failed', error_message: 'System rate limit reached' })
        .eq('id', logEntry.id);
      return { success: false, error: 'System rate limit reached', logId: logEntry.id };
    }

    // 6. Check SMTP configuration
    if (!isSmtpConfigured()) {
      await supabase
        .from('notification_log')
        .update({ status: 'failed', error_message: 'SMTP not configured: missing GMAIL_USER or GMAIL_APP_PASSWORD' })
        .eq('id', logEntry.id);
      return { success: false, error: 'SMTP not configured: missing GMAIL_USER or GMAIL_APP_PASSWORD', logId: logEntry.id };
    }

    // 7. Send email
    try {
      await transporter.sendMail({
        from: `"Guitar CRM" <${process.env.GMAIL_USER}>`,
        to: recipient.email,
        subject,
        html: htmlContent,
      });

      // Update log entry to sent
      await supabase
        .from('notification_log')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', logEntry.id);

      logNotificationSent(
        logEntry.id,
        recipientUserId,
        type,
        recipient.email,
        {
          entity_type: entityType,
          entity_id: entityId,
          subject,
        }
      );

      return {
        success: true,
        logId: logEntry.id,
      };
    } catch (emailError: unknown) {
      // Update log entry to failed
      const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error';

      await supabase
        .from('notification_log')
        .update({
          status: 'failed',
          error_message: errorMessage,
        })
        .eq('id', logEntry.id);

      logNotificationFailed(
        logEntry.id,
        emailError instanceof Error ? emailError : new Error(errorMessage),
        recipientUserId,
        type,
        {
          entity_type: entityType,
          entity_id: entityId,
          recipient_email: recipient.email,
        }
      );

      return {
        success: false,
        error: errorMessage,
        logId: logEntry.id,
      };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(
      'sendNotification error',
      error instanceof Error ? error : new Error(errorMessage),
      {
        user_id: recipientUserId,
        notification_type: type,
        entity_type: entityType,
        entity_id: entityId,
      }
    );
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Queue a notification for future delivery
 */
export async function queueNotification(
  params: QueueNotificationParams
): Promise<NotificationResult> {
  const {
    type,
    recipientUserId,
    templateData,
    entityType,
    entityId,
    priority = 5,
    scheduledFor = new Date(),
  } = params;

  try {
    const supabase = createAdminClient();

    const { data: queueEntry, error: queueError } = await supabase
      .from('notification_queue')
      .insert({
        notification_type: type,
        recipient_user_id: recipientUserId,
        template_data: templateData as unknown as Json,
        scheduled_for: scheduledFor.toISOString(),
        priority,
        entity_type: entityType,
        entity_id: entityId,
        status: 'pending',
      })
      .select('id')
      .single();

    if (queueError || !queueEntry) {
      logError(
        'Failed to queue notification',
        queueError instanceof Error ? queueError : new Error('Failed to queue notification'),
        {
          user_id: recipientUserId,
          notification_type: type,
          entity_type: entityType,
          entity_id: entityId,
        }
      );
      return {
        success: false,
        error: 'Failed to queue notification',
      };
    }

    logNotificationQueued(
      queueEntry.id,
      recipientUserId,
      type,
      scheduledFor.toISOString(),
      priority,
      {
        entity_type: entityType,
        entity_id: entityId,
      }
    );

    return {
      success: true,
      logId: queueEntry.id,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(
      'queueNotification error',
      error instanceof Error ? error : new Error(errorMessage),
      {
        user_id: recipientUserId,
        notification_type: type,
        entity_type: entityType,
        entity_id: entityId,
      }
    );
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Check if user has enabled a specific notification type
 */
export async function checkUserPreference(
  userId: string,
  notificationType: NotificationType
): Promise<boolean> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('enabled')
      .eq('user_id', userId)
      .eq('notification_type', notificationType)
      .single();

    if (error || !data) {
      // If no preference found, default to enabled
      return true;
    }

    return data.enabled;
  } catch (error) {
    logError(
      'checkUserPreference error',
      error instanceof Error ? error : new Error('Unknown error'),
      { user_id: userId, notification_type: notificationType }
    );
    // Default to enabled on error
    return true;
  }
}


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get notification subject based on type and template data
 */
function getNotificationSubject(
  type: NotificationType,
  templateData: Record<string, unknown>
): string {
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
  return subjectGenerator ? subjectGenerator(templateData) : 'Notification from Guitar CRM';
}

/**
 * Get notification HTML content using dedicated email templates.
 */
async function getNotificationHtml(
  type: NotificationType,
  templateData: Record<string, unknown>,
  recipient: { full_name: string | null; email: string }
): Promise<string> {
  const { renderNotificationHtml } = await import('@/lib/email/render-notification');
  return renderNotificationHtml(type, templateData, recipient);
}
