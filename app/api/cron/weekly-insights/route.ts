import { NextResponse } from 'next/server';
import { sendWeeklyInsights } from '@/app/actions/email/send-weekly-insights';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/weekly-insights
 * Cron job that sends weekly insight emails to all teachers
 * Runs every Monday at 9 AM UTC
 */
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log('[Cron] Starting weekly insights email job...');
    const result = await sendWeeklyInsights();

    if (result.success) {
      console.log(
        `[Cron] Weekly insights sent successfully. Emails sent: ${result.emailsSent}`
      );
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
