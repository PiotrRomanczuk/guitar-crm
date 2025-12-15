'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Music2, Guitar, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Song } from '@/types/Song';
import { createClient } from '@/lib/supabase/client';

const difficultyColors = {
  beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
  intermediate: 'bg-primary/10 text-primary border-primary/20',
  advanced: 'bg-destructive/10 text-destructive border-destructive/20',
};

const difficultyLabels = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const statusColors: Record<string, string> = {
  'to_learn': 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  'started': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'remembered': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'with_author': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'mastered': 'bg-green-500/10 text-green-500 border-green-500/20',
};

const statusLabels: Record<string, string> = {
  'to_learn': 'To Learn',
  'started': 'Started',
  'remembered': 'Remembered',
  'with_author': 'With Author',
  'mastered': 'Mastered',
};

export function StudentSongsPageClient() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchSongs() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('songs')
          .select(`
            *,
            lesson_songs!inner (
              status,
              lessons!inner (
                student_id
              )
            )
          `)
          .eq('lesson_songs.lessons.student_id', user.id);

        if (error) throw error;

        const processedSongsMap = new Map<string, Song>();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data?.forEach((song: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const userLessonSongs = song.lesson_songs.filter((ls: any) => ls.lessons.student_id === user.id);
          const status = userLessonSongs.length > 0 ? userLessonSongs[0].status : undefined;

          if (!processedSongsMap.has(song.id)) {
            processedSongsMap.set(song.id, {
              ...song,
              status: status
            });
          }
        });

        setSongs(Array.from(processedSongsMap.values()));
      } catch (error) {
        console.error('Error fetching songs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSongs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mb-8 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <h1 className="text-3xl font-semibold">My Songs</h1>
        <p className="text-muted-foreground mt-1">Songs you are currently learning or have mastered.</p>
      </div>

      {songs.length === 0 ? (
        <div className="text-center py-12">
          <Music2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No songs found</h3>
          <p className="text-muted-foreground">You haven&apos;t been assigned any songs yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {songs.map((song, index) => (
            <div
              key={song.id}
              className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Music2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="outline"
                      className={cn('capitalize', difficultyColors[song.level || 'beginner'])}
                    >
                      {difficultyLabels[song.level || 'beginner']}
                    </Badge>
                    {song.status && (
                      <Badge
                        variant="outline"
                        className={cn('capitalize', statusColors[song.status] || 'bg-gray-100 text-gray-800')}
                      >
                        {statusLabels[song.status] || song.status.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                  {song.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">{song.author}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Guitar className="w-4 h-4 mr-2" />
                    Key: {song.key}
                  </div>
                  {song.chords && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Music2 className="w-4 h-4 mr-2" />
                      Chords: {song.chords}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/dashboard/songs/${song.id}`}
                    className="flex-1 inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                  >
                    View Details
                  </Link>
                  {song.ultimate_guitar_link && (
                    <a
                      href={song.ultimate_guitar_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
                      title="View on Ultimate Guitar"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
