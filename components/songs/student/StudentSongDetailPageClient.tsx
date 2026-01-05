'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Music2, 
  ExternalLink, 
  Calendar, 
  Clock, 
  Loader2, 
  Signal,
  Timer,
  Mic2,
  Waves,
  Tag,
  Youtube,
  Play,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Song } from '@/types/Song';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

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

const statusLabels: Record<string, string> = {
  to_learn: '📝 To Learn',
  learning: '🎵 Learning',
  practicing: '🎸 Practicing',
  improving: '📈 Improving',
  mastered: '🏆 Mastered',
  // Legacy statuses
  started: 'Started',
  remembered: 'Remembered',
  with_author: 'With Author',
};

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
}

export function StudentSongDetailPageClient() {
  const params = useParams();
  const id = params?.id as string;
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const supabase = createClient();

  // Update song status
  const updateSongStatus = async (newStatus: string) => {
    if (!song) return;
    
    setUpdatingStatus(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find the lesson_song record to update
      const { data: lessonSong } = await supabase
        .from('lesson_songs')
        .select(`
          id,
          lessons!inner (student_id)
        `)
        .eq('song_id', song.id)
        .eq('lessons.student_id', user.id)
        .single();

      if (!lessonSong) {
        throw new Error('No lesson found for this song. Please contact your instructor.');
      }

      // Update the status
      const { error } = await supabase
        .from('lesson_songs')
        .update({ status: newStatus })
        .eq('id', lessonSong.id);

      if (error) throw error;

      // Update local state
      setSong({ ...song, status: newStatus });

      toast.success(`Song status updated to ${statusLabels[newStatus] || newStatus}!`);
    } catch (error) {
      console.error('Error updating song status:', error);
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

        // Fetch song details and status
        // We use maybeSingle() because RLS might return no rows if access is denied
        const { data, error } = await supabase
          .from('songs')
          .select(
            `
            *,
            lesson_songs!inner (
              status,
              lessons!inner (
                student_id
              )
            )
          `
          )
          .eq('id', id)
          .eq('lesson_songs.lessons.student_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          // Extract status from the first matching lesson_song
          const userLessonSongs = (
            data.lesson_songs as unknown as { status: string; lessons: { student_id: string } }[]
          ).filter((ls) => ls.lessons.student_id === user.id);
          const status = userLessonSongs.length > 0 ? userLessonSongs[0].status : undefined;

          setSong({
            ...data,
            status,
          });
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
        {/* Breadcrumb */}
        <Link
          href="/dashboard/songs"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Songs
        </Link>

        {/* Header Section */}
        <div className="space-y-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{song.title}</h1>
              <p className="text-xl text-muted-foreground">{song.author}</p>
            </div>
            
            {/* Status Update Controls */}
            <div className="flex flex-col gap-4 md:items-end">
              <div className="space-y-2 min-w-48">
                <label className="text-sm font-medium text-muted-foreground">
                  Learning Progress
                </label>
                <Select
                  value={song.status || 'to_learn'}
                  onValueChange={updateSongStatus}
                  disabled={updatingStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="to_learn">📝 To Learn</SelectItem>
                    <SelectItem value="learning">🎵 Learning</SelectItem>
                    <SelectItem value="practicing">🎸 Practicing</SelectItem>
                    <SelectItem value="improving">📈 Improving</SelectItem>
                    <SelectItem value="mastered">🏆 Mastered</SelectItem>
                  </SelectContent>
                </Select>
                {updatingStatus && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Updating...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cover Image */}
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

          {/* Song Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border/50 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Signal className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
                  <Badge
                    variant="secondary"
                    className={cn('mt-1 capitalize', difficultyColors[song.level || 'beginner'])}
                  >
                    {difficultyLabels[song.level || 'beginner']}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Music2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Key</p>
                  <p className="text-lg font-semibold mt-0.5">{song.key}</p>
                </div>
              </CardContent>
            </Card>

            {song.tempo && (
              <Card className="bg-card border-border/50 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Timer className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tempo</p>
                    <p className="text-lg font-semibold mt-0.5">{song.tempo} BPM</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {song.time_signature && (
              <Card className="bg-card border-border/50 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Time Sig.</p>
                    <p className="text-lg font-semibold mt-0.5">{song.time_signature}/4</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {song.duration_ms && (
              <Card className="bg-card border-border/50 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duration</p>
                    <p className="text-lg font-semibold mt-0.5">{formatDuration(song.duration_ms)}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {song.release_year && (
              <Card className="bg-card border-border/50 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Released</p>
                    <p className="text-lg font-semibold mt-0.5">{song.release_year}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {song.capo_fret !== null && song.capo_fret !== undefined && (
              <Card className="bg-card border-border/50 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Mic2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Capo</p>
                    <p className="text-lg font-semibold mt-0.5">
                      {song.capo_fret === 0 ? 'No Capo' : `Fret ${song.capo_fret}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {song.category && (
              <Card className="bg-card border-border/50 shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Tag className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="text-lg font-semibold mt-0.5">{song.category}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Strumming Pattern */}
          {song.strumming_pattern && (
            <Card className="bg-card border-border/50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Waves className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Strumming Pattern</h3>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg font-mono text-lg tracking-wider">
                  {song.strumming_pattern}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chords */}
          {song.chords && (
            <Card className="bg-card border-border/50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Music2 className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Chord Progression</h3>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm tracking-wide">
                  {song.chords}
                </div>
              </CardContent>
            </Card>
          )}

          {/* YouTube Video */}
          {song.youtube_url && (
            <Card className="bg-card border-border/50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500/10 rounded-full">
                    <Youtube className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold">Video Tutorial</h3>
                </div>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <iframe
                    src={song.youtube_url.replace('watch?v=', 'embed/')}
                    title={`${song.title} - Video Tutorial`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resource Links */}
          <Card className="bg-card border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <ExternalLink className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Learning Resources</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {song.youtube_url && (
                  <Button variant="outline" asChild className="h-12">
                    <a
                      href={song.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Youtube className="w-4 h-4" />
                      YouTube
                    </a>
                  </Button>
                )}
                
                {song.ultimate_guitar_link && (
                  <Button variant="outline" asChild className="h-12">
                    <a
                      href={song.ultimate_guitar_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Tabs
                    </a>
                  </Button>
                )}
                
                {song.spotify_link_url && (
                  <Button variant="outline" asChild className="h-12">
                    <a
                      href={song.spotify_link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Spotify
                    </a>
                  </Button>
                )}
                
                {song.audio_files && (
                  <Button variant="outline" asChild className="h-12">
                    <a
                      href={song.audio_files}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Music2 className="w-4 h-4" />
                      Audio
                    </a>
                  </Button>
                )}
              </div>
              
              {!song.youtube_url && !song.ultimate_guitar_link && !song.spotify_link_url && !song.audio_files && (
                <div className="text-sm text-muted-foreground italic text-center py-4">
                  No additional resources available yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Gallery */}
          {song.gallery_images && song.gallery_images.length > 0 && (
            <Card className="bg-card border-border/50 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {song.gallery_images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`${song.title} gallery image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments/Notes section if available */}
          {song.comments && (
            <Card className="bg-card border-border/50 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Notes</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">{song.comments}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
