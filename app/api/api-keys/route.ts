/**
 * GET /api/api-keys - List all API keys for the current user
 * DELETE /api/api-keys/[id] - Delete a specific API key
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all API keys for the user (without the hash)
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('id, name, last_used_at, created_at, is_active')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API Keys] Error fetching keys:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(keys || []);
  } catch (error) {
    console.error('[API Keys] Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'API key name is required' }, { status: 400 });
    }

    const { generateApiKey, hashApiKey } = await import('@/lib/api-keys');

    const plainKey = generateApiKey();
    const keyHash = hashApiKey(plainKey);

    // Insert the hashed key into the database
    const { data: newKey, error: insertError } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name: name.trim(),
        key_hash: keyHash,
      })
      .select('id, name, created_at')
      .single();

    if (insertError) {
      console.error('[API Keys] Error creating key:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Return the plain key only once (it cannot be retrieved later)
    return NextResponse.json(
      {
        ...newKey,
        key: plainKey,
        warning: 'Save your API key now. You will not be able to see it again.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API Keys] Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
