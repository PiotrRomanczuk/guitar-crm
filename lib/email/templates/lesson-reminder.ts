/**
 * Lesson Reminder Email Template
 *
 * Sent 24 hours before a scheduled lesson.
 */

import {
  generateBaseEmailHtml,
  createSectionHeading,
  createGreeting,
  createParagraph,
  createCardSection,
  createDetailRow,
} from './base-template';

export interface LessonReminderData {
  studentName: string;
  lessonDate: string;
  lessonTime: string;
  location?: string;
  agenda?: string;
}

export function generateLessonReminderHtml(data: LessonReminderData): string {
  const { studentName, lessonDate, lessonTime, location, agenda } = data;

  const bodyContent = `
    ${createSectionHeading('Upcoming Lesson Reminder')}
    ${createGreeting(studentName)}
    ${createParagraph(
      'This is a friendly reminder about your upcoming guitar lesson.'
    )}

    ${createCardSection(`
      ${createDetailRow('Date', lessonDate)}
      ${createDetailRow('Time', lessonTime)}
      ${location ? createDetailRow('Location', location) : ''}
      ${agenda ? createDetailRow('Planned Agenda', agenda) : ''}
    `)}
  `;

  return generateBaseEmailHtml({
    subject: 'Upcoming Lesson Reminder',
    preheader: `Your lesson is scheduled for ${lessonDate} at ${lessonTime}`,
    bodyContent,
    footerNote: 'See you soon!',
    ctaButton: {
      text: 'View Dashboard',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
    },
  });
}
