/**
 * Assignment Created Email Template
 *
 * Sent when a teacher creates a new assignment for a student.
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

interface AssignmentCreatedData {
  studentName: string;
  assignmentTitle: string;
  assignmentDescription?: string;
  dueDate: string;
  teacherName: string;
  assignmentLink?: string;
}

export function generateAssignmentCreatedHtml(data: AssignmentCreatedData): string {
  const { studentName, assignmentTitle, assignmentDescription, dueDate, teacherName, assignmentLink } = data;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const bodyContent = `
    ${createSectionHeading('New Assignment')}
    ${createGreeting(studentName)}
    ${createParagraph(
      `Your teacher <strong>${teacherName}</strong> has given you a new assignment.`
    )}

    ${createCardSection(`
      <div style="margin-bottom: 16px;">
        <h3 style="margin: 0 0 8px 0; color: #1c1917; font-size: 18px; font-weight: 600;">
          ${assignmentTitle}
        </h3>
        ${assignmentDescription ? `<p style="margin: 0; color: #57534e; line-height: 1.6; font-size: 15px;">${assignmentDescription}</p>` : ''}
      </div>
      ${createDetailRow('Due Date', dueDate)}
      ${createDetailRow('Assigned By', teacherName)}
      <div style="margin-top: 12px;">
        ${createStatusBadge('New', 'info')}
      </div>
    `)}

    ${createParagraph(
      'Get started early and reach out to your teacher if you have any questions!'
    )}
  `;

  return generateBaseEmailHtml({
    subject: `New Assignment: ${assignmentTitle}`,
    preheader: `${teacherName} assigned "${assignmentTitle}" — due ${dueDate}`,
    bodyContent,
    footerNote: 'Good luck with your practice!',
    ctaButton: {
      text: 'View Assignment',
      url: assignmentLink || `${baseUrl}/dashboard`,
    },
  });
}
