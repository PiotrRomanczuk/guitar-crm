/**
 * Notification HTML Renderer
 *
 * Maps NotificationType to the corresponding email template.
 * Used by both notification-service.ts and notification-queue-processor.ts.
 */

import type { NotificationType } from '@/types/notifications';
import { generateLessonReminderHtml } from './templates/lesson-reminder';
import { generateLessonRecapHtml } from './templates/lesson-recap';
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
        teacherName: (d.teacherName as string) || '',
        lessonDate: (d.lessonDate as string) || '',
        lessonTitle: (d.lessonTitle as string) || 'Your Recent Lesson',
        songsCovered: (d.songsCovered as string[]) || [],
        teacherNotes: (d.teacherNotes as string) || '',
        nextLessonDate: d.nextLessonDate as string | undefined,
        assignments: d.assignments as string[] | undefined,
      });
    case 'lesson_cancelled':
      return generateLessonCancellationHtml({
        studentName: (d.studentName as string) || name,
        lessonDate: (d.lessonDate as string) || '',
        lessonTime: (d.lessonTime as string) || '',
        reason: d.reason as string | undefined,
        rescheduleUrl: d.rescheduleUrl as string | undefined,
      });
    case 'lesson_rescheduled':
      return generateLessonRescheduledHtml({
        studentName: (d.studentName as string) || name,
        originalDate: (d.originalDate as string) || '',
        originalTime: (d.originalTime as string) || '',
        newDate: (d.newDate as string) || '',
        newTime: (d.newTime as string) || '',
        reason: d.reason as string | undefined,
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
        songTitle: d.songTitle as string | undefined,
        description: d.description as string | undefined,
      });
    case 'assignment_overdue_alert':
      return generateAssignmentOverdueAlertHtml({
        studentName: (d.studentName as string) || name,
        assignmentTitle: (d.assignmentTitle as string) || '',
        dueDate: (d.dueDate as string) || '',
        daysOverdue: (d.daysOverdue as number) || 0,
        songTitle: d.songTitle as string | undefined,
      });
    case 'song_mastery_achievement':
      return generateSongMasteryAchievementHtml({
        studentName: (d.studentName as string) || name,
        songTitle: (d.songTitle as string) || '',
        songArtist: (d.songArtist as string) || '',
        masteryDate: (d.masteryDate as string) || '',
        practiceSessionCount: d.practiceSessionCount as number | undefined,
        totalPracticeMinutes: d.totalPracticeMinutes as number | undefined,
      });
    case 'student_welcome':
      return generateStudentWelcomeHtml({
        studentName: (d.studentName as string) || name,
        teacherName: (d.teacherName as string) || '',
        firstLessonDate: d.firstLessonDate as string | undefined,
        loginUrl: d.loginUrl as string | undefined,
      });
    case 'weekly_progress_digest':
      return generateWeeklyProgressDigestHtml({
        studentName: (d.studentName as string) || name,
        weekStartDate: (d.weekStartDate as string) || '',
        weekEndDate: (d.weekEndDate as string) || '',
        lessonsCompleted: (d.lessonsCompleted as number) || 0,
        practiceMinutes: (d.practiceMinutes as number) || 0,
        songsProgressed: (d.songsProgressed as number) || 0,
        highlights: d.highlights as string[] | undefined,
        teacherMessage: d.teacherMessage as string | undefined,
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
    lessonsToday: (d.lessonsToday as number) || 0,
    studentsCount: (d.studentsCount as number) || 0,
    lessons: (d.lessons as Array<{ studentName: string; time: string; status: string }>) || [],
    upcomingAssignments: d.upcomingAssignments as Array<{ studentName: string; title: string; dueDate: string }> | undefined,
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
