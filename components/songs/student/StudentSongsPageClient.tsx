'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Music2, Loader2 } from 'lucide-react';
import { Song } from '@/types/Song';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { StudentSongFilters } from './StudentSongFilters';
import { StudentSongCard } from './StudentSongCard';

const statusLabels: Record<string, string> = {
  to_learn: 'To Learn',
  learning: 'Learning',
  practicing: 'Practicing',
  improving: 'Improving',
  mastered: 'Mastered',
};

interface StudentSongsPageClientProps {
  initialSongs?: Song[];
}

export function StudentSongsPageClient({ initialSongs = [] }: StudentSongsPageClientProps) {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [loading, setLoading] = useState(initialSongs.length === 0);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  const supabase = createClient();

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

      if (!lessonSong) {
        throw new Error('No lesson found for this song. Please contact your instructor.');
      }

      const { error } = await supabase
        .from('lesson_songs')
        .update({ status: newStatus })
        .eq('id', lessonSong.id);

      if (error) throw error;

      setSongs(prev => prev.map((song) =>
        song.id === songId ? { ...song, status: newStatus as Song['status'] } : song
      ));

      toast.success(`Song status updated to ${statusLabels[newStatus] || newStatus}!`);
    } catch (error) {
      console.error('[Songs] Error updating song status:', error);
      toast.error('Failed to update song status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  }, [supabase]);

  const filteredSongs = useMemo(() => {
    let filtered = songs;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (song) =>
          song.title.toLowerCase().includes(query) || song.author.toLowerCase().includes(query)
      );
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((song) => song.level === difficultyFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((song) => song.status === statusFilter);
    }

    const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
    const statusOrder = { to_learn: 0, learning: 1, practicing: 2, improving: 3, mastered: 4 };

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'difficulty':
          return (difficultyOrder[a.level as keyof typeof difficultyOrder] ?? 0) -
                 (difficultyOrder[b.level as keyof typeof difficultyOrder] ?? 0);
        case 'status':
          return (statusOrder[a.status as keyof typeof statusOrder] ?? 0) -
                 (statusOrder[b.status as keyof typeof statusOrder] ?? 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [songs, searchQuery, difficultyFilter, statusFilter, sortBy]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setDifficultyFilter('all');
    setStatusFilter('all');
  }, []);

  useEffect(() => {
    if (initialSongs.length > 0) {
      setLoading(false);
      return;
    }

    async function fetchSongs() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('lesson_songs')
          .select(`
            id, status,
            lessons!inner (student_id),
            songs!inner (id, title, author, level, key, chords, ultimate_guitar_link, cover_image_url, youtube_url, spotify_link_url, audio_files)
          `)
          .eq('lessons.student_id', user.id);

        if (error) throw error;

        const processedSongsMap = new Map<string, Song>();
        data?.forEach((lessonSong) => {
          const song = Array.isArray(lessonSong.songs) ? lessonSong.songs[0] : lessonSong.songs;
          if (!song || processedSongsMap.has(song.id)) return;
          processedSongsMap.set(song.id, { ...song, status: lessonSong.status } as Song);
        });

        setSongs(Array.from(processedSongsMap.values()));
      } catch (error) {
        console.error('[Songs] Error fetching songs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSongs();
  }, [supabase, initialSongs.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold">My Songs</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Songs you are currently learning or have mastered.
        </p>
      </div>

      {songs.length > 0 && (
        <StudentSongFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          difficultyFilter={difficultyFilter}
          onDifficultyChange={setDifficultyFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalCount={songs.length}
          filteredCount={filteredSongs.length}
          onClearFilters={clearFilters}
        />
      )}

      {songs.length === 0 ? (
        <div className="text-center py-12">
          <div className="relative w-64 h-48 mx-auto mb-6">
            <Image
              src="/illustrations/no-upcoming-lessons--future-focused---a-forward-lo.png"
              alt="No songs assigned"
              fill
              className="object-contain"
            />
          </div>
          <h3 className="text-lg font-medium mb-2">No songs assigned yet</h3>
          <p className="text-muted-foreground mb-4">
            You haven&apos;t been assigned any songs yet. Your teacher will add songs as you
            progress through your lessons.
          </p>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="text-center py-12">
          <Music2 className="w-24 h-24 text-muted-foreground/30 mx-auto mb-6" />
          <h3 className="text-lg font-medium mb-2">No songs match your filters</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter criteria to see more songs.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredSongs.map((song) => (
            <StudentSongCard
              key={song.id}
              song={song}
              onStatusChange={updateSongStatus}
              isUpdating={updatingStatus === song.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
