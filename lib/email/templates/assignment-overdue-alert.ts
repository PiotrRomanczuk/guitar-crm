/**
 * Assignment Overdue Alert Email Template
 *
 * Sent when an assignment becomes overdue.
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
import type { AssignmentOverdueAlertData } from '@/types/notifications';

export function generateAssignmentOverdueAlertHtml(data: AssignmentOverdueAlertData): string {
  const { studentName, assignmentTitle, dueDate, daysOverdue, assignmentLink } = data;

  const bodyContent = `
    ${createSectionHeading('Assignment Overdue')}
    ${createGreeting(studentName)}
    ${createParagraph(
      `Your assignment "${assignmentTitle}" is now ${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'} overdue. Please complete it as soon as possible.`
    )}

    ${createCardSection(`
      <div style="margin-bottom: 16px;">
        <h3 style="margin: 0 0 8px 0; color: #1c1917; font-size: 18px; font-weight: 600;">
          ${assignmentTitle}
        </h3>
      </div>

      ${createDetailRow('Was Due', `<span style="color: #ef4444;">${dueDate}</span>`)}
      ${createDetailRow('Days Overdue', `<span style="color: #ef4444; font-weight: 600;">${daysOverdue}</span>`)}

      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed #e8e0d8;">
        ${createStatusBadge('Overdue', 'warning')}
      </div>
    `)}

    ${createParagraph(
      "Don't worry - it's not too late to catch up! Complete the assignment and let your teacher know if you need any help or have questions."
    )}
  `;

  return generateBaseEmailHtml({
    subject: `Overdue Assignment: ${assignmentTitle}`,
    preheader: `${assignmentTitle} is ${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'} overdue`,
    bodyContent,
    footerNote: 'Your teacher is here to help!',
    ctaButton: {
      text: 'Complete Assignment',
      url: assignmentLink,
    },
  });
}
