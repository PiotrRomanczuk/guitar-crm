/**
 * Notification Service Helpers
 *
 * Helper functions for delivery channel logic, subject/HTML generation.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import type { NotificationType } from '@/types/notifications';

export type DeliveryChannel = 'email' | 'in_app' | 'both';

/**
 * Get delivery channel for a notification type
 * Checks user preference, falls back to default
 */
export async function getDeliveryChannel(
  userId: string,
  type: NotificationType
): Promise<DeliveryChannel> {
  try {
    const supabase = createAdminClient();

    // Note: delivery_channel column exists in DB (migration 038) but may not be in generated types yet
    const { data } = await supabase
      .from('notification_preferences')
      .select('delivery_channel')
      .eq('user_id', userId)
      .eq('notification_type', type)
      .single();

    if (!data) {
      return getDefaultDeliveryChannel(type);
    }

    // Type assertion: delivery_channel is 'email' | 'in_app' | 'both'
    return (data as unknown as { delivery_channel: DeliveryChannel }).delivery_channel;
  } catch {
    return getDefaultDeliveryChannel(type);
  }
}

/**
 * Get default delivery channel based on notification type
 * Email: student_welcome, lesson_recap
 * In-app: all others (16 types)
 */
export function getDefaultDeliveryChannel(type: NotificationType): DeliveryChannel {
  const emailOnly: NotificationType[] = ['student_welcome', 'lesson_recap'];
  return emailOnly.includes(type) ? 'email' : 'in_app';
}

/**
 * Get notification subject based on type and template data
 */
export function getNotificationSubject(
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
export async function getNotificationHtml(
  type: NotificationType,
  templateData: Record<string, unknown>,
  recipient: { full_name: string | null; email: string }
): Promise<string> {
  const { renderNotificationHtml } = await import('@/lib/email/render-notification');
  return renderNotificationHtml(type, templateData, recipient);
}
