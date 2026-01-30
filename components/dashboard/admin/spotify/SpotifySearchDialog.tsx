'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { ExternalLink, Loader2, Search } from 'lucide-react';
import Image from 'next/image';
import type { SpotifyMatch, SpotifySearchResult } from './types';
import { formatDuration } from './helpers';

interface SpotifySearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMatch: SpotifyMatch | null;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchResults: SpotifySearchResult[];
  searching: boolean;
  onSearch: () => void;
  onSelectAlternative: (result: SpotifySearchResult) => void;
  actionLoading: string | null;
}

export function SpotifySearchDialog({
  open,
  onOpenChange,
  currentMatch,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  searching,
  onSearch,
  onSelectAlternative,
  actionLoading,
}: SpotifySearchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            />
            <Button onClick={onSearch} disabled={searching}>
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
                              onClick={() => onSelectAlternative(result)}
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
  );
}
