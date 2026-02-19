/**
 * Trial Ending Reminder Email Template
 *
 * Sent when a student's trial period is about to end.
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

interface TrialEndingReminderData {
  studentName: string;
  trialEndDate: string;
  daysRemaining: number;
  upgradeLink?: string;
}

export function generateTrialEndingReminderHtml(data: TrialEndingReminderData): string {
  const { studentName, trialEndDate, daysRemaining, upgradeLink } = data;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const urgency = daysRemaining <= 1 ? 'warning' : 'info';

  const bodyContent = `
    ${createSectionHeading('Your Trial is Ending Soon')}
    ${createGreeting(studentName)}
    ${createParagraph(
      `Your trial period ends in <strong>${daysRemaining} day${daysRemaining === 1 ? '' : 's'}</strong>. Upgrade now to keep access to all your lessons, progress, and assignments.`
    )}

    ${createCardSection(`
      ${createDetailRow('Trial Ends', trialEndDate)}
      ${createDetailRow('Days Remaining', String(daysRemaining))}
      <div style="margin-top: 12px;">
        ${createStatusBadge(daysRemaining <= 1 ? 'Expiring Tomorrow' : 'Expiring Soon', urgency)}
      </div>
    `)}

    ${createParagraph(
      'After your trial ends, you\'ll lose access to your lesson history, assignments, and progress tracking. Upgrade to continue your guitar journey!'
    )}
  `;

  return generateBaseEmailHtml({
    subject: 'Your Trial Period is Ending Soon',
    preheader: `Your trial ends in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} — upgrade to keep your progress`,
    bodyContent,
    ctaButton: {
      text: 'Upgrade Now',
      url: upgradeLink || `${baseUrl}/dashboard`,
    },
  });
}
