import transporter from './smtp-client';
import { generateLessonRecapHtml, LessonEmailData as TemplateData } from './templates/lesson-recap';

// Extend the template data to include studentEmail which is needed for sending but not for the template
export interface LessonEmailData extends TemplateData {
  studentEmail: string;
}

export async function sendLessonCompletedEmail(data: LessonEmailData) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('GMAIL_USER or GMAIL_APP_PASSWORD is not set. Skipping email sending.');
    return { error: { message: 'SMTP credentials missing' } };
  }

  const { studentEmail, lessonDate } = data;

  const subject = `Lesson Summary - ${lessonDate}`;
  const html = generateLessonRecapHtml(data);

  try {
    const info = await transporter.sendMail({
      from: `"Guitar CRM" <${process.env.GMAIL_USER}>`,
      to: studentEmail,
      subject: subject,
      html: html,
    });

    return { data: { id: info.messageId }, error: null };
  } catch (error) {
    console.error('EXCEPTION sending email:', error);
    // Return a serializable error object
    const errorMessage = error instanceof Error ? error.message : 'Unknown error sending email';
    return { data: null, error: { message: errorMessage } };
  }
}

