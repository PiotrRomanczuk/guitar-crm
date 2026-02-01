'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/rules-of-hooks, react/no-unescaped-entities */

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle, Music, ExternalLink, Clock, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface SpotifyMatchData {
  matchId: string;
  songId: string;
  songTitle: string;
  spotifyTrack: {
    id: string;
    name: string;
    artist: string;
    album: string;
    coverImage: string | null;
    url: string;
    previewUrl: string | null;
    duration: number;
    releaseDate: string;
    popularity: number;
  };
  confidence: number;
  searchQuery: string;
  reason: string;
}

interface SpotifyMatchDialogProps {
  open: boolean;
  onClose: () => void;
  matchData: SpotifyMatchData | null;
}

export function SpotifyMatchDialog({ open, onClose, matchData }: SpotifyMatchDialogProps) {
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<any | null>(null);
  const router = useRouter();

  if (!matchData) return null;

  // Debounced auto-fetch for Spotify search
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(query)}&type=track&limit=5`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.tracks?.items || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Auto-fetch on input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const handleSelectTrack = (track: any) => {
    setSelectedTrack(track);
    toast.success('Track selected', {
      description: 'Click "Approve & Apply" to use this match',
    });
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      // Use selected track if available, otherwise use the suggested match
      const trackToApply = selectedTrack || {
        id: matchData.spotifyTrack.id,
        name: matchData.spotifyTrack.name,
        artists: [{ name: matchData.spotifyTrack.artist }],
        album: {
          name: matchData.spotifyTrack.album,
          images: matchData.spotifyTrack.coverImage
            ? [{ url: matchData.spotifyTrack.coverImage }]
            : [],
          release_date: matchData.spotifyTrack.releaseDate,
        },
        duration_ms: matchData.spotifyTrack.duration,
        external_urls: { spotify: matchData.spotifyTrack.url },
        preview_url: matchData.spotifyTrack.previewUrl,
        popularity: matchData.spotifyTrack.popularity,
      };

      const response = await fetch('/api/spotify/matches/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: matchData.matchId,
          songId: matchData.songId,
          track: trackToApply,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve match');
      }

      toast.success('Match approved!', {
        description: 'Spotify data has been updated',
      });

      router.refresh();
      onClose();
    } catch (error) {
      console.error('Approval error:', error);
      toast.error('Failed to approve match', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/spotify/matches/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: matchData.matchId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject match');
      }

      toast.info('Match rejected', {
        description: 'You can try syncing again with different settings',
      });

      onClose();
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error('Failed to reject match', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (confidence >= 70) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    if (confidence >= 50) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Review Spotify Match
          </DialogTitle>
          <DialogDescription>
            This match needs manual review before applying. Please verify if this is the correct
            song.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Song Info */}
          <Card className="p-4 bg-muted/50">
            <div className="text-sm font-medium text-muted-foreground mb-2">Your Song</div>
            <div className="font-semibold text-lg">{matchData.songTitle}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Search query: "{matchData.searchQuery}"
            </div>
          </Card>

          {/* Confidence Score */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Match Confidence</span>
            <Badge className={getConfidenceColor(matchData.confidence)}>
              {matchData.confidence}%
            </Badge>
          </div>

          {/* Spotify Match */}
          <Card className="p-4 border-primary/50">
            <div className="text-sm font-medium text-muted-foreground mb-3">
              {selectedTrack ? 'Selected Match (Manual)' : 'Suggested Spotify Match (AI)'}
            </div>

            <div className="flex gap-4">
              {/* Album Cover */}
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-border">
                {selectedTrack?.album?.images?.[0]?.url || matchData.spotifyTrack.coverImage ? (
                  <Image
                    src={
                      selectedTrack?.album?.images?.[0]?.url || matchData.spotifyTrack.coverImage
                    }
                    alt={selectedTrack?.name || matchData.spotifyTrack.name}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Track Details */}
              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <div className="font-semibold text-lg truncate">
                    {selectedTrack?.name || matchData.spotifyTrack.name}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {selectedTrack?.artists?.[0]?.name || matchData.spotifyTrack.artist}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Album:</span>
                    <div className="truncate">
                      {selectedTrack?.album?.name || matchData.spotifyTrack.album}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <div>
                      {formatDuration(
                        selectedTrack?.duration_ms || matchData.spotifyTrack.duration
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Released:</span>
                    <div>
                      {selectedTrack?.album?.release_date || matchData.spotifyTrack.releaseDate}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Popularity:</span>
                    <div>{selectedTrack?.popularity || matchData.spotifyTrack.popularity}/100</div>
                  </div>
                </div>

                {/* Action Links */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild className="gap-1">
                    <a
                      href={selectedTrack?.external_urls?.spotify || matchData.spotifyTrack.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open in Spotify
                    </a>
                  </Button>

                  {(selectedTrack?.preview_url || matchData.spotifyTrack.previewUrl) && (
                    <Button variant="outline" size="sm" asChild className="gap-1">
                      <a
                        href={selectedTrack?.preview_url || matchData.spotifyTrack.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Music className="w-3 h-3" />
                        Preview
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Manual Search Section */}
          <Card className="p-4 bg-muted/30 border-dashed">
            <div className="text-sm font-medium mb-3">Search for Different Match</div>
            <div className="relative mb-3">
              <Input
                placeholder="Type to search Spotify (e.g., 'Dust in the Wind Kansas')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : searchQuery ? (
                  <Search className="w-4 h-4 text-muted-foreground" />
                ) : null}
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((track) => (
                  <Card
                    key={track.id}
                    className={`p-3 cursor-pointer transition-all hover:bg-accent ${
                      selectedTrack?.id === track.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleSelectTrack(track)}
                  >
                    <div className="flex gap-3 items-center">
                      <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-muted">
                        {track.album?.images?.[0]?.url ? (
                          <Image
                            src={track.album.images[0].url}
                            alt={track.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{track.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {track.artists?.[0]?.name} • {track.album?.name}
                        </div>
                      </div>
                      {selectedTrack?.id === track.id && (
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Match Reason */}
          {matchData.reason && (
            <div className="text-sm">
              <span className="font-medium">Match Reason: </span>
              <span className="text-muted-foreground">{matchData.reason}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleReject} disabled={processing} className="gap-2">
            <XCircle className="w-4 h-4" />
            Reject
          </Button>
          <Button variant="default" onClick={handleApprove} disabled={processing} className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {processing ? 'Applying...' : 'Approve & Apply'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
