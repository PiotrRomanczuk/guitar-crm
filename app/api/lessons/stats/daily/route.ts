import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

interface LessonRow {
  scheduled_at: string;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('is_admin, is_teacher')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin && !profile?.is_teacher) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch lessons from last 12 months
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data: lessons, error: lessonsError } = await adminClient
      .from('lessons')
      .select('scheduled_at')
      .gte('scheduled_at', oneYearAgo.toISOString())
      .order('scheduled_at', { ascending: true });

    if (lessonsError) {
      return NextResponse.json({ error: lessonsError.message }, { status: 500 });
    }

    // Group lessons by day
    const dailyCounts = new Map<string, number>();

    for (const lesson of lessons || []) {
      const day = (lesson as LessonRow).scheduled_at.split('T')[0];
      dailyCounts.set(day, (dailyCounts.get(day) || 0) + 1);
    }

    // Convert to array format for Nivo calendar
    const result = Array.from(dailyCounts.entries()).map(([day, value]) => ({
      day,
      value,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('[DailyLessonStats] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
