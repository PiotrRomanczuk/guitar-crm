import transporter from './smtp-client';
import { generateLessonReminderHtml, LessonReminderData as TemplateData } from './templates/lesson-reminder';

export interface LessonReminderEmailData extends TemplateData {
  studentEmail: string;
}

export async function sendLessonReminderEmail(data: LessonReminderEmailData) {
  console.log('Attempting to send lesson reminder email via SMTP...');
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('GMAIL_USER or GMAIL_APP_PASSWORD is not set. Skipping email sending.');
    return { error: { message: 'SMTP credentials missing' } };
  }

  const { studentEmail, lessonDate, lessonTime } = data;
  console.log('Email data:', { 
    studentEmail, 
    studentName: data.studentName, 
    lessonDate, 
    lessonTime
  });

  const subject = `Reminder: Guitar Lesson on ${lessonDate} at ${lessonTime}`;
  const html = generateLessonReminderHtml(data);

  try {
    console.log('Sending email via Gmail SMTP...');
    const info = await transporter.sendMail({
      from: `"Guitar CRM" <${process.env.GMAIL_USER}>`,
      to: studentEmail,
      subject: subject,
      html: html,
    });

    console.log('SMTP response:', info);
    console.log('Email sent successfully. Message ID:', info.messageId);
    
    return { data: { id: info.messageId }, error: null };
  } catch (error) {
    console.error('EXCEPTION sending email:', error);
    return { data: null, error: error };
  }
}
