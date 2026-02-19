/**
 * Assignment Due Reminder Email Template
 *
 * Sent 2 days before an assignment is due.
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
import type { AssignmentDueReminderData } from '@/types/notifications';

export function generateAssignmentDueReminderHtml(data: AssignmentDueReminderData): string {
  const { studentName, assignmentTitle, dueDate, assignmentDescription, assignmentLink } = data;

  const bodyContent = `
    ${createSectionHeading('Assignment Due Soon')}
    ${createGreeting(studentName)}
    ${createParagraph(
      'This is a friendly reminder that you have an assignment due soon. Make sure to complete it before the deadline!'
    )}

    ${createCardSection(`
      <div style="margin-bottom: 16px;">
        <h3 style="margin: 0 0 8px 0; color: #1c1917; font-size: 18px; font-weight: 600;">
          ${assignmentTitle}
        </h3>
        ${
          assignmentDescription
            ? `<p style="margin: 0; color: #57534e; line-height: 1.6; font-size: 15px;">${assignmentDescription}</p>`
            : ''
        }
      </div>

      ${createDetailRow(
        'Due Date',
        `<span style="color: #f59e0b; font-weight: 600;">${dueDate}</span>`
      )}

      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed #e8e0d8;">
        ${createStatusBadge('Due Soon', 'warning')}
      </div>
    `)}

    ${createParagraph(
      'Make sure to practice and complete all the tasks before the deadline. If you need help or have questions, reach out to your teacher!'
    )}
  `;

  return generateBaseEmailHtml({
    subject: `Assignment Due Soon: ${assignmentTitle}`,
    preheader: `Don't forget - ${assignmentTitle} is due ${dueDate}`,
    bodyContent,
    footerNote: 'Keep up the great work!',
    ctaButton: {
      text: 'View Assignment',
      url: assignmentLink,
    },
  });
}
