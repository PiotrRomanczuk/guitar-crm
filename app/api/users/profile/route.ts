import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { z } from 'zod';

const ProfileUpdateSchema = z.object({
  full_name: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  avatar_url: z.string().url().optional().nullable(),
});

export async function GET() {
  try {
    const { user } = await getUserWithRolesSSR();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, avatar_url, is_admin, is_teacher, is_student, is_active, created_at, updated_at')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    return Response.json(data, { status: 200 });
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { user } = await getUserWithRolesSSR();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = ProfileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.full_name !== undefined) updates.full_name = parsed.data.full_name;
    if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone;
    if (parsed.data.avatar_url !== undefined) updates.avatar_url = parsed.data.avatar_url;

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select('id, email, full_name, phone, avatar_url, is_admin, is_teacher, is_student, is_active, created_at, updated_at')
      .single();

    if (error) {
      return Response.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return Response.json(data, { status: 200 });
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
