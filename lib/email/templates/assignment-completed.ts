/**
 * Assignment Completed Email Template
 *
 * Sent when a student completes an assignment.
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

interface AssignmentCompletedData {
  studentName: string;
  assignmentTitle: string;
  completedDate: string;
  teacherName: string;
}

export function generateAssignmentCompletedHtml(data: AssignmentCompletedData): string {
  const { studentName, assignmentTitle, completedDate, teacherName } = data;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const bodyContent = `
    ${createSectionHeading('Assignment Completed!')}
    ${createGreeting(studentName)}
    ${createParagraph(
      'Great work — you\'ve completed your assignment. Keep up the momentum!'
    )}

    ${createCardSection(`
      ${createDetailRow('Assignment', assignmentTitle)}
      ${createDetailRow('Completed', completedDate)}
      ${createDetailRow('Teacher', teacherName)}
      <div style="margin-top: 12px;">
        ${createStatusBadge('Completed', 'success')}
      </div>
    `)}
  `;

  return generateBaseEmailHtml({
    subject: `Assignment Completed: ${assignmentTitle}`,
    preheader: `You completed "${assignmentTitle}" — nice work!`,
    bodyContent,
    footerNote: 'Keep up the great work!',
    ctaButton: {
      text: 'View Dashboard',
      url: `${baseUrl}/dashboard`,
    },
  });
}
