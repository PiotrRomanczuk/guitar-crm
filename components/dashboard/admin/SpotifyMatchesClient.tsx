'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
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
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  SpotifyMatch,
  SpotifySearchResult,
  PaginationInfo,
  SortField,
  SortOrder,
  getConfidenceBadge,
  formatDuration,
  SpotifyMatchCard,
  SpotifySearchDialog,
} from './spotify';

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

  const fetchMatches = useCallback(async (status: string = 'pending', page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/spotify/matches?status=${status}&page=${page}&limit=20`);
      if (!response.ok) throw new Error('Failed to fetch matches');
      const data = await response.json();
      setMatches(data.matches || []);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load Spotify matches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches(activeTab, 1);
    setSortField(null);
  }, [activeTab, fetchMatches]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
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
          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
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
      if (!response.ok) throw new Error('Failed to process action');
      toast.success(`Match ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchMatches(activeTab, pagination.page);
    } catch {
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
      if (!response.ok) throw new Error('Failed to search Spotify');
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch {
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
      if (!response.ok) throw new Error('Failed to approve alternative match');
      toast.success('Alternative match approved successfully');
      setSearchDialogOpen(false);
      setCurrentMatch(null);
      setSearchQuery('');
      setSearchResults([]);
      fetchMatches(activeTab, pagination.page);
    } catch {
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

  const renderEmptyState = (icon: React.ReactNode, title: string, message: string) => (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center space-y-4 border-2 border-dashed border-border rounded-xl bg-muted/10">
      {icon}
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      </div>
    </div>
  );

  const renderPendingTable = () => (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead><SortButton field="original">Original Song</SortButton></TableHead>
              <TableHead><SortButton field="spotify">Spotify Match</SortButton></TableHead>
              <TableHead className="w-[90px]"><SortButton field="confidence">Score</SortButton></TableHead>
              <TableHead className="w-[220px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getSortedMatches().map((match) => (
              <TableRow key={match.id} className="hover:bg-muted/50">
                <TableCell className="align-top p-2">
                  <div className="flex flex-col gap-1">
                    {match.songs.cover_image_url && (
                      <Image src={match.songs.cover_image_url} alt={match.songs.title} width={48} height={48} className="rounded shrink-0" />
                    )}
                    {match.spotify_cover_image_url && (
                      <Image src={match.spotify_cover_image_url} alt={match.spotify_track_name} width={48} height={48} className="rounded shrink-0" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="space-y-0.5">
                    <div className="font-medium text-sm line-clamp-1">{match.songs.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{match.songs.author}</div>
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="space-y-0.5">
                    <div className="font-medium text-sm line-clamp-1">{match.spotify_track_name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{match.spotify_artist_name}</div>
                    <div className="text-xs text-muted-foreground/70 flex items-center gap-2">
                      <span>{formatDuration(match.spotify_duration_ms)}</span>
                      <span>•</span>
                      <span>{match.spotify_release_date?.split('-')[0]}</span>
                      <Button size="sm" variant="ghost" className="h-5 px-1 -ml-1" asChild>
                        <a href={match.spotify_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="align-top">{getConfidenceBadge(match.confidence_score)}</TableCell>
                <TableCell className="align-top text-right">
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" onClick={() => handleAction(match.id, 'approve')} disabled={actionLoading === match.id} title="Approve">
                      {actionLoading === match.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                    </Button>
                    <Button size="sm" onClick={() => openSearchDialog(match)} disabled={actionLoading === match.id} variant="outline" title="Search">
                      <Search className="w-3 h-3" />
                    </Button>
                    <Button size="sm" onClick={() => handleAction(match.id, 'reject')} disabled={actionLoading === match.id} variant="outline" title="Reject">
                      {actionLoading === match.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {(pagination.hasNext || pagination.hasPrev) && (
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={() => fetchMatches(activeTab, pagination.page - 1)} disabled={!pagination.hasPrev || loading}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}</span>
          <Button variant="outline" onClick={() => fetchMatches(activeTab, pagination.page + 1)} disabled={!pagination.hasNext || loading}>Next</Button>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pending' | 'approved' | 'rejected')}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="pending" className="flex-1 sm:flex-none">
              Pending {pagination.total > 0 && activeTab === 'pending' && `(${pagination.total})`}
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex-1 sm:flex-none">Approved</TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1 sm:flex-none">Rejected</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={() => fetchMatches(activeTab, pagination.page)} disabled={loading} className="w-full sm:w-auto">
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : matches.length === 0 ? (
            renderEmptyState(<CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />, 'All caught up!', 'No pending Spotify matches to review.')
          ) : (
            renderPendingTable()
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : matches.length === 0 ? (
            renderEmptyState(<CheckCircle2 className="w-12 h-12 text-muted-foreground/50" />, 'No approved matches', 'Approved matches will appear here.')
          ) : (
            <div className="grid gap-3">
              {matches.map((match) => <SpotifyMatchCard key={match.id} match={match} status="approved" />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : matches.length === 0 ? (
            renderEmptyState(<XCircle className="w-12 h-12 text-muted-foreground/50" />, 'No rejected matches', 'Rejected matches will appear here.')
          ) : (
            <div className="grid gap-3">
              {matches.map((match) => <SpotifyMatchCard key={match.id} match={match} status="rejected" />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <SpotifySearchDialog
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
        currentMatch={currentMatch}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        searchResults={searchResults}
        searching={searching}
        onSearch={handleSearchSpotify}
        onSelectAlternative={handleSelectAlternative}
        actionLoading={actionLoading}
      />
    </div>
  );
}
