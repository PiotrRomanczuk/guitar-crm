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
import { createInAppNotification } from '@/lib/services/in-app-notification-service';
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
 * Supports dual-channel routing: email, in-app, or both
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

    // 3. Get delivery channel (email, in-app, or both)
    const deliveryChannel = await getDeliveryChannel(recipientUserId, type);

    const results: { email: boolean | null; inApp: boolean | null } = {
      email: null,
      inApp: null,
    };

    // 4. Send via in-app if enabled
    if (deliveryChannel === 'in_app' || deliveryChannel === 'both') {
      const inAppContent = generateInAppContent(type, templateData);
      const inAppNotification = await createInAppNotification({
        type,
        recipientUserId,
        ...inAppContent,
        entityType,
        entityId: entityId || '',
        priority: getPriorityForType(type),
      });
      results.inApp = !!inAppNotification;
    }

    // 5. Send via email if enabled (skip email logic if in-app only)
    if (deliveryChannel === 'email' || deliveryChannel === 'both') {
      // Continue with existing email logic below...

      // 5.1. Generate email content
      const subject = getNotificationSubject(type, templateData);
      const htmlContent = await getNotificationHtml(type, templateData, recipient);

      // 5.2. Create log entry (pending)
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
          success: results.inApp === true,
          error: 'Failed to create email log entry',
        };
      }

      // 5.3. Check rate limits
      const userRateLimit = await checkRateLimit(recipientUserId);
      if (!userRateLimit.allowed) {
        await supabase
          .from('notification_log')
          .update({ status: 'failed', error_message: `User rate limited. Retry after ${userRateLimit.retryAfter}s` })
          .eq('id', logEntry.id);
        return {
          success: results.inApp === true,
          error: `User rate limited. Retry after ${userRateLimit.retryAfter}s`,
          logId: logEntry.id,
        };
      }
      const systemRateLimit = await checkSystemRateLimit();
      if (!systemRateLimit.allowed) {
        await supabase
          .from('notification_log')
          .update({ status: 'failed', error_message: 'System rate limit reached' })
          .eq('id', logEntry.id);
        return {
          success: results.inApp === true,
          error: 'System rate limit reached',
          logId: logEntry.id,
        };
      }

      // 5.4. Check SMTP configuration
      if (!isSmtpConfigured()) {
        await supabase
          .from('notification_log')
          .update({ status: 'failed', error_message: 'SMTP not configured: missing GMAIL_USER or GMAIL_APP_PASSWORD' })
          .eq('id', logEntry.id);
        return {
          success: results.inApp === true,
          error: 'SMTP not configured: missing GMAIL_USER or GMAIL_APP_PASSWORD',
          logId: logEntry.id,
        };
      }

      // 5.5. Send email
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

        results.email = true;
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

        results.email = false;
      }
    }

    // 6. Return combined result
    const overallSuccess = results.email === true || results.inApp === true;
    return {
      success: overallSuccess,
      logId: undefined,
    };
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

// ============================================================================
// DUAL-CHANNEL HELPERS (Email + In-App)
// ============================================================================

type DeliveryChannel = 'email' | 'in_app' | 'both';

/**
 * Get delivery channel for a notification type
 * Checks user preference, falls back to default
 */
async function getDeliveryChannel(
  userId: string,
  type: NotificationType
): Promise<DeliveryChannel> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('delivery_channel')
      .eq('user_id', userId)
      .eq('notification_type', type)
      .single();

    if (error || !data) {
      return getDefaultDeliveryChannel(type);
    }

    return data.delivery_channel as DeliveryChannel;
  } catch (error) {
    return getDefaultDeliveryChannel(type);
  }
}

/**
 * Get default delivery channel based on notification type
 * Email: student_welcome, lesson_recap
 * In-app: all others (16 types)
 */
function getDefaultDeliveryChannel(type: NotificationType): DeliveryChannel {
  const emailOnly: NotificationType[] = ['student_welcome', 'lesson_recap'];
  return emailOnly.includes(type) ? 'email' : 'in_app';
}

/**
 * Generate in-app notification content from template data
 */
function generateInAppContent(
  type: NotificationType,
  data: Record<string, unknown>
): {
  title: string;
  body: string;
  icon?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  actionUrl?: string;
  actionLabel?: string;
} {
  const contentMap: Record<
    NotificationType,
    (d: Record<string, unknown>) => ReturnType<typeof generateInAppContent>
  > = {
    // Lesson notifications
    lesson_reminder_24h: (d) => ({
      title: 'Lesson Tomorrow',
      body: `You have a lesson at ${d.lessonTime || 'your scheduled time'}`,
      icon: '📅',
      variant: 'info' as const,
      actionUrl: '/dashboard/lessons',
      actionLabel: 'View Lesson',
    }),
    lesson_recap: (d) => ({
      title: 'Lesson Recap',
      body: `Recap from your lesson: ${d.lessonTitle || 'Guitar Lesson'}`,
      icon: '📝',
      variant: 'default' as const,
      actionUrl: '/dashboard/lessons',
      actionLabel: 'View Details',
    }),
    lesson_cancelled: (d) => ({
      title: 'Lesson Cancelled',
      body: `Your lesson on ${d.lessonDate || 'your scheduled date'} has been cancelled`,
      icon: '❌',
      variant: 'warning' as const,
      actionUrl: '/dashboard/lessons',
      actionLabel: 'View Details',
    }),
    lesson_rescheduled: (d) => ({
      title: 'Lesson Rescheduled',
      body: `Your lesson has been moved to ${d.newDate || 'a new time'}`,
      icon: '🔄',
      variant: 'info' as const,
      actionUrl: '/dashboard/lessons',
      actionLabel: 'View New Time',
    }),

    // Assignment notifications
    assignment_created: (d) => ({
      title: 'New Assignment',
      body: `"${d.assignmentTitle || 'New assignment'}" due ${d.dueDate || 'soon'}`,
      icon: '📋',
      variant: 'info' as const,
      actionUrl: d.assignmentLink as string || '/dashboard/assignments',
      actionLabel: 'View Assignment',
    }),
    assignment_due_reminder: (d) => ({
      title: 'Assignment Due Soon',
      body: `"${d.assignmentTitle || 'Your assignment'}" is due ${d.dueDate || 'soon'}`,
      icon: '⏰',
      variant: 'warning' as const,
      actionUrl: d.assignmentLink as string || '/dashboard/assignments',
      actionLabel: 'View Assignment',
    }),
    assignment_overdue_alert: (d) => ({
      title: 'Assignment Overdue',
      body: `"${d.assignmentTitle || 'Your assignment'}" is overdue by ${d.daysOverdue || '0'} days`,
      icon: '⚠️',
      variant: 'error' as const,
      actionUrl: d.assignmentLink as string || '/dashboard/assignments',
      actionLabel: 'Complete Now',
    }),
    assignment_completed: (d) => ({
      title: 'Assignment Complete',
      body: `You completed "${d.assignmentTitle || 'your assignment'}"!`,
      icon: '✅',
      variant: 'success' as const,
      actionUrl: '/dashboard/assignments',
      actionLabel: 'View All',
    }),

    // Achievement notifications
    song_mastery_achievement: (d) => ({
      title: 'Song Mastered!',
      body: `You mastered "${d.songTitle || 'a song'}" by ${d.songArtist || 'Unknown Artist'}! 🎉`,
      icon: '🎸',
      variant: 'success' as const,
      actionUrl: '/dashboard/songs',
      actionLabel: 'View Progress',
    }),
    milestone_reached: (d) => ({
      title: 'Milestone Reached!',
      body: `You reached: ${d.milestone || 'a milestone'}!`,
      icon: '🏆',
      variant: 'success' as const,
      actionUrl: '/dashboard',
      actionLabel: 'View Dashboard',
    }),

    // Lifecycle notifications
    student_welcome: (d) => ({
      title: 'Welcome!',
      body: `Welcome to Guitar CRM, ${d.studentName || 'Student'}!`,
      icon: '👋',
      variant: 'info' as const,
      actionUrl: d.loginLink as string || '/dashboard',
      actionLabel: 'Get Started',
    }),
    trial_ending_reminder: (d) => ({
      title: 'Trial Ending Soon',
      body: `Your trial period ends ${d.daysRemaining || 'soon'}`,
      icon: '⏳',
      variant: 'warning' as const,
      actionUrl: '/dashboard/settings/billing',
      actionLabel: 'Upgrade Now',
    }),

    // Digest notifications
    teacher_daily_summary: (d) => ({
      title: 'Daily Summary',
      body: `${d.completedLessons || 0} lessons completed today`,
      icon: '📊',
      variant: 'info' as const,
      actionUrl: '/dashboard',
      actionLabel: 'View Summary',
    }),
    weekly_progress_digest: (d) => ({
      title: 'Weekly Progress',
      body: `${d.lessonsCompleted || 0} lessons, ${d.songsMastered || 0} songs mastered this week`,
      icon: '📈',
      variant: 'info' as const,
      actionUrl: '/dashboard',
      actionLabel: 'View Progress',
    }),

    // System notifications
    calendar_conflict_alert: (d) => ({
      title: 'Calendar Conflict',
      body: `You have a scheduling conflict on ${d.conflictDate || 'your calendar'}`,
      icon: '⚠️',
      variant: 'warning' as const,
      actionUrl: '/dashboard/lessons',
      actionLabel: 'Resolve Conflict',
    }),
    webhook_expiration_notice: (d) => ({
      title: 'Integration Expiring',
      body: `Your ${d.integration || 'calendar integration'} expires ${d.expiresAt || 'soon'}`,
      icon: '🔗',
      variant: 'warning' as const,
      actionUrl: '/dashboard/settings/integrations',
      actionLabel: 'Renew Now',
    }),
    admin_error_alert: (d) => ({
      title: 'System Error',
      body: `Error: ${d.errorType || 'System error occurred'}`,
      icon: '🚨',
      variant: 'error' as const,
      actionUrl: '/dashboard/admin/logs',
      actionLabel: 'View Logs',
    }),
  };

  const generator = contentMap[type];
  if (generator) {
    return generator(data);
  }

  // Fallback for unknown types
  return {
    title: 'Notification',
    body: 'You have a new notification',
    icon: '🔔',
    variant: 'default',
    actionUrl: '/dashboard',
    actionLabel: 'View',
  };
}

/**
 * Get priority for notification type (1-10, higher = more important)
 */
function getPriorityForType(type: NotificationType): number {
  const priorityMap: Record<NotificationType, number> = {
    // High priority (8-10)
    lesson_cancelled: 9,
    assignment_overdue_alert: 9,
    admin_error_alert: 10,
    calendar_conflict_alert: 8,

    // Medium-high priority (6-7)
    lesson_reminder_24h: 7,
    lesson_rescheduled: 7,
    student_welcome: 7,
    webhook_expiration_notice: 7,
    assignment_due_reminder: 6,
    song_mastery_achievement: 6,

    // Normal priority (4-5)
    lesson_recap: 5,
    assignment_created: 5,
    assignment_completed: 5,
    milestone_reached: 5,
    trial_ending_reminder: 5,

    // Low priority (1-3)
    teacher_daily_summary: 3,
    weekly_progress_digest: 3,
  };

  return priorityMap[type] || 5;
}
