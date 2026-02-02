'use server';

import { createClient } from '@/lib/supabase/server';
import {
  getPendingConflicts,
  resolveConflictManually,
  autoResolveOldConflicts,
} from '@/lib/services/sync-conflict-resolver';

interface ConflictData {
  remote_title?: string;
  remote_scheduled_at?: string;
  remote_notes?: string;
  remote_updated?: string;
}

interface Conflict {
  id: string;
  lesson_id: string;
  conflict_data: ConflictData;
  created_at: string;
  lesson?: {
    title: string;
    scheduled_at: string;
    notes?: string | null;
    updated_at: string;
  };
}

/**
 * Get all pending sync conflicts for the current user
 */
export async function fetchPendingConflicts(): Promise<{
  success: boolean;
  conflicts?: Conflict[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const conflicts = await getPendingConflicts(supabase, user.id);

    return {
      success: true,
      conflicts: conflicts as Conflict[],
    };
  } catch (error) {
    console.error('Error fetching conflicts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch conflicts',
    };
  }
}

/**
 * Resolve a sync conflict manually
 */
export async function resolveConflict(
  conflictId: string,
  resolution: 'use_local' | 'use_remote'
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await resolveConflictManually(supabase, conflictId, resolution);

    return result;
  } catch (error) {
    console.error('Error resolving conflict:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resolve conflict',
    };
  }
}

/**
 * Auto-resolve all old conflicts (older than 7 days)
 */
export async function autoResolveOldConflictsAction(): Promise<{
  success: boolean;
  resolved?: number;
  failed?: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await autoResolveOldConflicts(supabase);

    return {
      success: true,
      resolved: result.resolved,
      failed: result.failed,
    };
  } catch (error) {
    console.error('Error auto-resolving conflicts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to auto-resolve conflicts',
    };
  }
}
