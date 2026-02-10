/**
 * Base Email Template
 *
 * Reusable HTML email template with consistent styling, mobile-responsive design,
 * dark mode support, and unsubscribe footer.
 */

export interface BaseEmailTemplateOptions {
  subject: string;
  preheader?: string;
  bodyContent: string;
  footerNote?: string;
  recipientEmail?: string;
  recipientUserId?: string;
  notificationType?: string;
  ctaButton?: {
    text: string;
    url: string;
  };
}

/**
 * Get the base URL for links in emails
 */
function getBaseUrl(): string {
  let baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL_REMOTE ||
    'http://localhost:3000';

  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }

  return baseUrl;
}

/**
 * Generate unsubscribe link
 * Uses userId + notificationType to create direct unsubscribe link
 */
function getUnsubscribeLink(
  recipientUserId?: string,
  notificationType?: string
): string {
  const baseUrl = getBaseUrl();

  if (recipientUserId && notificationType) {
    // Direct unsubscribe API route
    return `${baseUrl}/api/notifications/unsubscribe?userId=${encodeURIComponent(recipientUserId)}&type=${encodeURIComponent(notificationType)}`;
  }

  // Fallback to settings page
  return `${baseUrl}/dashboard/settings`;
}

/**
 * Generate the complete email HTML using the base template
 */
export function generateBaseEmailHtml(options: BaseEmailTemplateOptions): string {
  const {
    subject,
    preheader,
    bodyContent,
    footerNote,
    recipientUserId,
    notificationType,
    ctaButton,
  } = options;

  const baseUrl = getBaseUrl();
  const unsubscribeLink = getUnsubscribeLink(recipientUserId, notificationType);
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>${subject}</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .email-container {
            background-color: #1a1a1a !important;
          }
          .email-content {
            background-color: #2d2d2d !important;
            color: #e5e5e5 !important;
          }
          .email-header {
            background-color: #18181b !important;
          }
          .email-footer {
            background-color: #262626 !important;
            border-color: #404040 !important;
          }
          .text-primary {
            color: #e5e5e5 !important;
          }
          .text-secondary {
            color: #a3a3a3 !important;
          }
          .text-muted {
            color: #737373 !important;
          }
          .card {
            background-color: #333333 !important;
            border-color: #404040 !important;
          }
          .button-primary {
            background-color: #3b82f6 !important;
            color: #ffffff !important;
          }
        }

        /* Mobile responsive */
        @media only screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
            margin: 0 !important;
          }
          .email-content {
            padding: 24px 16px !important;
          }
          .email-header {
            padding: 24px 16px !important;
          }
          h1 {
            font-size: 20px !important;
          }
          h2 {
            font-size: 18px !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">

      <!-- Preheader text (hidden but shows in email preview) -->
      ${preheader ? `
      <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
        ${preheader}
      </div>
      ` : ''}

      <!-- Email Container -->
      <div class="email-container" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">

        <!-- Header -->
        <div class="email-header" style="background-color: #18181b; padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">
            Strummy
          </h1>
          <p style="color: #a3a3a3; margin: 8px 0 0 0; font-size: 14px; font-weight: 400;">
            Guitar Student Management
          </p>
        </div>

        <!-- Content -->
        <div class="email-content" style="padding: 32px 24px;">
          ${bodyContent}

          ${ctaButton ? `
          <!-- Call to Action Button -->
          <div style="margin-top: 32px; text-align: center;">
            <a href="${ctaButton.url}" class="button-primary" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
              ${ctaButton.text}
            </a>
          </div>
          ` : ''}
        </div>

        <!-- Footer -->
        <div class="email-footer" style="background-color: #f4f4f5; padding: 24px; text-align: center; border-top: 1px solid #e4e4e7;">
          ${footerNote ? `
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #71717a; font-weight: 500;">
            ${footerNote}
          </p>
          ` : ''}

          <p style="margin: 0 0 12px 0; font-size: 14px; color: #71717a;">
            <a href="${baseUrl}/dashboard" style="color: #3b82f6; text-decoration: none; font-weight: 500;">
              View Dashboard
            </a>
            <span style="color: #d4d4d8; margin: 0 8px;">•</span>
            <a href="${unsubscribeLink}" style="color: #71717a; text-decoration: none;">
              Notification Settings
            </a>
          </p>

          <p style="margin: 0 0 8px 0; font-size: 12px; color: #a1a1aa;">
            You're receiving this email because you have an account with Strummy Guitar CRM.
          </p>

          <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
            © ${currentYear} Strummy. All rights reserved.
          </p>
        </div>
      </div>

      <!-- Spacer for email clients -->
      <div style="height: 40px;"></div>
    </body>
    </html>
  `;
}

/**
 * Helper function to create a card section (commonly used in emails)
 */
export function createCardSection(content: string): string {
  return `
    <div class="card" style="margin-bottom: 24px; background-color: #f4f4f5; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden; padding: 20px;">
      ${content}
    </div>
  `;
}

/**
 * Helper function to create a detail row (label + value)
 */
export function createDetailRow(label: string, value: string): string {
  return `
    <div style="margin-bottom: 16px;">
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">
        ${label}
      </p>
      <p style="margin: 0; color: #18181b; font-size: 16px; font-weight: 500;">
        ${value}
      </p>
    </div>
  `;
}

/**
 * Helper function to create a status badge
 */
export function createStatusBadge(text: string, color: 'success' | 'warning' | 'info' | 'default' = 'default'): string {
  const colorMap = {
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
    default: '#6b7280',
  };

  const bgColor = colorMap[color] || colorMap.default;

  return `
    <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; background-color: ${bgColor}; color: #ffffff; white-space: nowrap;">
      ${text}
    </span>
  `;
}

/**
 * Helper function to create a divider
 */
export function createDivider(): string {
  return `
    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">
  `;
}

/**
 * Helper function to format greeting with recipient name
 */
export function createGreeting(name: string): string {
  return `
    <p style="color: #52525b; margin: 0 0 24px 0; line-height: 1.6; font-size: 16px;">
      Hi ${name},
    </p>
  `;
}

/**
 * Helper function to create a section heading
 */
export function createSectionHeading(heading: string): string {
  return `
    <h2 class="text-primary" style="color: #18181b; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
      ${heading}
    </h2>
  `;
}

/**
 * Helper function to create a subsection heading
 */
export function createSubsectionHeading(heading: string): string {
  return `
    <h3 class="text-primary" style="color: #18181b; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
      ${heading}
    </h3>
  `;
}

/**
 * Helper function to create body text paragraph
 */
export function createParagraph(text: string): string {
  return `
    <p class="text-secondary" style="color: #52525b; margin: 0 0 16px 0; line-height: 1.6; font-size: 15px;">
      ${text}
    </p>
  `;
}
