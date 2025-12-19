import transporter from './smtp-client';

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
  console.log('Attempting to send lesson completed email via SMTP...');
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('GMAIL_USER or GMAIL_APP_PASSWORD is not set. Skipping email sending.');
    return { error: { message: 'SMTP credentials missing' } };
  }

  const { studentEmail, studentName, lessonDate, lessonTitle, notes, songs } = data;
  console.log('Email data:', { studentEmail, studentName, lessonDate, lessonTitle, songsCount: songs?.length });

  const subject = `Lesson Summary - ${lessonDate}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lesson Summary</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        
        <!-- Header -->
        <div style="background-color: #18181b; padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">Guitar CRM</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
          <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Lesson Summary</h2>
          <p style="color: #52525b; margin: 0 0 24px 0; line-height: 1.6; font-size: 16px;">
            Hi ${studentName},<br>
            Here's a summary of your lesson on <strong>${lessonDate}</strong>.
          </p>
          
          <!-- Lesson Title -->
          ${lessonTitle ? `
          <div style="margin-bottom: 24px; padding: 16px; background-color: #f4f4f5; border-radius: 8px; border: 1px solid #e4e4e7;">
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Topic</p>
            <p style="margin: 0; color: #18181b; font-size: 16px; font-weight: 500;">${lessonTitle}</p>
          </div>
          ` : ''}

          <!-- Notes -->
          ${notes ? `
          <div style="margin-bottom: 24px;">
            <h3 style="color: #18181b; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Teacher's Notes</h3>
            <div style="color: #52525b; line-height: 1.6; white-space: pre-wrap; background-color: #ffffff; border: 1px solid #e4e4e7; padding: 16px; border-radius: 8px; font-size: 15px;">${notes}</div>
          </div>
          ` : ''}

          <!-- Songs -->
          ${songs && songs.length > 0 ? `
          <div style="margin-bottom: 24px;">
            <h3 style="color: #18181b; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Songs Practiced</h3>
            <div style="border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
                ${songs.map((song, index) => `
                <tr style="${index !== songs.length - 1 ? 'border-bottom: 1px solid #e4e4e7;' : ''}">
                  <td style="padding: 16px;">
                    <div style="color: #18181b; font-weight: 600; font-size: 15px;">${song.title}</div>
                    <div style="color: #71717a; font-size: 14px; margin-top: 2px;">${song.artist}</div>
                    ${song.notes ? `<div style="color: #52525b; font-size: 14px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e4e4e7; font-style: italic;">${song.notes}</div>` : ''}
                  </td>
                  <td style="text-align: right; vertical-align: top; padding: 16px; width: 100px;">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; background-color: #f4f4f5; color: #18181b; white-space: nowrap;">${song.status}</span>
                  </td>
                </tr>
                `).join('')}
              </table>
            </div>
          </div>
          ` : ''}
          
          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e4e4e7; text-align: center; color: #a1a1aa; font-size: 14px;">
            <p style="margin: 0 0 8px 0; font-weight: 500; color: #71717a;">Keep practicing!</p>
            <p style="margin: 0;">Sent via Guitar CRM</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

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
