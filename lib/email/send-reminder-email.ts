import transporter from './smtp-client';
import {
  generateLessonReminderHtml,
  LessonReminderData as TemplateData,
} from './templates/lesson-reminder';

export interface LessonReminderEmailData extends TemplateData {
  studentEmail: string;
}

export async function sendLessonReminderEmail(data: LessonReminderEmailData) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('GMAIL_USER or GMAIL_APP_PASSWORD is not set. Skipping email sending.');
    return { error: { message: 'SMTP credentials missing' } };
  }

  const { studentEmail, lessonDate, lessonTime } = data;

  const subject = `Reminder: Guitar Lesson on ${lessonDate} at ${lessonTime}`;
  const html = generateLessonReminderHtml(data);

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
    return { data: null, error: error };
  }
}
