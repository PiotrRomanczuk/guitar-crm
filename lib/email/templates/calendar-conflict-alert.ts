/**
 * Calendar Conflict Alert Email Template
 *
 * Sent to teachers when two lessons are scheduled at the same time.
 */

import {
  generateBaseEmailHtml,
  createSectionHeading,
  createGreeting,
  createParagraph,
  createCardSection,
  createDetailRow,
  createStatusBadge,
} from './base-template';

interface CalendarConflictAlertData {
  teacherName: string;
  conflictDate: string;
  conflictTime: string;
  lesson1: string;
  lesson2: string;
  resolveLink?: string;
}

export function generateCalendarConflictAlertHtml(data: CalendarConflictAlertData): string {
  const { teacherName, conflictDate, conflictTime, lesson1, lesson2, resolveLink } = data;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const bodyContent = `
    ${createSectionHeading('Scheduling Conflict Detected')}
    ${createGreeting(teacherName)}
    ${createParagraph(
      'Two lessons are scheduled at the same time. Please resolve this conflict to avoid double-booking.'
    )}

    ${createCardSection(`
      ${createDetailRow('Date', conflictDate)}
      ${createDetailRow('Time', conflictTime)}
      <div style="margin-top: 12px;">
        ${createStatusBadge('Conflict', 'warning')}
      </div>
    `)}

    ${createCardSection(`
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #78716c; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Conflicting Lessons</p>
      <div style="padding: 12px; background-color: #ffffff; border: 1px solid #e8e0d8; border-radius: 6px; margin-bottom: 8px;">
        <p style="margin: 0; color: #1c1917; font-size: 15px; font-weight: 500;">${lesson1}</p>
      </div>
      <div style="padding: 12px; background-color: #ffffff; border: 1px solid #e8e0d8; border-radius: 6px;">
        <p style="margin: 0; color: #1c1917; font-size: 15px; font-weight: 500;">${lesson2}</p>
      </div>
    `)}

    ${createParagraph(
      'Please reschedule one of these lessons to resolve the conflict.'
    )}
  `;

  return generateBaseEmailHtml({
    subject: 'Calendar Conflict Detected',
    preheader: `Two lessons overlap on ${conflictDate} at ${conflictTime}`,
    bodyContent,
    ctaButton: {
      text: 'Resolve Conflict',
      url: resolveLink || `${baseUrl}/dashboard`,
    },
  });
}
