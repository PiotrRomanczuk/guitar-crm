'use server';

import { getSongDatabaseStatistics } from '@/lib/services/song-analytics';
import { generateAdminSongReportHtml } from '@/lib/email/templates/admin-song-report';
import transporter from '@/lib/email/smtp-client';

export async function sendAdminSongReport() {
  try {
    // 1. Fetch Stats
    const stats = await getSongDatabaseStatistics();

    // 2. Generate HTML
    const html = generateAdminSongReportHtml(stats);

    // 3. Send Email
    const adminEmail = process.env.GMAIL_USER; // Or a specific admin email env var
    
    if (!adminEmail) {
      throw new Error('GMAIL_USER environment variable is not set');
    }

    const info = await transporter.sendMail({
      from: `"Guitar CRM" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject: `Song Database Report - ${new Date().toLocaleDateString()}`,
      html: html,
    });

    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('[sendAdminSongReport] Failed to send report:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
