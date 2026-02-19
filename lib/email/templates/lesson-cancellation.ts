/**
 * Lesson Cancellation Email Template
 *
 * Sent when a lesson is cancelled to notify the student.
 */

import {
  generateBaseEmailHtml,
  createSectionHeading,
  createGreeting,
  createParagraph,
  createCardSection,
  createDetailRow,
} from './base-template';
import type { LessonCancellationData } from '@/types/notifications';

export function generateLessonCancellationHtml(data: LessonCancellationData): string {
  const { studentName, teacherName, lessonDate, lessonTime, reason, rescheduleLink } = data;

  const bodyContent = `
    ${createSectionHeading('Lesson Cancelled')}
    ${createGreeting(studentName)}
    ${createParagraph(
      'We wanted to let you know that your upcoming guitar lesson has been cancelled.'
    )}

    ${createCardSection(`
      ${createDetailRow('Date', lessonDate)}
      ${createDetailRow('Time', lessonTime)}
      ${createDetailRow('Teacher', teacherName)}
      ${reason ? createDetailRow('Reason', reason) : ''}
    `)}

    ${createParagraph(
      'We apologize for any inconvenience. Please reach out to your teacher to reschedule at a time that works for both of you.'
    )}
  `;

  return generateBaseEmailHtml({
    subject: 'Lesson Cancelled',
    preheader: `Your lesson on ${lessonDate} has been cancelled`,
    bodyContent,
    footerNote: "We look forward to seeing you at your next lesson!",
    ctaButton: rescheduleLink
      ? {
          text: 'Reschedule Lesson',
          url: rescheduleLink,
        }
      : undefined,
  });
}
