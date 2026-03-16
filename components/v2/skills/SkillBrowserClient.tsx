'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SkillBrowserV2 } from './SkillBrowser';
import type { Skill } from './SkillBrowser';

/**
 * Client-side data-fetching wrapper for SkillBrowserV2.
 * Fetches skills from Supabase and passes them as props.
 */
export function SkillBrowserClient() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('skills')
        .select('id, name, category, description')
        .order('category')
        .order('name');

      if (fetchError) throw fetchError;
      setSkills(data ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load skills'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return (
    <SkillBrowserV2
      skills={skills}
      loading={loading}
      error={error}
      onRefresh={fetchSkills}
    />
  );
}
