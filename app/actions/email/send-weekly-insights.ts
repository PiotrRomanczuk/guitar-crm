'use server';

import { createClient } from '@/lib/supabase/server';
import {
  getWeeklyInsightsData,
  getLastWeekDateRange,
} from '@/lib/services/weekly-insights';
import { generateWeeklyInsightsHtml } from '@/lib/email/templates/weekly-insights';
import transporter from '@/lib/email/smtp-client';

interface SendWeeklyInsightsResult {
  success: boolean;
  emailsSent: number;
  errors?: string[];
}

/**
 * Send weekly insight emails to all teachers and admins
 * Called by cron job every Monday at 9 AM UTC
 */
export async function sendWeeklyInsights(): Promise<SendWeeklyInsightsResult> {
  const errors: string[] = [];
  let emailsSent = 0;

  try {
    const supabase = await createClient();

    // Get all teachers and admins
    const { data: teachers, error: teachersError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('role', ['teacher', 'admin'])
      .eq('is_active', true);

    if (teachersError) {
      console.error('[sendWeeklyInsights] Failed to fetch teachers:', teachersError);
      return { success: false, emailsSent: 0, errors: [teachersError.message] };
    }

    if (!teachers || teachers.length === 0) {
      return { success: true, emailsSent: 0 };
    }

    // Get last week's date range (Monday to Sunday)
    const { start, end } = getLastWeekDateRange();

    // Send email to each teacher
    for (const teacher of teachers) {
      try {

        // Get weekly insights data for this teacher
        const insightsData = await getWeeklyInsightsData(teacher.id, start, end);

        // Generate HTML email
        const html = generateWeeklyInsightsHtml(insightsData);

        // Send email
        const info = await transporter.sendMail({
          from: `"Guitar CRM" <${process.env.GMAIL_USER}>`,
          to: teacher.email,
          subject: `📊 Your Weekly Insights - ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          html: html,
        });

        emailsSent++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[sendWeeklyInsights] Failed to send email to ${teacher.email}:`,
          errorMessage
        );
        errors.push(`${teacher.email}: ${errorMessage}`);
      }
    }

    return {
      success: errors.length === 0,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('[sendWeeklyInsights] Fatal error:', error);
    return {
      success: false,
      emailsSent,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}
