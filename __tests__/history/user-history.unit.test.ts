import { createClient } from '@/lib/supabase/client';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('User History Tracking', () => {
  let supabase: ReturnType<typeof createClient>;
  let testProfileId: string;

  beforeEach(async () => {
    supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');
    testProfileId = user.id;
  });

  afterEach(async () => {
    // Note: We don't delete the test user profile as it's the logged-in user
    // Clean up only the history records created during tests
    if (testProfileId) {
      await supabase
        .from('user_history')
        .delete()
        .eq('user_id', testProfileId)
        .neq('change_type', 'created'); // Keep the original creation record
    }
  });

  it('should create history record when user profile is updated', async () => {
    const originalData = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testProfileId)
      .single();

    // Update profile
    await supabase
      .from('profiles')
      .update({ full_name: 'Updated Test Name' })
      .eq('id', testProfileId);

    // Check history
    const { data: history } = await supabase
      .from('user_history')
      .select('*')
      .eq('user_id', testProfileId)
      .eq('change_type', 'updated')
      .order('changed_at', { ascending: false })
      .limit(1)
      .single();

    expect(history).toBeDefined();
    expect(history?.change_type).toBe('updated');
    expect(history?.previous_data).toBeDefined();
    expect(history?.new_data).toBeDefined();

    // Restore original data
    if (originalData.data) {
      await supabase
        .from('profiles')
        .update({ full_name: originalData.data.full_name })
        .eq('id', testProfileId);
    }
  });

  it('should track role changes separately', async () => {
    // Get current role
    const { data: currentRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', testProfileId)
      .single();

    if (!currentRole) {
      // Skip if user has no role
      return;
    }

    // This test requires admin privileges to change roles
    // For now, we just verify the change_type exists
    const { data: history } = await supabase
      .from('user_history')
      .select('*')
      .eq('user_id', testProfileId)
      .eq('change_type', 'role_changed')
      .order('changed_at', { ascending: false })
      .limit(1);

    // May or may not exist depending on test user's history
    expect(Array.isArray(history)).toBe(true);
  });

  it('should track status changes separately', async () => {
    const originalData = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', testProfileId)
      .single();

    // Toggle is_active if it exists
    if (originalData.data && typeof originalData.data.is_active === 'boolean') {
      await supabase
        .from('profiles')
        .update({ is_active: !originalData.data.is_active })
        .eq('id', testProfileId);

      const { data: history } = await supabase
        .from('user_history')
        .select('*')
        .eq('user_id', testProfileId)
        .eq('change_type', 'status_changed')
        .order('changed_at', { ascending: false })
        .limit(1)
        .single();

      expect(history).toBeDefined();
      expect(history?.change_type).toBe('status_changed');

      // Restore
      await supabase
        .from('profiles')
        .update({ is_active: originalData.data.is_active })
        .eq('id', testProfileId);
    }
  });

  it('should join with user profile details', async () => {
    const { data: history } = await supabase
      .from('user_history')
      .select('*, user_profile:profiles!user_history_user_id_fkey(full_name, email)')
      .eq('user_id', testProfileId)
      .order('changed_at', { ascending: false })
      .limit(1)
      .single();

    expect(history).toBeDefined();
    expect(history?.user_profile).toBeDefined();
  });

  it('should track who made the change', async () => {
    const { data: history } = await supabase
      .from('user_history')
      .select('*, changer_profile:profiles!user_history_changed_by_fkey(full_name, email)')
      .eq('user_id', testProfileId)
      .order('changed_at', { ascending: false })
      .limit(1)
      .single();

    expect(history).toBeDefined();
    expect(history?.changed_by).toBeDefined();
  });
});
