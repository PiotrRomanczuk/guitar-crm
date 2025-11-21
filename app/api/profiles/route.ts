import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

export async function GET() {
  try {
    const supabase = await createClient();
    const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin && !isTeacher) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all profiles - using * to get all columns
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching profiles:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profiles || []);
  } catch (error) {
    console.error('Error in profiles API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
