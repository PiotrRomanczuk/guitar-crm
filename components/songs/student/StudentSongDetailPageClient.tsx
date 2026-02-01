'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Song } from '@/types/Song';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

// Sub-components
import { StudentSongDetailHeader } from './StudentSongDetail.Header';
import { StudentSongDetailInfoGrid } from './StudentSongDetail.InfoGrid';
import {
  SongStrummingCard,
  SongChordsCard,
  SongVideoCard,
  SongResourceLinks,
  SongGallery,
  SongNotes,
} from './StudentSongDetail.Resources';
import { SongStatusHistory } from './SongStatusHistory';

const statusLabels: Record<string, string> = {
  to_learn: 'To Learn',
  learning: 'Learning',
  practicing: 'Practicing',
  improving: 'Improving',
  mastered: 'Mastered',
  started: 'Started',
  remembered: 'Remembered',
};

export function StudentSongDetailPageClient() {
  const params = useParams();
  const id = params?.id as string;
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const supabase = createClient();

  const updateSongStatus = async (newStatus: string) => {
    if (!song?.id) return;

    const previousStatus = song.status;

    try {
      setUpdatingStatus(true);
      setSong({ ...song, status: newStatus });

      const response = await fetch('/api/student/song-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId: song.id,
          status: newStatus,
          notes: `Status changed from ${statusLabels[previousStatus || ''] || previousStatus || 'None'} to ${statusLabels[newStatus] || newStatus}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setHistoryKey((prev) => prev + 1);
      toast.success(`Song status updated to ${statusLabels[newStatus] || newStatus}!`);
    } catch (error) {
      console.error('Error updating status:', error);
      setSong({ ...song, status: previousStatus });
      toast.error('Failed to update song status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    async function fetchSong() {
      if (!id) return;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('songs')
          .select(
            `*,
            lesson_songs!inner (
              status,
              lessons!inner (student_id)
            )`
          )
          .eq('id', id)
          .eq('lesson_songs.lessons.student_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const userLessonSongs = (
            data.lesson_songs as unknown as { status: string; lessons: { student_id: string } }[]
          ).filter((ls) => ls.lessons.student_id === user.id);
          const status = userLessonSongs.length > 0 ? userLessonSongs[0].status : undefined;
          setSong({ ...data, status });
        } else {
          setSong(null);
        }
      } catch (error) {
        console.error('Error fetching song:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSong();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Song not found</h1>
        <p className="text-muted-foreground mb-6">
          You don&apos;t have access to this song or it doesn&apos;t exist.
        </p>
        <Link href="/dashboard/songs">
          <Button>Back to Songs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link
          href="/dashboard/songs"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Songs
        </Link>

        <div className="space-y-8 animate-fade-in">
          <StudentSongDetailHeader
            song={song}
            updatingStatus={updatingStatus}
            onStatusChange={updateSongStatus}
          />

          {song.cover_image_url && (
            <div className="relative w-full max-w-md aspect-square mx-auto rounded-xl overflow-hidden shadow-lg">
              <Image
                src={song.cover_image_url}
                alt={`${song.title} cover`}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <StudentSongDetailInfoGrid song={song} />
          <SongStrummingCard song={song} />
          <SongChordsCard song={song} />
          <SongVideoCard song={song} />
          <SongResourceLinks song={song} />
          <SongGallery song={song} />
          <SongNotes song={song} />

          <SongStatusHistory
            key={historyKey}
            songId={song.id}
            className="lg:col-span-2 opacity-0 animate-fade-in [animation-delay:600ms] [animation-fill-mode:forwards]"
          />
        </div>
      </div>
    </div>
  );
}
