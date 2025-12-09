import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    console.log('[API] GET /api/songs/[id] - Fetching song:', id);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('[API] Song query error:', error);
      return NextResponse.json({ error: error.message || 'Failed to fetch song' }, { status: 404 });
    }

    if (!data) {
      console.log('[API] Song not found:', id);
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    console.log('[API] Song found:', data.id, data.title);
    return NextResponse.json(data);
  } catch (err) {
    console.error('[API] Exception:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
