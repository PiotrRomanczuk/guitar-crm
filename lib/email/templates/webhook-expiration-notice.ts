/**
 * Webhook Expiration Notice Email Template
 *
 * Sent when a calendar integration is about to expire and needs renewal.
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

interface WebhookExpirationNoticeData {
  teacherName: string;
  serviceName: string;
  expirationDate: string;
  renewLink?: string;
}

export function generateWebhookExpirationNoticeHtml(data: WebhookExpirationNoticeData): string {
  const { teacherName, serviceName, expirationDate, renewLink } = data;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const bodyContent = `
    ${createSectionHeading('Integration Expiring Soon')}
    ${createGreeting(teacherName)}
    ${createParagraph(
      `Your <strong>${serviceName}</strong> calendar integration is expiring soon. Renew it to keep your schedule in sync.`
    )}

    ${createCardSection(`
      ${createDetailRow('Service', serviceName)}
      ${createDetailRow('Expires', expirationDate)}
      <div style="margin-top: 12px;">
        ${createStatusBadge('Expiring Soon', 'warning')}
      </div>
    `)}

    ${createParagraph(
      'If this integration expires, new calendar events won\'t sync automatically. Renewing takes just a moment.'
    )}
  `;

  return generateBaseEmailHtml({
    subject: 'Calendar Integration Expiring Soon',
    preheader: `Your ${serviceName} integration expires ${expirationDate}`,
    bodyContent,
    ctaButton: {
      text: 'Renew Integration',
      url: renewLink || `${baseUrl}/dashboard/settings`,
    },
  });
}
