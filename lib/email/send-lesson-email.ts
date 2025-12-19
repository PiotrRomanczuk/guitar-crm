import resend from './client';
import { getContact } from './contacts';

interface LessonEmailData {
  studentEmail: string;
  studentName: string;
  lessonDate: string;
  lessonTitle?: string | null;
  notes?: string | null;
  songs?: {
    title: string;
    artist: string;
    status: string;
    notes?: string | null;
  }[];
}

export async function sendLessonCompletedEmail(data: LessonEmailData) {
  console.log('Attempting to send lesson completed email...');
  
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Skipping email sending.');
    return;
  } else {
    console.log('RESEND_API_KEY is present (starts with ' + process.env.RESEND_API_KEY.substring(0, 3) + '...)');
  }

  const { studentEmail, studentName, lessonDate, lessonTitle, notes, songs } = data;
  console.log('Email data:', { studentEmail, studentName, lessonDate, lessonTitle, songsCount: songs?.length });

  // Check if contact exists in Resend Audience
  try {
    console.log(`Checking if ${studentEmail} is in Resend contacts...`);
    const contactResult = await getContact({ email: studentEmail });
    
    if (contactResult.success && contactResult.data) {
      console.log('✅ Contact FOUND in Resend Audience:', {
        id: contactResult.data.id,
        unsubscribed: contactResult.data.unsubscribed
      });
      
      if (contactResult.data.unsubscribed) {
        console.warn('⚠️ WARNING: This contact is marked as UNSUBSCRIBED. Email might not be delivered if it is not transactional.');
      }
    } else {
      console.log('ℹ️ Contact NOT FOUND in Resend Audience. It will be treated as a new contact or guest.');
      // Note: Resend usually allows sending to new contacts, but for marketing emails they must be in the audience.
    }
  } catch (err) {
    console.error('Error checking contact status (non-blocking):', err);
  }

  const subject = `Lesson Summary - ${lessonDate}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Lesson Summary</h1>
      <p>Hi ${studentName},</p>
      <p>Here is a summary of your lesson on ${lessonDate}.</p>
      
      ${lessonTitle ? `<h2>${lessonTitle}</h2>` : ''}
      
      ${notes ? `<h3>Notes:</h3><p style="white-space: pre-wrap;">${notes}</p>` : ''}
      
      ${
        songs && songs.length > 0
          ? `
        <h3>Songs Practiced:</h3>
        <ul>
          ${songs
            .map(
              (song) => `
            <li style="margin-bottom: 10px;">
              <strong>${song.title}</strong> by ${song.artist} <span style="color: #666; font-size: 0.9em;">(${song.status})</span>
              ${song.notes ? `<br/><em style="color: #555;">Notes: ${song.notes}</em>` : ''}
            </li>
          `
            )
            .join('')}
        </ul>
      `
          : ''
      }
      
      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        <p>Keep practicing!</p>
        <p>Best regards,<br/>Your Guitar Teacher</p>
      </div>
    </div>
  `;

  try {
    console.log('Sending email via Resend API...');
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Guitar CRM <onboarding@resend.dev>';
    
    const response = await resend.emails.send({
      from: fromEmail,
      to: studentEmail,
      subject: subject,
      html: html,
    });

    console.log('Resend API response:', JSON.stringify(response, null, 2));
    
    if (response.error) {
        console.error('Resend API returned an error:', response.error);
    } else {
        console.log('Email sent successfully. ID:', response.data?.id);
    }
    
    return response;
  } catch (error) {
    console.error('EXCEPTION sending email:', error);
    // Don't throw error to prevent blocking the response if email fails
    return null;
  }
}
