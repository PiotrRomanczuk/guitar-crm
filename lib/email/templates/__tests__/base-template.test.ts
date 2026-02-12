import {
  generateBaseEmailHtml,
  createCardSection,
  createDetailRow,
  createStatusBadge,
  createDivider,
  createGreeting,
  createSectionHeading,
  createSubsectionHeading,
  createParagraph,
} from '../base-template';

describe('base-template', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('generateBaseEmailHtml', () => {
    it('should generate a complete email with all sections', () => {
      const html = generateBaseEmailHtml({
        subject: 'Test Email',
        preheader: 'This is a test email',
        bodyContent: '<p>Hello World</p>',
        footerNote: 'Keep practicing!',
        recipientEmail: 'test@example.com',
        notificationType: 'lesson_reminder_24h',
        ctaButton: {
          text: 'View Lesson',
          url: 'https://example.com/lessons/123',
        },
      });

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Test Email');
      expect(html).toContain('This is a test email');
      expect(html).toContain('Hello World');
      expect(html).toContain('Keep practicing!');
      expect(html).toContain('View Lesson');
      expect(html).toContain('https://example.com/lessons/123');
      expect(html).toContain('Strummy');
      expect(html).toContain('Guitar Student Management');
    });

    it('should generate email without optional fields', () => {
      const html = generateBaseEmailHtml({
        subject: 'Simple Email',
        bodyContent: '<p>Simple content</p>',
      });

      expect(html).toContain('Simple Email');
      expect(html).toContain('Simple content');
      expect(html).toContain('Strummy');
      expect(html).not.toContain('Keep practicing!');
      expect(html).not.toContain('View Lesson');
    });

    it('should include unsubscribe link', () => {
      const html = generateBaseEmailHtml({
        subject: 'Test',
        bodyContent: '<p>Test</p>',
        recipientEmail: 'user@example.com',
        notificationType: 'lesson_reminder_24h',
      });

      expect(html).toContain('Notification Settings');
      expect(html).toContain('/dashboard/settings');
    });

    it('should include dark mode CSS', () => {
      const html = generateBaseEmailHtml({
        subject: 'Test',
        bodyContent: '<p>Test</p>',
      });

      expect(html).toContain('@media (prefers-color-scheme: dark)');
      expect(html).toContain('meta name="color-scheme"');
    });

    it('should include mobile responsive CSS', () => {
      const html = generateBaseEmailHtml({
        subject: 'Test',
        bodyContent: '<p>Test</p>',
      });

      expect(html).toContain('@media only screen and (max-width: 600px)');
    });

    it('should include current year in copyright', () => {
      const html = generateBaseEmailHtml({
        subject: 'Test',
        bodyContent: '<p>Test</p>',
      });

      const currentYear = new Date().getFullYear();
      expect(html).toContain(`${currentYear} Strummy`);
    });

    it('should use warm gold accent colors', () => {
      const html = generateBaseEmailHtml({
        subject: 'Test',
        bodyContent: '<p>Test</p>',
        ctaButton: { text: 'Click', url: 'https://example.com' },
      });

      // Gold accent bar
      expect(html).toContain('linear-gradient(135deg, #f59e0b, #d97706)');
      // Gold header text
      expect(html).toContain('color: #f59e0b');
      // Warm body background
      expect(html).toContain('background-color: #faf8f5');
      // Gold CTA button
      expect(html).toContain('background-color: #f59e0b');
      // Warm header background
      expect(html).toContain('background-color: #0f0c0a');
    });

    it('should include dark mode badge overrides', () => {
      const html = generateBaseEmailHtml({
        subject: 'Test',
        bodyContent: '<p>Test</p>',
      });

      expect(html).toContain('.badge-success');
      expect(html).toContain('.badge-warning');
      expect(html).toContain('.badge-info');
      expect(html).toContain('.badge-default');
    });
  });

  describe('createCardSection', () => {
    it('should create a card with content', () => {
      const card = createCardSection('<p>Card content</p>');

      expect(card).toContain('class="card"');
      expect(card).toContain('Card content');
      expect(card).toContain('border-radius: 10px');
      expect(card).toContain('#faf5f0');
      expect(card).toContain('#e8e0d8');
    });
  });

  describe('createDetailRow', () => {
    it('should create a label-value pair', () => {
      const row = createDetailRow('Date', 'February 10, 2026');

      expect(row).toContain('Date');
      expect(row).toContain('February 10, 2026');
      expect(row).toContain('text-transform: uppercase');
      expect(row).toContain('#78716c');
      expect(row).toContain('#1c1917');
    });
  });

  describe('createStatusBadge', () => {
    it('should create a translucent success badge', () => {
      const badge = createStatusBadge('Completed', 'success');

      expect(badge).toContain('Completed');
      expect(badge).toContain('#dcfce7'); // translucent green bg
      expect(badge).toContain('#15803d'); // green text
      expect(badge).toContain('badge-success');
    });

    it('should create a translucent warning badge', () => {
      const badge = createStatusBadge('Pending', 'warning');

      expect(badge).toContain('Pending');
      expect(badge).toContain('#fef3c7'); // translucent amber bg
      expect(badge).toContain('#b45309'); // amber text
      expect(badge).toContain('badge-warning');
    });

    it('should create a gold info badge (not blue)', () => {
      const badge = createStatusBadge('New', 'info');

      expect(badge).toContain('New');
      expect(badge).toContain('#fef3c7'); // gold bg (same as warning)
      expect(badge).toContain('#b45309'); // amber text
      expect(badge).toContain('badge-info');
      expect(badge).not.toContain('#3b82f6'); // no blue
    });

    it('should create a warm default badge', () => {
      const badge = createStatusBadge('Unknown');

      expect(badge).toContain('Unknown');
      expect(badge).toContain('#f5f0eb'); // warm bg
      expect(badge).toContain('#78716c'); // warm text
      expect(badge).toContain('badge-default');
    });
  });

  describe('createDivider', () => {
    it('should create a warm divider', () => {
      const divider = createDivider();

      expect(divider).toContain('<hr');
      expect(divider).toContain('border-top: 1px solid #e8e0d8');
    });
  });

  describe('createGreeting', () => {
    it('should create a greeting with name', () => {
      const greeting = createGreeting('John');

      expect(greeting).toContain('Hi John,');
      expect(greeting).toContain('<p');
      expect(greeting).toContain('#57534e');
    });
  });

  describe('createSectionHeading', () => {
    it('should create a section heading', () => {
      const heading = createSectionHeading('Lesson Details');

      expect(heading).toContain('Lesson Details');
      expect(heading).toContain('<h2');
      expect(heading).toContain('font-size: 20px');
      expect(heading).toContain('#1c1917');
    });
  });

  describe('createSubsectionHeading', () => {
    it('should create a subsection heading', () => {
      const heading = createSubsectionHeading('Songs Practiced');

      expect(heading).toContain('Songs Practiced');
      expect(heading).toContain('<h3');
      expect(heading).toContain('font-size: 16px');
      expect(heading).toContain('#1c1917');
    });
  });

  describe('createParagraph', () => {
    it('should create a paragraph', () => {
      const paragraph = createParagraph('This is a test paragraph.');

      expect(paragraph).toContain('This is a test paragraph.');
      expect(paragraph).toContain('<p');
      expect(paragraph).toContain('line-height: 1.6');
      expect(paragraph).toContain('#57534e');
    });
  });

  describe('snapshot tests', () => {
    it('should match snapshot for full email', () => {
      const html = generateBaseEmailHtml({
        subject: 'Test Notification',
        preheader: 'You have a new notification',
        bodyContent: `
          ${createSectionHeading('Important Update')}
          ${createGreeting('John Student')}
          ${createParagraph('This is an important notification about your account.')}
          ${createCardSection(
            createDetailRow('Date', 'February 10, 2026') +
            createDetailRow('Status', createStatusBadge('Active', 'success'))
          )}
        `,
        footerNote: 'Thank you for using Strummy!',
        ctaButton: {
          text: 'View Details',
          url: 'https://example.com/dashboard',
        },
      });

      expect(html).toMatchSnapshot();
    });

    it('should match snapshot for minimal email', () => {
      const html = generateBaseEmailHtml({
        subject: 'Simple Notification',
        bodyContent: '<p>Simple message</p>',
      });

      expect(html).toMatchSnapshot();
    });
  });
});
