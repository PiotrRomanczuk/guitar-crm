/**
 * Vercel Cron Job: Update Student Activity Status
 *
 * Runs daily at 2 AM UTC to automatically update student_status based on lesson activity:
 * - Students become "inactive" if no completed lesson in last 28 days AND no future scheduled lessons
 * - Students return to "active" if they have a future scheduled lesson
 *
 * @route GET /api/cron/update-student-status
 */

import { NextResponse } from 'next/server';
import { updateStudentActivityStatus } from '@/lib/services/student-activity-service';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron (in production)
    const authHeader = request.headers.get('authorization');

    if (process.env.NODE_ENV === 'production') {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const result = await updateStudentActivityStatus();

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Cron] Student status update failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
