import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { NotificationAnalytics, NotificationType } from '@/types/notifications';

/**
 * Helper to get user profile with roles from profiles table boolean flags
 */
async function getUserProfile(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin, is_teacher, is_student')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return null;
  }

  return {
    isAdmin: profile.is_admin ?? false,
    isTeacher: profile.is_teacher ?? false,
    isStudent: profile.is_student ?? false,
  };
}

/**
 * GET /api/admin/notification-analytics
 * Fetch notification analytics data for admin dashboard
 *
 * Query params:
 * - days: Number of days to look back (7, 30, or 90)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getUserProfile(supabase, user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (!profile.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    if (![7, 30, 90].includes(days)) {
      return NextResponse.json({ error: 'Invalid days parameter' }, { status: 400 });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all notification logs within date range
    const { data: logs, error: logsError } = await supabase
      .from('notification_log')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (logsError) {
      console.error('Error fetching notification logs:', logsError);
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    const totalLogs = logs || [];
    const totalSent = totalLogs.length;

    // Calculate rates
    const sentCount = totalLogs.filter((log) => log.status === 'sent').length;
    const failedCount = totalLogs.filter((log) => log.status === 'failed').length;
    const bouncedCount = totalLogs.filter((log) => log.status === 'bounced').length;
    const skippedCount = totalLogs.filter((log) => log.status === 'skipped').length;

    const successRate = totalSent > 0 ? (sentCount / totalSent) * 100 : 0;
    const failureRate = totalSent > 0 ? (failedCount / totalSent) * 100 : 0;
    const bounceRate = totalSent > 0 ? (bouncedCount / totalSent) * 100 : 0;
    const optOutRate = totalSent > 0 ? (skippedCount / totalSent) * 100 : 0;

    // Count by notification type
    const sentByType: Record<NotificationType, number> = totalLogs.reduce(
      (acc, log) => {
        acc[log.notification_type] = (acc[log.notification_type] || 0) + 1;
        return acc;
      },
      {} as Record<NotificationType, number>
    );

    // Group by day
    const sentByDay = totalLogs.reduce(
      (acc, log) => {
        const date = new Date(log.created_at).toISOString().split('T')[0];
        const existing = acc.find((item: { date: string; count: number }) => item.date === date);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ date, count: 1 });
        }
        return acc;
      },
      [] as Array<{ date: string; count: number }>
    );

    // Sort by date
    sentByDay.sort((a, b) => a.date.localeCompare(b.date));

    const analytics: NotificationAnalytics = {
      totalSent,
      successRate: Math.round(successRate * 100) / 100,
      failureRate: Math.round(failureRate * 100) / 100,
      bounceRate: Math.round(bounceRate * 100) / 100,
      optOutRate: Math.round(optOutRate * 100) / 100,
      sentByType,
      sentByDay,
    };

    return NextResponse.json(analytics, { status: 200 });
  } catch (error) {
    console.error('Error in notification analytics API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
