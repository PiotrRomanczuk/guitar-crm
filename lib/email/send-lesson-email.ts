import transporter from './smtp-client';
import { generateLessonRecapHtml, LessonEmailData as TemplateData } from './templates/lesson-recap';

// Extend the template data to include studentEmail which is needed for sending but not for the template
export interface LessonEmailData extends TemplateData {
  studentEmail: string;
}

export async function sendLessonCompletedEmail(data: LessonEmailData) {
  console.log('Attempting to send lesson completed email via SMTP...');
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('GMAIL_USER or GMAIL_APP_PASSWORD is not set. Skipping email sending.');
    return { error: { message: 'SMTP credentials missing' } };
  }

  const { studentEmail, lessonDate } = data;
  console.log('Email data:', { 
    studentEmail, 
    studentName: data.studentName, 
    lessonDate, 
    lessonTitle: data.lessonTitle, 
    songsCount: data.songs?.length 
  });

  const subject = `Lesson Summary - ${lessonDate}`;
  const html = generateLessonRecapHtml(data);

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

