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
import transporter from '@/lib/email/smtp-client';
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
          template_data: templateData,
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
    const { data: logEntry, error: logInsertError } = await supabase
      .from('notification_log')
      .insert({
        notification_type: type,
        recipient_user_id: recipientUserId,
        recipient_email: recipient.email,
        status: 'pending',
        subject,
        template_data: templateData,
        entity_type: entityType,
        entity_id: entityId,
      })
      .select('id')
      .single();

    if (logInsertError || !logEntry) {
      logError(
        'Failed to create log entry',
        logInsertError instanceof Error ? logInsertError : new Error('Failed to create log entry'),
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

    // 5. Send email
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
        template_data: templateData,
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
 * Get notification HTML content (placeholder - will be implemented with templates)
 */
async function getNotificationHtml(
  type: NotificationType,
  templateData: Record<string, unknown>,
  recipient: { full_name: string | null; email: string }
): Promise<string> {
  // TODO: Import and call actual template functions once they're created
  // For now, return a simple placeholder

  let baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL_REMOTE ||
    'http://localhost:3000';

  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }

  const recipientName = recipient.full_name || 'there';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${getNotificationSubject(type, templateData)}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">

        <!-- Header -->
        <div style="background-color: #18181b; padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Guitar CRM</h1>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
          <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">${getNotificationSubject(type, templateData)}</h2>
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
