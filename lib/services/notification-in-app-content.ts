/**
 * In-App Notification Content Generator
 *
 * Generates notification content (title, body, icon, variant, action) for in-app notifications.
 */

import type { NotificationType } from '@/types/notifications';

export type InAppContent = {
  title: string;
  body: string;
  icon?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  actionUrl?: string;
  actionLabel?: string;
};

/**
 * Generate in-app notification content from template data
 */
export function generateInAppContent(
  type: NotificationType,
  data: Record<string, unknown>
): InAppContent {
  const contentMap: Record<
    NotificationType,
    (d: Record<string, unknown>) => InAppContent
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
export function getPriorityForType(type: NotificationType): number {
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
