export interface LessonReminderData {
  studentName: string;
  lessonDate: string;
  lessonTime: string;
  location?: string;
  agenda?: string;
}

export function generateLessonReminderHtml(data: LessonReminderData): string {
  const { studentName, lessonDate, lessonTime, location, agenda } = data;

  // Prioritize the remote URL for emails
  let baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL_REMOTE ||
    'http://localhost:3000';

  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lesson Reminder</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        
        <!-- Header -->
        <div style="background-color: #18181b; padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">Guitar CRM</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
          <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Upcoming Lesson Reminder</h2>
          <p style="color: #52525b; margin: 0 0 24px 0; line-height: 1.6; font-size: 16px;">
            Hi ${studentName},<br>
            This is a friendly reminder about your upcoming guitar lesson.
          </p>
          
          <!-- Lesson Details Card -->
          <div style="margin-bottom: 24px; background-color: #f4f4f5; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden;">
            <div style="padding: 20px;">
              <div style="margin-bottom: 16px;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Date</p>
                <p style="margin: 0; color: #18181b; font-size: 18px; font-weight: 600;">${lessonDate}</p>
              </div>
              
              <div style="margin-bottom: ${location || agenda ? '16px' : '0'};">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Time</p>
                <p style="margin: 0; color: #18181b; font-size: 18px; font-weight: 600;">${lessonTime}</p>
              </div>

              ${
                location
                  ? `
              <div style="margin-bottom: ${agenda ? '16px' : '0'};">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Location</p>
                <p style="margin: 0; color: #18181b; font-size: 16px; font-weight: 500;">${location}</p>
              </div>
              `
                  : ''
              }

              ${
                agenda
                  ? `
              <div>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Planned Agenda</p>
                <p style="margin: 0; color: #18181b; font-size: 16px; font-weight: 500;">${agenda}</p>
              </div>
              `
                  : ''
              }
            </div>
          </div>

          <!-- Action Button -->
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${baseUrl}/dashboard" style="display: inline-block; background-color: #18181b; color: #ffffff; font-weight: 600; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px;">View Dashboard</a>
          </div>
          
          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e4e4e7; text-align: center; color: #a1a1aa; font-size: 14px;">
            <p style="margin: 0 0 8px 0; font-weight: 500; color: #71717a;">See you soon!</p>
            <p style="margin: 0;">Sent via Guitar CRM</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
