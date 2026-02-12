/**
 * Lesson Rescheduled Email Template
 *
 * Sent when a lesson time is changed to notify the student.
 */

import {
  generateBaseEmailHtml,
  createSectionHeading,
  createGreeting,
  createParagraph,
  createCardSection,
} from './base-template';
import type { LessonRescheduledData } from '@/types/notifications';

export function generateLessonRescheduledHtml(data: LessonRescheduledData): string {
  const { studentName, teacherName, oldDate, oldTime, newDate, newTime } = data;

  const bodyContent = `
    ${createSectionHeading('Lesson Rescheduled')}
    ${createGreeting(studentName)}
    ${createParagraph(
      'Your guitar lesson time has been changed. Please make note of the new date and time below.'
    )}

    ${createCardSection(`
      <div style="text-align: center; margin-bottom: 16px;">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #78716c; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">
          Previous Time
        </p>
        <p style="margin: 0; color: #78716c; font-size: 15px; text-decoration: line-through;">
          ${oldDate} at ${oldTime}
        </p>
      </div>

      <div style="text-align: center; margin: 16px 0;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
          <path d="M19 9L12 16L5 9" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div style="text-align: center; margin-top: 16px;">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #78716c; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">
          New Time
        </p>
        <p style="margin: 0; color: #1c1917; font-size: 18px; font-weight: 700;">
          ${newDate} at ${newTime}
        </p>
      </div>
    `)}

    ${createParagraph(
      `Your teacher ${teacherName} is looking forward to seeing you at the new time. If you have any questions or concerns about this change, please contact them directly.`
    )}
  `;

  return generateBaseEmailHtml({
    subject: 'Lesson Rescheduled',
    preheader: `Your lesson has been moved to ${newDate} at ${newTime}`,
    bodyContent,
    footerNote: "Add this to your calendar so you don't forget!",
  });
}
