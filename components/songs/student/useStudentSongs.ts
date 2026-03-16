'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { SongWithStatus as Song } from '@/components/songs/types';
import { statusLabels } from './StudentSongs.constants';
import { logger } from '@/lib/logger';

type SortField = 'name' | 'author' | 'difficulty' | 'status';
type FilterState = {
  searchQuery: string;
  difficultyFilter: string;
  statusFilter: string;
  sortBy: SortField;
};

const DIFFICULTY_ORDER = { beginner: 0, intermediate: 1, advanced: 2 } as const;
const STATUS_ORDER = { to_learn: 0, learning: 1, practicing: 2, improving: 3, mastered: 4 } as const;

export function useStudentSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    difficultyFilter: 'all',
    statusFilter: 'all',
    sortBy: 'name',
  });

  const supabase = createClient();

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({ ...prev, searchQuery: '', difficultyFilter: 'all', statusFilter: 'all' }));
  }, []);

  const updateSongStatus = useCallback(async (songId: string, newStatus: string) => {
    setUpdatingStatus(songId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: lessonSong } = await supabase
        .from('lesson_songs')
        .select(`id, lessons!inner (student_id)`)
        .eq('song_id', songId)
        .eq('lessons.student_id', user.id)
        .single();

      if (!lessonSong) throw new Error('No lesson found for this song.');

      const { error } = await supabase
        .from('lesson_songs')
        .update({ status: newStatus })
        .eq('id', lessonSong.id);
      if (error) throw error;

      setSongs((prev) =>
        prev.map((s) => (s.id === songId ? { ...s, status: newStatus as Song['status'] } : s))
      );
      toast.success(`Song status updated to ${statusLabels[newStatus] || newStatus}!`);
    } catch (error) {
      logger.error('Error updating song status:', error);
      toast.error('Failed to update song status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  }, [supabase]);

  const filteredSongs = useMemo(() => {
    let filtered = songs;
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (s) => s.title.toLowerCase().includes(q) || (s.author ?? '').toLowerCase().includes(q)
      );
    }
    if (filters.difficultyFilter !== 'all')
      filtered = filtered.filter((s) => s.level === filters.difficultyFilter);
    if (filters.statusFilter !== 'all')
      filtered = filtered.filter((s) => s.status === filters.statusFilter);

    return [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'name': return a.title.localeCompare(b.title);
        case 'author': return (a.author ?? '').localeCompare(b.author ?? '');
        case 'difficulty':
          return (DIFFICULTY_ORDER[a.level as keyof typeof DIFFICULTY_ORDER] ?? 0) -
            (DIFFICULTY_ORDER[b.level as keyof typeof DIFFICULTY_ORDER] ?? 0);
        case 'status':
          return (STATUS_ORDER[a.status as keyof typeof STATUS_ORDER] ?? 0) -
            (STATUS_ORDER[b.status as keyof typeof STATUS_ORDER] ?? 0);
        default: return 0;
      }
    });
  }, [songs, filters]);

  useEffect(() => {
    async function fetchSongs() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('lesson_songs')
          .select(`id, status, lessons!inner (student_id), songs!inner (
            id, title, author, level, key, chords,
            ultimate_guitar_link, youtube_url, spotify_link_url, cover_image_url, audio_files
          )`)
          .eq('lessons.student_id', user.id);
        if (error) throw error;

        const seen = new Map<string, Song>();
        data?.forEach((ls) => {
          const song = Array.isArray(ls.songs) ? ls.songs[0] : ls.songs;
          if (!song || seen.has(song.id)) return;
          seen.set(song.id, { ...song, status: ls.status } as Song);
        });
        setSongs(Array.from(seen.values()));
      } catch (error) {
        logger.error('Error fetching songs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, [supabase]);

  const hasActiveFilters =
    filters.searchQuery !== '' || filters.difficultyFilter !== 'all' || filters.statusFilter !== 'all';

  return {
    songs,
    loading,
    updatingStatus,
    filters,
    updateFilter,
    clearFilters,
    updateSongStatus,
    filteredSongs,
    hasActiveFilters,
  };
}
