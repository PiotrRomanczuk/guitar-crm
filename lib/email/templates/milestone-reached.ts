/**
 * Milestone Reached Email Template
 *
 * Sent when a student reaches a learning milestone.
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

interface MilestoneReachedData {
  studentName: string;
  milestone: string;
  milestoneDescription?: string;
  achievedDate: string;
}

export function generateMilestoneReachedHtml(data: MilestoneReachedData): string {
  const { studentName, milestone, milestoneDescription, achievedDate } = data;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const bodyContent = `
    ${createSectionHeading('Milestone Reached!')}
    ${createGreeting(studentName)}
    ${createParagraph(
      'Congratulations! Your hard work is paying off. You\'ve just reached a new milestone in your guitar journey.'
    )}

    ${createCardSection(`
      <div style="text-align: center; margin-bottom: 16px;">
        <div style="font-size: 48px; line-height: 1;">🏆</div>
      </div>
      ${createDetailRow('Milestone', milestone)}
      ${milestoneDescription ? createDetailRow('Details', milestoneDescription) : ''}
      ${createDetailRow('Achieved', achievedDate)}
      <div style="margin-top: 12px; text-align: center;">
        ${createStatusBadge('Achievement Unlocked', 'success')}
      </div>
    `)}

    ${createParagraph(
      'Every milestone brings you closer to mastering the guitar. Keep practicing!'
    )}
  `;

  return generateBaseEmailHtml({
    subject: `Milestone Reached: ${milestone}`,
    preheader: `You reached a new milestone: ${milestone}`,
    bodyContent,
    footerNote: 'Keep strumming!',
    ctaButton: {
      text: 'View Achievements',
      url: `${baseUrl}/dashboard`,
    },
  });
}
