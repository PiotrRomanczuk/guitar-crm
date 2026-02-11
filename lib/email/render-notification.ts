/**
 * Notification HTML Renderer
 *
 * Maps NotificationType to the corresponding email template.
 * Used by both notification-service.ts and notification-queue-processor.ts.
 */

import type { NotificationType } from '@/types/notifications';
import { generateLessonReminderHtml } from './templates/lesson-reminder';
import { generateLessonRecapHtml, type LessonEmailData } from './templates/lesson-recap';
import { generateLessonCancellationHtml } from './templates/lesson-cancellation';
import { generateLessonRescheduledHtml } from './templates/lesson-rescheduled-notification';
import { generateAssignmentDueReminderHtml } from './templates/assignment-due-reminder';
import { generateAssignmentOverdueAlertHtml } from './templates/assignment-overdue-alert';
import { generateSongMasteryAchievementHtml } from './templates/song-mastery-achievement';
import { generateStudentWelcomeHtml } from './templates/student-welcome';
import { generateTeacherDailySummaryHtml } from './templates/teacher-daily-summary';
import { generateWeeklyProgressDigestHtml } from './templates/weekly-progress-digest';
import { generateBaseEmailHtml, createGreeting, createParagraph } from './templates/base-template';

type TemplateData = Record<string, unknown>;
type Recipient = { full_name: string | null; email: string };

function renderLessonTemplate(
  type: string,
  d: TemplateData,
  name: string
): string | null {
  switch (type) {
    case 'lesson_reminder_24h':
      return generateLessonReminderHtml({
        studentName: (d.studentName as string) || name,
        lessonDate: (d.lessonDate as string) || '',
        lessonTime: (d.lessonTime as string) || '',
        location: d.location as string | undefined,
        agenda: d.agenda as string | undefined,
      });
    case 'lesson_recap':
      return generateLessonRecapHtml({
        studentName: (d.studentName as string) || name,
        lessonDate: (d.lessonDate as string) || '',
        lessonTitle: (d.lessonTitle as string) || 'Your Recent Lesson',
        notes: (d.notes as string) || null,
        songs: d.songs as LessonEmailData['songs'],
      });
    case 'lesson_cancelled':
      return generateLessonCancellationHtml({
        studentName: (d.studentName as string) || name,
        teacherName: (d.teacherName as string) || '',
        lessonDate: (d.lessonDate as string) || '',
        lessonTime: (d.lessonTime as string) || '',
        reason: d.reason as string | undefined,
        rescheduleLink: d.rescheduleLink as string | undefined,
      });
    case 'lesson_rescheduled':
      return generateLessonRescheduledHtml({
        studentName: (d.studentName as string) || name,
        teacherName: (d.teacherName as string) || '',
        oldDate: (d.oldDate as string) || '',
        oldTime: (d.oldTime as string) || '',
        newDate: (d.newDate as string) || '',
        newTime: (d.newTime as string) || '',
      });
    default:
      return null;
  }
}

function renderStudentTemplate(
  type: string,
  d: TemplateData,
  name: string
): string | null {
  switch (type) {
    case 'assignment_due_reminder':
      return generateAssignmentDueReminderHtml({
        studentName: (d.studentName as string) || name,
        assignmentTitle: (d.assignmentTitle as string) || '',
        dueDate: (d.dueDate as string) || '',
        assignmentDescription: d.assignmentDescription as string | undefined,
        assignmentLink: (d.assignmentLink as string) || '',
      });
    case 'assignment_overdue_alert':
      return generateAssignmentOverdueAlertHtml({
        studentName: (d.studentName as string) || name,
        assignmentTitle: (d.assignmentTitle as string) || '',
        dueDate: (d.dueDate as string) || '',
        daysOverdue: (d.daysOverdue as number) || 0,
        assignmentLink: (d.assignmentLink as string) || '',
      });
    case 'song_mastery_achievement':
      return generateSongMasteryAchievementHtml({
        studentName: (d.studentName as string) || name,
        songTitle: (d.songTitle as string) || '',
        songArtist: (d.songArtist as string) || '',
        masteredDate: (d.masteredDate as string) || '',
        totalSongsMastered: (d.totalSongsMastered as number) || 0,
      });
    case 'student_welcome':
      return generateStudentWelcomeHtml({
        studentName: (d.studentName as string) || name,
        teacherName: (d.teacherName as string) || '',
        loginLink: (d.loginLink as string) || '',
        firstLessonDate: d.firstLessonDate as string | undefined,
      });
    case 'weekly_progress_digest':
      return generateWeeklyProgressDigestHtml({
        recipientName: (d.recipientName as string) || name,
        weekStart: (d.weekStart as string) || '',
        weekEnd: (d.weekEnd as string) || '',
        lessonsCompleted: (d.lessonsCompleted as number) || 0,
        songsMastered: (d.songsMastered as number) || 0,
        practiceTime: (d.practiceTime as number) || 0,
        highlights: (d.highlights as string[]) || [],
        upcomingLessons: (d.upcomingLessons as Array<{ date: string; title: string }>) || [],
      });
    default:
      return null;
  }
}

function renderTeacherTemplate(
  type: string,
  d: TemplateData,
  name: string
): string | null {
  if (type !== 'teacher_daily_summary') return null;
  return generateTeacherDailySummaryHtml({
    teacherName: (d.teacherName as string) || name,
    date: (d.date as string) || '',
    upcomingLessons: (d.upcomingLessons as Array<{ studentName: string; time: string; title: string }>) || [],
    completedLessons: (d.completedLessons as number) || 0,
    pendingAssignments: (d.pendingAssignments as number) || 0,
    recentAchievements: (d.recentAchievements as Array<{ studentName: string; achievement: string }>) || [],
  });
}

function renderGenericNotification(
  type: NotificationType,
  data: TemplateData,
  recipientName: string,
  recipientEmail: string
): string {
  const subjectMap: Partial<Record<NotificationType, string>> = {
    assignment_created: `New Assignment: ${data.assignmentTitle || 'Untitled'}`,
    assignment_completed: `Assignment Completed: ${data.assignmentTitle || 'Untitled'}`,
    milestone_reached: `Milestone Reached: ${data.milestone || ''}`,
    trial_ending_reminder: 'Your Trial Period is Ending Soon',
    calendar_conflict_alert: 'Calendar Conflict Detected',
    webhook_expiration_notice: 'Calendar Integration Expiring',
    admin_error_alert: `System Error: ${data.errorType || 'Unknown'}`,
  };

  const subject = subjectMap[type] || 'Notification from Guitar CRM';

  const detailPairs = Object.entries(data)
    .filter(([, v]) => v != null && typeof v !== 'object')
    .map(([k, v]) => `<strong>${k}:</strong> ${String(v)}`)
    .join('<br>');

  const bodyContent = [
    createGreeting(recipientName),
    createParagraph(subject),
    detailPairs
      ? `<div style="background-color: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0; line-height: 1.8;">${detailPairs}</div>`
      : '',
  ].join('');

  return generateBaseEmailHtml({
    subject,
    bodyContent,
    recipientEmail,
    notificationType: type,
  });
}

/**
 * Render notification HTML using the appropriate template.
 * Falls back to a generic base template for types without a dedicated template.
 */
export function renderNotificationHtml(
  type: NotificationType,
  templateData: TemplateData,
  recipient: Recipient
): string {
  const name = recipient.full_name || 'there';

  return (
    renderLessonTemplate(type, templateData, name) ||
    renderStudentTemplate(type, templateData, name) ||
    renderTeacherTemplate(type, templateData, name) ||
    renderGenericNotification(type, templateData, name, recipient.email)
  );
}
