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
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
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
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Search for Alternative Spotify Match</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Original song: <strong>{currentMatch?.songs.title}</strong> by{' '}
            <strong>{currentMatch?.songs.author}</strong>
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search Spotify..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              className="h-11 sm:h-9"
            />
            <Button onClick={onSearch} disabled={searching} className="h-11 sm:h-9 shrink-0">
              {searching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">Search</span>
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Search Results</h3>

              {/* Mobile: Card layout */}
              <div className="md:hidden space-y-2 max-h-[50vh] overflow-y-auto">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border"
                  >
                    {result.coverUrl && (
                      <Image
                        src={result.coverUrl}
                        alt={result.name}
                        width={48}
                        height={48}
                        className="rounded shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{result.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.artist}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(result.duration_ms)}
                        {result.release_date && ` \u2022 ${result.release_date.split('-')[0]}`}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-9 w-9" asChild>
                        <a href={result.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        className="h-9"
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
                  </div>
                ))}
              </div>

              {/* Desktop: Table layout */}
              <div className="hidden md:block rounded-lg border border-border overflow-hidden">
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
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
