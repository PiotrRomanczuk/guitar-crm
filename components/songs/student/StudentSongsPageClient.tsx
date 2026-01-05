'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Music2,
  Guitar,
  ExternalLink,
  Loader2,
  TrendingUp,
  Search,
  Filter,
  SortAsc,
  Youtube,
  Play,
  FileText,
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

const statusColors: Record<string, string> = {
  to_learn: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  learning: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  practicing: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  improving: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  mastered: 'bg-green-500/10 text-green-500 border-green-500/20',
  // Legacy statuses
  started: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  remembered: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  with_author: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

const statusLabels: Record<string, string> = {
  to_learn: 'To Learn',
  learning: 'Learning',
  practicing: 'Practicing',
  improving: 'Improving',
  mastered: 'Mastered',
  // Legacy statuses
  started: 'Started',
  remembered: 'Remembered',
  with_author: 'With Author',
};

export function StudentSongsPageClient() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  const supabase = createClient();

  // Update song status
  const updateSongStatus = async (songId: string, newStatus: string) => {
    setUpdatingStatus(songId);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find the lesson_song record to update
      const { data: lessonSong } = await supabase
        .from('lesson_songs')
        .select(
          `
          id,
          lessons!inner (student_id)
        `
        )
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

      // Update local state
      setSongs(
        songs.map((song) => (song.id === songId ? { ...song, status: newStatus as any } : song))
      );

      toast.success(`Song status updated to ${statusLabels[newStatus] || newStatus}!`);
    } catch (error) {
      console.error('Error updating song status:', error);
      toast.error('Failed to update song status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Filter and sort songs
  const filteredSongs = useMemo(() => {
    let filtered = songs;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (song) =>
          song.title.toLowerCase().includes(query) || song.author.toLowerCase().includes(query)
      );
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((song) => song.level === difficultyFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((song) => song.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'difficulty':
          const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
          return (
            difficultyOrder[a.level as keyof typeof difficultyOrder] -
            difficultyOrder[b.level as keyof typeof difficultyOrder]
          );
        case 'status':
          const statusOrder = {
            to_learn: 0,
            learning: 1,
            practicing: 2,
            improving: 3,
            mastered: 4,
          };
          return (
            statusOrder[a.status as keyof typeof statusOrder] -
            statusOrder[b.status as keyof typeof statusOrder]
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [songs, searchQuery, difficultyFilter, statusFilter, sortBy]);

  useEffect(() => {
    async function fetchSongs() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('lesson_songs')
          .select(
            `
            id,
            status,
            lessons!inner (student_id),
            songs!inner (
              id,
              title,
              author,
              level,
              key,
              chords,
              ultimate_guitar_link,
              cover_image_url
            )
          `
          )
          .eq('lessons.student_id', user.id);

        if (error) throw error;

        const processedSongsMap = new Map<string, Song>();

        data?.forEach((lessonSong) => {
          const song = Array.isArray(lessonSong.songs) ? lessonSong.songs[0] : lessonSong.songs;
          if (!song || processedSongsMap.has(song.id)) return;

          processedSongsMap.set(song.id, {
            ...song,
            status: lessonSong.status,
          } as Song);
        });

        setSongs(Array.from(processedSongsMap.values()));
      } catch (error) {
        console.error('Error fetching songs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSongs();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div
        className="mb-6 sm:mb-8 opacity-0 animate-fade-in"
        style={{ animationFillMode: 'forwards' }}
      >
        <h1 className="text-2xl sm:text-3xl font-semibold">My Songs</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Songs you are currently learning or have mastered.
        </p>
      </div>

      {songs.length > 0 && (
        <div
          className="mb-6 sm:mb-8 space-y-4 opacity-0 animate-fade-in"
          style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search songs or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Difficulty Filter */}
            <div className="flex items-center gap-2 flex-1">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-1">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="to_learn">📝 To Learn</SelectItem>
                  <SelectItem value="learning">🎵 Learning</SelectItem>
                  <SelectItem value="practicing">🎸 Practicing</SelectItem>
                  <SelectItem value="improving">📈 Improving</SelectItem>
                  <SelectItem value="mastered">🏆 Mastered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2 flex-1">
              <SortAsc className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Song Name</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                  <SelectItem value="status">Learning Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          {(searchQuery || difficultyFilter !== 'all' || statusFilter !== 'all') && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredSongs.length} of {songs.length} songs
            </div>
          )}
        </div>
      )}

      {songs.length === 0 ? (
        <div className="text-center py-12">
          <div className="relative w-64 h-48 mx-auto mb-6">
            <img
              src="/illustrations/no-upcoming-lessons--future-focused---a-forward-lo.png"
              alt="No songs assigned"
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-lg font-medium mb-2">No songs assigned yet</h3>
          <p className="text-muted-foreground mb-4">
            You haven&apos;t been assigned any songs yet. Your teacher will add songs as you
            progress through your lessons.
          </p>
          <p className="text-sm text-muted-foreground">
            Have questions? Contact your teacher for guidance on what to practice next.
          </p>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="text-center py-12">
          <div className="relative w-64 h-48 mx-auto mb-6">
            <Music2 className="w-24 h-24 text-muted-foreground/30 mx-auto" />
          </div>
          <h3 className="text-lg font-medium mb-2">No songs match your filters</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter criteria to see more songs.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setDifficultyFilter('all');
              setStatusFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredSongs.map((song, index) => (
            <div
              key={song.id}
              className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden relative">
                    {song.cover_image_url ? (
                      <Image
                        src={song.cover_image_url}
                        alt={song.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Music2 className="w-6 h-6 text-primary" />
                    )}
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
                        className={cn(
                          'capitalize',
                          statusColors[song.status] || 'bg-gray-100 text-gray-800'
                        )}
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

                <div className="flex flex-col gap-3 mb-4">
                  {/* Status Update */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Learning Progress
                    </label>
                    <Select
                      value={song.status || 'to_learn'}
                      onValueChange={(newStatus) => updateSongStatus(song.id, newStatus)}
                      disabled={updatingStatus === song.id}
                    >
                      <SelectTrigger className="h-8 text-xs">
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
                    {updatingStatus === song.id && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Updating...
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Quick Resource Access */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">
                      Quick Resources
                    </h4>

                    {/* Primary Resource Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      {song.youtube_url && (
                        <a
                          href={song.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 h-9 px-3 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        >
                          <Youtube className="w-4 h-4" />
                          YouTube
                        </a>
                      )}

                      {song.ultimate_guitar_link && (
                        <a
                          href={song.ultimate_guitar_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 h-9 px-3 text-xs font-medium bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Tabs
                        </a>
                      )}

                      {song.spotify_link_url && (
                        <a
                          href={song.spotify_link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 h-9 px-3 text-xs font-medium bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          Spotify
                        </a>
                      )}

                      {song.audio_files && (
                        <a
                          href={song.audio_files}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 h-9 px-3 text-xs font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                          <Music2 className="w-4 h-4" />
                          Audio
                        </a>
                      )}
                    </div>

                    {/* Resource availability indicator */}
                    {!song.youtube_url &&
                      !song.ultimate_guitar_link &&
                      !song.spotify_link_url &&
                      !song.audio_files && (
                        <div className="text-xs text-muted-foreground text-center py-2">
                          No resources available yet
                        </div>
                      )}
                  </div>

                  {/* View Details Button */}
                  <Link
                    href={`/dashboard/songs/${song.id}`}
                    className="w-full inline-flex items-center justify-center h-9 px-4 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                  >
                    View Full Details
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
