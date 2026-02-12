/**
 * Cron Job: Admin Monitoring
 *
 * Monitors notification system health and sends alerts to admins when:
 * - Failure rate > 10% (last hour)
 * - Bounce rate > 5% for any template type
 * - Queue backlog > 500 pending notifications
 *
 * Also sends daily summary at 8am daily
 *
 * Schedule: Every hour at :00
 */

import { NextResponse } from 'next/server';
import {
  checkFailureRate,
  checkBounceRate,
  checkQueueBacklog,
  sendDailyAdminSummary,
} from '@/lib/services/notification-monitoring';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const results = {
      failureCheck: 'pending',
      bounceCheck: 'pending',
      queueCheck: 'pending',
      dailySummary: 'skipped',
    };

    // Run all monitoring checks
    try {
      await checkFailureRate();
      results.failureCheck = 'completed';
    } catch (error) {
      console.error('[Cron] Failure rate check error:', error);
      results.failureCheck = 'failed';
    }

    try {
      await checkBounceRate();
      results.bounceCheck = 'completed';
    } catch (error) {
      console.error('[Cron] Bounce rate check error:', error);
      results.bounceCheck = 'failed';
    }

    try {
      await checkQueueBacklog();
      results.queueCheck = 'completed';
    } catch (error) {
      console.error('[Cron] Queue backlog check error:', error);
      results.queueCheck = 'failed';
    }

    // Send daily summary at 8am UTC (adjust as needed)
    const currentHour = new Date().getUTCHours();
    if (currentHour === 8) {
      try {
        await sendDailyAdminSummary();
        results.dailySummary = 'sent';
      } catch (error) {
        console.error('[Cron] Daily summary error:', error);
        results.dailySummary = 'failed';
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Unexpected error in admin monitoring:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
