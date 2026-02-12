/**
 * Admin Error Alert Email Template
 *
 * Sent to admins when a system error occurs.
 * Uses a direct heading instead of a greeting (system alert).
 */

import {
  generateBaseEmailHtml,
  createSectionHeading,
  createParagraph,
  createCardSection,
  createDetailRow,
  createStatusBadge,
  createDivider,
} from './base-template';

interface AdminErrorAlertData {
  adminName?: string;
  errorType: string;
  errorMessage: string;
  timestamp: string;
  affectedService?: string;
  stackTrace?: string;
}

export function generateAdminErrorAlertHtml(data: AdminErrorAlertData): string {
  const { errorType, errorMessage, timestamp, affectedService, stackTrace } = data;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const bodyContent = `
    ${createSectionHeading('System Error Alert')}
    ${createParagraph(
      'A system error has been detected that may require your attention.'
    )}

    ${createCardSection(`
      ${createDetailRow('Error Type', errorType)}
      ${createDetailRow('Message', errorMessage)}
      ${createDetailRow('Timestamp', timestamp)}
      ${affectedService ? createDetailRow('Affected Service', affectedService) : ''}
      <div style="margin-top: 12px;">
        ${createStatusBadge('Error', 'warning')}
      </div>
    `)}

    ${stackTrace ? `
      ${createDivider()}
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #78716c; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">
        Stack Trace
      </p>
      <div style="background-color: #1c1917; color: #a8a29e; padding: 16px; border-radius: 8px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 12px; line-height: 1.5; overflow-x: auto; white-space: pre-wrap; word-break: break-all; max-height: 200px;">
        ${stackTrace.slice(0, 1000)}${stackTrace.length > 1000 ? '\n... (truncated)' : ''}
      </div>
    ` : ''}
  `;

  return generateBaseEmailHtml({
    subject: `System Alert: ${errorType}`,
    preheader: `Error detected: ${errorMessage.slice(0, 80)}`,
    bodyContent,
    ctaButton: {
      text: 'View Dashboard',
      url: `${baseUrl}/dashboard`,
    },
  });
}
