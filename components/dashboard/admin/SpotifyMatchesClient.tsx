'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  XCircle,
  Music,
  ExternalLink,
  AlertCircle,
  Loader2,
  RefreshCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface SpotifyMatch {
  id: string;
  song_id: string;
  spotify_track_id: string;
  spotify_track_name: string;
  spotify_artist_name: string;
  spotify_album_name: string;
  spotify_url: string;
  spotify_preview_url?: string;
  spotify_cover_image_url?: string;
  spotify_duration_ms: number;
  spotify_release_date: string;
  spotify_popularity?: number;
  confidence_score: number;
  search_query: string;
  match_reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  songs: {
    id: string;
    title: string;
    author: string;
    spotify_link_url?: string;
    cover_image_url?: string;
  };
}

interface SpotifySearchResult {
  id: string;
  name: string;
  artist: string;
  album: string;
  url: string;
  coverUrl?: string;
  duration_ms: number;
  release_date: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

type SortField = 'original' | 'spotify' | 'confidence' | null;
type SortOrder = 'asc' | 'desc';

export function SpotifyMatchesClient() {
  const [matches, setMatches] = useState<SpotifyMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<SpotifyMatch | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifySearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchMatches = async (status: string = 'pending', page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/spotify/matches?status=${status}&page=${page}&limit=20`);
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      const data = await response.json();
      setMatches(data.matches || []);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to load Spotify matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(activeTab, 1);
    setSortField(null);
  }, [activeTab]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortedMatches = () => {
    if (!sortField) return matches;

    return [...matches].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'original':
          comparison = a.songs.title.localeCompare(b.songs.title);
          break;
        case 'spotify':
          comparison = a.spotify_track_name.localeCompare(b.spotify_track_name);
          break;
        case 'confidence':
          comparison = a.confidence_score - b.confidence_score;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortField === field;
    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        {children}
        {isActive ? (
          sortOrder === 'asc' ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-50" />
        )}
      </button>
    );
  };

  const handleAction = async (matchId: string, action: 'approve' | 'reject') => {
    setActionLoading(matchId);
    try {
      const response = await fetch('/api/spotify/matches/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, action }),
      });

      if (!response.ok) {
        throw new Error('Failed to process action');
      }

      toast.success(`Match ${action === 'approve' ? 'approved' : 'rejected'} successfully`);

      // Refresh the list
      fetchMatches(activeTab, pagination.page);
    } catch (error) {
      toast.error(`Failed to ${action} match`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearchSpotify = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Failed to search Spotify');
      }
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      toast.error('Failed to search Spotify');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectAlternative = async (result: SpotifySearchResult) => {
    if (!currentMatch) return;

    setActionLoading(currentMatch.id);
    try {
      const response = await fetch('/api/spotify/matches/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: currentMatch.id,
          action: 'approve',
          overrideSpotifyId: result.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve alternative match');
      }

      toast.success('Alternative match approved successfully');
      setSearchDialogOpen(false);
      setCurrentMatch(null);
      setSearchQuery('');
      setSearchResults([]);

      // Refresh the list
      fetchMatches(activeTab, pagination.page);
    } catch (error) {
      toast.error('Failed to approve alternative match');
    } finally {
      setActionLoading(null);
    }
  };

  const openSearchDialog = (match: SpotifyMatch) => {
    setCurrentMatch(match);
    setSearchQuery(`${match.songs.title} ${match.songs.author}`);
    setSearchDialogOpen(true);
    setSearchResults([]);
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 70) {
      return (
        <Badge
          variant="outline"
          className="bg-warning/10 text-warning border-warning/20"
        >
          High: {score}%
        </Badge>
      );
    } else if (score >= 50) {
      return (
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          Medium: {score}%
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-destructive/10 text-destructive border-destructive/20"
        >
          Low: {score}%
        </Badge>
      );
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="pending" className="flex-1 sm:flex-none">
              Pending {pagination.total > 0 && activeTab === 'pending' && `(${pagination.total})`}
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex-1 sm:flex-none">
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1 sm:flex-none">
              Rejected
            </TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMatches(activeTab, pagination.page)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center space-y-4 border-2 border-dashed border-border rounded-xl bg-muted/10">
              <CheckCircle2 className="w-12 h-12 text-success" />
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">All caught up!</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  No pending Spotify matches to review.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>
                        <SortButton field="original">Original Song</SortButton>
                      </TableHead>
                      <TableHead>
                        <SortButton field="spotify">Spotify Match</SortButton>
                      </TableHead>
                      <TableHead className="w-[90px]">
                        <SortButton field="confidence">Score</SortButton>
                      </TableHead>
                      <TableHead className="w-[220px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getSortedMatches().map((match) => (
                      <TableRow key={match.id} className="hover:bg-muted/50">
                        {/* Cover Images */}
                        <TableCell className="align-top p-2">
                          <div className="flex flex-col gap-1">
                            {match.songs.cover_image_url && (
                              <Image
                                src={match.songs.cover_image_url}
                                alt={match.songs.title}
                                width={48}
                                height={48}
                                className="rounded shrink-0"
                              />
                            )}
                            {match.spotify_cover_image_url && (
                              <Image
                                src={match.spotify_cover_image_url}
                                alt={match.spotify_track_name}
                                width={48}
                                height={48}
                                className="rounded shrink-0"
                              />
                            )}
                          </div>
                        </TableCell>

                        {/* Original Song */}
                        <TableCell className="align-top">
                          <div className="space-y-0.5">
                            <div className="font-medium text-sm line-clamp-1">
                              {match.songs.title}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {match.songs.author}
                            </div>
                          </div>
                        </TableCell>

                        {/* Spotify Match */}
                        <TableCell className="align-top">
                          <div className="space-y-0.5">
                            <div className="font-medium text-sm line-clamp-1">
                              {match.spotify_track_name}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {match.spotify_artist_name}
                            </div>
                            <div className="text-xs text-muted-foreground/70 flex items-center gap-2">
                              <span>{formatDuration(match.spotify_duration_ms)}</span>
                              <span>•</span>
                              <span>{match.spotify_release_date?.split('-')[0]}</span>
                              <Button size="sm" variant="ghost" className="h-5 px-1 -ml-1" asChild>
                                <a
                                  href={match.spotify_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </TableCell>

                        {/* Confidence */}
                        <TableCell className="align-top">
                          {getConfidenceBadge(match.confidence_score)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="align-top text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleAction(match.id, 'approve')}
                              disabled={actionLoading === match.id}
                              title="Approve this match"
                            >
                              {actionLoading === match.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openSearchDialog(match)}
                              disabled={actionLoading === match.id}
                              variant="outline"
                              title="Search for alternative"
                            >
                              <Search className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAction(match.id, 'reject')}
                              disabled={actionLoading === match.id}
                              variant="outline"
                              title="Reject this match"
                            >
                              {actionLoading === match.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {(pagination.hasNext || pagination.hasPrev) && (
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => fetchMatches(activeTab, pagination.page - 1)}
                    disabled={!pagination.hasPrev || loading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => fetchMatches(activeTab, pagination.page + 1)}
                    disabled={!pagination.hasNext || loading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center space-y-4 border-2 border-dashed border-border rounded-xl bg-muted/10">
              <CheckCircle2 className="w-12 h-12 text-muted-foreground/50" />
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">No approved matches</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Approved matches will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {matches.map((match) => (
                <Card key={match.id} className="bg-card rounded-lg border border-border shadow-sm">
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-base">{match.songs.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Matched to: {match.spotify_track_name} by {match.spotify_artist_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Confidence: {match.confidence_score}%
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-success/10 text-success border-success/20 shrink-0"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center space-y-4 border-2 border-dashed border-border rounded-xl bg-muted/10">
              <XCircle className="w-12 h-12 text-muted-foreground/50" />
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">No rejected matches</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Rejected matches will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {matches.map((match) => (
                <Card key={match.id} className="bg-card rounded-lg border border-border shadow-sm">
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-base">{match.songs.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Rejected match: {match.spotify_track_name} by {match.spotify_artist_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Confidence: {match.confidence_score}%
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-destructive/10 text-destructive border-destructive/20 shrink-0"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Rejected
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Search Dialog */}
      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Search for Alternative Spotify Match</DialogTitle>
            <DialogDescription>
              Original song: <strong>{currentMatch?.songs.title}</strong> by{' '}
              <strong>{currentMatch?.songs.author}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search Spotify (e.g., 'Song Title Artist Name')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSpotify()}
              />
              <Button onClick={handleSearchSpotify} disabled={searching}>
                {searching ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Search
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Search Results</h3>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[60px]"></TableHead>
                        <TableHead>Track</TableHead>
                        <TableHead>Artist</TableHead>
                        <TableHead>Album</TableHead>
                        <TableHead className="w-[100px]">Duration</TableHead>
                        <TableHead className="w-[100px]">Year</TableHead>
                        <TableHead className="w-[120px] text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((result) => (
                        <TableRow key={result.id} className="hover:bg-muted/50">
                          <TableCell className="p-2">
                            {result.coverUrl && (
                              <Image
                                src={result.coverUrl}
                                alt={result.name}
                                width={48}
                                height={48}
                                className="rounded"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-sm">{result.name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">{result.artist}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">{result.album}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {formatDuration(result.duration_ms)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {result.release_date?.split('-')[0]}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="ghost" asChild>
                                <a href={result.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSelectAlternative(result)}
                                disabled={actionLoading === currentMatch?.id}
                              >
                                {actionLoading === currentMatch?.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  'Select'
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !searching && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No results found. Try a different search query.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
