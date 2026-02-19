import { NextResponse } from 'next/server';
import { sendWeeklyInsights } from '@/app/actions/email/send-weekly-insights';
import { verifyCronSecret } from '@/lib/auth/cron-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/weekly-insights
 * Cron job that sends weekly insight emails to all teachers
 * Runs every Monday at 9 AM UTC
 */
export async function GET(request: Request) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  try {
    const result = await sendWeeklyInsights();

    if (result.success) {
      return NextResponse.json({
        success: true,
        emailsSent: result.emailsSent,
      });
    } else {
      console.error('[Cron] Failed to send weekly insights:', result.errors);
      return NextResponse.json(
        {
          success: false,
          emailsSent: result.emailsSent,
          errors: result.errors,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Cron] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
